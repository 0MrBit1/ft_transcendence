(function () {
  const btnBook = document.getElementById('btn-book');
  const btnLoadUserBookings = document.getElementById('btn-load-user-bookings');
  const btnLoadEventBookings = document.getElementById('btn-load-event-bookings');
  const bookingsGrid = document.getElementById('bookings-grid');
  
  const createUserId = document.getElementById('create-user-id');
  const createEventId = document.getElementById('create-event-id');
  const viewUserId = document.getElementById('view-user-id');
  const viewEventId = document.getElementById('view-event-id');

  // Badge mapping for bookings
  const bBadge = (status) => {
    const map = { PENDING: 'badge-draft', CONFIRMED: 'badge-published', CANCELLED: 'badge-cancelled' };
    return `<span class="badge ${map[status] || ''}">${status}</span>`;
  };

  btnBook.addEventListener('click', async () => {
    try {
      if (!createUserId.value || !createEventId.value) return toast('All fields required', 'error');
      await api.post(`/bookings/events/${createEventId.value.trim()}`, { userId: createUserId.value.trim() });
      toast('Booking created successfully!', 'success');
      viewUserId.value = createUserId.value; // Convenience auto-fill
      viewEventId.value = createEventId.value;
    } catch (err) {
      toast(err.message || 'Error creating booking', 'error');
    }
  });

  btnLoadUserBookings.addEventListener('click', async () => {
    if (!viewUserId.value) return toast('User ID required', 'error');
    bookingsGrid.innerHTML = '<p class="empty-state">Loading…</p>';
    try {
      const res = await api.get(`/bookings/user/${viewUserId.value.trim()}`);
      if (!res.data.length) {
        bookingsGrid.innerHTML = '<p class="empty-state">No bookings found.</p>';
        return;
      }
      bookingsGrid.innerHTML = res.data.map(b => `
        <div class="event-card">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem">
            <h3>Event: ${esc(b.event.title)}</h3>
            ${bBadge(b.status)}
          </div>
          <p>Booking ID: ${b.id}</p>
          <div class="form-actions" style="margin-top: 1rem;">
             ${b.status !== 'CANCELLED' ? `<button onclick="window.cancelBooking('${b.id}')" class="btn btn-secondary" style="color:var(--danger)">Cancel</button>` : ''}
          </div>
        </div>
      `).join('');
    } catch (err) {
      bookingsGrid.innerHTML = '<p class="empty-state">Failed to load user bookings.</p>';
    }
  });

  btnLoadEventBookings.addEventListener('click', async () => {
    if (!viewEventId.value) return toast('Event ID required', 'error');
    bookingsGrid.innerHTML = '<p class="empty-state">Loading…</p>';
    try {
      const res = await api.get(`/bookings/events/${viewEventId.value.trim()}`);
      if (!res.data.length) {
        bookingsGrid.innerHTML = '<p class="empty-state">No bookings found.</p>';
        return;
      }
      bookingsGrid.innerHTML = res.data.map(b => `
        <div class="event-card">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem">
            <h3>User: ${esc(b.user.firstName + ' ' + b.user.lastName)}</h3>
            ${bBadge(b.status)}
          </div>
          <p>Booking ID: ${b.id}</p>
          <div class="form-actions" style="margin-top: 1rem;">
             ${b.status === 'PENDING' ? `<button onclick="window.confirmBooking('${b.id}')" class="btn btn-primary" style="margin-right:0.5rem">Confirm</button>` : ''}
             ${b.status !== 'CANCELLED' ? `<button onclick="window.cancelBooking('${b.id}')" class="btn btn-secondary" style="color:var(--danger)">Cancel</button>` : ''}
          </div>
        </div>
      `).join('');
    } catch (err) {
      bookingsGrid.innerHTML = '<p class="empty-state">Failed to load event bookings.</p>';
    }
  });

  window.cancelBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast('Booking cancelled.', 'success');
      // Reload the appropriate list if visible
      if (viewEventId.value && !viewUserId.value) btnLoadEventBookings.click();
      else if (viewUserId.value && !viewEventId.value) btnLoadUserBookings.click();
    } catch (err) {
      toast(err.message || 'Error cancelling', 'error');
    }
  };

  window.confirmBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/confirm`);
      toast('Booking confirmed.', 'success');
      btnLoadEventBookings.click();
    } catch (err) {
      toast(err.message || 'Error confirming', 'error');
    }
  };
})();
