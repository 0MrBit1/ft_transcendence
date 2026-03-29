// ── Events list page ───────────────────────────────────
(function () {
  const grid = document.getElementById('events-grid');
  const paginationEl = document.getElementById('pagination');
  const filterType = document.getElementById('filter-type');
  const filterTag = document.getElementById('filter-tag');
  const btnSearch = document.getElementById('btn-search');
  const toggleAll = document.getElementById('toggle-all');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalBody = document.getElementById('modal-body');

  let currentPage = 1;

  // ── Load events ──────────────────────────────────────
  async function loadEvents(page) {
    currentPage = page || 1;
    grid.innerHTML = '<p class="empty-state">Loading…</p>';

    try {
      const showAll = toggleAll.checked;
      const type = filterType.value;
      const tag = filterTag.value.trim();

      let data;
      if (showAll) {
        // Debug endpoint — all statuses
        data = await api.get('/events/all');
      } else {
        let qs = `?page=${currentPage}&limit=12`;
        if (type) qs += `&type=${encodeURIComponent(type)}`;
        if (tag) qs += `&tag=${encodeURIComponent(tag)}`;
        data = await api.get(`/events${qs}`);
      }

      const events = data.data;
      const meta = data.meta;

      if (!events.length) {
        grid.innerHTML = '<p class="empty-state">No events found. <a href="/create.html">Create one!</a></p>';
        paginationEl.innerHTML = '';
        return;
      }

      grid.innerHTML = events.map(eventCard).join('');
      renderPagination(meta);

      // Click handlers
      grid.querySelectorAll('.event-card').forEach((card) => {
        card.addEventListener('click', () => openDetail(card.dataset.id));
      });
    } catch (err) {
      grid.innerHTML = '<p class="empty-state">Failed to load events.</p>';
      console.error(err);
    }
  }

  // ── Event card ───────────────────────────────────────
  function eventCard(ev) {
    const start = new Date(ev.startTime).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const cap = ev.capacity ? `${ev.remainingCapacity}/${ev.capacity}` : '∞';
    const tags = (ev.tags || []).map((t) => `<span class="tag">${esc(t.tag)}</span>`).join('');

    return `
      <div class="event-card" data-id="${ev.id}">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem">
          <h3>${esc(ev.title)}</h3>
          ${statusBadge(ev.status)}
        </div>
        <div class="event-meta">📅 ${start}</div>
        <div class="event-meta">📍 ${ev.locationType}${ev.location ? ' · ' + esc(ev.location) : ''}</div>
        <div class="event-meta">👥 ${cap} spots · ${ev.type}</div>
        ${ev.organization ? `<div class="event-meta">🏢 ${esc(ev.organization.name)}</div>` : ''}
        ${ev.description ? `<p class="event-desc">${esc(ev.description)}</p>` : ''}
        <div class="event-footer">
          <div class="tags">${tags}</div>
        </div>
      </div>`;
  }

  // ── Pagination ───────────────────────────────────────
  function renderPagination(meta) {
    if (!meta.totalPages || meta.totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }
    let html = '';
    html += `<button ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">← Prev</button>`;
    html += `<span>Page ${meta.page} of ${meta.totalPages}</span>`;
    html += `<button ${currentPage >= meta.totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Next →</button>`;
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page, 10);
        if (p >= 1) loadEvents(p);
      });
    });
  }

  // ── Detail modal ─────────────────────────────────────
  async function openDetail(id) {
    try {
      const ev = await api.get(`/events/${id}`);
      const start = new Date(ev.startTime).toLocaleString();
      const end = ev.endTime ? new Date(ev.endTime).toLocaleString() : '—';
      const cap = ev.capacity ? `${ev.remainingCapacity} / ${ev.capacity}` : 'Unlimited';
      const tags = (ev.tags || []).map((t) => `<span class="tag">${esc(t.tag)}</span>`).join('') || '—';

      modalBody.innerHTML = `
        <h2>${esc(ev.title)}</h2>
        ${statusBadge(ev.status)}
        <hr style="margin:0.75rem 0;border:none;border-top:1px solid var(--border)">
        <div class="detail-row"><span class="label">Type</span><span>${ev.type}</span></div>
        <div class="detail-row"><span class="label">Location</span><span>${ev.locationType}${ev.location ? ' — ' + esc(ev.location) : ''}</span></div>
        <div class="detail-row"><span class="label">Start</span><span>${start}</span></div>
        <div class="detail-row"><span class="label">End</span><span>${end}</span></div>
        <div class="detail-row"><span class="label">Capacity</span><span>${cap}</span></div>
        <div class="detail-row"><span class="label">Organization</span><span>${ev.organization ? esc(ev.organization.name) : '—'}</span></div>
        <div class="detail-row"><span class="label">Tags</span><div class="tags">${tags}</div></div>
        ${ev.description ? `<p style="margin-top:1rem;color:var(--text-muted)">${esc(ev.description)}</p>` : ''}
        <p style="margin-top:1rem;font-size:0.75rem;color:var(--text-muted)">ID: ${ev.id}</p>
      `;
      modalOverlay.classList.remove('hidden');
    } catch {
      toast('Failed to load event details', 'error');
    }
  }

  // ── Event listeners ──────────────────────────────────
  modalClose.addEventListener('click', () => modalOverlay.classList.add('hidden'));
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
  });

  btnSearch.addEventListener('click', () => loadEvents(1));
  filterTag.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadEvents(1); });
  toggleAll.addEventListener('change', () => loadEvents(1));

  // initial load
  loadEvents(1);
})();
