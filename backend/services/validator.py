from typing import Dict, Any, Tuple

def validate_event(event_dict: Dict[str, Any]) -> Tuple[bool, list[str]]:
    """
    Validates normalized event properties against perimeter defense standards.
    """
    warnings = []
    
    # Validate Source IP
    src_ip = event_dict.get("source_ip")
    if not src_ip:
        warnings.append("Missing source IP")
        
    # Validate Action
    action = event_dict.get("action")
    if not action or action not in ["ALLOW", "DENY", "DROP", "BLOCK", "ACCEPT", "PERMIT", "REJECT", "PASS"]:
        warnings.append(f"Unnormalized action value: {action}")
        
    # Validate Ports
    for port_key in ["source_port", "destination_port"]:
        p = event_dict.get(port_key)
        if p is not None and (not isinstance(p, int) or p < 1 or p > 65535):
            warnings.append(f"Invalid port range for {port_key}: {p}")
            
    is_valid = len(warnings) == 0
    return is_valid, warnings
