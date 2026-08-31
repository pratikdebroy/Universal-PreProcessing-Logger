import re
from typing import Dict, List, Optional, Any, Tuple
from models.schemas import ExtractedFeatures

IP_REGEX = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"
)

PROTO_REGEX = re.compile(
    r"\b(TCP|UDP|ICMP|GRE|ESP|AH|IGMP|SCTP|HTTP|HTTPS|SSH|DNS)\b", re.IGNORECASE
)

ACTION_REGEX = re.compile(
    r"\b(ALLOW|DENY|DROP|BLOCK|ACCEPT|PERMIT|REJECT|PASS|DENIED|ALLOWED|DROPPED|BLOCKED|DISCARD)\b",
    re.IGNORECASE,
)

TIMESTAMP_PATTERNS = [
    # ISO 8601: 2026-08-31T21:11:12Z or 2026-08-31 21:11:12
    re.compile(r"\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b"),
    # BSD Syslog: Aug 31 21:10:04
    re.compile(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\b"),
    # DD-MM-YYYY HH:MM:SS: 31-08-2026 21:13:04
    re.compile(r"\b\d{2}[-/]\d{2}[-/]\d{4}\s+\d{2}:\d{2}:\d{2}\b"),
    # [DD/MM/YY HH:MM:SS]: [31/08/26 21:14:22]
    re.compile(r"\[\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\s+\d{2}:\d{2}:\d{2}\]"),
]

DEVICE_PATTERNS = [
    re.compile(r"\b(router-[a-zA-Z0-9_-]+)\b", re.IGNORECASE),
    re.compile(r"\b(FW[a-zA-Z0-9_-]*)\b", re.IGNORECASE),
    re.compile(r"\b(gateway[a-zA-Z0-9_-]*)\b", re.IGNORECASE),
    re.compile(r"\b(EDGE-[a-zA-Z0-9_-]+)\b", re.IGNORECASE),
    re.compile(r"\b(RT-[a-zA-Z0-9_-]+)\b", re.IGNORECASE),
    re.compile(r"\b(switch-[a-zA-Z0-9_-]+)\b", re.IGNORECASE),
    re.compile(r"\b([a-zA-Z0-9_-]+)\s+sshd\[\d+\]", re.IGNORECASE),
]

def extract_features(raw_text: str) -> ExtractedFeatures:
    """Extracts structural, semantic, and token-based features from raw perimeter logs."""
    text = raw_text.strip()
    
    # 1. IP extraction
    ips = IP_REGEX.findall(text)
    
    # 2. Protocol extraction
    proto_matches = PROTO_REGEX.findall(text)
    protocols = list(dict.fromkeys([p.upper() for p in proto_matches]))
    
    # 3. Action extraction
    action_matches = ACTION_REGEX.findall(text)
    actions = list(dict.fromkeys([a.upper() for a in action_matches]))
    
    # 4. Timestamp extraction
    timestamps = []
    for pat in TIMESTAMP_PATTERNS:
        matches = pat.findall(text)
        if matches:
            timestamps.extend(matches)
            
    # 5. Key-Value pairs extraction (K=V, K:V)
    key_values: Dict[str, str] = {}
    
    # Standard K=V
    kv_eq = re.findall(r"([A-Za-z0-9_-]+)=([^\s,;]+)", text)
    for k, v in kv_eq:
        key_values[k.strip()] = v.strip().strip("'\"")
        
    # K:V with pipes or spaces (e.g. EDGE-X | SRCIP:172.20.1.50 | ...)
    kv_colon = re.findall(r"(?:\||\s|^)([A-Za-z0-9_-]+):([^\s,;|]+)", text)
    for k, v in kv_colon:
        # Avoid matching timestamps like 21:13:04 as K:V
        if not re.match(r"^\d{2}$", k) and not re.match(r"^\d{2}:\d{2}$", v):
            key_values[k.strip()] = v.strip().strip("'\"")

    # 6. Port extraction
    ports: List[int] = []
    # Parenthesized ports after IPs: 10.20.1.15(443)
    paren_ports = re.findall(r"\b\d{1,3}(?:\.\d{1,3}){3}\((\d{1,5})\)", text)
    for p in paren_ports:
        port_num = int(p)
        if 0 < port_num <= 65535 and port_num not in ports:
            ports.append(port_num)
            
    # Ports from KV pairs
    for k, v in key_values.items():
        if any(term in k.lower() for term in ["port", "dport", "sport", "dp", "sp"]):
            if v.isdigit():
                port_num = int(v)
                if 0 < port_num <= 65535 and port_num not in ports:
                    ports.append(port_num)
                    
    # Ports in text like 'port 5212'
    text_ports = re.findall(r"\bport\s+(\d{1,5})\b", text, re.IGNORECASE)
    for p in text_ports:
        port_num = int(p)
        if 0 < port_num <= 65535 and port_num not in ports:
            ports.append(port_num)
            
    # 7. Delimiters
    delimiters = []
    for delim in ["|", "::", "%", "=", ":", ",", "->", ";"]:
        if delim in text:
            delimiters.append(delim)
            
    # 8. Device hint
    device_hint = None
    for dev_pat in DEVICE_PATTERNS:
        m = dev_pat.search(text)
        if m:
            device_hint = m.group(1)
            break
            
    # 9. General tokens
    tokens = [t for t in re.split(r"[\s,|]+", text) if t]
    
    return ExtractedFeatures(
        ips=ips,
        ports=ports,
        protocols=protocols,
        actions=actions,
        timestamps=timestamps,
        key_values=key_values,
        delimiters=delimiters,
        tokens=tokens,
        device_hint=device_hint,
    )
