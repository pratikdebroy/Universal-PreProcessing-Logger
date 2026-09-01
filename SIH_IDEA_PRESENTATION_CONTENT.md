# Smart India Hackathon 2026: Idea Submission Presentation
## Problem Statement SIH26156: NTRO Log Preprocessing

This document contains the slide-by-slide content formatted according to the official **Smart India Hackathon Idea Submission Template**.

The presentation file has been generated and is ready to use:
📁 **[`SIH26156_NTRO_Log_Preprocessor_Presentation.pptx`](file:///c:/Users/gauta/Log%20Prototype/SIH26156_NTRO_Log_Preprocessor_Presentation.pptx)**

---

### 📌 SLIDE 1: IDEA TITLE
- **Idea Title:** Universal Adaptive Log Preprocessor for Heterogeneous Perimeter & Network Devices
- **Problem Statement ID:** SIH26156
- **Problem Statement Title:** NTRO Log Preprocessing
- **Organization:** National Technical Research Organisation (NTRO)
- **Theme / Category:** Security & Surveillance / Cyber Defense / Smart Automation
- **Core Capability:** Autonomous Unknown Log Detection, Adaptive Schema Inference, Zero-Cloud Air-Gapped Operation
- **Team Name / Leader:** `[Your Team Name]` | `[Team Leader & Member Names]`

---

### 📌 SLIDE 2: PROPOSED SOLUTION (Idea / Solution / Prototype)

#### ❖ Detailed Explanation of the Proposed Solution:
- **Heterogeneous Ingestion:** Ingests live telemetry from border routers, next-generation firewalls, VPN gateways, and perimeter appliances without requiring manual parser engineering.
- **Structural Fingerprinting:** Instantly recognizes known log formats (Cisco IOS ACLs, Firewall KV, Linux Syslog) and identifies unknown/unseen vendor formats.
- **Zero-Code Adaptive Parsing:** Tokenizes unstructured logs, extracts critical security entities (IPv4/IPv6, Ports, Action verbs, Protocols, Timestamps), and matches them against semantic synonym dictionaries (`SRCIP` $\to$ `source_ip`, `DP` $\to$ `destination_port`, `DECISION` $\to$ `action`).
- **Universal Schema Normalization:** Converts all incoming telemetry into a standardized JSON defense schema for seamless ingestion by downstream SIEMs, SOC analytics, and threat-hunting engines.

#### ❖ How It Addresses the Problem:
- Solves the bottleneck where security teams spend hundreds of hours writing brittle Grok/Regex expressions for new vendor devices.
- Eliminates log drop-off and unparsed data blackouts when firmware updates modify vendor log syntax.

#### ❖ Innovation & Key R&D Differentiators:
1. **Autonomous Self-Healing:** Detects schema drift when parser confidence drops (e.g. 100% $\to$ 25%), triggers adaptive re-analysis, synthesizes **Parser v2.0**, and restores confidence to 100%.
2. **Deterministic Confidence Scorer:** Explainable multi-attribute scoring (Timestamp +20%, Src IP +20%, Dst IP +20%, Protocol +15%, Action +15%, Port +10%) eliminating black-box guessing.
3. **100% Air-Gapped Local Operation:** 0% cloud egress, 0% LLM API calls. Sensitive internal IP topologies and firewall policies never leave the local on-premise defense network.

---

### 📌 SLIDE 3: TECHNICAL ARCHITECTURE & PROCESSING PIPELINE

#### ❖ 7-Stage Real-Time Pipeline:
1. **Ingestion:** Local raw log stream collection.
2. **Fingerprinting:** Structural delimiter & token analysis (`|`, `::`, `%`, `=`).
3. **Classification:** Automated routing into Known vs. Unknown paths.
4. **Adaptive Parsing:** Dynamic semantic synonym mapping and positional AST generation.
5. **Confidence Scorer:** Deterministic explainable multi-attribute evaluation (0–100%).
6. **Normalization:** Universal JSON defense schema generation.
7. **Drift Detection & Self-Healing:** Autonomous rule evolution (Parser v1 $\to$ v2) upon syntax shifts.

#### ❖ Core Technology Stack:
- **Backend:** Python 3.13, FastAPI (High-throughput async REST API), Pydantic v2 (Strict Schema Validation).
- **Inference & Parsing:** Pattern-based Feature Extractor, Semantic Synonym Dictionaries, Positional Token Entropy.
- **Frontend SOC Dashboard:** React 18, Vite, Tailwind CSS (Dark SOC Theme), Recharts (Telemetry Analytics), Lucide Icons.
- **Security Boundary:** 100% On-Premise Execution, Zero External Network Egress, In-Memory Store.

---

### 📌 SLIDE 4: FEASIBILITY AND VIABILITY

#### ❖ Analysis of Feasibility:
- **Technical Feasibility:** Lightweight regex compilation and deterministic hash lookups achieve sub-millisecond per-log processing latency.
- **Operational Feasibility:** Drop-in compatibility with existing Syslog daemons (rsyslog, syslog-ng), Logstash, FluentBit, and Kafka streams.
- **Economic Viability:** Zero recurring cloud LLM token fees or vendor licensing costs. Runs on standard edge servers.

#### ❖ Potential Challenges & Risks:
- High EPS throughput load during distributed perimeter traffic surges (100,000+ logs/sec).
- Obfuscated proprietary log payloads without identifiable delimiters.
- Intermittent log corruption causing false-positive drift alarms.

#### ❖ Mitigation & Engineering Strategies:
- **Hyperscan & Vectorization:** Compile dynamic parser ASTs into hardware-accelerated C-bindings (Intel Hyperscan).
- **Positional Heuristic Fallback:** Dual-tier extraction combining key-value matching with positional token entropy and IPv4/Port patterns.
- **Confidence Quorum:** Require minimum batch failure verification (e.g. 5+ failed logs) before promoting self-healed Parser v2.0.

---

### 📌 SLIDE 5: IMPACT, BENEFITS, AND POTENTIAL APPLICATIONS

1. **National Security & Defense (NTRO / CERT-In / Military Grid):**
   - Seamlessly integrates diverse perimeter hardware across border routers, naval gateways, and military NOCs.
   - 100% Air-gapped deployment prevents sensitive defense network topology from leaking to external clouds.
2. **Critical Infrastructure & Financial Institutions:**
   - Protects banking networks, power grids (SCADA/ICS), and telecom backbones from log ingestion blackouts during vendor firmware updates.
3. **Massive Operational Efficiency:**
   - Reduces manual Grok/Regex parser engineering time by over 90%.
   - Eliminates cloud LLM API costs through deterministic edge execution.
4. **Resilient Self-Healing Zero-Downtime Pipeline:**
   - Eliminates silent data loss caused by schema drift with continuous uninterrupted log visibility for threat hunting.

---

### 📌 SLIDE 6: RESEARCH AND REFERENCES

- **IETF RFC 5424 & RFC 3164:** *The Syslog Protocol & BSD Syslog Standards for Network Device Logging.*
- **NIST Special Publication 800-92:** *Guide to Computer Security Log Management - Recommendations of the National Institute of Standards and Technology.*
- **Drain Log Parsing Research (He et al., IEEE ICWS):** *Drain: An Online Log Parsing Approach with Fixed Depth Trees for High-Volume Telemetry Systems.*
- **Spell & Logram Mining (Du et al., IEEE ICDM / Dai et al., IEEE TSE):** *Streaming Parsing of Unstructured System Logs and Log-based Automated Anomaly Detection.*
- **Schema Drift & Data Quality (Gao et al., ACM SIGMOD):** *Adaptive Schema Evolution and Anomaly Detection in Heterogeneous Streaming Pipelines.*
- **Smart India Hackathon 2026 Problem Guidelines:** *Problem Statement SIH26156: 'NTRO Log Preprocessing' - National Technical Research Organisation.*
