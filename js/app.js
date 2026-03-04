/**
 * AminchiData - app.js
 * Shared utilities: toast, modal, navigation, localStorage helpers
 */

// ===================== Toast Notifications =====================
const Toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 4000) {
    const c = getContainer();
    const icons = {
      success: 'fa-circle-check',
      error:   'fa-circle-xmark',
      info:    'fa-circle-info',
      warning: 'fa-triangle-exclamation',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info}"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:inherit;cursor:pointer;font-size:1rem;opacity:0.7;">
        <i class="fa-solid fa-xmark"></i>
      </button>`;

    c.appendChild(toast);

    toast.addEventListener('click', () => removeToast(toast));

    if (duration > 0) {
      setTimeout(() => removeToast(toast), duration);
    }
  }

  function removeToast(toast) {
    toast.classList.add('toast-fadeout');
    setTimeout(() => toast.remove(), 310);
  }

  return { show };
})();

// ===================== Modal =====================
const Modal = (() => {
  function confirm(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirm',
        message = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'primary',
      } = options;

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-box">
          <h3 class="text-xl font-bold mb-3 text-white">${title}</h3>
          <p class="text-slate-300 mb-6">${message}</p>
          <div class="flex gap-3 justify-end">
            <button id="modal-cancel" class="btn-outline px-5 py-2.5 text-sm">${cancelText}</button>
            <button id="modal-confirm" class="btn-primary px-5 py-2.5 text-sm">${confirmText}</button>
          </div>
        </div>`;

      document.body.appendChild(overlay);

      overlay.querySelector('#modal-cancel').addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });

      overlay.querySelector('#modal-confirm').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { overlay.remove(); resolve(false); }
      });
    });
  }

  function alert(options = {}) {
    return new Promise((resolve) => {
      const { title = 'Notice', message = '', okText = 'OK' } = options;
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-box">
          <h3 class="text-xl font-bold mb-3 text-white">${title}</h3>
          <p class="text-slate-300 mb-6">${message}</p>
          <div class="flex justify-end">
            <button id="modal-ok" class="btn-primary px-6 py-2.5 text-sm">${okText}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('#modal-ok').addEventListener('click', () => { overlay.remove(); resolve(); });
      overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve(); } });
    });
  }

  return { confirm, alert };
})();

// ===================== localStorage Helpers =====================
const Store = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem('aminchi_' + key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('aminchi_' + key, JSON.stringify(value)); } catch {}
  },
  remove(key) { localStorage.removeItem('aminchi_' + key); },
};

// ===================== Auth Helpers =====================
const Auth = {
  getUser() { return Store.get('user'); },
  isLoggedIn() { return !!this.getUser(); },
  logout() {
    Store.remove('user');
    fetch('api/auth.php?action=logout', { method: 'POST' }).catch(() => {});
    window.location.href = 'login.html';
  },
};

// ===================== Local User Store (client-side fallback) =====================
const LocalUsers = (() => {
  const STORE_KEY = 'local_users';

  async function hashPassword(password) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for non-secure contexts: simple one-way transform
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash + password.charCodeAt(i)) | 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }

  // Pre-computed SHA-256 hashes for seed users
  const SEED_HASHES = {
    'demo@aminchidata.com': null,
    'admin@aminchidata.com': null,
  };
  const SEED_PASSWORDS = {
    'demo@aminchidata.com': 'password123',
    'admin@aminchidata.com': 'admin123',
  };

  // Seed with demo user on first load
  async function init() {
    if (!Store.get(STORE_KEY)) {
      const demoHash = await hashPassword('password123');
      const adminHash = await hashPassword('admin123');
      Store.set(STORE_KEY, [
        { id: 1, name: 'Demo User', email: 'demo@aminchidata.com', phone: '08012345678', passwordHash: demoHash, wallet_balance: 5000 },
        { id: 2, name: 'Admin User', email: 'admin@aminchidata.com', phone: '08098765432', passwordHash: adminHash, wallet_balance: 0 },
      ]);
    }
  }

  async function getAll() {
    await init();
    return Store.get(STORE_KEY, []);
  }

  async function findByEmail(email) {
    const users = await getAll();
    return users.find(u => u.email === email.toLowerCase().trim());
  }

  async function create(name, email, phone, password) {
    const users = await getAll();
    if (users.find(u => u.email === email.toLowerCase().trim())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser = {
      id: Date.now(),
      name,
      email: email.toLowerCase().trim(),
      phone,
      passwordHash: await hashPassword(password),
      wallet_balance: 500,
    };
    users.push(newUser);
    Store.set(STORE_KEY, users);
    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone } };
  }

  async function authenticate(email, password) {
    const user = await findByEmail(email);
    if (!user) return null;
    const hash = await hashPassword(password);
    if (user.passwordHash !== hash) return null;
    return { id: user.id, name: user.name, email: user.email, phone: user.phone };
  }

  return { init, findByEmail, create, authenticate };
})();

// ===================== Format Helpers =====================
function formatCurrency(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ===================== Button Loading =====================
function setButtonLoading(btn, loading, originalText = null) {
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> Processing...`;
    btn.disabled = true;
  } else {
    btn.innerHTML = originalText || btn.dataset.originalText || 'Submit';
    btn.disabled = false;
  }
}

// ===================== Form Validation =====================
function validateField(input, rules = {}) {
  const val = input.value.trim();
  let error = '';

  if (rules.required && !val) { error = rules.required === true ? 'This field is required.' : rules.required; }
  else if (rules.minLength && val.length < rules.minLength) { error = `Minimum ${rules.minLength} characters required.`; }
  else if (rules.maxLength && val.length > rules.maxLength) { error = `Maximum ${rules.maxLength} characters allowed.`; }
  else if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { error = 'Enter a valid email address.'; }
  else if (rules.phone && !/^0[7-9][0-1]\d{8}$/.test(val)) { error = 'Enter a valid Nigerian phone number (e.g. 08012345678).'; }
  else if (rules.min !== undefined && Number(val) < rules.min) { error = `Minimum value is ${rules.min}.`; }
  else if (rules.max !== undefined && Number(val) > rules.max) { error = `Maximum value is ${rules.max}.`; }
  else if (rules.match && val !== rules.match.value) { error = rules.match.message || 'Values do not match.'; }
  else if (rules.pattern && !rules.pattern.regex.test(val)) { error = rules.pattern.message; }

  const parent = input.closest('.field-wrap') || input.parentElement;
  let errEl = parent.querySelector('.form-error');

  if (error) {
    input.classList.add('error');
    if (!errEl) { errEl = document.createElement('p'); errEl.className = 'form-error'; parent.appendChild(errEl); }
    errEl.textContent = error;
    return false;
  } else {
    input.classList.remove('error');
    if (errEl) errEl.remove();
    return true;
  }
}

function clearFieldError(input) {
  input.classList.remove('error');
  const parent = input.closest('.field-wrap') || input.parentElement;
  const errEl = parent.querySelector('.form-error');
  if (errEl) errEl.remove();
}

// ===================== Navigation Setup =====================
function initNavigation() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('hidden');
        hamburger.classList.remove('open');
      } else {
        mobileMenu.classList.remove('hidden');
        // Force reflow so transition triggers
        mobileMenu.offsetHeight;
        mobileMenu.classList.add('open');
        hamburger.classList.add('open');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('hidden');
        hamburger.classList.remove('open');
      }
    });
  }

  // Highlight active nav link
  const links = document.querySelectorAll('.nav-link');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === path || href.endsWith(path))) {
      link.classList.add('active');
    }
  });

  // Auth-aware nav buttons
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navDashboard = document.getElementById('nav-dashboard');
  const navUser = document.getElementById('nav-user');
  const navLogout = document.getElementById('nav-logout');

  const user = Auth.getUser();
  if (user) {
    if (navLogin) navLogin.classList.add('hidden');
    if (navRegister) navRegister.classList.add('hidden');
    if (navDashboard) navDashboard.classList.remove('hidden');
    if (navUser) { navUser.classList.remove('hidden'); navUser.textContent = user.name.split(' ')[0]; }
    if (navLogout) { navLogout.classList.remove('hidden'); navLogout.addEventListener('click', Auth.logout.bind(Auth)); }
  } else {
    if (navDashboard) navDashboard.classList.add('hidden');
    if (navUser) navUser.classList.add('hidden');
    if (navLogout) navLogout.classList.add('hidden');
  }
}

// ===================== Animated Counter =====================
function animateCounter(el, target, duration = 1500, prefix = '', suffix = '') {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
  }, 16);
}

// ===================== Scroll animations =====================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ===================== Mock Transactions =====================
function getMockTransactions() {
  return Store.get('transactions', [
    { id: 'TXN001', date: '2024-12-20T14:30:00', type: 'Data', description: 'MTN 2GB Data', amount: 520, status: 'Success', phone: '08012345678' },
    { id: 'TXN002', date: '2024-12-19T11:15:00', type: 'Airtime', description: 'Airtel Airtime', amount: 500, status: 'Success', phone: '09087654321' },
    { id: 'TXN003', date: '2024-12-18T09:45:00', type: 'Education', description: 'WAEC Result Checker', amount: 3500, status: 'Success', phone: '' },
    { id: 'TXN004', date: '2024-12-17T16:20:00', type: 'Electricity', description: 'Ikeja Electric Prepaid', amount: 5000, status: 'Success', phone: '12345678901' },
    { id: 'TXN005', date: '2024-12-16T10:00:00', type: 'Data', description: 'Glo 1GB Data', amount: 240, status: 'Pending', phone: '08098765432' },
    { id: 'TXN006', date: '2024-12-15T13:55:00', type: 'Airtime', description: 'MTN Airtime', amount: 200, status: 'Failed', phone: '08011112222' },
    { id: 'TXN007', date: '2024-12-14T08:30:00', type: 'Data', description: 'MTN 5GB Data', amount: 1300, status: 'Success', phone: '09033334444' },
    { id: 'TXN008', date: '2024-12-13T17:10:00', type: 'Education', description: 'NECO Result Checker', amount: 1000, status: 'Success', phone: '' },
    { id: 'TXN009', date: '2024-12-12T12:00:00', type: 'Electricity', description: 'Eko Electric Prepaid', amount: 3000, status: 'Success', phone: '98765432101' },
    { id: 'TXN010', date: '2024-12-11T15:45:00', type: 'Airtime', description: 'Glo Airtime', amount: 1000, status: 'Success', phone: '07055556666' },
    { id: 'TXN011', date: '2024-12-10T09:20:00', type: 'Data', description: 'Airtel 3GB Data', amount: 780, status: 'Success', phone: '08077778888' },
    { id: 'TXN012', date: '2024-12-09T14:00:00', type: 'Education', description: 'NABTEB Result Checker', amount: 1000, status: 'Pending', phone: '' },
  ]);
}

function addTransaction(tx) {
  const txns = getMockTransactions();
  const newTx = {
    id: 'TXN' + Date.now(),
    date: new Date().toISOString(),
    ...tx,
  };
  txns.unshift(newTx);
  Store.set('transactions', txns);
  return newTx;
}

// ===================== Wallet =====================
function getWalletBalance() { return Store.get('wallet_balance', 5000); }
function setWalletBalance(amount) { Store.set('wallet_balance', amount); }
function deductWallet(amount) {
  const bal = getWalletBalance();
  if (bal < amount) return false;
  setWalletBalance(bal - amount);
  return true;
}
function fundWallet(amount) { setWalletBalance(getWalletBalance() + Number(amount)); }

// ===================== API Helper =====================
const API = {
  async post(url, data) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON response');
      }
    } catch (err) {
      throw err;
    }
  },
  async get(url) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON response');
      }
    } catch (err) {
      throw err;
    }
  },
};

// ===================== Init =====================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
});
