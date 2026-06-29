/**
 * app.js — Shared utilities, navbar, and page scaffolding
 */
import { getCurrentUser, isLoggedIn, isHost, logout, refreshUser } from './auth.js';

// ─── Navbar ──────────────────────────────────────────────────────────────────
export async function initNavbar() {
  const user = getCurrentUser() || await refreshUser();
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Update nav actions based on auth state
  const actionsEl = document.getElementById('nav-actions');
  if (!actionsEl) return;

  if (user) {
    const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
    actionsEl.innerHTML = `
      ${isHost() ? `<a href="/pages/dashboard.html" class="btn" style="background: white; color: black; border-radius: 9999px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 8px 16px; font-size: 0.875rem; margin-right: 12px;">Host Dashboard</a>` : ''}
      <div class="nav-user-menu">
        ${user.avatarUrl
          ? `<img src="${user.avatarUrl}" class="nav-avatar" id="nav-avatar-btn" alt="${user.firstName}">`
          : `<div class="nav-avatar" id="nav-avatar-btn" style="background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:0.85rem;">${initials}</div>`
        }
        <div class="user-dropdown" id="user-dropdown">
          <div style="padding:12px 20px 8px;">
            <div style="font-weight:700;color:var(--text);">${user.firstName} ${user.lastName}</div>
            <div style="font-size:0.8rem;color:var(--text-3);margin-top:2px;">${user.email}</div>
          </div>
          <hr>
          <a href="/pages/bookings.html">My Bookings</a>
          <a href="/pages/profile.html">Profile</a>
          ${isHost() ? `<a href="/pages/dashboard.html">Host Dashboard</a>` : ''}
          <hr>
          <button id="logout-btn">Sign Out</button>
        </div>
      </div>
    `;

    document.getElementById('nav-avatar-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('user-dropdown').classList.toggle('open');
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    document.addEventListener('click', () => {
      document.getElementById('user-dropdown')?.classList.remove('open');
    });
  } else {
    actionsEl.innerHTML = `
      <a href="/pages/login.html" class="nav-link">Sign In</a>
      <a href="/pages/register.html" class="btn-nav-primary">Sign Up</a>
    `;
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────
export function formatPrice(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function renderStars(rating, count = null) {
  const filled = Math.round(rating || 0);
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="${i < filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" style="color:${i < filled ? '#f59e0b' : '#3e3e55'}">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>`
  ).join('');

  return `<span class="stars">${stars}</span>${rating ? `<span style="margin-left:4px;font-weight:600;">${rating.toFixed(1)}</span>` : ''}${count !== null ? `<span style="color:var(--text-3);font-weight:400;"> (${count})</span>` : ''}`;
}

export function renderListingCard(listing) {
  const img = listing.imageUrls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600';
  const rating = listing.averageRating;

  return `
    <div class="listing-card" onclick="window.location.href='/pages/listing.html?id=${listing.id}'">
      <div class="listing-card-img card-image-wrap">
        <img src="${img}" alt="${listing.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'">
        <span class="listing-card-badge">${listing.propertyType}</span>

      </div>
      <div class="listing-card-body">
        <div class="listing-card-header">
          <div class="listing-card-title">${listing.title}</div>
          ${rating ? `<div class="listing-card-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${rating.toFixed(1)}
          </div>` : ''}
        </div>
        <div class="listing-card-location">${listing.city}, ${listing.country}</div>
        <div class="listing-card-price"><strong>${formatPrice(listing.pricePerNight)}</strong> / night</div>
      </div>
    </div>
  `;
}

export function renderSkeletonCards(count = 8) {
  return Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-line" style="width:80%;margin-top:12px;"></div>
      <div class="skeleton skeleton-line" style="width:55%;margin-top:8px;"></div>
      <div class="skeleton skeleton-line skeleton-line-sm" style="margin-top:8px;"></div>
    </div>
  `).join('');
}

export function getStatusBadge(status) {
  const map = {
    PENDING:   'badge-warning',
    CONFIRMED: 'badge-success',
    CANCELLED: 'badge-danger',
    COMPLETED: 'badge-info',
  };
  return `<span class="badge ${map[status] || 'badge-neutral'}">${status}</span>`;
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
