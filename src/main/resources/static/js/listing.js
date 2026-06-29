/**
 * listing.js — Listing detail page logic
 */
import { initNavbar, formatPrice, formatDate, timeAgo, getQueryParam, renderStars } from './app.js';
import { listings, bookings, reviews as reviewsApi } from './api.js';
import { isLoggedIn, getCurrentUser, showToast } from './auth.js';

const AMENITY_ICONS = {
  'WiFi': '📶', 'Private Pool': '🏊', 'Beach Access': '🏖', 'BBQ Grill': '🔥',
  'Air Conditioning': '❄️', 'Parking': '🚗', 'Kitchen': '🍳', 'Washer/Dryer': '🧺',
  'Gym': '💪', 'Gym Access': '💪', 'Elevator': '🛗', 'Smart TV': '📺',
  'Fireplace': '🔥', 'Hot Tub': '🛁', 'Garden': '🌿', 'Breakfast Included': '🍳',
  'Pet Friendly': '🐾', 'Mountain View': '⛰', 'City View': '🌃', 'Sea View': '🌊',
  'Forest View': '🌳', 'Lake View': '💧', 'Washing Machine': '🧺',
  'Rooftop Terrace': '🏙', 'Concierge': '🔔', 'Infinity Pool': '🌊',
};

let listing = null;
let selectedRating = 0;

async function init() {
  await initNavbar();
  const id = getQueryParam('id');
  if (!id) { window.location.href = '/pages/search.html'; return; }

  try {
    const res = await listings.getById(id);
    listing = res.data;
    renderListing(listing);
    await loadReviews(id);
    initBookingWidget(listing);
    initReviewModal(listing.id);
  } catch (err) {
    document.getElementById('listing-loading').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏡</div>
        <div class="empty-state-title">Listing not found</div>
        <div class="empty-state-text">${err.message}</div>
        <a href="/pages/search.html" class="btn btn-outline" style="margin-top:16px;">Browse listings</a>
      </div>`;
  }
}

function renderListing(l) {
  // Gallery
  const images = l.imageUrls?.length ? l.imageUrls
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'];

  const galleryEl = document.getElementById('gallery-grid');
  galleryEl.innerHTML = `
    <div class="gallery-main"><img src="${images[0]}" alt="${l.title}" onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'"></div>
    ${images[1] ? `<div class="gallery-thumb"><img src="${images[1]}" alt="${l.title}"></div>` : ''}
    ${images[2] ? `<div class="gallery-thumb"><img src="${images[2]}" alt="${l.title}"></div>` : ''}
    ${images[3] ? `<div class="gallery-thumb" style="position:relative;"><img src="${images[3]}" alt="${l.title}">${images.length > 4 ? `<div class="gallery-more">+${images.length - 4} more</div>` : ''}</div>` : ''}
  `;

  // Bind Lightbox
  window.galleryImages = images;
  const thumbs = galleryEl.querySelectorAll('.gallery-main, .gallery-thumb');
  thumbs.forEach((thumb, idx) => {
    thumb.style.cursor = 'pointer';
    thumb.addEventListener('click', () => openLightbox(idx));
  });

  document.title = `${l.title} — Hela Stay`;
  document.getElementById('listing-title').textContent = l.title;
  document.getElementById('listing-location').textContent = `📍 ${l.address}, ${l.city}, ${l.country}`;
  document.getElementById('listing-type-badge').textContent = l.propertyType;

  // Rating
  const ratingEl = document.getElementById('listing-rating');
  if (l.averageRating) {
    ratingEl.innerHTML = `${renderStars(l.averageRating)} · ${l.reviewCount} review${l.reviewCount !== 1 ? 's' : ''}`;
  } else {
    ratingEl.innerHTML = `<span style="color:var(--text-3);">No reviews yet</span>`;
  }

  // Stats
  document.getElementById('stat-guests').textContent    = l.maxGuests;
  document.getElementById('stat-bedrooms').textContent  = l.bedrooms;
  document.getElementById('stat-bathrooms').textContent = l.bathrooms;

  // Host
  const hostAvatar = document.getElementById('host-avatar-container');
  if (l.hostAvatar) {
    hostAvatar.innerHTML = `<img src="${l.hostAvatar}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--primary);">`;
  } else {
    const initials = l.hostName ? l.hostName.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    hostAvatar.innerHTML = `<div style="width:48px;height:48px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;">${initials}</div>`;
  }
  document.getElementById('host-name').textContent = 'Hosted by ' + (l.hostName || 'Your Host');

  // Description
  document.getElementById('listing-description').textContent = l.description;

  // Amenities
  const amenitiesEl = document.getElementById('amenities-grid');
  amenitiesEl.innerHTML = l.amenities?.length
    ? l.amenities.map(a => `
        <div class="amenity-item">
          <span class="amenity-item-icon">${AMENITY_ICONS[a] || '✓'}</span>
          <span>${a}</span>
        </div>
      `).join('')
    : '<p style="color:var(--text-3);">No amenities listed</p>';

  // Map
  const mapEl = document.getElementById('listing-map');
  if (l.latitude && l.longitude) {
    mapEl.innerHTML = `
      <iframe 
        width="100%" 
        height="400" 
        style="border:0; border-radius: var(--radius-xl); box-shadow: 0 4px 6px rgba(0,0,0,0.05);" 
        loading="lazy" 
        allowfullscreen 
        src="https://maps.google.com/maps?q=${l.latitude},${l.longitude}&hl=en&z=14&output=embed">
      </iframe>
    `;
  } else {
    mapEl.innerHTML = '<p style="color:var(--text-3);">Map unavailable</p>';
  }

  // Show content
  document.getElementById('listing-loading').style.display = 'none';
  document.getElementById('listing-content').style.display = 'block';
}

async function loadReviews(listingId) {
  try {
    const res = await reviewsApi.getForListing(listingId);
    const reviewList = res.data;

    const heading = document.getElementById('reviews-heading');
    heading.textContent = reviewList.length
      ? `★ ${listing.averageRating?.toFixed(1) || ''} · ${reviewList.length} Review${reviewList.length !== 1 ? 's' : ''}`
      : 'Reviews';

    const grid = document.getElementById('reviews-grid');
    if (reviewList.length === 0) {
      grid.innerHTML = `<p style="color:var(--text-3);">No reviews yet. Be the first!</p>`;
      return;
    }

    grid.innerHTML = reviewList.map(r => `
      <div class="review-card">
        <div class="review-header">
          ${r.guestAvatar
            ? `<img src="${r.guestAvatar}" class="review-avatar" alt="${r.guestName}">`
            : `<div class="review-avatar-placeholder">${r.guestName?.[0] || '?'}</div>`
          }
          <div>
            <div class="review-guest-name">${r.guestName}</div>
            <div class="review-date">${timeAgo(r.createdAt)}</div>
          </div>
          <div style="margin-left:auto;">${renderStars(r.rating)}</div>
        </div>
        <p class="review-text">${r.comment}</p>
      </div>
    `).join('');

    // Show review button if logged in
    if (isLoggedIn()) {
      document.getElementById('add-review-btn').style.display = 'inline-flex';
    }
  } catch {}
}

function initBookingWidget(l) {
  const user = getCurrentUser();

  if (!user) {
    document.getElementById('booking-widget').style.display = 'none';
    document.getElementById('login-to-book').style.display = 'block';
    return;
  }

  if (user.id === l.hostId) {
    document.getElementById('book-btn').disabled = true;
    document.getElementById('book-btn').textContent = 'Your Listing';
    return;
  }

  // Set booking price display
  document.getElementById('booking-price').textContent = formatPrice(l.pricePerNight);

  // Default dates
  const today = new Date();
  const future = new Date(today.getTime() + 3 * 86400000);
  const fmt = d => d.toISOString().split('T')[0];
  document.getElementById('checkin-date').value  = fmt(today);
  document.getElementById('checkin-date').min    = fmt(today);
  document.getElementById('checkout-date').value = fmt(future);
  document.getElementById('checkout-date').min   = fmt(future);

  // Price breakdown
  function updateBreakdown() {
    const ci = document.getElementById('checkin-date').value;
    const co = document.getElementById('checkout-date').value;
    if (!ci || !co) { document.getElementById('price-breakdown').style.display = 'none'; return; }

    const nights = Math.round((new Date(co) - new Date(ci)) / 86400000);
    if (nights <= 0) { document.getElementById('price-breakdown').style.display = 'none'; return; }

    const base = l.pricePerNight * nights;
    const fee  = Math.round(base * 0.12);
    const total = base + fee;

    document.getElementById('breakdown-nights-label').textContent = `${formatPrice(l.pricePerNight)} × ${nights} night${nights > 1 ? 's' : ''}`;
    document.getElementById('breakdown-nights-total').textContent  = formatPrice(base);
    document.getElementById('breakdown-fee').textContent           = formatPrice(fee);
    document.getElementById('breakdown-total').textContent         = formatPrice(total);
    document.getElementById('price-breakdown').style.display = 'flex';
  }

  document.getElementById('checkin-date').addEventListener('change', updateBreakdown);
  document.getElementById('checkout-date').addEventListener('change', updateBreakdown);
  updateBreakdown();

  document.getElementById('book-btn').addEventListener('click', async () => {
    const checkIn  = document.getElementById('checkin-date').value;
    const checkOut = document.getElementById('checkout-date').value;
    const numGuests = parseInt(document.getElementById('num-guests').value);

    if (!checkIn || !checkOut) { showToast('Please select dates', 'error'); return; }
    if (new Date(checkOut) <= new Date(checkIn)) { showToast('Check-out must be after check-in', 'error'); return; }

    const btn = document.getElementById('book-btn');
    btn.disabled = true;
    btn.textContent = 'Booking…';

    try {
      await bookings.create({ listingId: l.id, checkIn, checkOut, numGuests });
      showToast('Booking created! 🎉');
      setTimeout(() => window.location.href = '/pages/bookings.html', 1000);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Reserve';
    }
  });
}

function initReviewModal(listingId) {
  const modal = document.getElementById('review-modal');

  document.getElementById('add-review-btn').addEventListener('click', () => {
    modal.classList.add('open');
  });
  document.getElementById('close-review-modal').addEventListener('click', () => {
    modal.classList.remove('open');
  });
  document.getElementById('cancel-review-btn').addEventListener('click', () => {
    modal.classList.remove('open');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Star rating
  const stars = document.querySelectorAll('.star[data-val]');
  stars.forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseout', () => highlightStars(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.val);
      document.getElementById('review-rating').value = selectedRating;
      highlightStars(selectedRating);
    });
  });

  document.getElementById('submit-review-btn').addEventListener('click', async () => {
    const rating  = selectedRating;
    const comment = document.getElementById('review-comment').value.trim();
    const errorEl = document.getElementById('review-error');

    errorEl.style.display = 'none';
    if (rating === 0) { errorEl.textContent = '⚠ Please select a rating'; errorEl.style.display = 'flex'; return; }
    if (comment.length < 10) { errorEl.textContent = '⚠ Comment must be at least 10 characters'; errorEl.style.display = 'flex'; return; }

    const btn = document.getElementById('submit-review-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    try {
      await reviewsApi.create({ listingId, rating, comment });
      showToast('Review submitted! Thank you 🙏');
      modal.classList.remove('open');
      await loadReviews(listingId);
    } catch (err) {
      errorEl.textContent = '⚠ ' + err.message;
      errorEl.style.display = 'flex';
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

// Lightbox logic
let currentImageIndex = 0;

function openLightbox(index) {
  currentImageIndex = index;
  document.getElementById('lightbox-img').src = window.galleryImages[currentImageIndex];
  document.getElementById('lightbox-overlay').classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox-overlay').classList.remove('open');
}

function nextLightbox() {
  if (!window.galleryImages) return;
  currentImageIndex = (currentImageIndex + 1) % window.galleryImages.length;
  document.getElementById('lightbox-img').src = window.galleryImages[currentImageIndex];
}

function prevLightbox() {
  if (!window.galleryImages) return;
  currentImageIndex = (currentImageIndex - 1 + window.galleryImages.length) % window.galleryImages.length;
  document.getElementById('lightbox-img').src = window.galleryImages[currentImageIndex];
}

// Bind lightbox controls globally when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-next')?.addEventListener('click', nextLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', prevLightbox);
  document.getElementById('lightbox-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox-overlay') closeLightbox();
  });
});
