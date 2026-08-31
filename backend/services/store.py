import uuid
from typing import Dict, List, Optional, Any
from models.schemas import RawLogItem, NormalizedSecurityEvent, SystemStats, SelfHealingReport, ParserRule
from services.normalizer import process_single_log
from services.self_healing import heal_drifted_log, EVOLVED_PARSER_REGISTRY
from demo.sample_logs import BASELINE_LOGS, UNKNOWN_LOG_EDGEX, UNKNOWN_LOG_RTX9, DRIFTED_LOG_FW

class InMemoryStore:
    def __init__(self):
        self.raw_logs: Dict[str, RawLogItem] = {}
        self.events: Dict[str, NormalizedSecurityEvent] = {}
        self.healing_reports: List[SelfHealingReport] = []
        self.registered_parsers: Dict[str, ParserRule] = {
            "cisco_ios": ParserRule(
                id="cisco_ios",
                name="Cisco IOS Perimeter Router Parser",
                version="v1.0",
                format_signature="Cisco %SEC-6-IPACCESSLOGP",
                is_adaptive=False,
                mappings={"src_ip": "source_ip", "dst_ip": "destination_ip", "acl": "rule_id"},
                created_at="2026-08-31 00:00:00",
                active=True,
            ),
            "firewall_kv_v1": ParserRule(
                id="firewall_kv_v1",
                name="Perimeter Firewall Key-Value Parser",
                version="v1.0",
                format_signature="ACTION= SRC= DST= PROTO=",
                is_adaptive=False,
                mappings={"ACTION": "action", "SRC": "source_ip", "DST": "destination_ip", "PROTO": "protocol", "DPORT": "destination_port"},
                created_at="2026-08-31 00:00:00",
                active=True,
            ),
            "syslog_sshd": ParserRule(
                id="syslog_sshd",
                name="Linux Gateway Syslog Auth Parser",
                version="v1.0",
                format_signature="sshd: Failed/Accepted password",
                is_adaptive=False,
                mappings={"from": "source_ip", "port": "source_port", "status": "action"},
                created_at="2026-08-31 00:00:00",
                active=True,
            ),
        }
        
    def clear(self):
        self.raw_logs.clear()
        self.events.clear()
        self.healing_reports.clear()
        EVOLVED_PARSER_REGISTRY.clear()
        # Reset evolved parsers in registry
        self.registered_parsers = {
            k: v for k, v in self.registered_parsers.items() if not v.is_adaptive and "v2" not in v.version
        }

    def ingest(self, logs: List[str]) -> List[RawLogItem]:
        items = []
        for raw in logs:
            log_id = f"log_{uuid.uuid4().hex[:8]}"
            item = RawLogItem(id=log_id, raw_text=raw.strip())
            self.raw_logs[log_id] = item
            items.append(item)
        return items

    def process_log(self, log_id: str) -> Optional[NormalizedSecurityEvent]:
        raw_item = self.raw_logs.get(log_id)
        if not raw_item:
            return None
        event = process_single_log(raw_item.raw_text, log_id=log_id)
        self.events[log_id] = event
        
        # If adaptive or self healed, register dynamic parser rule
        if event.parser_type == "adaptive":
            rule_id = f"adaptive_{log_id}"
            self.registered_parsers[rule_id] = ParserRule(
                id=rule_id,
                name=f"Dynamic Adaptive Parser ({event.device or 'Vendor'})",
                version=event.parser_version,
                format_signature="Dynamic Structural Tokens",
                is_adaptive=True,
                mappings={m.raw_key: m.target_field for m in (event.mappings or [])},
                created_at="Just now",
                active=True,
            )
        return event

    def process_all(self) -> List[NormalizedSecurityEvent]:
        processed = []
        for log_id in list(self.raw_logs.keys()):
            ev = self.process_log(log_id)
            if ev:
                processed.append(ev)
        return processed

    def get_stats(self) -> SystemStats:
        total_ingested = len(self.raw_logs)
        total_processed = len(self.events)
        
        known_count = sum(1 for e in self.events.values() if e.status == "known")
        unknown_count = sum(1 for e in self.events.values() if e.status in ["adaptive", "failed"])
        adaptive_count = sum(1 for e in self.events.values() if e.status == "adaptive")
        self_healed_count = sum(1 for e in self.events.values() if e.status == "self_healed")
        failed_count = sum(1 for e in self.events.values() if e.status == "failed")
        
        confidences = [e.confidence for e in self.events.values()]
        avg_confidence = round(sum(confidences) / len(confidences), 1) if confidences else 0.0
        
        return SystemStats(
            total_ingested=total_ingested,
            total_processed=total_processed,
            known_count=known_count,
            unknown_count=unknown_count,
            adaptive_count=adaptive_count,
            self_healed_count=self_healed_count,
            failed_count=failed_count,
            avg_confidence=avg_confidence,
            active_parsers_count=len(self.registered_parsers),
        )

    def trigger_self_healing(self) -> List[SelfHealingReport]:
        reports = []
        for log_id, event in list(self.events.items()):
            # Find drifted or failed events
            if event.drift_detected or event.status == "failed" or event.confidence < 60.0:
                healed_dict, report = heal_drifted_log(event.model_dump())
                healed_event = NormalizedSecurityEvent(**healed_dict)
                self.events[log_id] = healed_event
                reports.append(report)
                self.healing_reports.append(report)
                
                # Register parser v2
                v2_id = "fw_v2.0"
                self.registered_parsers[v2_id] = ParserRule(
                    id=v2_id,
                    name="Perimeter Firewall v2.0 (Self-Healed)",
                    version="v2.0",
                    format_signature="ACT= SRCIP= DSTIP= P= DP=",
                    is_adaptive=True,
                    mappings=report.drifted_keys,
                    created_at="Just now (Synthesized)",
                    active=True,
                )
        return reports

    def load_demo_baseline(self) -> List[NormalizedSecurityEvent]:
        self.clear()
        self.ingest(BASELINE_LOGS)
        return self.process_all()

    def inject_unknown(self, kind: str = "edgex") -> NormalizedSecurityEvent:
        raw_text = UNKNOWN_LOG_EDGEX if kind == "edgex" else UNKNOWN_LOG_RTX9
        items = self.ingest([raw_text])
        event = self.process_log(items[0].id)
        return event

    def inject_drift(self) -> NormalizedSecurityEvent:
        items = self.ingest([DRIFTED_LOG_FW])
        event = self.process_log(items[0].id)
        return event

store = InMemoryStore()
