// ── Create event page ──────────────────────────────────
(function () {
  const form = document.getElementById('create-form');
  const orgSelect = document.getElementById('organizationId');

  // ── Load organizations into dropdown ─────────────────
  async function loadOrgs() {
    try {
      const data = await api.get('/organizations');
      const orgs = Array.isArray(data) ? data : data.data || [];
      if (!orgs.length) {
        orgSelect.innerHTML = '<option value="">No organizations found</option>';
        return;
      }
      orgSelect.innerHTML = orgs
        .map((o) => `<option value="${o.id}">${esc(o.name)}</option>`)
        .join('');
    } catch {
      // Fallback — load from events/all to extract unique orgs
      try {
        const data = await api.get('/events/all');
        const seen = new Set();
        const orgs = [];
        for (const ev of data.data || []) {
          if (ev.organization && !seen.has(ev.organization.id)) {
            seen.add(ev.organization.id);
            orgs.push(ev.organization);
          }
        }
        if (orgs.length) {
          orgSelect.innerHTML = orgs
            .map((o) => `<option value="${o.id}">${esc(o.name)}</option>`)
            .join('');
          return;
        }
      } catch { /* ignore */ }

      // Last-resort: let user paste an ID
      orgSelect.outerHTML =
        '<input id="organizationId" name="organizationId" required placeholder="Paste organization ID" />';
    }
  }

  // ── Submit handler ───────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const body = {
      title: fd.get('title'),
      type: fd.get('type'),
      locationType: fd.get('locationType'),
      startTime: new Date(fd.get('startTime')).toISOString(),
      organizationId: fd.get('organizationId'),
    };

    const desc = fd.get('description');
    if (desc) body.description = desc;

    const loc = fd.get('location');
    if (loc) body.location = loc;

    const endTime = fd.get('endTime');
    if (endTime) body.endTime = new Date(endTime).toISOString();

    const cap = fd.get('capacity');
    if (cap) body.capacity = parseInt(cap, 10);

    const tagsRaw = fd.get('tags');
    if (tagsRaw) {
      body.tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
    }

    try {
      const event = await api.post('/events', body);
      toast(`Event "${event.title}" created! (Status: ${event.status})`);
      // redirect after a moment
      setTimeout(() => (window.location.href = '/'), 1200);
    } catch (err) {
      const msg = err.message || (Array.isArray(err.message) ? err.message.join(', ') : 'Failed to create event');
      toast(msg, 'error');
      console.error(err);
    }
  });

  loadOrgs();
})();
