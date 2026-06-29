/**
 * api.js — Centralized API client for Hela Stay
 * All requests go through here with credentials: 'include' for session cookies.
 */

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(method, path, body = null, isFormData = false) {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const options = {
    method,
    credentials: 'include',
    headers,
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(API_BASE + path, options);

  if (res.status === 401) {
    // Session invalid or expired: clear local state and redirect to login
    localStorage.removeItem('staybnb_user');
    
    const onAuthPage = window.location.pathname.includes('/login') ||
                       window.location.pathname.includes('/register');
    const isMeCheck = path.includes('/auth/me');
    if (!onAuthPage && !isMeCheck) {
      window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(window.location.href);
    }
    throw new ApiError('Authentication required', 401);
  }

  let data;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const auth = {
  register: (body) => request('POST', '/auth/register', body),
  login:    (body) => request('POST', '/auth/login', body),
  logout:   ()     => request('POST', '/auth/logout'),
  me:       ()     => request('GET',  '/auth/me'),
  updateProfile: (body) => request('PUT', '/auth/profile', body),
  updateAvatar: (avatarUrl) => request('PUT', '/auth/profile/avatar', { avatarUrl }),
  forgotPassword: (email) => request('POST', '/auth/forgot-password', { email }),
  resetPassword: (email, code, newPassword) => request('POST', '/auth/reset-password', { email, code, newPassword }),
};

// ─── Listings ──────────────────────────────────────────────────────────────
export const listings = {
  search: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') q.set(k, v); });
    return request('GET', `/listings?${q.toString()}`);
  },
  getById:  (id)   => request('GET',    `/listings/${id}`),
  getMyListings: (page = 0) => request('GET', `/listings/my?page=${page}`),
  create:   (body) => request('POST',   '/listings', body),
  update:   (id, body) => request('PUT', `/listings/${id}`, body),
  delete:   (id)   => request('DELETE', `/listings/${id}`),
};

// ─── Bookings ───────────────────────────────────────────────────────────────
export const bookings = {
  create:     (body) => request('POST', '/bookings', body),
  myBookings: ()     => request('GET',  '/bookings/my'),
  hostBookings: ()   => request('GET',  '/bookings/host'),
  updateStatus: (id, status) => request('PUT', `/bookings/${id}/status`, { status }),
  cancel:     (id)   => request('DELETE', `/bookings/${id}`),
};

// ─── Reviews ────────────────────────────────────────────────────────────────
export const reviews = {
  create:         (body)      => request('POST', '/reviews', body),
  getForListing:  (listingId) => request('GET',  `/reviews/listing/${listingId}`),
};

// ─── Files ──────────────────────────────────────────────────────────────────
export const files = {
  upload: async (fileList) => {
    const form = new FormData();
    [...fileList].forEach(f => form.append('files', f));
    return request('POST', '/files/upload', form, true);
  },
  uploadSingle: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('POST', '/files/upload/single', form, true);
  },
};

export default { auth, listings, bookings, reviews, files, ApiError };
