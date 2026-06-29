import { auth as authApi } from './api.js';
import { redirectIfLoggedIn, showToast } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  redirectIfLoggedIn('/pages/dashboard.html');

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const forgotForm = document.getElementById('forgot-form');
  const resetForm = document.getElementById('reset-form');
  const sendCodeBtn = document.getElementById('send-code-btn');
  const resetPwBtn = document.getElementById('reset-pw-btn');

  let currentEmail = '';

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) return showToast('Please enter your email', 'warning');

    const ogText = sendCodeBtn.textContent;
    sendCodeBtn.textContent = 'Sending...';
    sendCodeBtn.disabled = true;

    try {
      const res = await authApi.forgotPassword(email);
      currentEmail = email;
      showToast(res.message || 'Code sent successfully', 'success');
      step1.style.display = 'none';
      step2.style.display = 'block';
    } catch (err) {
      showToast(err.message || 'Failed to send code', 'error');
    } finally {
      sendCodeBtn.textContent = ogText;
      sendCodeBtn.disabled = false;
    }
  });

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('code').value.trim();
    const newPassword = document.getElementById('new-password').value;

    if (!code) return showToast('Please enter the code', 'warning');
    if (!newPassword || newPassword.length < 8) return showToast('Password must be at least 8 characters', 'warning');

    const ogText = resetPwBtn.textContent;
    resetPwBtn.textContent = 'Resetting...';
    resetPwBtn.disabled = true;

    try {
      const res = await authApi.resetPassword(currentEmail, code, newPassword);
      showToast(res.message || 'Password reset successful', 'success');
      setTimeout(() => {
        window.location.href = '/pages/login.html';
      }, 2000);
    } catch (err) {
      showToast(err.message || 'Failed to reset password', 'error');
      resetPwBtn.textContent = ogText;
      resetPwBtn.disabled = false;
    }
  });
});
