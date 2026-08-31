from typing import Dict, Any, Tuple, List, Optional
from services.feature_extractor import extract_features

def detect_drift(raw_text: str, parsed_result: Dict[str, Any], parser_name: str) -> Tuple[bool, Optional[str], List[str]]:
    """
    Detects if a log format has drifted from an existing known parser's schema.
    Returns: (is_drifted, reason, drifted_keys)
    """
    confidence = parsed_result.get("confidence", 0.0)
    extracted = parsed_result.get("extracted", {})
    
    # Extract raw features to check if payload contains security features that the parser failed to map
    raw_features = extract_features(raw_text)
    
    # If the parser confidence is below threshold (<60%) but raw log has rich features (IPs, Action, Ports)
    if confidence < 60.0 and (raw_features.ips or raw_features.actions or raw_features.key_values):
        # Identify key mutations
        drifted_keys = []
        for k in raw_features.key_values.keys():
            k_upper = k.upper()
            if k_upper in ["ACT", "SRCIP", "DSTIP", "P", "DP", "SP", "DECISION", "CLIENTIP"]:
                drifted_keys.append(k)
                
        reason = f"Schema Mutation: '{parser_name}' extracted only {confidence}% confidence. Raw features contain {len(raw_features.ips)} IPs and candidate keys {list(raw_features.key_values.keys())}."
        return True, reason, drifted_keys
        
    return False, None, []
