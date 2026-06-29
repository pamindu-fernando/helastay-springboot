/**
 * login.js — Sign-in page logic
 */
import { auth as authApi } from './api.js';
import { setCurrentUser, redirectIfLoggedIn, showToast } from './auth.js';
import { getQueryParam } from './app.js';

// Redirect if already logged in
redirectIfLoggedIn('/index.html');

// Toggle password visibility
const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

document.getElementById('toggle-pw').addEventListener('click', () => {
  const pwInput = document.getElementById('password');
  const btn = document.getElementById('toggle-pw');
  if (pwInput.type === 'password') {
    pwInput.type = 'text';
    btn.innerHTML = eyeOffIcon;
  } else {
    pwInput.type = 'password';
    btn.innerHTML = eyeIcon;
  }
});

// Form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Client-side validation
  let valid = true;
  if (!email) {
    showFieldError('email-error', 'Email is required');
    document.getElementById('email').classList.add('error');
    valid = false;
  }
  if (!password) {
    showFieldError('pw-error', 'Password is required');
    document.getElementById('password').classList.add('error');
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    const res = await authApi.login({ email, password });
    setCurrentUser(res.data);
    showToast('Welcome back, ' + res.data.firstName + '! 👋');

    // Redirect to original destination or home
    const redirect = getQueryParam('redirect');
    setTimeout(() => {
      window.location.href = redirect && redirect.startsWith('http://localhost')
        ? redirect : '/index.html';
    }, 500);

  } catch (err) {
    showGlobalError(err.message || 'Invalid email or password');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});

function showFieldError(id, msg) {
  const el = document.getElementById(id);
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
