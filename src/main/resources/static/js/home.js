/**
 * home.js — Landing page logic
 */
import { initNavbar, renderListingCard, renderSkeletonCards, formatPrice } from './app.js';
import { listings } from './api.js';

let currentPage = 0;
let currentType = '';
let totalPages = 0;

async function init() {
  await initNavbar();
  initHeroText();
  initHeroSearch();
  initCategories();
  animateCounters();
  await loadListings();
}

// ─── Hero Text Animation ───────────────────────────────────────────────────────
function initHeroText() {
  const el = document.getElementById('hero-title');
  if (!el) return;

  const titles = [
    "Curated spaces.<br>Extraordinary stays.",
    "Your perfect getaway.<br>Just a click away.",
    "Unforgettable journeys.<br>Start here.",
    "Find your next.<br>Great adventure."
  ];
  let currentIndex = 0;

  setInterval(() => {
    el.classList.add('hidden');
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % titles.length;
      el.innerHTML = titles[currentIndex];
      el.classList.remove('hidden');
    }, 250);
  }, 4000);
}

// ─── Hero Search ─────────────────────────────────────────────────────────────
function initHeroSearch() {
  // Set default dates (today + 3 days)
  const today = new Date();
  const future = new Date(today.getTime() + 3 * 86400000);
  const fmt = d => d.toISOString().split('T')[0];
  document.getElementById('search-checkin').value = fmt(today);
  document.getElementById('search-checkout').value = fmt(future);

  document.getElementById('hero-search-btn').addEventListener('click', doSearch);
  document.getElementById('search-city').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
}

function doSearch() {
  const city     = document.getElementById('search-city').value.trim();
  const checkIn  = document.getElementById('search-checkin').value;
  const checkOut = document.getElementById('search-checkout').value;
  const guests   = document.getElementById('search-guests').value;

  const params = new URLSearchParams();
  if (city)     params.set('city', city);
  if (checkIn)  params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  if (guests)   params.set('guests', guests);

  window.location.href = `/pages/search.html?${params.toString()}`;
}

// ─── Categories ──────────────────────────────────────────────────────────────
function initCategories() {
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentType = chip.dataset.type || '';
      currentPage = 0;

      const heading = document.getElementById('listings-heading');
      heading.textContent = currentType
        ? `${chip.querySelector('.category-chip-label').textContent} Stays`
        : 'Featured Stays';

      loadListings();
    });
  });
}

// ─── Listings ────────────────────────────────────────────────────────────────
async function loadListings() {
  const grid = document.getElementById('listings-grid');
  grid.innerHTML = renderSkeletonCards(8);

  try {
    const res = await listings.search({
      propertyType: currentType || undefined,
      page: currentPage,
      size: 20,
      sort: 'rating',
    });

    const data = res.data;
    totalPages = data.totalPages;

    if (data.content.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-state-icon">🏡</div>
          <div class="empty-state-title">No listings found</div>
          <div class="empty-state-text">Try selecting a different category or browse all stays.</div>
        </div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = data.content.map(renderListingCard).join('');
    renderPagination();

  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Could not load listings</div>
        <div class="empty-state-text">Make sure the backend is running at localhost:8080</div>
        <a href="http://localhost:8080/api/listings" target="_blank" class="btn btn-outline btn-sm" style="margin-top:16px;">Test API →</a>
      </div>`;
  }
}

function renderPagination() {
  if (totalPages <= 1) {
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>←</button>`;
  for (let i = 0; i < totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i + 1}</button>`;
  }
  html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>→</button>`;
  document.getElementById('pagination').innerHTML = html;
}

window.changePage = (page) => {
  currentPage = page;
  loadListings();
  document.getElementById('listings-section').scrollIntoView({ behavior: 'smooth' });
};

// ─── Counter Animation ───────────────────────────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = target >= 1000 ? '+' : '+';
      let current = 0;
      const step = target / 60;
      const update = () => {
        current = Math.min(current + step, target);
        const display = target >= 1000
          ? (current / 1000).toFixed(0) + 'K'
          : Math.round(current).toString();
        el.textContent = display + suffix;
        if (current < target) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

init();
