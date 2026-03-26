// ── API helper ─────────────────────────────────────────
const API_BASE = '/api/v1';

const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async patch(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};

// ── Toast ──────────────────────────────────────────────
function toast(msg, type = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast hidden';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `toast ${type}`;
  setTimeout(() => (el.className = 'toast hidden'), 3500);
}

// ── HTML escape ────────────────────────────────────────
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ── Badge helper ───────────────────────────────────────
function statusBadge(status) {
  const cls = {
    DRAFT: 'badge-draft',
    PUBLISHED: 'badge-published',
    CANCELLED: 'badge-cancelled',
    COMPLETED: 'badge-completed',
  };
  return `<span class="badge ${cls[status] || ''}">${status}</span>`;
}
