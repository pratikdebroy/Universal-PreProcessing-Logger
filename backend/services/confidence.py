from typing import Dict, Any, List, Optional
from models.schemas import ConfidenceBreakdown

def calculate_confidence(
    timestamp: Optional[str],
    source_ip: Optional[str],
    destination_ip: Optional[str],
    protocol: Optional[str],
    action: Optional[str],
    destination_port: Optional[int],
    source_port: Optional[int],
    device: Optional[str],
    bytes_count: Optional[int],
) -> ConfidenceBreakdown:
    """
    Computes a deterministic, explainable confidence score (0-100%) for a parsed security event.
    """
    details: List[str] = []
    
    # 1. Timestamp score (weight: 20)
    ts_score = 0.0
    if timestamp:
        ts_score = 20.0
        details.append("Timestamp extracted and validated (+20%)")
    else:
        details.append("Missing timestamp (-20%)")
        
    # 2. Source IP score (weight: 20)
    src_score = 0.0
    if source_ip:
        src_score = 20.0
        details.append(f"Source IP identified: {source_ip} (+20%)")
    else:
        details.append("Missing source IP (-20%)")
        
    # 3. Destination IP score (weight: 20)
    dst_score = 0.0
    if destination_ip:
        dst_score = 20.0
        details.append(f"Destination IP identified: {destination_ip} (+20%)")
    else:
        details.append("Missing destination IP (-20%)")
        
    # 4. Protocol score (weight: 15)
    proto_score = 0.0
    if protocol:
        proto_score = 15.0
        details.append(f"Network protocol recognized: {protocol} (+15%)")
    else:
        details.append("Missing network protocol (-15%)")
        
    # 5. Action score (weight: 15)
    act_score = 0.0
    if action:
        act_score = 15.0
        details.append(f"Perimeter action verdict recognized: {action} (+15%)")
    else:
        details.append("Missing perimeter action (-15%)")
        
    # 6. Port score (weight: 5)
    port_score = 0.0
    if destination_port or source_port:
        port_score = 5.0
        port_val = destination_port or source_port
        details.append(f"Port identified: {port_val} (+5%)")
    else:
        details.append("Missing port indicator (-5%)")
        
    # 7. Schema completeness & device (weight: 5)
    comp_score = 0.0
    if device or bytes_count is not None:
        comp_score = 5.0
        details.append("Device/telemetry context validated (+5%)")
        
    total = round(ts_score + src_score + dst_score + proto_score + act_score + port_score + comp_score, 1)
    
    if total >= 80.0:
        rating = "HIGH"
    elif total >= 60.0:
        rating = "MEDIUM"
    else:
        rating = "LOW"
        
    return ConfidenceBreakdown(
        timestamp_score=ts_score,
        source_ip_score=src_score,
        destination_ip_score=dst_score,
        protocol_score=proto_score,
        action_score=act_score,
        port_score=port_score,
        schema_completeness_score=comp_score,
        total_confidence=total,
        rating=rating,
        details=details,
    )
