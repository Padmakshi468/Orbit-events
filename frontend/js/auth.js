// ═══════════════════════════════════════════════════
//  auth.js — Orbit shared authentication utilities
// ═══════════════════════════════════════════════════

const API_BASE = 'http://127.0.0.1:5000/api';

// ─── Token helpers ────────────────────────────────
function getToken() {
  return localStorage.getItem('orbit_token');
}

function getUser() {
  const raw = localStorage.getItem('orbit_user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  try {
    // Decode JWT payload (no verification, just read expiry)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function saveSession(token, user) {
  localStorage.setItem('orbit_token', token);
  localStorage.setItem('orbit_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('orbit_token');
  localStorage.removeItem('orbit_user');
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

// ─── Auth guard: redirect to login if not logged in ─
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ─── Redirect logged-in users away from auth pages ─
function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return true;
  }
  return false;
}

// ─── Authenticated fetch wrapper ──────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Inject navbar user state ──────────────────────
function initNavbar() {
  const user = getUser();
  const loggedIn = isLoggedIn();

  // Update nav links based on auth state
  document.querySelectorAll('[data-auth="guest"]').forEach(el => {
    el.style.display = loggedIn ? 'none' : '';
  });
  document.querySelectorAll('[data-auth="user"]').forEach(el => {
    el.style.display = loggedIn ? '' : 'none';
  });

  // Set user name display
  const nameEl = document.querySelector('[data-user-name]');
  if (nameEl && user) nameEl.textContent = user.name;

  // Wire logout buttons
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      logout();
    });
  });
}

// Show toast notification
function showToast(message, type = 'success') {
  const existing = document.getElementById('orbit-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'orbit-toast';
  toast.className = `orbit-toast orbit-toast--${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="toast-msg">${message}</span>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('orbit-toast--show'));
  setTimeout(() => {
    toast.classList.remove('orbit-toast--show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Show inline form error
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('input-error');
  let err = field.parentElement.querySelector('.field-error-msg');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error-msg';
    field.parentElement.appendChild(err);
  }
  err.textContent = message;
}

function clearFieldErrors() {
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  document.querySelectorAll('.field-error-msg').forEach(el => el.remove());
}

// Set button loading state
function setButtonLoading(btn, loading, originalText) {
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Please wait...';
    btn.disabled = true;
  } else {
    btn.textContent = originalText || btn.dataset.originalText;
    btn.disabled = false;
  }
}
