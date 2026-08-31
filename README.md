# NTRO Universal Adaptive Log Preprocessor (SIH26156)
> **Smart India Hackathon 2026 Prototype** • *Perimeter & Router Security Log Preprocessing Engine*

[![Air-Gapped Local Architecture](https://img.shields.io/badge/Architecture-100%25%20Air--Gapped%20Local-10b981.svg)]()
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.13-06b6d4.svg)]()
[![React Dashboard](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-6366f1.svg)]()
[![SIH Problem](https://img.shields.io/badge/SIH%202026-SIH26156-f59e0b.svg)]()

---

## 🎯 Executive Summary & Problem Context

Perimeter security infrastructure (border routers, next-generation firewalls, VPN concentrators, IDS/IPS, security gateways) generates massive volumes of heterogeneous, unstructured, and vendor-proprietary log streams.

**Traditional log preprocessors suffer from critical limitations:**
1. **Brittle Rigid Parsers:** Ingestion breaks whenever an unknown vendor appliance is deployed or when firmware updates modify log format syntax.
2. **Heavy Manual Rule Engineering:** Analysts must manually write Grok/Regex expressions for every new perimeter device.
3. **Cloud/LLM Dependency Risks:** Cloud-based log parsing exposes sensitive internal defense IP topologies and firewall policies to external networks.

### The Solution: Universal Adaptive Log Preprocessor
An **intelligent, 100% air-gapped local preprocessing engine** that:
- Ingests raw perimeter logs with zero cloud or external LLM dependencies.
- Identifies **Known vs. Unknown** log formats through structural fingerprinting.
- Adaptively extracts features and infers field semantics using semantic synonym resolution without hardcoded vendor parsers.
- Detects **schema drift** when existing parsers degrade in confidence.
- Executes **autonomous self-healing** by synthesizing updated parser rules in real-time.
- Normalizes all traffic events into a standardized defense schema.

---

## 🏗 System Architecture & Pipeline

```
RAW PERIMETER LOG
       ↓
LOCAL INGESTION (Air-Gapped, Zero-Cloud)
       ↓
FORMAT FINGERPRINTING & CLASSIFICATION
       ↓
┌─────────────────────────┴─────────────────────────┐
│                                                   │
▼                                                   ▼
KNOWN FORMAT                               UNKNOWN VENDOR FORMAT
(Cisco, FW v1, Syslog)                              │
│                                                   ▼
│                                         ADAPTIVE FEATURE EXTRACTION
│                                         (IPs, Ports, Action Verbs, Delimiters)
│                                                   │
│                                                   ▼
│                                         SEMANTIC VOCABULARY INFERENCE
│                                         (SRCIP → source_ip, DP → dport)
│                                                   │
│                                                   ▼
│                                         DYNAMIC PARSER SYNTHESIS
│                                                   │
└─────────────────────────┬─────────────────────────┘
                          ▼
            DETERMINISTIC CONFIDENCE SCORING
            (Explainable Weighted Evaluation: 0–100%)
                          │
                          ▼
               SCHEMA VALIDATION CHECK
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
     CONFIDENCE >= 60%          CONFIDENCE < 60%
             │                 (Schema Mutation / Drift)
             │                         │
             │                         ▼
             │                 DRIFT DETECTION ENGINE
             │                         │
             │                         ▼
             │                 ADAPTIVE RE-PARSING
             │                         │
             │                         ▼
             │                 SYNTHESIZE PARSER v2.0
             │                         │
             │                         ▼
             │                 SELF-HEALED EVENT (100% Conf)
             │                         │
             └────────────┬────────────┘
                          ▼
             UNIVERSAL NORMALIZED EVENT
             (JSON Schema for SIEM / SOC)
                          │
                          ▼
             SOC ANALYTICS & VISUALIZER
```

---

## ⚡ Quick Start: Running the Prototype

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & **npm**

### Option A: Run Backend & Frontend in Separate Terminals

#### Terminal 1: Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://127.0.0.1:8000` (Swagger docs available at `http://127.0.0.1:8000/docs`).*

#### Terminal 2: Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📋 5-Minute Judge Demonstration Script

Follow this step-by-step walkthrough to present the prototype to the evaluators:

| Step | Action on UI | What Happens in the Engine | What to Say to the Judges |
| :--- | :--- | :--- | :--- |
| **1** | Click **"1. Load Baseline Logs"** | Ingests 5 baseline logs (Cisco router ACLs, Firewall v1, Linux Syslog sshd). Known parsers process them instantly. | *"Notice how the system fingerprints known router and firewall logs and normalizes them into our universal schema with 100% confidence."* |
| **2** | Click **"2. Inject Unknown Vendor (EDGE-X)"** | System receives an unknown vendor format: `31-08-2026 EDGE-X \| SRCIP:... \| DSTIP:... \| P:TCP \| DP:3389 \| DECISION:BLOCK`. | *"Now we inject an unknown perimeter appliance format never seen before. Watch the engine automatically detect it as UNKNOWN."* |
| **3** | Inspect the **Adaptive Parser Inspector Panel** | The adaptive engine tokenizes the log, extracts features (IPs, Ports, Action verbs), and matches keys (`SRCIP` $\to$ `source_ip`, `DP` $\to$ `destination_port`, `DECISION` $\to$ `action`). | *"Without writing a single line of code, our adaptive engine infers the schema, calculates 100% confidence, and maps all attributes dynamically."* |
| **4** | Click **"3. Inject Format Drift"** | Ingests mutated log `ACT=DENY SRCIP=10.1.1.5 DSTIP=10.1.1.20 P=TCP DP=22`. Existing parser `fw_v1.0` fails (Confidence drops to 25%). | *"Firmware updates often mutate log keys. Here, the existing v1 parser fails, confidence drops to 25%, and the Drift Detector flags the anomaly."* |
| **5** | Click **"4. Trigger Self-Healing"** | System initiates adaptive re-analysis, synthesizes `fw_v2.0 (Self-Healed)`, repairs the event, and updates the registry. | *"The engine autonomously self-heals: it synthesizes parser v2.0, repairs the degraded log, and restores confidence to 100%."* |
| **6** | Click **"LOCAL / AIR-GAPPED"** badge | Opens the architecture boundary diagram. | *"Crucially, all preprocessing, feature extraction, and self-healing happen 100% locally on-premises. Zero cloud APIs, zero sensitive IP leakage."* |
| **7** | Click **"Custom Log"** | Type or paste any custom perimeter log string and click "Adaptively Ingest & Parse". | *"Judges can test any custom router or firewall string in real time to verify the live adaptive inference."* |

---

## 🔬 R&D Novelty & Technical Differentiators

| R&D Area | Traditional SIEM / Log Collectors | NTRO Universal Adaptive Preprocessor |
| :--- | :--- | :--- |
| **Unknown Vendors** | Hard failure / unparsed text blob | **Adaptive Feature Extraction & Semantic Synonym Inference** |
| **Schema Drift** | Silent data corruption or ingestion failure | **Drift Detector Engine with Confidence Thresholding** |
| **Self-Healing** | Requires manual engineer patch | **Autonomous Parser Rule Synthesis (v1 $\to$ v2)** |
| **Confidence Scoring** | Binary success/fail | **Deterministic, Explainable Multi-Attribute Score (0–100%)** |
| **Air-Gap Compliance** | Often relies on cloud SIEM / LLM APIs | **100% Local Python Engine with Zero External Egress** |

---

## 📊 Universal Normalized Defense Schema

Every ingested log is normalized into this standard event structure:

```json
{
  "id": "log_a8f9c12b",
  "timestamp": "31-08-2026 21:13:04",
  "device": "EDGE-X",
  "device_type": "Perimeter Gateway",
  "source_ip": "172.20.1.50",
  "destination_ip": "10.10.4.8",
  "source_port": null,
  "destination_port": 3389,
  "protocol": "TCP",
  "action": "DENY",
  "event_type": "Perimeter Traffic Filter",
  "severity": "WARNING",
  "bytes": 421,
  "raw_log": "31-08-2026 21:13:04 EDGE-X | SRCIP:172.20.1.50 | DSTIP:10.10.4.8 | P:TCP | DP:3389 | DECISION:BLOCK | BYTES:421",
  "parser_type": "adaptive",
  "parser_version": "adaptive_v1.0",
  "confidence": 100.0,
  "status": "adaptive"
}
```

---

## 🚀 Implemented Capabilities vs. Future Roadmap

### ✅ Implemented in Prototype (Day 1)
- [x] Local Ingestion & Routing Engine (FastAPI)
- [x] Known Parsers (Cisco IOS %SEC ACLs, Firewall v1 KV, Linux Syslog sshd)
- [x] Unknown Log Detection & Format Fingerprinting
- [x] Adaptive Feature Extractor (IPv4, Ports, Protocols, Action verbs, Delimiters)
- [x] Semantic Synonym Inference Engine
- [x] Deterministic Explainable Confidence Scorer
- [x] Format Drift Detector & Schema Anomaly Trigger
- [x] Autonomous Self-Healing Pipeline (Parser v1 $\to$ v2 Synthesis & Log Repair)
- [x] Dark SOC Cybersecurity Visualizer (React, Tailwind, Recharts, Lucide)
- [x] Air-Gapped Local Architecture Model

### 🔮 Future Production Enhancements
- Distributed stream processing with Apache Kafka / Vector for 100,000+ EPS throughput.
- Hardware-accelerated regex matching via Hyperscan / vectors.
- Persistent SQLite / DuckDB long-term historical event store with indexed search.
- Integration with STIX/TAXII threat intelligence feeds for automated IOC enrichment.
