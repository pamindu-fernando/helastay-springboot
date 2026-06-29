/**
 * dashboard.js — Host dashboard logic
 */
import { initNavbar, formatPrice, formatDate, getStatusBadge } from './app.js';
import { listings as listingsApi, bookings as bookingsApi, files as filesApi } from './api.js';
import { requireHost, getCurrentUser, showToast } from './auth.js';

if (!requireHost()) { /* guard */ }

let myListings = [];
let myBookings = [];
let editingId = null;

// Map globals
const SRI_LANKA_CENTER = [7.8731, 80.7718];
let map;
let marker;

function initLeafletMap() {
  const mapEl = document.getElementById('map-container');
  if (!mapEl) return;
  map = L.map(mapEl).setView(SRI_LANKA_CENTER, 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  map.on('click', function(e) {
    placeMarker(e.latlng);
  });
}

// Ensure DOM is ready, though module scripts run deferred.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeafletMap);
} else {
  initLeafletMap();
}

function placeMarker(latlng) {
  if (!marker) {
    marker = L.marker(latlng).addTo(map);
  } else {
    marker.setLatLng(latlng);
  }
  document.getElementById('l-lat').value = latlng.lat.toFixed(6);
  document.getElementById('l-lng').value = latlng.lng.toFixed(6);
}

async function init() {
  await initNavbar();
  const user = getCurrentUser();
  if (user) {
    document.getElementById('host-greeting').textContent = `Welcome back, ${user.firstName}! Here's your dashboard.`;
  }
  await Promise.all([loadListings(), loadBookings()]);
  initModal();
}

// ─── Listings ────────────────────────────────────────────────────────────────
async function loadListings() {
  try {
    const res = await listingsApi.getMyListings();
    myListings = res.data.content || [];
    updateStats();
    renderListingsTable();
  } catch (err) {
    showToast('Could not load listings: ' + err.message, 'error');
  }
}

function renderListingsTable() {
  const wrap = document.getElementById('listings-table-wrap');
  if (myListings.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state" style="padding:60px 24px;">
        <div class="empty-state-icon">🏠</div>
        <div class="empty-state-title">No listings yet</div>
        <div class="empty-state-text">Create your first listing to start earning.</div>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="document.getElementById('new-listing-btn').click()">+ Create Listing</button>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Price / Night</th>
            <th>Guests</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${myListings.map(l => `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:12px;">
                  <img src="${l.imageUrls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100'}"
                    style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;"
                    onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100'">
                  <div>
                    <div style="font-weight:600;color:var(--text);font-size:0.875rem;">${l.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-3);">${l.city}, ${l.country}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-neutral">${l.propertyType}</span></td>
              <td style="font-weight:600;color:var(--text);">${formatPrice(l.pricePerNight)}</td>
              <td>${l.maxGuests}</td>
              <td>${l.averageRating ? `⭐ ${l.averageRating.toFixed(1)} (${l.reviewCount})` : '<span style="color:var(--text-4);">—</span>'}</td>
              <td><span class="badge ${l.isActive ? 'badge-success' : 'badge-danger'}">${l.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <div style="display:flex;gap:8px;">
                  <a href="/pages/listing.html?id=${l.id}" class="btn btn-ghost btn-sm" style="padding:4px 8px;">👁</a>
                  <button class="btn btn-outline btn-sm" onclick="editListing(${l.id})">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteListing(${l.id})">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ─── Bookings ────────────────────────────────────────────────────────────────
async function loadBookings() {
  try {
    const res = await bookingsApi.hostBookings();
    myBookings = res.data;
    updateStats();
    renderBookingsTable();
  } catch (err) {
    document.getElementById('bookings-table-wrap').innerHTML =
      `<div style="padding:24px;color:var(--text-3);">Could not load bookings</div>`;
  }
}

function renderBookingsTable() {
  const wrap = document.getElementById('bookings-table-wrap');
  if (myBookings.length === 0) {
    wrap.innerHTML = `<div class="empty-state" style="padding:60px 24px;">
      <div class="empty-state-icon">📅</div>
      <div class="empty-state-title">No bookings yet</div>
      <div class="empty-state-text">Bookings from guests will appear here.</div>
    </div>`;
    return;
  }

  wrap.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Guest</th>
            <th>Dates</th>
            <th>Guests</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${myBookings.map(b => `
            <tr>
              <td>
                <div style="font-weight:600;color:var(--text);font-size:0.875rem;">${b.listingTitle}</div>
                <div style="font-size:0.75rem;color:var(--text-3);">${b.listingCity}</div>
              </td>
              <td style="color:var(--text-2);">${b.guestName}</td>
              <td style="font-size:0.8rem;color:var(--text-2);">${formatDate(b.checkIn)} → ${formatDate(b.checkOut)}</td>
              <td>${b.numGuests}</td>
              <td style="font-weight:600;color:var(--text);">${formatPrice(b.totalPrice)}</td>
              <td>${getStatusBadge(b.status)}</td>
              <td>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${b.status === 'PENDING' ? `
                    <button class="btn btn-sm" style="background:rgba(34,197,94,0.15);color:var(--success);border:1px solid rgba(34,197,94,0.3);" onclick="updateBookingStatus(${b.id},'CONFIRMED')">✓ Confirm</button>
                    <button class="btn btn-danger btn-sm" onclick="updateBookingStatus(${b.id},'CANCELLED')">✕ Decline</button>
                  ` : ''}
                  ${b.status === 'CONFIRMED' ? `
                    <button class="btn btn-sm" style="background:rgba(59,130,246,0.15);color:var(--info);border:1px solid rgba(59,130,246,0.3);" onclick="updateBookingStatus(${b.id},'COMPLETED')">✓ Complete</button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('stat-listings').textContent = myListings.length;
  document.getElementById('stat-bookings').textContent = myBookings.length;
  document.getElementById('stat-pending').textContent  = myBookings.filter(b => b.status === 'PENDING').length;

  const revenue = myBookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0);
  document.getElementById('stat-revenue').textContent = formatPrice(revenue);
}

// ─── Tab switching ───────────────────────────────────────────────────────────
window.switchTab = (tab) => {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById('panel-listings').style.display = tab === 'listings' ? 'block' : 'none';
  document.getElementById('panel-bookings').style.display = tab === 'bookings' ? 'block' : 'none';
};

// ─── Booking status update ───────────────────────────────────────────────────
window.updateBookingStatus = async (id, status) => {
  try {
    await bookingsApi.updateStatus(id, status);
    showToast(`Booking ${status.toLowerCase()}`);
    await loadBookings();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ─── Delete listing ──────────────────────────────────────────────────────────
window.deleteListing = async (id) => {
  if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
  try {
    await listingsApi.delete(id);
    showToast('Listing deleted');
    await loadListings();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ─── Edit listing ────────────────────────────────────────────────────────────
window.editListing = (id) => {
  const l = myListings.find(x => x.id === id);
  if (!l) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Listing';

  document.getElementById('l-title').value       = l.title;
  document.getElementById('l-description').value = l.description;
  document.getElementById('l-type').value        = l.propertyType;
  document.getElementById('l-price').value       = l.pricePerNight;
  document.getElementById('l-guests').value      = l.maxGuests;
  document.getElementById('l-bedrooms').value    = l.bedrooms;
  document.getElementById('l-bathrooms').value   = l.bathrooms;
  document.getElementById('l-address').value     = l.address;
  document.getElementById('l-city').value        = l.city;
  document.getElementById('l-country').value     = l.country;
  document.getElementById('l-images').value      = l.imageUrls?.join('\n') || '';
  document.getElementById('l-lat').value         = l.latitude || '';
  document.getElementById('l-lng').value         = l.longitude || '';

  document.querySelectorAll('input[name="l-amenity"]').forEach(c => {
    c.checked = l.amenities?.includes(c.value);
  });

  document.getElementById('listing-modal').classList.add('open');
  
  if (map) {
    setTimeout(() => {
      map.invalidateSize();
      if (l.latitude && l.longitude) {
        const pos = { lat: l.latitude, lng: l.longitude };
        placeMarker(pos);
        map.setView(pos, 12);
      } else {
        if (marker) {
          map.removeLayer(marker);
          marker = null;
        }
        map.setView(SRI_LANKA_CENTER, 7);
      }
    }, 100);
  }
};

// ─── Modal ───────────────────────────────────────────────────────────────────
function initModal() {
  document.getElementById('new-listing-btn').addEventListener('click', () => {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Create New Listing';
    document.getElementById('listing-modal').querySelector('form, .modal-body').reset?.();
    ['l-title','l-description','l-price','l-guests','l-bedrooms','l-bathrooms','l-address','l-city','l-country','l-images', 'l-lat', 'l-lng'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('l-type').value = '';
    document.querySelectorAll('input[name="l-amenity"]').forEach(c => c.checked = false);
    document.getElementById('modal-error').style.display = 'none';
    document.getElementById('listing-modal').classList.add('open');
    
    if (marker) {
      if (map) map.removeLayer(marker);
      marker = null;
    }
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
        map.setView(SRI_LANKA_CENTER, 7);
      }, 100);
    }
  });

  const closeModal = () => {
    document.getElementById('listing-modal').classList.remove('open');
    editingId = null;
  };

  document.getElementById('close-listing-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-listing-btn').addEventListener('click', closeModal);
  document.getElementById('listing-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('listing-modal')) closeModal();
  });

  // Image upload
  document.getElementById('l-image-upload').addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    try {
      const res = await filesApi.upload(files);
      const current = document.getElementById('l-images').value.trim();
      const newUrls = res.data.join('\n');
      document.getElementById('l-images').value = current ? current + '\n' + newUrls : newUrls;
      showToast('Images uploaded!');
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error');
    }
  });

  document.getElementById('save-listing-btn').addEventListener('click', async () => {
    const title       = document.getElementById('l-title').value.trim();
    const description = document.getElementById('l-description').value.trim();
    const propertyType = document.getElementById('l-type').value;
    const pricePerNight = parseFloat(document.getElementById('l-price').value);
    const maxGuests   = parseInt(document.getElementById('l-guests').value);
    const bedrooms    = parseInt(document.getElementById('l-bedrooms').value);
    const bathrooms   = parseInt(document.getElementById('l-bathrooms').value);
    const address     = document.getElementById('l-address').value.trim();
    const city        = document.getElementById('l-city').value.trim();
    const country     = document.getElementById('l-country').value.trim();
    const lat         = document.getElementById('l-lat').value;
    const lng         = document.getElementById('l-lng').value;
    const imageUrls   = document.getElementById('l-images').value.split('\n').map(s => s.trim()).filter(Boolean);
    const amenities   = [...document.querySelectorAll('input[name="l-amenity"]:checked')].map(c => c.value);

    const errEl = document.getElementById('modal-error');
    errEl.style.display = 'none';

    if (!title || !description || !propertyType || !address || !city || !country) {
      errEl.textContent = '⚠ Please fill in all required fields.';
      errEl.style.display = 'block';
      return;
    }
    if (!lat || !lng) {
      errEl.textContent = '⚠ Please drop a pin on the map to set the exact location in Sri Lanka.';
      errEl.style.display = 'block';
      return;
    }

    const body = { 
      title, description, propertyType, pricePerNight, maxGuests, 
      bedrooms, bathrooms, address, city, country, imageUrls, amenities,
      latitude: parseFloat(lat), longitude: parseFloat(lng)
    };

    const btn = document.getElementById('save-listing-btn');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      if (editingId) {
        await listingsApi.update(editingId, body);
        showToast('Listing updated!');
      } else {
        await listingsApi.create(body);
        showToast('Listing created! 🎉');
      }
      document.getElementById('listing-modal').classList.remove('open');
      await loadListings();
    } catch (err) {
      errEl.textContent = '⚠ ' + err.message;
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Listing';
    }
  });
}

init();
