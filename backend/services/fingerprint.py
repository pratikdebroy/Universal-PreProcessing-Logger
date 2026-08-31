import re
from typing import Tuple, Dict, Any
from services.feature_extractor import extract_features

KNOWN_SIGNATURES = {
    "cisco_ios": {
        "name": "Cisco IOS Perimeter Router",
        "regex": r"(?:<\d+>)?(?:[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+)\s+router-\w+\s+%SEC-\d+-\w+:\s+list\s+\d+\s+(?:denied|permitted)",
        "priority": 1,
    },
    "firewall_kv_v1": {
        "name": "Standard Perimeter Firewall v1",
        "regex": r"(?=.*ACTION=)(?=.*SRC=)(?=.*DST=)(?=.*PROTO=)",
        "priority": 2,
    },
    "syslog_sshd": {
        "name": "Linux Gateway Syslog Auth",
        "regex": r"(?:[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+)\s+\w+\s+sshd\[\d+\]:\s+(?:Failed|Accepted)\s+password",
        "priority": 3,
    },
}

def fingerprint_log(raw_text: str) -> Tuple[str, str, float]:
    """
    Identifies if a raw log matches a KNOWN format or is an UNKNOWN/NEW vendor format.
    Returns: (format_id, format_name, confidence_estimate)
    """
    text = raw_text.strip()
    
    # Check known signatures
    for fmt_id, sig in KNOWN_SIGNATURES.items():
        if re.search(sig["regex"], text, re.IGNORECASE):
            return fmt_id, sig["name"], 0.98
            
    # Check for drifted firewall format specifically
    if ("ACT=" in text or "ACTION=" in text) and ("SRCIP=" in text or "DSTIP=" in text or "P=" in text):
        return "firewall_drifted", "Drifted Perimeter Firewall (Mutated Keys)", 0.40
        
    # Check for Unknown Vendor Formats
    if "|" in text and ("SRCIP:" in text or "EDGE-" in text or "DECISION:" in text):
        return "unknown_vendor_edgex", "Unknown Vendor: EDGE-X Appliance", 0.0
        
    if "::" in text or ("RT-X9" in text and "source=" in text):
        return "unknown_vendor_rtx9", "Unknown Vendor: RT-X9 NextGen Gateway", 0.0
        
    # Generic Unknown format
    return "unknown_generic", "Unseen Perimeter Format", 0.0
