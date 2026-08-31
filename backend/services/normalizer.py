import uuid
from typing import Dict, Any
from services.fingerprint import fingerprint_log
from services.parser_engine import parse_cisco_ios, parse_firewall_kv_v1, parse_syslog_sshd
from services.adaptive_parser import parse_adaptively
from services.drift_detector import detect_drift
from services.validator import validate_event
from models.schemas import NormalizedSecurityEvent

def process_single_log(raw_text: str, log_id: str = None) -> NormalizedSecurityEvent:
    """
    Full pipeline:
    RAW LOG → FINGERPRINT → PARSER ROUTING → DRIFT CHECK → VALIDATE → NORMALIZED EVENT
    """
    if not log_id:
        log_id = f"log_{uuid.uuid4().hex[:8]}"
        
    text = raw_text.strip()
    fmt_id, fmt_name, fmt_conf = fingerprint_log(text)
    
    parsed_res: Dict[str, Any] = {}
    parser_type = "known"
    status = "known"
    
    # 1. Routing based on fingerprint
    if fmt_id == "cisco_ios":
        parsed_res = parse_cisco_ios(text)
        if not parsed_res:
            parsed_res = parse_adaptively(text, parser_version="adaptive_fallback")
            parser_type = "adaptive"
            status = "adaptive"
    elif fmt_id == "firewall_kv_v1":
        parsed_res = parse_firewall_kv_v1(text)
    elif fmt_id == "syslog_sshd":
        parsed_res = parse_syslog_sshd(text)
    elif fmt_id == "firewall_drifted":
        # Simulate running existing v1 parser on mutated keys to expose drift
        parsed_res = parse_firewall_kv_v1(text)
        # Check if v1 parser failed or had degraded confidence
        is_drift, reason, drifted_keys = detect_drift(text, parsed_res, "firewall_kv_v1")
        if is_drift:
            parser_type = "known (drifted)"
            status = "failed"
            parsed_res["drift_detected"] = True
            parsed_res["drift_reason"] = reason
    else:
        # Unknown vendor format → route to Adaptive Engine
        parsed_res = parse_adaptively(text, parser_version="adaptive_v1.0")
        parser_type = "adaptive"
        status = "adaptive"

    extracted = parsed_res.get("extracted", {})
    confidence = parsed_res.get("confidence", 0.0)
    
    # Check drift on any parser if not already detected
    if not parsed_res.get("drift_detected", False) and parser_type == "known":
        is_drift, reason, _ = detect_drift(text, parsed_res, parsed_res.get("parser_version", "known"))
        if is_drift:
            parsed_res["drift_detected"] = True
            parsed_res["drift_reason"] = reason
            status = "failed"

    # Validation
    is_valid, warnings = validate_event(extracted)

    event = NormalizedSecurityEvent(
        id=log_id,
        timestamp=extracted.get("timestamp"),
        device=extracted.get("device"),
        device_type=extracted.get("device_type", "Perimeter Device"),
        source_ip=extracted.get("source_ip"),
        destination_ip=extracted.get("destination_ip"),
        source_port=extracted.get("source_port"),
        destination_port=extracted.get("destination_port"),
        protocol=extracted.get("protocol"),
        action=extracted.get("action"),
        event_type=extracted.get("event_type", "Perimeter Telemetry"),
        severity=extracted.get("severity", "INFO"),
        bytes=extracted.get("bytes"),
        raw_log=text,
        parser_type=parser_type,
        parser_version=parsed_res.get("parser_version", "v1.0"),
        confidence=confidence,
        status=status,
        extracted_features=parsed_res.get("features"),
        mappings=parsed_res.get("mappings"),
        confidence_breakdown=parsed_res.get("confidence_breakdown"),
        drift_detected=parsed_res.get("drift_detected", False),
        drift_reason=parsed_res.get("drift_reason"),
    )
    
    return event
