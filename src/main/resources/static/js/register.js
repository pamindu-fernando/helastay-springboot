/**
 * register.js — Registration page logic
 */
import { auth as authApi } from './api.js';
import { setCurrentUser, redirectIfLoggedIn, showToast } from './auth.js';
import { getQueryParam } from './app.js';

redirectIfLoggedIn('/index.html');

// Pre-select HOST role if URL param says so
const urlRole = getQueryParam('role');
if (urlRole === 'HOST') {
  setRole('HOST');
  document.getElementById('role-guest').classList.remove('active');
  document.getElementById('role-host').classList.add('active');
  document.getElementById('role').value = 'HOST';
}

// Role toggle
document.querySelectorAll('.tab-btn[data-role]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn[data-role]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('role').value = btn.dataset.role;
  });
});

function setRole(role) {
  document.getElementById('role').value = role;
}

// Password visibility
const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

document.getElementById('toggle-pw').addEventListener('click', () => {
  const pw = document.getElementById('password');
  const btn = document.getElementById('toggle-pw');
  if (pw.type === 'password') { pw.type = 'text'; btn.innerHTML = eyeOffIcon; }
  else { pw.type = 'password'; btn.innerHTML = eyeIcon; }
});

// Password strength meter
document.getElementById('password').addEventListener('input', (e) => {
  const val = e.target.value;
  const strengthEl = document.getElementById('pw-strength');
  const label = document.getElementById('pw-strength-label');
  const bars = document.querySelectorAll('.pw-bar');

  if (!val) { strengthEl.style.display = 'none'; return; }
  strengthEl.style.display = 'block';

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  bars.forEach((bar, i) => {
    bar.style.background = i < score ? colors[score - 1] : 'var(--bg-4)';
  });
  label.textContent = labels[score - 1] || '';
  label.style.color = colors[score - 1] || 'var(--text-3)';
});

// Form submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('email').value.trim();
  const phone     = document.getElementById('phone').value.trim();
  const password  = document.getElementById('password').value;
  const confirm   = document.getElementById('confirm-password').value;
  const role      = document.getElementById('role').value;

  // Validation
  let valid = true;
  if (!firstName) { showFieldError('firstName-error', 'First name is required'); valid = false; }
  if (!lastName)  { showFieldError('lastName-error', 'Last name is required'); valid = false; }
  if (!email)     { showFieldError('email-error', 'Email is required'); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFieldError('email-error', 'Please enter a valid email'); valid = false; }
  if (!password)  { showFieldError('pw-error', 'Password is required'); valid = false; }
  else if (password.length < 6) { showFieldError('pw-error', 'Password must be at least 6 characters'); valid = false; }
  if (password !== confirm) { showFieldError('confirm-pw-error', 'Passwords do not match'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Creating account…';

  try {
    const res = await authApi.register({ firstName, lastName, email, phone, password, role });
    // Auto-login after registration
    const loginRes = await authApi.login({ email, password });
    setCurrentUser(loginRes.data);
    showToast('Welcome to Hela Stay, ' + firstName + '! 🎉');
    setTimeout(() => {
      window.location.href = role === 'HOST' ? '/pages/dashboard.html' : '/index.html';
    }, 800);
  } catch (err) {
    showGlobalError(err.message || 'Registration failed. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
});

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '⚠ ' + msg;
  el.style.display = 'flex';
}

function showGlobalError(msg) {
  const el = document.getElementById('error-alert');
  el.textContent = '⚠ ' + msg;
  el.style.display = 'block';
}

function clearErrors() {
  document.getElementById('error-alert').style.display = 'none';
  document.querySelectorAll('.form-error').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.form-control').forEach(e => e.classList.remove('error'));
}
