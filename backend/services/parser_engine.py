import re
from typing import Dict, Any, Optional
from services.feature_extractor import extract_features
from services.confidence import calculate_confidence
from models.schemas import SemanticMapping

def parse_cisco_ios(raw_text: str) -> Dict[str, Any]:
    """Parses Cisco IOS Perimeter Router ACL logs."""
    text = raw_text.strip()
    
    # Regex pattern for Cisco IOS ACL log
    # e.g., <134>Aug 31 21:10:04 router-01 %SEC-6-IPACCESSLOGP: list 101 denied tcp 10.20.1.15(443) -> 172.16.4.20(52144), 1 packet
    pattern = re.compile(
        r"(?:<\d+>)?(?P<timestamp>[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+)\s+(?P<device>router-\w+)\s+(?P<tag>%SEC-\d+-\w+):\s+list\s+(?P<acl>\d+)\s+(?P<action>denied|permitted)\s+(?P<proto>\w+)\s+(?P<src_ip>\d{1,3}(?:\.\d{1,3}){3})(?:\((?P<src_port>\d+)\))?\s+->\s+(?P<dst_ip>\d{1,3}(?:\.\d{1,3}){3})(?:\((?P<dst_port>\d+)\))?",
        re.IGNORECASE,
    )
    
    m = pattern.search(text)
    if not m:
        # Fallback to feature extraction
        return {}

    d = m.groupdict()
    action = "DENY" if d["action"].lower() == "denied" else "ALLOW"
    proto = d["proto"].upper()
    src_port = int(d["src_port"]) if d.get("src_port") else None
    dst_port = int(d["dst_port"]) if d.get("dst_port") else None
    
    confidence_breakdown = calculate_confidence(
        timestamp=d["timestamp"],
        source_ip=d["src_ip"],
        destination_ip=d["dst_ip"],
        protocol=proto,
        action=action,
        destination_port=dst_port,
        source_port=src_port,
        device=d["device"],
        bytes_count=None,
    )
    
    mappings = [
        SemanticMapping(raw_key="src_ip(port)", target_field="source_ip / source_port", sample_value=f"{d['src_ip']}({src_port})", match_reason="Cisco IOS Grammar Rule"),
        SemanticMapping(raw_key="dst_ip(port)", target_field="destination_ip / destination_port", sample_value=f"{d['dst_ip']}({dst_port})", match_reason="Cisco IOS Grammar Rule"),
        SemanticMapping(raw_key="action", target_field="action", sample_value=action, match_reason="Cisco IOS Grammar Rule"),
    ]

    return {
        "extracted": {
            "timestamp": d["timestamp"],
            "device": d["device"],
            "device_type": "Perimeter Router",
            "source_ip": d["src_ip"],
            "destination_ip": d["dst_ip"],
            "source_port": src_port,
            "destination_port": dst_port,
            "protocol": proto,
            "action": action,
            "event_type": "ACL Traffic Filter",
            "severity": "WARNING" if action == "DENY" else "INFO",
            "bytes": None,
        },
        "mappings": [m.model_dump() for m in mappings],
        "confidence_breakdown": confidence_breakdown.model_dump(),
        "confidence": confidence_breakdown.total_confidence,
        "parser_type": "known",
        "parser_version": "cisco_v1.0",
    }

def parse_firewall_kv_v1(raw_text: str) -> Dict[str, Any]:
    """
    Parses Standard Perimeter Firewall v1 Key-Value format:
    ACTION=... SRC=... DST=... PROTO=... SPORT=... DPORT=...
    """
    text = raw_text.strip()
    
    # Extract timestamp and device from beginning
    # e.g., 2026-08-31T21:11:12Z FW01 ACTION=DENY SRC=192.168.10.25 DST=10.0.0.12 PROTO=TCP SPORT=443 DPORT=22
    ts_match = re.search(r"^\s*(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)", text)
    timestamp = ts_match.group(1) if ts_match else None
    
    dev_match = re.search(r"\b(FW\w*)\b", text, re.IGNORECASE)
    device = dev_match.group(1) if dev_match else "FW-PERIMETER"
    
    # Standard v1 keys strictly expected
    action_m = re.search(r"\bACTION=([^\s]+)", text)
    src_m = re.search(r"\bSRC=([^\s]+)", text)
    dst_m = re.search(r"\bDST=([^\s]+)", text)
    proto_m = re.search(r"\bPROTO=([^\s]+)", text)
    sport_m = re.search(r"\bSPORT=([^\s]+)", text)
    dport_m = re.search(r"\bDPORT=([^\s]+)", text)
    
    action = action_m.group(1).upper() if action_m else None
    src_ip = src_m.group(1) if src_m else None
    dst_ip = dst_m.group(1) if dst_m else None
    proto = proto_m.group(1).upper() if proto_m else None
    src_port = int(sport_m.group(1)) if sport_m and sport_m.group(1).isdigit() else None
    dst_port = int(dport_m.group(1)) if dport_m and dport_m.group(1).isdigit() else None

    confidence_breakdown = calculate_confidence(
        timestamp=timestamp,
        source_ip=src_ip,
        destination_ip=dst_ip,
        protocol=proto,
        action=action,
        destination_port=dst_port,
        source_port=src_port,
        device=device,
        bytes_count=None,
    )
    
    mappings = []
    if action: mappings.append(SemanticMapping(raw_key="ACTION", target_field="action", sample_value=action, match_reason="Firewall v1 Static Mapping"))
    if src_ip: mappings.append(SemanticMapping(raw_key="SRC", target_field="source_ip", sample_value=src_ip, match_reason="Firewall v1 Static Mapping"))
    if dst_ip: mappings.append(SemanticMapping(raw_key="DST", target_field="destination_ip", sample_value=dst_ip, match_reason="Firewall v1 Static Mapping"))
    if proto: mappings.append(SemanticMapping(raw_key="PROTO", target_field="protocol", sample_value=proto, match_reason="Firewall v1 Static Mapping"))
    if dport_m: mappings.append(SemanticMapping(raw_key="DPORT", target_field="destination_port", sample_value=str(dst_port), match_reason="Firewall v1 Static Mapping"))

    return {
        "extracted": {
            "timestamp": timestamp,
            "device": device,
            "device_type": "Perimeter Firewall",
            "source_ip": src_ip,
            "destination_ip": dst_ip,
            "source_port": src_port,
            "destination_port": dst_port,
            "protocol": proto,
            "action": action,
            "event_type": "Firewall Rule Filter",
            "severity": "WARNING" if action == "DENY" else "INFO",
            "bytes": None,
        },
        "mappings": [m.model_dump() for m in mappings],
        "confidence_breakdown": confidence_breakdown.model_dump(),
        "confidence": confidence_breakdown.total_confidence,
        "parser_type": "known",
        "parser_version": "fw_v1.0",
    }

def parse_syslog_sshd(raw_text: str) -> Dict[str, Any]:
    """Parses Linux Gateway SSH authentication syslog."""
    text = raw_text.strip()
    # e.g., Aug 31 21:12:44 gateway01 sshd[2190]: Failed password for admin from 192.168.1.44 port 5212
    pattern = re.compile(
        r"(?P<timestamp>[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+)\s+(?P<device>\w+)\s+sshd\[\d+\]:\s+(?P<status>Failed|Accepted)\s+password\s+(?:for\s+(?P<user>\w+)\s+)?from\s+(?P<src_ip>\d{1,3}(?:\.\d{1,3}){3})\s+port\s+(?P<src_port>\d+)",
        re.IGNORECASE,
    )
    m = pattern.search(text)
    if not m:
        return {}

    d = m.groupdict()
    action = "DENY" if d["status"].lower() == "failed" else "ALLOW"
    src_port = int(d["src_port"]) if d.get("src_port") else None
    
    confidence_breakdown = calculate_confidence(
        timestamp=d["timestamp"],
        source_ip=d["src_ip"],
        destination_ip="192.168.1.1",  # Local gateway destination
        protocol="SSH",
        action=action,
        destination_port=22,
        source_port=src_port,
        device=d["device"],
        bytes_count=None,
    )
    
    mappings = [
        SemanticMapping(raw_key="timestamp", target_field="timestamp", sample_value=d["timestamp"], match_reason="Syslog Header"),
        SemanticMapping(raw_key="from <IP>", target_field="source_ip", sample_value=d["src_ip"], match_reason="SSH Auth Pattern"),
        SemanticMapping(raw_key="port <N>", target_field="source_port", sample_value=str(src_port), match_reason="SSH Port Pattern"),
        SemanticMapping(raw_key="status", target_field="action", sample_value=action, match_reason="Auth status normalization"),
    ]

    return {
        "extracted": {
            "timestamp": d["timestamp"],
            "device": d["device"],
            "device_type": "Authentication Gateway",
            "source_ip": d["src_ip"],
            "destination_ip": "192.168.1.1",
            "source_port": src_port,
            "destination_port": 22,
            "protocol": "SSH",
            "action": action,
            "event_type": "SSH Authentication Attempt",
            "severity": "WARNING" if action == "DENY" else "INFO",
            "bytes": None,
        },
        "mappings": [m.model_dump() for m in mappings],
        "confidence_breakdown": confidence_breakdown.model_dump(),
        "confidence": confidence_breakdown.total_confidence,
        "parser_type": "known",
        "parser_version": "syslog_v1.0",
    }
