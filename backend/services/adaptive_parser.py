import re
from typing import Dict, Any, List, Optional, Tuple
from services.feature_extractor import extract_features
from services.confidence import calculate_confidence
from models.schemas import ExtractedFeatures, SemanticMapping, ConfidenceBreakdown

# Semantic synonym dictionary for perimeter & network security logs
SEMANTIC_SYNONYMS = {
    "source_ip": ["srcip", "src", "source", "s_ip", "saddr", "client_ip", "src_ip", "source_ip", "sourceip"],
    "destination_ip": ["dstip", "dst", "destination", "d_ip", "daddr", "target_ip", "dst_ip", "dest_ip", "destip", "destination_ip"],
    "source_port": ["sport", "srcport", "source_port", "sp", "s_port", "src_port"],
    "destination_port": ["dport", "dstport", "destination_port", "dp", "dest_port", "d_port", "dst_port"],
    "protocol": ["proto", "protocol", "p", "pr", "prot"],
    "action": ["action", "act", "decision", "status", "verdict", "rule_action", "result"],
    "bytes": ["bytes", "len", "size", "pkt_size", "length", "byte_count"],
    "device": ["device", "dev", "host", "hostname", "node", "appliance"],
}

def parse_adaptively(raw_text: str, parser_version: str = "adaptive_v1.0") -> Dict[str, Any]:
    """
    Adaptively parses unknown/unseen log formats without manual vendor-specific rules.
    Performs tokenization, candidate key-value detection, semantic synonym resolution,
    positional heuristic fallback, and confidence calculation.
    """
    text = raw_text.strip()
    features = extract_features(text)
    
    extracted: Dict[str, Any] = {
        "timestamp": None,
        "device": None,
        "device_type": "Perimeter Gateway",
        "source_ip": None,
        "destination_ip": None,
        "source_port": None,
        "destination_port": None,
        "protocol": None,
        "action": None,
        "bytes": None,
        "event_type": "Perimeter Traffic Filter",
        "severity": "NOTICE",
    }
    
    mappings: List[SemanticMapping] = []
    
    # 1. Resolve Timestamp
    if features.timestamps:
        extracted["timestamp"] = features.timestamps[0].strip("[]")
        mappings.append(SemanticMapping(
            raw_key="TIMESTAMP_TOKEN",
            target_field="timestamp",
            sample_value=extracted["timestamp"],
            match_reason="Pattern match (Timestamp Regex)",
        ))
        
    # 2. Resolve Device
    if features.device_hint:
        extracted["device"] = features.device_hint
        mappings.append(SemanticMapping(
            raw_key="DEVICE_TOKEN",
            target_field="device",
            sample_value=extracted["device"],
            match_reason="Identifier pattern match",
        ))
        
    # 3. Match Key-Value pairs with semantic synonym dictionary
    mapped_keys = set()
    for raw_k, raw_v in features.key_values.items():
        clean_k = raw_k.lower().strip("-_:")
        for target_field, synonyms in SEMANTIC_SYNONYMS.items():
            if clean_k in synonyms and extracted[target_field] is None:
                if target_field in ["source_port", "destination_port", "bytes"]:
                    try:
                        extracted[target_field] = int(raw_v)
                    except ValueError:
                        extracted[target_field] = raw_v
                elif target_field == "protocol":
                    extracted[target_field] = raw_v.upper()
                elif target_field == "action":
                    extracted[target_field] = raw_v.upper()
                else:
                    extracted[target_field] = raw_v
                    
                mapped_keys.add(raw_k)
                mappings.append(SemanticMapping(
                    raw_key=raw_k,
                    target_field=target_field,
                    sample_value=str(raw_v),
                    match_reason=f"Semantic Dictionary Match: '{raw_k}' -> '{target_field}'",
                ))
                break

    # 4. Positional & Type Fallbacks for unmapped fields
    # Source & Destination IPs
    if not extracted["source_ip"] and len(features.ips) >= 1:
        extracted["source_ip"] = features.ips[0]
        mappings.append(SemanticMapping(
            raw_key="IP_1",
            target_field="source_ip",
            sample_value=features.ips[0],
            match_reason="Positional Heuristic (First IPv4 token)",
        ))
    if not extracted["destination_ip"] and len(features.ips) >= 2:
        extracted["destination_ip"] = features.ips[1]
        mappings.append(SemanticMapping(
            raw_key="IP_2",
            target_field="destination_ip",
            sample_value=features.ips[1],
            match_reason="Positional Heuristic (Second IPv4 token)",
        ))

    # Protocol
    if not extracted["protocol"] and features.protocols:
        extracted["protocol"] = features.protocols[0].upper()
        mappings.append(SemanticMapping(
            raw_key="PROTO_TOKEN",
            target_field="protocol",
            sample_value=extracted["protocol"],
            match_reason="Protocol keyword detection",
        ))

    # Action
    if not extracted["action"] and features.actions:
        action_raw = features.actions[0].upper()
        # Normalize actions
        if action_raw in ["DENIED", "BLOCK", "BLOCKED", "DROP", "DROPPED", "REJECT", "DISCARD"]:
            extracted["action"] = "DENY"
        elif action_raw in ["ALLOWED", "ALLOW", "PERMIT", "PERMITTED", "ACCEPT", "PASS"]:
            extracted["action"] = "ALLOW"
        else:
            extracted["action"] = action_raw
            
        mappings.append(SemanticMapping(
            raw_key="ACTION_TOKEN",
            target_field="action",
            sample_value=extracted["action"],
            match_reason="Action verb detection & normalization",
        ))

    # Ports
    if not extracted["destination_port"] and features.ports:
        extracted["destination_port"] = features.ports[0]
        mappings.append(SemanticMapping(
            raw_key="PORT_TOKEN",
            target_field="destination_port",
            sample_value=str(features.ports[0]),
            match_reason="Port range heuristic",
        ))

    # Device fallback if not detected
    if not extracted["device"]:
        # Extract first non-timestamp alphanumeric keyword
        for token in features.tokens[:4]:
            if re.match(r"^[A-Za-z0-9_-]{3,15}$", token) and not any(p in token.lower() for p in ["utc", "gmt", "log"]):
                extracted["device"] = token
                break
        if not extracted["device"]:
            extracted["device"] = "UNKNOWN-PERIMETER-NODE"

    # Assign event severity based on action
    if extracted["action"] in ["DENY", "DROP", "BLOCK", "REJECT"]:
        extracted["severity"] = "WARNING"
    else:
        extracted["severity"] = "INFO"

    # Compute Confidence Score
    confidence_breakdown = calculate_confidence(
        timestamp=extracted["timestamp"],
        source_ip=extracted["source_ip"],
        destination_ip=extracted["destination_ip"],
        protocol=extracted["protocol"],
        action=extracted["action"],
        destination_port=extracted["destination_port"],
        source_port=extracted["source_port"],
        device=extracted["device"],
        bytes_count=extracted["bytes"],
    )

    return {
        "extracted": extracted,
        "features": features.model_dump(),
        "mappings": [m.model_dump() for m in mappings],
        "confidence_breakdown": confidence_breakdown.model_dump(),
        "confidence": confidence_breakdown.total_confidence,
        "parser_type": "adaptive",
        "parser_version": parser_version,
    }
