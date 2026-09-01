from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any

from models.schemas import (
    IngestRequest,
    ProcessRequest,
    BatchProcessRequest,
    NormalizedSecurityEvent,
    RawLogItem,
    SystemStats,
    SelfHealingReport,
    ParserRule,
)
from services.store import store
from services.adaptive_parser import parse_adaptively
from services.normalizer import process_single_log

app = FastAPI(
    title="NTRO Universal Adaptive Log Preprocessor API",
    description="Intelligent Local Log Preprocessor for Perimeter Security Devices (SIH26156)",
    version="1.0.0",
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mode": "air_gapped_local",
        "engine": "Universal Adaptive Log Preprocessor",
        "version": "1.0.0",
    }

@app.post("/logs/ingest", response_model=List[RawLogItem])
def ingest_logs(req: IngestRequest):
    if not req.logs:
        raise HTTPException(status_code=400, detail="No logs provided")
    return store.ingest(req.logs)

@app.post("/logs/process", response_model=NormalizedSecurityEvent)
def process_log(req: ProcessRequest):
    if req.log_id:
        ev = store.process_log(req.log_id)
        if not ev:
            raise HTTPException(status_code=404, detail="Log ID not found")
        return ev
    elif req.raw_text:
        items = store.ingest([req.raw_text])
        return store.process_log(items[0].id)
    else:
        raise HTTPException(status_code=400, detail="Either log_id or raw_text must be provided")

@app.post("/logs/process-batch", response_model=List[NormalizedSecurityEvent])
def process_batch(req: Optional[BatchProcessRequest] = None):
    if req and req.log_ids:
        res = []
        for lid in req.log_ids:
            ev = store.process_log(lid)
            if ev:
                res.append(ev)
        return res
    return store.process_all()

@app.get("/logs", response_model=List[RawLogItem])
def list_raw_logs():
    return list(store.raw_logs.values())

@app.get("/logs/{log_id}", response_model=RawLogItem)
def get_raw_log(log_id: str):
    item = store.raw_logs.get(log_id)
    if not item:
        raise HTTPException(status_code=404, detail="Log item not found")
    return item

@app.get("/events", response_model=List[NormalizedSecurityEvent])
def list_events(status: Optional[str] = None):
    evs = list(store.events.values())
    if status:
        evs = [e for e in evs if e.status.lower() == status.lower()]
    return evs

@app.get("/events/{event_id}", response_model=NormalizedSecurityEvent)
def get_event(event_id: str):
    ev = store.events.get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Normalized event not found")
    return ev

@app.get("/stats", response_model=SystemStats)
def get_system_stats():
    return store.get_stats()

@app.get("/parsers", response_model=List[ParserRule])
def list_parsers():
    return list(store.registered_parsers.values())

@app.get("/parsers/{parser_id}", response_model=ParserRule)
def get_parser(parser_id: str):
    p = store.registered_parsers.get(parser_id)
    if not p:
        raise HTTPException(status_code=404, detail="Parser rule not found")
    return p

@app.post("/parsers/adaptive")
def test_adaptive_parser(payload: Dict[str, str]):
    raw_text = payload.get("raw_text", "")
    if not raw_text:
        raise HTTPException(status_code=400, detail="raw_text is required")
    return parse_adaptively(raw_text)

@app.get("/healing-reports", response_model=List[SelfHealingReport])
def get_healing_reports():
    return store.healing_reports

# ==================== DEMO CONTROLLER ENDPOINTS ====================

@app.post("/demo/load", response_model=List[NormalizedSecurityEvent])
def demo_load_baseline():
    """Step 1 & 2: Load baseline perimeter logs (Cisco, FW, Syslog) and process them."""
    return store.load_demo_baseline()

@app.post("/demo/unknown", response_model=NormalizedSecurityEvent)
def demo_inject_unknown(kind: str = Query("edgex", enum=["edgex", "rtx9"])):
    """Step 3 - 8: Inject an unknown vendor log format (EDGE-X or RT-X9)."""
    return store.inject_unknown(kind)

@app.post("/demo/drift", response_model=NormalizedSecurityEvent)
def demo_inject_drift():
    """Step 9 & 10: Inject a format-drifted log that breaks existing parser v1."""
    return store.inject_drift()

@app.post("/demo/self-heal", response_model=List[SelfHealingReport])
def demo_trigger_self_healing():
    """Step 11 & 12: Trigger self-healing to synthesize Parser v2 and recover confidence."""
    return store.trigger_self_healing()

@app.post("/demo/clear")
def demo_clear():
    """Reset state for a fresh demonstration run."""
    store.clear()
    return {"message": "Store cleared successfully", "stats": store.get_stats()}

# ==================== SPA FRONTEND SERVING ====================
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Search for the built frontend dist in all standard locations
dist_path = None
possible_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    "/app/frontend/dist",
    "/app/dist",
]

for candidate in possible_candidates:
    if os.path.exists(candidate) and os.path.exists(os.path.join(candidate, "index.html")):
        dist_path = candidate
        break

if dist_path:
    assets_dir = os.path.join(dist_path, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API 404s for non-existent API routes
        api_prefixes = ["health", "stats", "events", "logs", "parsers", "healing-reports", "demo", "api"]
        if any(full_path.startswith(p) for p in api_prefixes):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        file_path = os.path.join(dist_path, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index_file = os.path.join(dist_path, "index.html")
        return FileResponse(index_file)
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "message": "FastAPI is running. Frontend build not found.",
            "docs": "/docs",
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
