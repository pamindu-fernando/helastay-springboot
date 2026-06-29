/**
 * search.js — Search, filter, sort, and pagination
 */
import { initNavbar, renderListingCard, renderSkeletonCards, getQueryParam, debounce } from './app.js';
import { listings } from './api.js';

let page = 0;
const size = 12;
let totalPages = 0;
let currentFilters = {};

async function init() {
  await initNavbar();
  readUrlParams();
  initPriceRange();
  initFilters();
  initSort();
  initNavSearch();
  await search();
}

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city');
  if (city) {
    document.getElementById('nav-city-input').value = city;
    currentFilters.city = city;
  }
  const guests = params.get('guests');
  if (guests) currentFilters.guests = guests;
}

function initNavSearch() {
  const input = document.getElementById('nav-city-input');
  const btn   = document.getElementById('nav-search-btn');

  const run = debounce(() => {
    currentFilters.city = input.value.trim() || undefined;
    page = 0;
    search();
  }, 400);

  input.addEventListener('input', run);
  btn.addEventListener('click', () => {
    currentFilters.city = input.value.trim() || undefined;
    page = 0;
    search();
  });
}

function initPriceRange() {
  const minSlider = document.getElementById('price-min');
  const maxSlider = document.getElementById('price-max');
  const minLabel  = document.getElementById('price-min-label');
  const maxLabel  = document.getElementById('price-max-label');
  const fill      = document.getElementById('price-fill');

  function updateFill() {
    const min = parseInt(minSlider.value);
    const max = parseInt(maxSlider.value);
    if (min > max) { minSlider.value = max; return; }
    const pct = (v) => (v / 1000) * 100;
    fill.style.left  = pct(min) + '%';
    fill.style.width = (pct(max) - pct(min)) + '%';
    minLabel.textContent = 'Rs. ' + min;
    maxLabel.textContent = max >= 1000 ? 'Rs. 1000+' : 'Rs. ' + max;
  }

  minSlider.addEventListener('input', () => { updateFill(); });
  maxSlider.addEventListener('input', () => { updateFill(); });
  updateFill();
}

function initFilters() {
  document.getElementById('apply-filters-btn').addEventListener('click', () => {
    const minPrice = parseInt(document.getElementById('price-min').value);
    const maxPrice = parseInt(document.getElementById('price-max').value);
    const types = [...document.querySelectorAll('input[name="type"]:checked')].map(e => e.value);
    const activeBeds = document.querySelector('.page-btn[data-beds].active');

    currentFilters.minPrice = minPrice > 0 ? minPrice : undefined;
    currentFilters.maxPrice = maxPrice < 1000 ? maxPrice : undefined;
    currentFilters.propertyType = types.length === 1 ? types[0] : undefined;
    currentFilters.guests = activeBeds && activeBeds.dataset.beds !== 'any' ? activeBeds.dataset.beds : undefined;
    page = 0;
    search();
  });

  document.getElementById('clear-filters-btn').addEventListener('click', () => {
    currentFilters = { city: document.getElementById('nav-city-input').value.trim() || undefined };
    document.getElementById('price-min').value = 0;
    document.getElementById('price-max').value = 1000;
    document.querySelectorAll('input[name="type"]').forEach(c => c.checked = false);
    document.querySelectorAll('input[name="amenity"]').forEach(c => c.checked = false);
    document.querySelectorAll('.page-btn[data-beds]').forEach(b => {
      b.classList.toggle('active', b.dataset.beds === 'any');
    });
    document.getElementById('price-min-label').textContent = 'Rs. 0';
    document.getElementById('price-max-label').textContent = 'Rs. 1000+';
    document.getElementById('price-fill').style.left = '0%';
    document.getElementById('price-fill').style.width = '100%';
    page = 0;
    search();
  });

  // Bedroom buttons
  document.querySelectorAll('.page-btn[data-beds]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.page-btn[data-beds]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Mobile filter toggle
  const filterToggle = document.getElementById('filter-toggle-btn');
  if (window.innerWidth <= 900) filterToggle.style.display = 'flex';
  filterToggle.addEventListener('click', () => {
    document.getElementById('filter-sidebar').classList.toggle('mobile-open');
  });
}

function initSort() {
  document.getElementById('sort-select').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    page = 0;
    search();
  });
}

async function search() {
  const grid = document.getElementById('results-grid');
  grid.innerHTML = renderSkeletonCards(size);
  document.getElementById('pagination').innerHTML = '';

  const sortEl = document.getElementById('sort-select');
  const sort = sortEl?.value || 'createdAt';

  try {
    const res = await listings.search({
      ...currentFilters,
      sort,
      page,
      size,
    });

    const data = res.data;
    totalPages = data.totalPages;
    const total = data.totalElements;

    const countEl = document.getElementById('results-count');
    countEl.textContent = total === 0
      ? 'No stays found'
      : `${total} ${total === 1 ? 'stay' : 'stays'} found${currentFilters.city ? ` in "${currentFilters.city}"` : ''}`;

    if (data.content.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-state-icon" style="display:flex;justify-content:center;color:var(--text-4);margin-bottom:var(--space-4);"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
          <div class="empty-state-title">No results found</div>
          <div class="empty-state-text">Try adjusting your filters or searching a different city.</div>
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('clear-filters-btn').click()" style="margin-top:16px;">Clear Filters</button>
        </div>`;
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
      </div>`;
  }
}

function renderPagination() {
  if (totalPages <= 1) return;
  const pg = document.getElementById('pagination');

  let html = `<button class="page-btn" onclick="goTo(${page - 1})" ${page === 0 ? 'disabled' : ''}>←</button>`;
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages, start + 5);

  if (start > 0) html += `<button class="page-btn" onclick="goTo(0)">1</button><span style="color:var(--text-3);padding:0 4px;">…</span>`;
  for (let i = start; i < end; i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="goTo(${i})">${i + 1}</button>`;
  }
  if (end < totalPages) html += `<span style="color:var(--text-3);padding:0 4px;">…</span><button class="page-btn" onclick="goTo(${totalPages - 1})">${totalPages}</button>`;
  html += `<button class="page-btn" onclick="goTo(${page + 1})" ${page >= totalPages - 1 ? 'disabled' : ''}>→</button>`;

  pg.innerHTML = html;
}

window.goTo = (p) => {
  page = p;
  search();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

init();
