/**
 * auth.js — Auth state management, guards, and helpers
 */
import { auth as authApi } from './api.js';

const USER_KEY = 'staybnb_user';

// ─── State ─────────────────────────────────────────────────────────────────
let _currentUser = null;

export function getCurrentUser() {
  if (_currentUser) return _currentUser;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) _currentUser = JSON.parse(raw);
  } catch {}
  return _currentUser;
}

export function setCurrentUser(user) {
  _currentUser = user;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function isLoggedIn() { return !!getCurrentUser(); }

export function isHost() {
  const u = getCurrentUser();
  return u && (u.role === 'HOST' || u.role === 'ADMIN');
}

export function isAdmin() {
  const u = getCurrentUser();
  return u && u.role === 'ADMIN';
}

// ─── Session Refresh ────────────────────────────────────────────────────────
export async function refreshUser() {
  try {
    const res = await authApi.me();
    setCurrentUser(res.data);
    return res.data;
  } catch {
    setCurrentUser(null);
    return null;
  }
}

// ─── Guards ─────────────────────────────────────────────────────────────────
export function requireAuth(redirectTo = '/pages/login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo + '?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
  return true;
}

export function requireHost() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  if (!isHost()) {
    showToast('You need a host account to access this page', 'error');
    setTimeout(() => window.location.href = '/index.html', 1500);
    return false;
  }
  return true;
}

export function redirectIfLoggedIn(to = '/index.html') {
  if (isLoggedIn()) {
    window.location.href = to;
    return true;
  }
  return false;
}

// ─── Logout ─────────────────────────────────────────────────────────────────
export async function logout() {
  try { await authApi.logout(); } catch {}
  setCurrentUser(null);
  window.location.href = '/index.html';
}

// ─── Toast (shared utility) ─────────────────────────────────────────────────
export function showToast(message, type = 'success', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="font-size:1rem;">${icons[type] || '✓'}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export default { getCurrentUser, setCurrentUser, isLoggedIn, isHost, isAdmin,
  refreshUser, requireAuth, requireHost, redirectIfLoggedIn, logout, showToast };
