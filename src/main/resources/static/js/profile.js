/**
 * profile.js — User profile page
 */
import { initNavbar, formatDate } from './app.js';
import { auth as authApi, files as filesApi } from './api.js';
import { requireAuth, setCurrentUser, showToast } from './auth.js';

requireAuth();

let user = null;

async function init() {
  await initNavbar();
  try {
    const res = await authApi.me();
    user = res.data;
    setCurrentUser(user);
    populateForm(user);
  } catch {
    window.location.href = '/pages/login.html';
  }
  initForm();
  initAvatarUpload();
}

function populateForm(u) {
  // Avatar
  const avatarEl = document.getElementById('avatar-display');
  if (u.avatarUrl) {
    avatarEl.innerHTML = `<img src="${u.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" alt="${u.firstName}">`;
  } else {
    avatarEl.textContent = (u.firstName[0] + u.lastName[0]).toUpperCase();
  }

  document.getElementById('profile-name').textContent  = u.firstName + ' ' + u.lastName;
  document.getElementById('profile-email').textContent = u.email;
  document.getElementById('profile-role').textContent  = u.role;

  document.getElementById('p-first').value = u.firstName;
  document.getElementById('p-last').value  = u.lastName;
  document.getElementById('p-email').value = u.email;
  document.getElementById('p-phone').value = u.phone || '';

  document.getElementById('member-since').textContent = formatDate(u.createdAt);
  document.getElementById('account-type').textContent = u.role === 'HOST' ? 'Host' : u.role === 'ADMIN' ? 'Admin' : 'Guest';
}

function initForm() {
  document.getElementById('save-profile-btn').addEventListener('click', async () => {
    const firstName = document.getElementById('p-first').value.trim();
    const lastName  = document.getElementById('p-last').value.trim();
    const phone     = document.getElementById('p-phone').value.trim();

    const errEl     = document.getElementById('profile-error');
    const successEl = document.getElementById('profile-success');
    errEl.style.display = 'none';
    successEl.style.display = 'none';

    if (!firstName || !lastName) {
      errEl.textContent = '⚠ First and last name are required.';
      errEl.style.display = 'block';
      return;
    }

    const btn = document.getElementById('save-profile-btn');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      const res = await authApi.updateProfile({ firstName, lastName, phone });
      user = res.data;
      setCurrentUser(user);
      populateForm(user);
      successEl.style.display = 'block';
      showToast('Profile updated!');
      setTimeout(() => successEl.style.display = 'none', 3000);
    } catch (err) {
      errEl.textContent = '⚠ ' + err.message;
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  });
}

function initAvatarUpload() {
  document.getElementById('avatar-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await filesApi.uploadSingle(file);
      const avatarUrl = res.data;

      // Preview
      const avatarEl = document.getElementById('avatar-display');
      avatarEl.innerHTML = `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;">`;

      // Save the avatar immediately via the dedicated endpoint
      await authApi.updateAvatar(avatarUrl);
      
      // Update local session storage immediately
      const currentUser = JSON.parse(sessionStorage.getItem('staybnb_user'));
      if (currentUser) {
        currentUser.avatarUrl = avatarUrl;
        sessionStorage.setItem('staybnb_user', JSON.stringify(currentUser));
        // Force navbar re-render
        if (window.initNavbar) window.initNavbar();
      }

      showToast('Avatar updated successfully!');
    } catch (err) {
      showToast('Failed to upload avatar: ' + err.message, 'error');
    }
  });
}

init();
