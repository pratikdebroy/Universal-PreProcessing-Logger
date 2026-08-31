from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class RawLogItem(BaseModel):
    id: str
    raw_text: str
    timestamp: Optional[str] = None
    source_device: Optional[str] = None

class IngestRequest(BaseModel):
    logs: List[str]

class ProcessRequest(BaseModel):
    log_id: Optional[str] = None
    raw_text: Optional[str] = None

class BatchProcessRequest(BaseModel):
    log_ids: Optional[List[str]] = None

class ExtractedFeatures(BaseModel):
    ips: List[str] = []
    ports: List[int] = []
    protocols: List[str] = []
    actions: List[str] = []
    timestamps: List[str] = []
    key_values: Dict[str, str] = {}
    delimiters: List[str] = []
    tokens: List[str] = []
    device_hint: Optional[str] = None

class SemanticMapping(BaseModel):
    raw_key: str
    target_field: str
    sample_value: Optional[str] = None
    match_reason: str = "Synonym Dictionary Match"

class ConfidenceBreakdown(BaseModel):
    timestamp_score: float = 0.0
    source_ip_score: float = 0.0
    destination_ip_score: float = 0.0
    protocol_score: float = 0.0
    action_score: float = 0.0
    port_score: float = 0.0
    schema_completeness_score: float = 0.0
    total_confidence: float = 0.0
    rating: str = "LOW"  # HIGH (>=80), MEDIUM (60-79), LOW (<60)
    details: List[str] = []

class NormalizedSecurityEvent(BaseModel):
    id: str
    timestamp: Optional[str] = None
    device: Optional[str] = None
    device_type: Optional[str] = "Perimeter Security"
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: Optional[str] = None
    action: Optional[str] = None
    event_type: Optional[str] = "Network Traffic"
    severity: Optional[str] = "INFO"
    bytes: Optional[int] = None
    raw_log: str
    parser_type: str = "known"  # known | adaptive | self_healed | failed
    parser_version: str = "v1.0"
    confidence: float = 0.0
    status: str = "known"  # known | adaptive | self_healed | failed
    extracted_features: Optional[Dict[str, Any]] = None
    mappings: Optional[List[SemanticMapping]] = None
    confidence_breakdown: Optional[ConfidenceBreakdown] = None
    drift_detected: bool = False
    drift_reason: Optional[str] = None

class ParserRule(BaseModel):
    id: str
    name: str
    version: str
    format_signature: str
    is_adaptive: bool = False
    mappings: Dict[str, str] = {}
    regex_pattern: Optional[str] = None
    created_at: str
    active: bool = True

class SystemStats(BaseModel):
    total_ingested: int = 0
    total_processed: int = 0
    known_count: int = 0
    unknown_count: int = 0
    adaptive_count: int = 0
    self_healed_count: int = 0
    failed_count: int = 0
    avg_confidence: float = 0.0
    active_parsers_count: int = 0

class SelfHealingReport(BaseModel):
    drift_detected: bool
    affected_log_id: str
    previous_parser_version: str
    previous_confidence: float
    new_parser_version: str
    new_confidence: float
    drifted_keys: Dict[str, str] = {}
    repaired_count: int = 0
    status: str = "SUCCESS"
    details: str = ""
