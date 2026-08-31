const API_BASE = "http://127.0.0.1:8000";

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  async getLogs() {
    const res = await fetch(`${API_BASE}/logs`);
    return res.json();
  },

  async getEvents() {
    const res = await fetch(`${API_BASE}/events`);
    return res.json();
  },

  async getEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return res.json();
  },

  async getParsers() {
    const res = await fetch(`${API_BASE}/parsers`);
    return res.json();
  },

  async getHealingReports() {
    const res = await fetch(`${API_BASE}/healing-reports`);
    return res.json();
  },

  async loadBaseline() {
    const res = await fetch(`${API_BASE}/demo/load`, { method: "POST" });
    return res.json();
  },

  async injectUnknown(kind = "edgex") {
    const res = await fetch(`${API_BASE}/demo/unknown?kind=${kind}`, { method: "POST" });
    return res.json();
  },

  async injectDrift() {
    const res = await fetch(`${API_BASE}/demo/drift`, { method: "POST" });
    return res.json();
  },

  async triggerSelfHealing() {
    const res = await fetch(`${API_BASE}/demo/self-heal`, { method: "POST" });
    return res.json();
  },

  async clearAll() {
    const res = await fetch(`${API_BASE}/demo/clear`, { method: "POST" });
    return res.json();
  },

  async processCustom(raw_text) {
    const res = await fetch(`${API_BASE}/logs/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text }),
    });
    return res.json();
  },

  async testAdaptive(raw_text) {
    const res = await fetch(`${API_BASE}/parsers/adaptive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text }),
    });
    return res.json();
  }
};
