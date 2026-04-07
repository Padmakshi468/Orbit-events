// ═══════════════════════════════════════════════════
//  main.js — Orbit app logic v2.1
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();

  const page = document.body.dataset.page;
  if (page === 'login')      initLoginPage();
  if (page === 'register')   initRegisterPage();
  if (page === 'dashboard')  initDashboardPage();
  if (page === 'events')     initEventsPage();
  if (page === 'book-event') initBookEventPage();
  if (page === 'home')       initHomePage();
});

// ══════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════
function initLoginPage() {
  if (redirectIfLoggedIn()) return;
  const form = document.getElementById('login-form');
  const toggleBtn = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('password');
  const submitBtn = form?.querySelector('button[type="submit"]');

  toggleBtn?.addEventListener('click', () => {
    const hidden = passwordInput.type === 'password';
    passwordInput.type = hidden ? 'text' : 'password';
    toggleBtn.innerHTML = hidden
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();
    let valid = true;
    if (!email) { showFieldError('email', 'Email is required'); valid = false; }
    if (!password) { showFieldError('password', 'Password is required'); valid = false; }
    if (!valid) return;
    setButtonLoading(submitBtn, true);
    try {
      const data = await apiFetch('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      saveSession(data.token, data.user);
      showToast('Welcome back, ' + data.user.name + '!');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
      setButtonLoading(submitBtn, false, 'Sign In');
    }
  });
}

// ══════════════════════════════════════════════════
//  REGISTER
// ══════════════════════════════════════════════════
function initRegisterPage() {
  if (redirectIfLoggedIn()) return;
  const form = document.getElementById('register-form');
  const toggleBtn = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('password');
  const submitBtn = form?.querySelector('button[type="submit"]');

  toggleBtn?.addEventListener('click', () => {
    const hidden = passwordInput.type === 'password';
    passwordInput.type = hidden ? 'text' : 'password';
    toggleBtn.innerHTML = hidden
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  });

  passwordInput?.addEventListener('input', () => updatePasswordStrength(passwordInput.value));

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    let valid = true;
    if (!name)  { showFieldError('name', 'Full name is required'); valid = false; }
    if (!email) { showFieldError('email', 'Email is required'); valid = false; }
    if (!password) { showFieldError('password', 'Password is required'); valid = false; }
    else if (!passwordRegex.test(password)) { showFieldError('password', 'Must be 8+ chars with uppercase, lowercase, number & special character'); valid = false; }
    if (!valid) return;
    setButtonLoading(submitBtn, true);
    try {
      const data = await apiFetch('/users/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      saveSession(data.token, data.user);
      showToast('Account created! Welcome to Orbit 🚀');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      setButtonLoading(submitBtn, false, 'Create Account');
    }
  });
}

function updatePasswordStrength(value) {
  const bar = document.getElementById('strength-bar');
  const label = document.getElementById('strength-label');
  if (!bar || !label) return;
  const checks = [value.length >= 8, /[A-Z]/.test(value), /[a-z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)];
  const score = checks.filter(Boolean).length;
  const levels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  bar.style.width = `${(score / 5) * 100}%`;
  bar.style.background = colors[score];
  label.textContent = score > 0 ? levels[score] : '';
  label.style.color = colors[score];
}

// ══════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════
function initDashboardPage() {
  if (!requireAuth()) return;
  const user = getUser();
  document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = user?.name || 'User'; });
  loadDashboardEvents();
}

async function loadDashboardEvents() {
  const container = document.getElementById('dashboard-events');
  if (!container) return;
  try {
    const data = await apiFetch('/events');
    const events = (data.events || []).slice(0, 5);

    // Update stat counters with real data
    const statEvents = document.getElementById('stat-events');
    if (statEvents) animateCounter('stat-events', data.count || 0);

    if (events.length === 0) {
      container.innerHTML = '<p class="empty-state">No events yet. <a href="event-list.html">Create one!</a></p>';
      return;
    }
    container.innerHTML = events.map(ev => {
      const remaining = ev.totalSlots - ev.slotsBooked;
      const pct = Math.round((remaining / ev.totalSlots) * 100);
      const color = pct > 50 ? 'var(--success)' : pct > 20 ? 'var(--warning)' : 'var(--error)';
      return `
        <div class="dash-event-item">
          <div class="dash-event-dot" style="background:${color}"></div>
          <div class="dash-event-info">
            <strong>${ev.name}</strong>
            <span>${new Date(ev.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}${ev.city ? ' · ' + ev.city : ''}</span>
          </div>
          <span class="dash-event-slots" style="background:${color}1a; color:${color};">
            ${remaining} left
          </span>
        </div>`;
    }).join('');
  } catch {
    container.innerHTML = '<p class="empty-state">Could not load events.</p>';
  }
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let count = 0;
  const interval = setInterval(() => {
    count = Math.min(count + 1, target);
    el.textContent = count;
    if (count >= target) clearInterval(interval);
  }, 40);
}

// ══════════════════════════════════════════════════
//  EVENTS PAGE — list, search, filter, add, delete
// ══════════════════════════════════════════════════
let allEvents = []; // cache for search/filter

function initEventsPage() {
  if (!requireAuth()) return;

  loadEvents();
  initEventSearch();
  initAddEventModal();
}

async function loadEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading events…</p></div>';
  try {
    const data = await apiFetch('/events');
    allEvents = data.events || [];
    updateStatsBar(allEvents);
    renderEvents(allEvents);
  } catch {
    container.innerHTML = '<div class="empty-events"><p>Failed to load events. Is the backend running?</p></div>';
  }
}

function updateStatsBar(events) {
  const bar = document.getElementById('events-stats-bar');
  if (!bar) return;
  bar.style.display = 'flex';
  const soldOut = events.filter(e => e.slotsBooked >= e.totalSlots).length;
  document.getElementById('stat-total').textContent = `${events.length} event${events.length !== 1 ? 's' : ''}`;
  document.getElementById('stat-available').textContent = `${events.length - soldOut} available`;
  document.getElementById('stat-soldout').textContent = `${soldOut} sold out`;
}

function renderEvents(events) {
  const container = document.getElementById('events-container');
  if (!container) return;
  if (events.length === 0) {
    container.innerHTML = `<div class="empty-events" style="grid-column:1/-1;"><div class="empty-icon">📅</div><h3>No events found</h3><p>Try a different search, or create a new event.</p></div>`;
    return;
  }
  container.innerHTML = events.map(ev => createEventCard(ev)).join('');
}

function createEventCard(ev) {
  const remaining   = ev.totalSlots - ev.slotsBooked;
  const soldOut     = remaining <= 0;
  const pct         = Math.max(0, Math.round((remaining / ev.totalSlots) * 100));
  const slotColor   = soldOut ? '#ef4444' : pct <= 20 ? '#f97316' : pct <= 50 ? '#eab308' : '#22c55e';
  const slotLabel   = soldOut ? 'Sold Out' : `${remaining} slot${remaining !== 1 ? 's' : ''} left`;
  const dateStr     = new Date(ev.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
 
  const venueStr    = [ev.venueName, ev.city].filter(Boolean).join(', ');
  const collegeStr  = ev.collegeName || '';

  return `
    <div class="event-card${soldOut ? ' event-card--soldout' : ''}" data-id="${ev._id}">
      
        <div class="event-slot-badge" style="background:${slotColor};">
          ${soldOut ? '🚫 Sold Out' : `🎟 ${slotLabel}`}
        </div>
      
      <div class="event-card-body">
        <h3 class="event-card-title">${ev.name}</h3>
        ${venueStr  ? `<div class="event-meta-row">📍 ${venueStr}</div>` : ''}
        ${collegeStr ? `<div class="event-meta-row">🎓 ${collegeStr}</div>` : ''}
        <div class="event-meta-row">📅 ${dateStr}</div>
        ${ev.description ? `<p class="event-card-desc">${ev.description}</p>` : ''}

        <!-- Slot progress bar -->
        <div class="slot-progress-wrap">
          <div class="slot-progress-track">
            <div class="slot-progress-fill" style="width:${100 - pct}%; background:${slotColor};"></div>
          </div>
          <div class="slot-progress-labels">
            <span style="color:${slotColor}; font-weight:600;">${slotLabel}</span>
            <span>${ev.slotsBooked} / ${ev.totalSlots} booked</span>
          </div>
        </div>

        <div class="event-card-actions">
          ${soldOut
            ? `<span class="btn-soldout">Sold Out</span>`
            : `<a href="book-event.html?id=${ev._id}" class="btn-primary-sm">Book Now</a>`
          }
          <button class="btn-danger-sm" onclick="deleteEventById('${ev._id}', this)">Delete</button>
        </div>
      </div>
    </div>`;
}

async function deleteEventById(id, btn) {
  if (!confirm('Delete this event? This cannot be undone.')) return;
  btn.textContent = 'Deleting…';
  btn.disabled = true;
  try {
    await apiFetch(`/events/${id}`, { method: 'DELETE' });
    showToast('Event deleted.');
    allEvents = allEvents.filter(e => e._id !== id);
    updateStatsBar(allEvents);
    renderEvents(allEvents);
  } catch (err) {
    showToast(err.message || 'Delete failed.', 'error');
    btn.textContent = 'Delete';
    btn.disabled = false;
  }
}

// ── Search & Filter ─────────────────────────────
function initEventSearch() {
  const searchInput = document.getElementById('searchInput');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  let currentFilter = 'all';

  searchInput?.addEventListener('input', () => applySearchFilter(searchInput.value.trim(), currentFilter));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applySearchFilter(searchInput?.value.trim() || '', currentFilter);
    });
  });
}

function applySearchFilter(query, filter) {
  let results = allEvents;

  // Text search across name, venueName, city, collegeName
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(ev =>
      ev.name.toLowerCase().includes(q) ||
      (ev.venueName || '').toLowerCase().includes(q) ||
      (ev.city || '').toLowerCase().includes(q) ||
      (ev.collegeName || '').toLowerCase().includes(q)
    );
  }

  // Slot filter
  if (filter === 'available') results = results.filter(ev => ev.slotsBooked < ev.totalSlots);
  if (filter === 'soldout')   results = results.filter(ev => ev.slotsBooked >= ev.totalSlots);

  renderEvents(results);
}



function initAddEventModal() {
  // Open / close
  document.getElementById('openAddEventModal')?.addEventListener('click', () => {
    document.getElementById('addEventModal')?.classList.add('modal-open');
    document.getElementById('modal-overlay')?.classList.add('modal-open');
  });
  document.getElementById('closeModal')?.addEventListener('click', closeEventModal);
  document.getElementById('cancelModal')?.addEventListener('click', closeEventModal);
  document.getElementById('modal-overlay')?.addEventListener('click', closeEventModal);

 

  // Form submit
  document.getElementById('addEventForm')?.addEventListener('submit', submitCreateEvent);
}

async function submitCreateEvent(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('createEventBtn');

  const name         = document.getElementById('eventName').value.trim();
  const description  = document.getElementById('eventDescription').value.trim();
  const date         = document.getElementById('eventDate').value;
  const time         = document.getElementById('eventTime').value;
  const totalSlots   = parseInt(document.getElementById('totalSlots').value);
  const venueName    = document.getElementById('venueName').value.trim();
  const venueAddress = document.getElementById('venueAddress').value.trim();
  const city         = document.getElementById('city').value.trim();
  const collegeName  = document.getElementById('collegeName').value.trim();
  const collegeWebsite = document.getElementById('collegeWebsite').value.trim();
  const organiserName  = document.getElementById('organiserName').value.trim();
  const organiserEmail = document.getElementById('organiserEmail').value.trim();
  const organiserPhone = document.getElementById('organiserPhone').value.trim();

  if (!name || !date || !totalSlots || totalSlots < 1) {
    showToast('Event name, date and at least 1 slot are required.', 'error');
    return;
  }

  // Combine date + time if time provided
  const fullDate = time ? `${date}T${time}` : date;

  setButtonLoading(submitBtn, true);
  try {
    const payload = {
      name, description, date: fullDate, totalSlots,
      venueName, venueAddress, city,
      collegeName, collegeWebsite,
      organiserName, organiserEmail, organiserPhone,
      
    };

    const data = await apiFetch('/events', { method: 'POST', body: JSON.stringify(payload) });
    showToast('Event created successfully! 🎉');
    closeEventModal();
    document.getElementById('addEventForm').reset();
   
    // Add to local cache and re-render
    allEvents.unshift(data.event);
    updateStatsBar(allEvents);
    renderEvents(allEvents);
  } catch (err) {
    showToast(err.message || 'Failed to create event.', 'error');
  } finally {
    setButtonLoading(submitBtn, false, 'Create Event');
  }
}

function closeEventModal() {
  document.getElementById('addEventModal')?.classList.remove('modal-open');
  document.getElementById('modal-overlay')?.classList.remove('modal-open');
}

// ══════════════════════════════════════════════════
//  BOOK EVENT PAGE
// ══════════════════════════════════════════════════
function initBookEventPage() {
  if (!requireAuth()) return;

  const params  = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  if (!eventId) {
    // No event id — just redirect back
    window.location.href = 'event-list.html';
    return;
  }

  // Load event details from backend
  loadEventDetails(eventId);

  const form      = document.getElementById('event-booking-form');
  const submitBtn = document.getElementById('bookBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const name  = document.getElementById('booking-name').value.trim();
    const email = document.getElementById('booking-email').value.trim();

    let valid = true;
    if (!name)  { showFieldError('booking-name', 'Name is required');  valid = false; }
    if (!email) { showFieldError('booking-email', 'Email is required'); valid = false; }
    if (!valid) return;

    setButtonLoading(submitBtn, true);
    try {
      const data = await apiFetch('/bookings/book-event', {
        method: 'POST',
        body: JSON.stringify({ name, email, eventId }),
      });

      // Update slot meter immediately
      updateSlotMeter(data.slotsRemaining, data.booking);

      // Show success section
      form.closest('#formSection').querySelector('form').style.display = 'none';
      document.getElementById('booking-success').classList.remove('hidden');

      // Booking summary
      const b = data.booking;
      document.getElementById('booking-details-summary').innerHTML = `
        <div class="summary-row"><span>Name</span><strong>${b.name}</strong></div>
        <div class="summary-row"><span>Email</span><strong>${b.email}</strong></div>
        <div class="summary-row"><span>Event</span><strong>${b.eventName || 'Event'}</strong></div>
        ${b.venueName ? `<div class="summary-row"><span>Venue</span><strong>${b.venueName}${b.city ? ', ' + b.city : ''}</strong></div>` : ''}
        <div class="summary-row"><span>Date</span><strong>${new Date(b.eventDate).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}</strong></div>
      `;

      // QR code
      const qrData = `Orbit Event Booking\nName: ${b.name}\nEmail: ${b.email}\nEvent: ${b.eventName || eventId}\nDate: ${new Date(b.eventDate).toLocaleDateString()}`;
      generateQRCode(qrData);
      showToast('Booking confirmed! 🎉');
    } catch (err) {
      showToast(err.message || 'Booking failed.', 'error');
      setButtonLoading(submitBtn, false, 'Confirm Booking');
    }
  });
}

async function loadEventDetails(eventId) {
  const panel = document.getElementById('eventInfoPanel');
  if (!panel) return;

  try {
    const data = await apiFetch(`/events/${eventId}`);
    const ev = data.event;

    const remaining = ev.totalSlots - ev.slotsBooked;
    const soldOut   = remaining <= 0;
    const pct       = Math.max(0, Math.round((remaining / ev.totalSlots) * 100));
    const slotColor = soldOut ? '#ef4444' : pct <= 20 ? '#f97316' : pct <= 50 ? '#eab308' : '#22c55e';
   
    panel.innerHTML = `
     
      <div class="event-info-body">
        <h2 class="event-info-title">${ev.name}</h2>
        ${ev.description ? `<p class="event-info-desc">${ev.description}</p>` : ''}

        <div class="event-info-grid">
          <div class="info-chip">📅 ${new Date(ev.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}</div>
          ${ev.venueName  ? `<div class="info-chip">🏛️ ${ev.venueName}</div>` : ''}
          ${ev.venueAddress ? `<div class="info-chip">📌 ${ev.venueAddress}</div>` : ''}
          ${ev.city       ? `<div class="info-chip">🏙️ ${ev.city}</div>` : ''}
          ${ev.collegeName ? `<div class="info-chip">🎓 ${ev.collegeName}</div>` : ''}
          ${ev.collegeWebsite ? `<div class="info-chip">🔗 <a href="${ev.collegeWebsite}" target="_blank" style="color:var(--brand)">College Website</a></div>` : ''}
          ${ev.organiserName  ? `<div class="info-chip">👤 ${ev.organiserName}</div>` : ''}
          ${ev.organiserEmail ? `<div class="info-chip">✉️ ${ev.organiserEmail}</div>` : ''}
          ${ev.organiserPhone ? `<div class="info-chip">📞 ${ev.organiserPhone}</div>` : ''}
        </div>

        <!-- Slot meter on info panel -->
        <div class="slot-meter-card" style="margin-top:1.5rem;">
          <div class="slot-meter-header">
            <span class="slot-label">Seats Available</span>
            <span class="slot-count" style="color:${slotColor};">${soldOut ? 'Sold Out' : remaining + ' remaining'}</span>
          </div>
          <div class="slot-track">
            <div class="slot-fill" style="width:${100-pct}%; background:${slotColor};"></div>
          </div>
          <div class="slot-meta">
            <span>${ev.slotsBooked} booked</span>
            <span>of ${ev.totalSlots} total</span>
          </div>
        </div>
      </div>`;

    // Pre-fill user
    const user = getUser();
    if (user) {
      document.getElementById('booking-name').value  = user.name;
      document.getElementById('booking-email').value = user.email;
    }

    // Show/hide form based on soldOut
    if (soldOut) {
      document.getElementById('sold-out-banner')?.classList.remove('hidden');
      document.getElementById('bookBtn').disabled = true;
      document.getElementById('bookBtn').textContent = '🚫 Sold Out';
      document.getElementById('bookBtn').style.background = '#ef4444';
    }

  } catch {
    panel.innerHTML = '<p style="color:var(--error); padding:2rem;">Could not load event details.</p>';
  }
}

function updateSlotMeter(remaining, booking) {
  // Update right panel slot count (if visible)
  const countEl = document.getElementById('slotCountDisplay');
  if (countEl) countEl.textContent = remaining + ' remaining';
}

function generateQRCode(data) {
  const container = document.getElementById('qrContainer');
  if (!container) return;
  container.innerHTML = '';
  if (typeof QRCode === 'undefined') {
    container.innerHTML = '<p style="color:#888">QR library not loaded.</p>';
    return;
  }
  new QRCode(container, {
    text: data, width: 180, height: 180,
    colorDark: '#1a1530', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

// ══════════════════════════════════════════════════
//  HOME PAGE
// ══════════════════════════════════════════════════
function initHomePage() {
  if (isLoggedIn()) {
    const ctaBtn = document.getElementById('cta-btn');
    if (ctaBtn) { ctaBtn.textContent = 'Go to Dashboard'; ctaBtn.href = 'dashboard.html'; }
  }
}
