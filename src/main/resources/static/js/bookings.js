/**
 * bookings.js — Guest bookings page
 */
import { initNavbar, formatPrice, formatDate, getStatusBadge } from './app.js';
import { bookings as bookingsApi, reviews as reviewsApi } from './api.js';
import { requireAuth, showToast } from './auth.js';

requireAuth();

let allBookings = [];
let activeFilter = 'ALL';
let reviewListingId = null;
let selectedRating = 0;

async function init() {
  await initNavbar();
  initFilterTabs();
  initReviewModal();
  await loadBookings();
}

async function loadBookings() {
  try {
    const res = await bookingsApi.myBookings();
    allBookings = res.data;
    renderBookings();
  } catch (err) {
    document.getElementById('bookings-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Could not load bookings</div>
        <div class="empty-state-text">${err.message}</div>
      </div>`;
  }
}

function renderBookings() {
  const filtered = activeFilter === 'ALL'
    ? allBookings
    : allBookings.filter(b => b.status === activeFilter);

  const list = document.getElementById('bookings-list');

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🗓</div>
        <div class="empty-state-title">${activeFilter === 'ALL' ? 'No bookings yet' : `No ${activeFilter.toLowerCase()} bookings`}</div>
        <div class="empty-state-text">Explore amazing stays and make your first booking!</div>
        <a href="/pages/search.html" class="btn btn-primary" style="margin-top:16px;">Browse Stays</a>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(b => `
    <div class="card" style="padding:0;display:flex;flex-direction:row;overflow:hidden;border-radius:var(--radius-xl);" id="booking-card-${b.id}">
      <img src="${b.listingImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200'}"
        style="width:160px;height:140px;object-fit:cover;flex-shrink:0;"
        onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200'"
        alt="${b.listingTitle}">
      <div style="padding:var(--space-5);flex:1;display:flex;flex-direction:column;gap:var(--space-2);">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);">
          <div>
            <a href="/pages/listing.html?id=${b.listingId}" style="font-weight:700;color:var(--text);font-size:1rem;">${b.listingTitle}</a>
            <div style="font-size:0.8rem;color:var(--text-3);">📍 ${b.listingCity}</div>
          </div>
          ${getStatusBadge(b.status)}
        </div>
        <div style="display:flex;gap:var(--space-6);font-size:0.875rem;color:var(--text-2);">
          <span>📅 ${formatDate(b.checkIn)} → ${formatDate(b.checkOut)}</span>
          <span>👥 ${b.numGuests} guest${b.numGuests > 1 ? 's' : ''}</span>
        </div>
        <div style="font-weight:700;color:var(--text);font-size:1rem;">${formatPrice(b.totalPrice)}</div>
        <div style="display:flex;gap:var(--space-3);margin-top:auto;flex-wrap:wrap;">
          ${b.status === 'PENDING' || b.status === 'CONFIRMED'
            ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.id})">Cancel</button>`
            : ''}
          ${b.status === 'COMPLETED'
            ? `<button class="btn btn-outline btn-sm" onclick="openReviewModal(${b.listingId}, '${b.listingTitle}')">✍ Write Review</button>`
            : ''}
          <a href="/pages/listing.html?id=${b.listingId}" class="btn btn-ghost btn-sm">View Property</a>
        </div>
      </div>
    </div>
  `).join('');
}

function initFilterTabs() {
  document.querySelectorAll('.tab-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderBookings();
    });
  });
}

// ─── Cancel ──────────────────────────────────────────────────────────────────
window.cancelBooking = async (id) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  try {
    await bookingsApi.cancel(id);
    showToast('Booking cancelled');
    await loadBookings();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ─── Review Modal ────────────────────────────────────────────────────────────
window.openReviewModal = (listingId, title) => {
  reviewListingId = listingId;
  selectedRating  = 0;
  document.getElementById('modal-comment').value = '';
  document.getElementById('modal-rating').value  = '0';
  document.querySelectorAll('.star[data-val]').forEach(s => s.classList.remove('filled'));
  document.getElementById('modal-review-error').style.display = 'none';
  document.getElementById('review-modal').classList.add('open');
};

function initReviewModal() {
  const modal = document.getElementById('review-modal');
  const close = () => modal.classList.remove('open');
  document.getElementById('close-review').addEventListener('click', close);
  document.getElementById('cancel-review').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  // Stars
  document.querySelectorAll('.star[data-val]').forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseout',  () => highlightStars(selectedRating));
    star.addEventListener('click',     () => {
      selectedRating = parseInt(star.dataset.val);
      document.getElementById('modal-rating').value = selectedRating;
      highlightStars(selectedRating);
    });
  });

  document.getElementById('submit-review').addEventListener('click', async () => {
    const comment = document.getElementById('modal-comment').value.trim();
    const errEl   = document.getElementById('modal-review-error');
    errEl.style.display = 'none';

    if (selectedRating === 0) { errEl.textContent = '⚠ Please select a rating'; errEl.style.display = 'block'; return; }
    if (comment.length < 10)  { errEl.textContent = '⚠ Comment must be at least 10 characters'; errEl.style.display = 'block'; return; }

    const btn = document.getElementById('submit-review');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    try {
      await reviewsApi.create({ listingId: reviewListingId, rating: selectedRating, comment });
      showToast('Review submitted! Thank you 🙏');
      modal.classList.remove('open');
    } catch (err) {
      errEl.textContent = '⚠ ' + err.message;
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Review';
    }
  });
}

function highlightStars(count) {
  document.querySelectorAll('.star[data-val]').forEach(s => {
    s.classList.toggle('filled', parseInt(s.dataset.val) <= count);
  });
}

init();
