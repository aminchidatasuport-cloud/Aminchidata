/**
 * AminchiData - admin.js
 * Admin panel logic: dashboard stats, user management, transaction management, settings
 */

// ===================== Admin Auth Guard =====================
const AdminAuth = {
  getAdmin() { return Store.get('admin_user'); },
  isAdminLoggedIn() { return !!this.getAdmin(); },
  logout() {
    Store.remove('admin_user');
    window.location.href = 'admin-login.html';
  }
};

// ===================== State Management =====================
let currentSection = 'dashboard';
let userSearchQuery = '';
let txnSearchQuery = '';
let txnFilterType = 'All';
let txnFilterStatus = 'All';
let userCurrentPage = 1;
let txnCurrentPage = 1;
const ITEMS_PER_PAGE = 10;

// ===================== Init =====================
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if not admin logged in
  if (!AdminAuth.isAdminLoggedIn()) { window.location.href = 'admin-login.html'; return; }

  initAdminSidebar();
  initAdminNav();
  loadDashboard();
  initUserManagement();
  initTransactionManagement();
  initSettings();
  initPriceList();
});

// ===================== Sidebar =====================
function initAdminSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('hidden');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('open');
      overlay.classList.add('hidden');
    });
  }
}

// ===================== Navigation =====================
function initAdminNav() {
  const navItems = document.querySelectorAll('[data-section]');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      if (section === currentSection) return;

      // Hide all sections
      document.querySelectorAll('[id^="section-"]').forEach(el => el.classList.add('hidden'));

      // Show target section
      const target = document.getElementById('section-' + section);
      if (target) target.classList.remove('hidden');

      // Update sidebar active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Update header title
      const titleEl = document.getElementById('admin-page-title');
      const titles = { dashboard: 'Dashboard', users: 'User Management', transactions: 'Transactions', settings: 'Settings', pricelist: 'Price List' };
      if (titleEl) titleEl.textContent = titles[section] || section;

      currentSection = section;

      // Close sidebar on mobile
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.add('hidden');

      // Refresh data when switching sections
      if (section === 'dashboard') refreshDashboard();
    });
  });

  // Admin logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  const logoutBtnMob = document.getElementById('logout-btn-mobile');
  [logoutBtn, logoutBtnMob].forEach(btn => {
    if (btn) btn.addEventListener('click', () => AdminAuth.logout());
  });
}

// ===================== Dashboard Section =====================
function loadDashboard() {
  const users = Store.get('users', []);
  const txns = getMockTransactions();
  const successTxns = txns.filter(t => t.status === 'Success');

  // Total users count
  const totalUsers = users.length;
  const totalTxns = txns.length;
  const totalRevenue = successTxns.reduce((sum, t) => sum + t.amount, 0);

  // Active users: users who have at least one transaction
  const txnPhones = new Set(txns.map(t => t.phone).filter(Boolean));
  const activeUsers = users.filter(u => txnPhones.has(u.phone)).length;

  // Populate stat elements
  const statUsers = document.getElementById('admin-stat-users');
  const statTxns = document.getElementById('admin-stat-transactions');
  const statRevenue = document.getElementById('admin-stat-revenue');
  const statActive = document.getElementById('admin-stat-active');

  if (statUsers) animateCounter(statUsers, totalUsers, 1500);
  if (statTxns) animateCounter(statTxns, totalTxns, 1500);
  if (statRevenue) animateCounter(statRevenue, totalRevenue, 1500, '₦');
  if (statActive) animateCounter(statActive, activeUsers, 1500);

  // Recent transactions table (last 5)
  const recentTxnBody = document.getElementById('admin-recent-txns');
  if (recentTxnBody) {
    const recent = txns.slice(0, 5);
    if (recent.length === 0) {
      recentTxnBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500">No transactions yet</td></tr>`;
    } else {
      recentTxnBody.innerHTML = recent.map(tx => `
        <tr>
          <td class="text-slate-400 text-sm whitespace-nowrap">${formatDateShort(tx.date)}</td>
          <td>
            <span class="inline-flex items-center gap-1.5">
              <i class="fa-solid ${typeIcon(tx.type)} text-${typeColor(tx.type)}-400 text-xs"></i>
              <span class="text-sm font-medium">${tx.type}</span>
            </span>
          </td>
          <td class="text-slate-300 text-sm hidden md:table-cell">${tx.description}</td>
          <td class="font-semibold text-sm">${formatCurrency(tx.amount)}</td>
          <td><span class="badge badge-${tx.status.toLowerCase()}">${tx.status}</span></td>
        </tr>`).join('');
    }
  }

  // Recent users table (last 5)
  const recentUserBody = document.getElementById('admin-recent-users');
  if (recentUserBody) {
    const recentUsers = [...users].reverse().slice(0, 5);
    if (recentUsers.length === 0) {
      recentUserBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-slate-500">No registered users</td></tr>`;
    } else {
      recentUserBody.innerHTML = recentUsers.map(u => `
        <tr>
          <td class="text-sm font-medium text-white">${u.name}</td>
          <td class="text-slate-300 text-sm">${u.email}</td>
          <td class="text-slate-400 text-sm hidden md:table-cell">${u.phone || '—'}</td>
          <td class="text-slate-400 text-sm whitespace-nowrap">${formatDateShort(u.createdAt)}</td>
        </tr>`).join('');
    }
  }
}

function refreshDashboard() {
  loadDashboard();
}

// ===================== Helper: Type Icons & Colors =====================
function typeIcon(type) {
  const map = { Data: 'fa-wifi', Airtime: 'fa-mobile-screen', Education: 'fa-graduation-cap', Electricity: 'fa-bolt' };
  return map[type] || 'fa-receipt';
}

function typeColor(type) {
  const map = { Data: 'blue', Airtime: 'orange', Education: 'purple', Electricity: 'yellow' };
  return map[type] || 'slate';
}

function typeColorClass(type) {
  const map = {
    Data: 'bg-blue-500/20 text-blue-400',
    Airtime: 'bg-orange-500/20 text-orange-400',
    Education: 'bg-purple-500/20 text-purple-400',
    Electricity: 'bg-yellow-500/20 text-yellow-400',
  };
  return map[type] || 'bg-slate-700 text-slate-300';
}

// ===================== Per-User Wallet Helpers =====================
function getUserWallet(userId) {
  return Store.get('wallet_' + userId, 5000);
}

function setUserWallet(userId, amount) {
  Store.set('wallet_' + userId, amount);
}

// ===================== User Management Section =====================
function initUserManagement() {
  const searchInput = document.getElementById('user-search');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      userSearchQuery = searchInput.value.trim().toLowerCase();
      userCurrentPage = 1;
      renderUserSection();
    });
  }

  renderUserSection();
}

function getFilteredUsers() {
  const users = Store.get('users', []);
  if (!userSearchQuery) return users;

  return users.filter(u =>
    (u.name && u.name.toLowerCase().includes(userSearchQuery)) ||
    (u.email && u.email.toLowerCase().includes(userSearchQuery)) ||
    (u.phone && u.phone.toLowerCase().includes(userSearchQuery))
  );
}

function renderUserSection() {
  const filtered = getFilteredUsers();
  renderUserRows(filtered, userCurrentPage);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  renderPaginationControls('user-pagination', userCurrentPage, totalPages, (page) => {
    userCurrentPage = page;
    renderUserSection();
  });

  const countLabel = document.getElementById('user-count-label');
  if (countLabel) {
    const start = (userCurrentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(userCurrentPage * ITEMS_PER_PAGE, filtered.length);
    countLabel.textContent = filtered.length === 0
      ? 'No users found'
      : `Showing ${start}–${end} of ${filtered.length} users`;
  }
}

function renderUserRows(users, page) {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = users.slice(start, start + ITEMS_PER_PAGE);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-500">No users found</td></tr>`;
    return;
  }

  tbody.innerHTML = paginated.map(u => `
    <tr>
      <td class="text-sm font-medium text-white">${u.name}</td>
      <td class="text-slate-300 text-sm">${u.email}</td>
      <td class="text-slate-400 text-sm hidden md:table-cell">${u.phone || '—'}</td>
      <td class="text-slate-400 text-sm whitespace-nowrap">${formatDateShort(u.createdAt)}</td>
      <td class="text-slate-300 text-sm">${formatCurrency(getUserWallet(u.id))}</td>
      <td class="text-right">
        <div class="flex items-center gap-2 justify-end">
          <button class="admin-adjust-wallet-btn text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-2.5 py-1.5 rounded-lg transition-colors" data-user-id="${u.id}">
            <i class="fa-solid fa-wallet mr-1"></i>Adjust Wallet
          </button>
          <button class="admin-delete-user-btn text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2.5 py-1.5 rounded-lg transition-colors" data-user-id="${u.id}">
            <i class="fa-solid fa-trash mr-1"></i>Delete
          </button>
        </div>
      </td>
    </tr>`).join('');

  // Bind action buttons
  tbody.querySelectorAll('.admin-adjust-wallet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.userId;
      const allUsers = Store.get('users', []);
      const user = allUsers.find(u => u.id === userId);
      if (user) showAdjustWalletModal(user);
    });
  });

  tbody.querySelectorAll('.admin-delete-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      const allUsers = Store.get('users', []);
      const user = allUsers.find(u => u.id === userId);
      if (!user) return;

      const confirmed = await Modal.confirm({
        title: 'Delete User',
        message: `Are you sure you want to delete <strong>${user.name}</strong>? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });

      if (confirmed) {
        const updated = allUsers.filter(u => u.id !== userId);
        Store.set('users', updated);
        Toast.show(`User "${user.name}" has been deleted`, 'success');
        renderUserSection();
        refreshDashboard();
      }
    });
  });
}

// ===================== Adjust Wallet Modal =====================
async function showAdjustWalletModal(user) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box max-w-sm">
      <h3 class="text-xl font-bold mb-1 text-white">Adjust Wallet</h3>
      <p class="text-slate-400 text-sm mb-5">Modify wallet balance for <strong>${user.name}</strong></p>

      <div class="field-wrap mb-4">
        <label class="block text-sm font-medium text-slate-300 mb-1.5">Current Balance</label>
        <p class="text-green-400 font-semibold">${formatCurrency(getUserWallet(user.id))}</p>
      </div>

      <div class="field-wrap mb-4">
        <label class="block text-sm font-medium text-slate-300 mb-1.5">Action</label>
        <select id="admin-wallet-action" class="form-input">
          <option value="add">Add Funds</option>
          <option value="deduct">Deduct Funds</option>
        </select>
      </div>

      <div class="field-wrap mb-4">
        <label class="block text-sm font-medium text-slate-300 mb-1.5">Amount (₦)</label>
        <input id="admin-wallet-amount" type="number" min="1" placeholder="e.g. 1000" class="form-input"/>
      </div>

      <div class="flex gap-3 justify-end mt-4">
        <button id="admin-wallet-cancel" class="btn-outline px-5 py-2.5 text-sm">Cancel</button>
        <button id="admin-wallet-confirm" class="btn-primary px-5 py-2.5 text-sm">Apply</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('#admin-wallet-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#admin-wallet-confirm').addEventListener('click', async () => {
    const action = overlay.querySelector('#admin-wallet-action').value;
    const amtInput = overlay.querySelector('#admin-wallet-amount');
    const amount = parseFloat(amtInput.value);

    if (!amount || amount <= 0) {
      Toast.show('Enter a valid amount', 'warning');
      return;
    }

    const btn = overlay.querySelector('#admin-wallet-confirm');
    setButtonLoading(btn, true);
    await new Promise(r => setTimeout(r, 1000));

    const currentBalance = getUserWallet(user.id);

    if (action === 'add') {
      setUserWallet(user.id, currentBalance + amount);
      Toast.show(`₦${amount.toLocaleString()} added to ${user.name}'s wallet`, 'success');
    } else {
      if (amount > currentBalance) {
        Toast.show('Insufficient wallet balance for deduction', 'error');
        setButtonLoading(btn, false);
        return;
      }
      setUserWallet(user.id, currentBalance - amount);
      Toast.show(`₦${amount.toLocaleString()} deducted from ${user.name}'s wallet`, 'success');
    }

    overlay.remove();
    renderUserSection();
    refreshDashboard();
  });
}

// ===================== Transaction Management Section =====================
function initTransactionManagement() {
  const searchInput = document.getElementById('txn-search');
  const typeFilter = document.getElementById('txn-filter-type');
  const statusFilter = document.getElementById('txn-filter-status');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      txnSearchQuery = searchInput.value.trim().toLowerCase();
      txnCurrentPage = 1;
      renderTxnSection();
    });
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      txnFilterType = typeFilter.value;
      txnCurrentPage = 1;
      renderTxnSection();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      txnFilterStatus = statusFilter.value;
      txnCurrentPage = 1;
      renderTxnSection();
    });
  }

  renderTxnSection();
}

function getFilteredTransactions() {
  let txns = getMockTransactions();

  // Apply type filter
  if (txnFilterType !== 'All') {
    txns = txns.filter(t => t.type === txnFilterType);
  }

  // Apply status filter
  if (txnFilterStatus !== 'All') {
    txns = txns.filter(t => t.status === txnFilterStatus);
  }

  // Apply search query
  if (txnSearchQuery) {
    txns = txns.filter(t =>
      (t.description && t.description.toLowerCase().includes(txnSearchQuery)) ||
      (t.type && t.type.toLowerCase().includes(txnSearchQuery)) ||
      (t.id && t.id.toLowerCase().includes(txnSearchQuery)) ||
      (t.phone && t.phone.toLowerCase().includes(txnSearchQuery))
    );
  }

  return txns;
}

function renderTxnSection() {
  const filtered = getFilteredTransactions();
  renderTxnRows(filtered, txnCurrentPage);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  renderPaginationControls('txn-pagination', txnCurrentPage, totalPages, (page) => {
    txnCurrentPage = page;
    renderTxnSection();
  });

  const countLabel = document.getElementById('txn-count-label');
  if (countLabel) {
    const start = (txnCurrentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(txnCurrentPage * ITEMS_PER_PAGE, filtered.length);
    countLabel.textContent = filtered.length === 0
      ? 'No transactions found'
      : `Showing ${start}–${end} of ${filtered.length} transactions`;
  }
}

function renderTxnRows(txns, page) {
  const tbody = document.getElementById('admin-txns-tbody');
  if (!tbody) return;

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = txns.slice(start, start + ITEMS_PER_PAGE);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-500">No transactions found</td></tr>`;
    return;
  }

  tbody.innerHTML = paginated.map(tx => `
    <tr>
      <td class="text-slate-400 text-sm whitespace-nowrap">${formatDateShort(tx.date)}</td>
      <td class="text-slate-500 text-xs font-mono hidden lg:table-cell">${tx.id}</td>
      <td>
        <span class="inline-flex items-center gap-1.5">
          <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs ${typeColorClass(tx.type)}">
            <i class="fa-solid ${typeIcon(tx.type)}"></i>
          </span>
          <span class="font-medium text-sm">${tx.type}</span>
        </span>
      </td>
      <td class="text-slate-300 text-sm hidden md:table-cell">${tx.description}</td>
      <td class="font-semibold text-sm whitespace-nowrap">${formatCurrency(tx.amount)}</td>
      <td><span class="badge badge-${tx.status.toLowerCase()}">${tx.status}</span></td>
      <td class="text-slate-400 text-sm hidden lg:table-cell">${tx.phone || '—'}</td>
      <td class="text-right">
        <button class="admin-update-status-btn text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors" data-txn-id="${tx.id}">
          <i class="fa-solid fa-pen mr-1"></i>Status
        </button>
      </td>
    </tr>`).join('');

  // Bind status update buttons
  tbody.querySelectorAll('.admin-update-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const txnId = btn.dataset.txnId;
      const allTxns = getMockTransactions();
      const txn = allTxns.find(t => t.id === txnId);
      if (txn) showUpdateStatusModal(txn);
    });
  });
}

// ===================== Update Status Modal =====================
async function showUpdateStatusModal(txn) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box max-w-sm">
      <h3 class="text-xl font-bold mb-1 text-white">Update Transaction Status</h3>
      <p class="text-slate-400 text-sm mb-5">Transaction <strong>${txn.id}</strong> — ${txn.description}</p>

      <div class="field-wrap mb-4">
        <label class="block text-sm font-medium text-slate-300 mb-1.5">Current Status</label>
        <p><span class="badge badge-${txn.status.toLowerCase()}">${txn.status}</span></p>
      </div>

      <div class="field-wrap mb-4">
        <label class="block text-sm font-medium text-slate-300 mb-1.5">New Status</label>
        <select id="admin-txn-status" class="form-input">
          <option value="Success" ${txn.status === 'Success' ? 'selected' : ''}>Success</option>
          <option value="Pending" ${txn.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Failed" ${txn.status === 'Failed' ? 'selected' : ''}>Failed</option>
        </select>
      </div>

      <div class="flex gap-3 justify-end mt-4">
        <button id="admin-status-cancel" class="btn-outline px-5 py-2.5 text-sm">Cancel</button>
        <button id="admin-status-confirm" class="btn-primary px-5 py-2.5 text-sm">Update</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('#admin-status-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#admin-status-confirm').addEventListener('click', async () => {
    const newStatus = overlay.querySelector('#admin-txn-status').value;

    if (newStatus === txn.status) {
      Toast.show('Status is already set to ' + newStatus, 'info');
      overlay.remove();
      return;
    }

    const btn = overlay.querySelector('#admin-status-confirm');
    setButtonLoading(btn, true);
    await new Promise(r => setTimeout(r, 1000));

    // Update transaction in store
    const allTxns = getMockTransactions();
    const target = allTxns.find(t => t.id === txn.id);
    if (target) {
      target.status = newStatus;
      Store.set('transactions', allTxns);
    }

    overlay.remove();
    Toast.show(`Transaction ${txn.id} updated to "${newStatus}"`, 'success');
    renderTxnSection();
    refreshDashboard();
  });
}

// ===================== Pagination Controls =====================
function renderPaginationControls(containerId, currentPage, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let pages = [];

  // Always show first, last, current, and neighbors
  const show = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1].filter(p => p >= 1 && p <= totalPages));
  const sorted = [...show].sort((a, b) => a - b);

  sorted.forEach((page, i) => {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      pages.push('<span class="text-slate-600 px-1">…</span>');
    }
    pages.push(`
      <button class="admin-page-btn w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === currentPage
        ? 'bg-green-500 text-white'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}" data-page="${page}">
        ${page}
      </button>`);
  });

  const prevDisabled = currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-700';
  const nextDisabled = currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-700';

  container.innerHTML = `
    <div class="flex items-center gap-1.5 flex-wrap">
      <button class="admin-page-btn w-9 h-9 rounded-lg bg-slate-800 text-slate-300 text-sm ${prevDisabled}" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-left text-xs"></i>
      </button>
      ${pages.join('')}
      <button class="admin-page-btn w-9 h-9 rounded-lg bg-slate-800 text-slate-300 text-sm ${nextDisabled}" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>
    </div>`;

  container.querySelectorAll('.admin-page-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page, 10);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    });
  });
}

// ===================== Settings Section =====================
function initSettings() {
  const settings = Store.get('admin_settings', {});

  const nameInput = document.getElementById('setting-platform-name');
  const emailInput = document.getElementById('setting-support-email');
  const maintenanceToggle = document.getElementById('setting-maintenance');
  const markupInput = document.getElementById('setting-data-markup');
  const discountInput = document.getElementById('setting-airtime-discount');
  const saveBtn = document.getElementById('save-settings-btn');

  // Load existing settings
  if (nameInput) nameInput.value = settings.platformName || 'AminchiData';
  if (emailInput) emailInput.value = settings.supportEmail || '';
  if (maintenanceToggle) maintenanceToggle.checked = settings.maintenanceMode || false;
  if (markupInput) markupInput.value = settings.dataMarkup || '';
  if (discountInput) discountInput.value = settings.airtimeDiscount || '';

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      setButtonLoading(saveBtn, true);
      await new Promise(r => setTimeout(r, 1000));

      const updatedSettings = {
        platformName: nameInput ? nameInput.value.trim() : 'AminchiData',
        supportEmail: emailInput ? emailInput.value.trim() : '',
        maintenanceMode: maintenanceToggle ? maintenanceToggle.checked : false,
        dataMarkup: markupInput ? markupInput.value.trim() : '',
        airtimeDiscount: discountInput ? discountInput.value.trim() : '',
      };

      Store.set('admin_settings', updatedSettings);
      setButtonLoading(saveBtn, false);
      Toast.show('Settings saved successfully', 'success');
    });
  }
}

// ===================== Price List Section =====================

// AlrahuzData complete price lists
const ALRAHUZ_DATA_PLANS = {
  MTN: {
    SME: [
      { id: 500, size: '0.5 GB', validity: '7 days', price: 340 },
      { id: 583, size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 7, size: '1.0 GB', validity: '7 days', price: 780 },
      { id: 467, size: '1.5 GB', validity: '7 days', price: 965 },
      { id: 501, size: '1.0 GB', validity: '21-30 days', price: 500 },
      { id: 573, size: '2.0 GB', validity: '21-30 days', price: 900 },
      { id: 572, size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 8, size: '2.0 GB', validity: '30 days', price: 1450 },
      { id: 538, size: '5.0 GB', validity: '3 weeks', price: 1800 },
      { id: 44, size: '3.5 GB', validity: '30 days', price: 2450 },
      { id: 219, size: '500.0 MB', validity: '7 days', price: 485 },
      { id: 539, size: '20.0 GB', validity: '30 days', price: 7300 },
    ],
    SME2: [
      { id: 590, size: '0.5 GB', validity: '7 days', price: 340 },
      { id: 587, size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 562, size: '1.0 GB', validity: '21-30 days', price: 500 },
      { id: 509, size: '2.5 GB', validity: '1 day', price: 740 },
      { id: 319, size: '1.0 GB', validity: '7 days +5min', price: 780 },
      { id: 481, size: '2.0 GB', validity: '14-21 days', price: 900 },
      { id: 314, size: '2.0 GB', validity: '1 month', price: 1450 },
      { id: 465, size: '3.5 GB', validity: '7 days', price: 1480 },
      { id: 482, size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 503, size: '5.0 GB', validity: '3 weeks', price: 1800 },
      { id: 310, size: '3.5 GB', validity: '1 month', price: 2450 },
      { id: 466, size: '4.2 GB', validity: '1 month', price: 2910 },
      { id: 308, size: '7.0 GB', validity: '1 month', price: 3450 },
      { id: 315, size: '10.0 GB', validity: '1 month', price: 4400 },
      { id: 512, size: '20.0 GB', validity: '7 days', price: 4900 },
      { id: 463, size: '12.5 GB', validity: '1 month', price: 5350 },
      { id: 464, size: '16.5 GB', validity: '1 month', price: 6300 },
      { id: 635, size: '34.0 GB', validity: '30 days', price: 9800 },
      { id: 473, size: '36.0 GB', validity: '30 days', price: 10800 },
      { id: 474, size: '65.0 GB', validity: '30 days', price: 15500 },
      { id: 475, size: '75.0 GB', validity: '30 days', price: 17450 },
      { id: 506, size: '90.0 GB', validity: '60 days', price: 24500 },
      { id: 476, size: '165.0 GB', validity: '30 days', price: 35880 },
      { id: 504, size: '250.0 GB', validity: '30 days', price: 53500 },
      { id: 576, size: '800.0 GB', validity: '365 days', price: 123000 },
      { id: 616, size: '1.0 GB', validity: '1 day (no sms)', price: 200 },
      { id: 637, size: '1.0 GB', validity: '1 day', price: 220 },
      { id: 607, size: '1.0 GB', validity: '3 days (social)', price: 291 },
      { id: 609, size: '2.0 GB', validity: '7 days (TikTok)', price: 390 },
      { id: 623, size: '750.0 MB', validity: '3 days +1hr YT/IG', price: 441 },
      { id: 518, size: '2.5 GB', validity: '1 day', price: 520 },
      { id: 629, size: '3.5 GB', validity: '1 day', price: 970 },
      { id: 631, size: '4.0 GB', validity: '2 days', price: 1164 },
      { id: 611, size: '200.0 MB', validity: '1 day (social)', price: 120 },
    ],
    GIFTING: [
      { id: 638, size: '1.0 GB', validity: '1 day', price: 200 },
      { id: 614, size: '1.0 GB', validity: '1 day', price: 220 },
      { id: 589, size: '0.5 GB', validity: '7 days', price: 340 },
      { id: 586, size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 408, size: '75.0 MB', validity: '1 day', price: 80 },
      { id: 443, size: '110.0 MB', validity: '1 day', price: 96 },
      { id: 610, size: '200.0 MB', validity: '1 day (social)', price: 120 },
      { id: 445, size: '230.0 MB', validity: '1 day', price: 195 },
      { id: 606, size: '1.0 GB', validity: '3 days (social)', price: 291 },
      { id: 403, size: '1.0 GB', validity: '1 day +5min', price: 485 },
      { id: 575, size: '1.0 GB', validity: '21 days-monthly', price: 500 },
      { id: 617, size: '2.5 GB', validity: '1 day', price: 520 },
      { id: 412, size: '1.5 GB', validity: '2 days', price: 590 },
      { id: 622, size: '750.0 MB', validity: '3 days +1hr YT/IG', price: 441 },
      { id: 510, size: '2.5 GB', validity: '1 day', price: 740 },
      { id: 409, size: '2.5 GB', validity: '1 day', price: 750 },
      { id: 410, size: '2.0 GB', validity: '2 days', price: 750 },
      { id: 441, size: '1.0 GB', validity: '7 days +25min', price: 785 },
      { id: 580, size: '2.0 GB', validity: '21-30 days', price: 900 },
      { id: 378, size: '3.2 GB', validity: '2 days', price: 970 },
      { id: 627, size: '3.5 GB', validity: '1 day', price: 970 },
      { id: 630, size: '4.0 GB', validity: '2 days', price: 1164 },
      { id: 571, size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 451, size: '2.0 GB', validity: '30 days', price: 1450 },
      { id: 633, size: '5.5 GB', validity: '2 days', price: 1480 },
      { id: 570, size: '5.0 GB', validity: '3 weeks', price: 1800 },
      { id: 404, size: '6.0 GB', validity: '7 days', price: 2450 },
      { id: 453, size: '3.5 GB', validity: '30 days', price: 2450 },
      { id: 419, size: '4.2 GB', validity: '30 days +5min', price: 2910 },
      { id: 379, size: '11.0 GB', validity: '7 days', price: 3450 },
      { id: 456, size: '7.0 GB', validity: '30 days +2gb night', price: 3450 },
      { id: 420, size: '10.0 GB', validity: '30 days +15min', price: 4450 },
      { id: 513, size: '20.0 GB', validity: '7 days', price: 4900 },
      { id: 413, size: '11.0 GB', validity: '30 days +25min', price: 5000 },
      { id: 414, size: '16.5 GB', validity: '30 days +25min', price: 6480 },
      { id: 458, size: '20.0 GB', validity: '30 days', price: 7300 },
      { id: 417, size: '25.0 GB', validity: '30 days', price: 8950 },
      { id: 634, size: '34.0 GB', validity: '30 days', price: 9800 },
      { id: 405, size: '75.0 GB', validity: '30 days', price: 17500 },
      { id: 406, size: '200.0 GB', validity: '60 days', price: 49500 },
      { id: 577, size: '800.0 GB', validity: '365 days', price: 123000 },
      { id: 608, size: '2.0 GB', validity: '7 days (TikTok)', price: 390 },
    ],
    'CORPORATE GIFTING': [
      { id: 497, size: '500.0 MB', validity: '7 days', price: 340 },
      { id: 584, size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 498, size: '1.0 GB', validity: '21 days-monthly', price: 500 },
      { id: 479, size: '2.0 GB', validity: '21-30 days', price: 900 },
      { id: 480, size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 502, size: '5.0 GB', validity: '3 weeks', price: 1800 },
    ],
    'DATA COUPONS': [
      { id: 639, size: '1.0 GB', validity: '1 day', price: 200 },
      { id: 615, size: '1.0 GB', validity: '1 day', price: 220 },
      { id: 591, size: '0.5 GB', validity: '7 days', price: 340 },
      { id: 588, size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 462, size: '75.0 MB', validity: '1 day', price: 80 },
      { id: 444, size: '110.0 MB', validity: '1 day', price: 96 },
      { id: 446, size: '230.0 MB', validity: '1 day', price: 195 },
      { id: 624, size: '750.0 MB', validity: '3 days +1hr YT/IG', price: 441 },
      { id: 429, size: '1.0 GB', validity: '1 day +5min', price: 485 },
      { id: 574, size: '1.0 GB', validity: '21-30 days', price: 500 },
      { id: 619, size: '2.5 GB', validity: '1 day', price: 520 },
      { id: 430, size: '1.5 GB', validity: '2 days', price: 590 },
      { id: 511, size: '2.5 GB', validity: '1 day', price: 740 },
      { id: 431, size: '2.0 GB', validity: '2 days', price: 750 },
      { id: 433, size: '2.5 GB', validity: '1 day', price: 750 },
      { id: 442, size: '1.0 GB', validity: '7 days +25min', price: 785 },
      { id: 432, size: '2.5 GB', validity: '2 days', price: 900 },
      { id: 581, size: '2.0 GB', validity: '14-21 days', price: 900 },
      { id: 343, size: '3.2 GB', validity: '2 days', price: 970 },
      { id: 628, size: '3.5 GB', validity: '1 day', price: 970 },
      { id: 632, size: '4.0 GB', validity: '2 days', price: 1164 },
      { id: 582, size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 452, size: '2.0 GB', validity: '30 days', price: 1450 },
      { id: 579, size: '5.0 GB', validity: '3 weeks', price: 1800 },
      { id: 434, size: '6.0 GB', validity: '7 days', price: 2450 },
      { id: 454, size: '3.5 GB', validity: '30 days', price: 2450 },
      { id: 438, size: '4.2 GB', validity: '30 days +5min', price: 2950 },
      { id: 440, size: '11.0 GB', validity: '7 days', price: 3450 },
      { id: 457, size: '7.0 GB', validity: '30 days +2gb night', price: 3450 },
      { id: 407, size: '10.0 GB', validity: '30 days +15min', price: 4450 },
      { id: 514, size: '20.0 GB', validity: '7 days', price: 4900 },
      { id: 455, size: '16.5 GB', validity: '30 days +10min', price: 6480 },
      { id: 416, size: '20.0 GB', validity: '30 days', price: 7300 },
      { id: 459, size: '25.0 GB', validity: '30 days', price: 8950 },
      { id: 636, size: '34.0 GB', validity: '30 days', price: 9800 },
      { id: 507, size: '90.0 GB', validity: '60 days', price: 24500 },
      { id: 505, size: '250.0 GB', validity: '30 days', price: 53500 },
      { id: 578, size: '800.0 GB', validity: '365 days', price: 123000 },
    ],
    'DATA SHARE': [
      { id: 566, size: '500.0 MB', validity: '7 days', price: 340 },
      { id: 585, size: '1.0 GB', validity: '7 days', price: 440 },
      { id: 567, size: '1.0 GB', validity: '21 days-monthly', price: 500 },
      { id: 568, size: '2.0 GB', validity: '21-30 days', price: 900 },
      { id: 569, size: '3.0 GB', validity: '21-30 days', price: 1350 },
      { id: 330, size: '5.0 GB', validity: '3 weeks', price: 1800 },
    ],
  },
  Airtel: {
    GIFTING: [
      { id: 436, size: '150.0 MB', validity: '1 day', price: 55 },
      { id: 556, size: '150.0 MB', validity: '1 day', price: 55 },
      { id: 560, size: '300.0 MB', validity: '2 days', price: 98 },
      { id: 558, size: '600.0 MB', validity: '2 days', price: 196 },
      { id: 483, size: '1.0 GB', validity: '3 days (social)', price: 292 },
      { id: 592, size: '1.5 GB', validity: '1 day', price: 395 },
      { id: 598, size: '3.2 GB', validity: '3 days', price: 490 },
      { id: 596, size: '2.0 GB', validity: '2 days', price: 575 },
      { id: 552, size: '3.0 GB', validity: '1 day', price: 735 },
      { id: 600, size: '6.5 GB', validity: '7 days', price: 990 },
      { id: 594, size: '5.0 GB', validity: '7 days', price: 1450 },
      { id: 602, size: '8.0 GB', validity: '30 days', price: 1950 },
      { id: 427, size: '10.0 GB', validity: '30 days', price: 2940 },
    ],
    SME: [
      { id: 437, size: '150.0 MB', validity: '1 day', price: 55 },
      { id: 557, size: '150.0 MB', validity: '1 day', price: 55 },
      { id: 561, size: '300.0 MB', validity: '2 days', price: 98 },
      { id: 559, size: '600.0 MB', validity: '2 days', price: 196 },
      { id: 484, size: '1.0 GB', validity: '3 days (social)', price: 292 },
      { id: 593, size: '1.5 GB', validity: '1 day', price: 395 },
      { id: 599, size: '3.2 GB', validity: '3 days', price: 490 },
      { id: 597, size: '2.0 GB', validity: '2 days', price: 575 },
      { id: 553, size: '3.0 GB', validity: '2 days', price: 735 },
      { id: 601, size: '6.5 GB', validity: '7 days', price: 990 },
      { id: 595, size: '5.0 GB', validity: '7 days', price: 1460 },
      { id: 603, size: '8.0 GB', validity: '30 days', price: 1950 },
      { id: 428, size: '10.0 GB', validity: '30 days', price: 2940 },
    ],
    'CORPORATE GIFTING': [
      { id: 525, size: '75.0 MB', validity: '1 day', price: 75 },
      { id: 526, size: '100.0 MB', validity: '1 day', price: 100 },
      { id: 527, size: '200.0 MB', validity: '2 days', price: 200 },
      { id: 528, size: '300.0 MB', validity: '2 days', price: 298 },
      { id: 515, size: '500.0 MB', validity: '7 days', price: 490 },
      { id: 516, size: '1.0 GB', validity: '7 days', price: 784 },
      { id: 517, size: '2.0 GB', validity: '30 days', price: 1450 },
      { id: 518, size: '3.0 GB', validity: '30 days', price: 1950 },
      { id: 519, size: '4.0 GB', validity: '30 days', price: 2460 },
      { id: 520, size: '8.0 GB', validity: '30 days', price: 2950 },
      { id: 521, size: '10.0 GB', validity: '30 days', price: 3910 },
      { id: 522, size: '13.0 GB', validity: '30 days', price: 4900 },
      { id: 523, size: '18.0 GB', validity: '30 days', price: 5870 },
      { id: 524, size: '25.0 GB', validity: '30 days', price: 7820 },
      { id: 529, size: '35.0 GB', validity: '30 days', price: 97500 },
      { id: 530, size: '60.0 GB', validity: '30 days', price: 14600 },
      { id: 535, size: '100.0 GB', validity: '30 days', price: 19500 },
    ],
  },
  Glo: {
    GIFTING: [
      { id: 351, size: '1.5 GB', validity: '1 day (Awoof)', price: 295 },
      { id: 352, size: '2.5 GB', validity: '2 days', price: 485 },
      { id: 546, size: '3.5 GB', validity: '7 days', price: 1000 },
      { id: 354, size: '10.0 GB', validity: '7 days (Awoof)', price: 1950 },
      { id: 548, size: '8.5 GB', validity: '7 days', price: 2000 },
      { id: 550, size: '20.5 GB', validity: '7 days', price: 4850 },
    ],
    SME: [
      { id: 369, size: '1.5 GB', validity: '1 day', price: 295 },
      { id: 370, size: '2.5 GB', validity: '2 days', price: 485 },
      { id: 547, size: '3.5 GB', validity: '7 days', price: 1000 },
      { id: 371, size: '10.0 GB', validity: '7 days', price: 1950 },
      { id: 549, size: '8.5 GB', validity: '7 days', price: 2000 },
      { id: 551, size: '20.5 GB', validity: '7 days', price: 4850 },
    ],
    'CORPORATE GIFTING': [
      { id: 291, size: '200.0 MB', validity: '30 days', price: 84 },
      { id: 290, size: '500.0 MB', validity: '30 days', price: 199 },
      { id: 564, size: '1.0 GB', validity: '3 days', price: 245 },
      { id: 563, size: '1.0 GB', validity: '7 days', price: 280 },
      { id: 285, size: '1.0 GB', validity: '30 days', price: 399 },
      { id: 621, size: '3.0 GB', validity: '3 days', price: 720 },
      { id: 286, size: '2.0 GB', validity: '30 days', price: 798 },
      { id: 620, size: '3.0 GB', validity: '7 days', price: 850 },
      { id: 287, size: '3.0 GB', validity: '30 days', price: 1199 },
      { id: 625, size: '5.0 GB', validity: '3 days', price: 1200 },
      { id: 626, size: '5.0 GB', validity: '7 days', price: 1460 },
      { id: 288, size: '5.0 GB', validity: '30 days', price: 1998 },
      { id: 289, size: '10.0 GB', validity: '30 days', price: 3990 },
    ],
  },
  '9mobile': {
    GIFTING: [
      { id: 269, size: '25.0 MB', validity: '1 day', price: 46 },
      { id: 270, size: '650.0 MB', validity: '1 day', price: 175 },
      { id: 182, size: '500.0 MB', validity: '30 days', price: 425 },
      { id: 272, size: '2.0 GB', validity: '3 days', price: 425 },
      { id: 183, size: '1.5 GB', validity: '30 days', price: 850 },
      { id: 184, size: '2.0 GB', validity: '30 days', price: 1020 },
      { id: 273, size: '7.0 GB', validity: '7 days', price: 1275 },
      { id: 185, size: '3.0 GB', validity: '30 days', price: 1275 },
      { id: 186, size: '4.5 GB', validity: '30 days', price: 1700 },
      { id: 187, size: '11.0 GB', validity: '30 days', price: 3400 },
      { id: 188, size: '15.0 GB', validity: '30 days', price: 4200 },
      { id: 189, size: '40.0 GB', validity: '30 days', price: 8500 },
      { id: 262, size: '75.0 GB', validity: '1 month', price: 12750 },
    ],
    SME: [
      { id: 248, size: '1.0 GB', validity: '1 month', price: 220 },
      { id: 249, size: '1.5 GB', validity: '1 month', price: 330 },
      { id: 250, size: '2.0 GB', validity: '1 month', price: 720 },
      { id: 251, size: '3.0 GB', validity: '1 month', price: 660 },
      { id: 252, size: '4.0 GB', validity: '1 month', price: 880 },
      { id: 253, size: '5.0 GB', validity: '1 month', price: 1100 },
      { id: 304, size: '4.5 GB', validity: '30 days', price: 980 },
      { id: 292, size: '10.0 GB', validity: '30 days', price: 2200 },
    ],
    'CORPORATE GIFTING': [
      { id: 305, size: '25.0 MB', validity: '30 days', price: 25 },
      { id: 302, size: '500.0 MB', validity: '30 days', price: 240 },
      { id: 296, size: '1.0 GB', validity: '30 days', price: 480 },
      { id: 298, size: '1.5 GB', validity: '30 days', price: 720 },
      { id: 297, size: '2.0 GB', validity: '30 days', price: 960 },
      { id: 299, size: '3.0 GB', validity: '30 days', price: 1440 },
      { id: 303, size: '4.0 GB', validity: '30 days', price: 1920 },
      { id: 300, size: '5.0 GB', validity: '30 days', price: 2400 },
      { id: 301, size: '10.0 GB', validity: '30 days', price: 4800 },
    ],
  },
};

const ALRAHUZ_CABLE_PLANS = {
  GOTV: [
    { id: 34, name: 'GOtv Smallie - Monthly', price: 1900 },
    { id: 35, name: 'GOtv Smallie - Quarterly', price: 5100 },
    { id: 36, name: 'GOtv Smallie - Yearly', price: 15000 },
    { id: 16, name: 'GOtv Jinja', price: 3900 },
    { id: 17, name: 'GOtv Jolli', price: 5800 },
    { id: 2, name: 'GOtv Max', price: 8500 },
    { id: 47, name: 'GOtv Supa', price: 11400 },
    { id: 49, name: 'GOtv Supa Plus', price: 16800 },
  ],
  DSTV: [
    { id: 20, name: 'DStv Padi', price: 4400 },
    { id: 6, name: 'DStv Yanga', price: 6000 },
    { id: 19, name: 'DStv Confam', price: 11000 },
    { id: 7, name: 'DStv Compact', price: 19000 },
    { id: 8, name: 'DStv Compact Plus', price: 30000 },
    { id: 9, name: 'DStv Premium', price: 44500 },
    { id: 23, name: 'DStv Indian', price: 14900 },
    { id: 24, name: 'DStv Premium French', price: 69000 },
    { id: 25, name: 'DStv Premium Asia', price: 50500 },
    { id: 26, name: 'DStv Confam + ExtraView', price: 17000 },
    { id: 27, name: 'DStv Yanga + ExtraView', price: 12000 },
    { id: 28, name: 'DStv Padi + ExtraView', price: 10400 },
    { id: 29, name: 'DStv Compact + Extra View', price: 25000 },
    { id: 30, name: 'DStv Premium + Extra View', price: 50500 },
    { id: 31, name: 'DStv Compact Plus + Extra View', price: 36000 },
    { id: 33, name: 'ExtraView Access', price: 6000 },
  ],
  STARTIME: [
    { id: 14, name: 'Nova - 1 Month', price: 2100 },
    { id: 12, name: 'Basic - 1 Month', price: 4000 },
    { id: 13, name: 'Smart - 1 Month', price: 5100 },
    { id: 11, name: 'Classic - 1 Month', price: 6000 },
    { id: 15, name: 'Super - 1 Month (₦9800)', price: 9800 },
    { id: 48, name: 'Super - 1 Month (₦9000)', price: 9000 },
    { id: 37, name: 'Nova - 1 Week', price: 700 },
    { id: 38, name: 'Basic - 1 Week', price: 1400 },
    { id: 39, name: 'Smart - 1 Week', price: 1700 },
    { id: 40, name: 'Classic - 1 Week', price: 2000 },
    { id: 41, name: 'Super - 1 Week', price: 3300 },
  ],
};

const ALRAHUZ_RECHARGE_CARDS = [
  { id: 13, network: 'MTN', amount: 100 },
  { id: 2, network: 'MTN', amount: 200 },
  { id: 3, network: 'MTN', amount: 500 },
  { id: 20, network: 'MTN', amount: 1000 },
  { id: 4, network: 'GLO', amount: 100 },
  { id: 5, network: 'GLO', amount: 200 },
  { id: 6, network: 'GLO', amount: 500 },
  { id: 22, network: 'GLO', amount: 1000 },
  { id: 7, network: '9MOBILE', amount: 100 },
  { id: 8, network: '9MOBILE', amount: 200 },
  { id: 10, network: 'AIRTEL', amount: 100 },
  { id: 11, network: 'AIRTEL', amount: 200 },
  { id: 12, network: 'AIRTEL', amount: 500 },
  { id: 21, network: 'AIRTEL', amount: 1000 },
];

const ALRAHUZ_DISCOS = [
  { id: 1, name: 'Ikeja Electric' },
  { id: 2, name: 'Eko Electric' },
  { id: 3, name: 'Abuja Electric' },
  { id: 4, name: 'Kano Electric' },
  { id: 5, name: 'Enugu Electric' },
  { id: 6, name: 'Port Harcourt Electric' },
  { id: 7, name: 'Ibadan Electric' },
  { id: 8, name: 'Kaduna Electric' },
  { id: 9, name: 'Jos Electric' },
  { id: 10, name: 'Benin Electric' },
  { id: 11, name: 'Yola Electric' },
];

function initPriceList() {
  // Tab switching
  document.querySelectorAll('.pricelist-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pricelist-tab').forEach(t => {
        t.classList.remove('bg-green-500', 'text-white');
        t.classList.add('bg-slate-700', 'text-slate-300');
      });
      tab.classList.remove('bg-slate-700', 'text-slate-300');
      tab.classList.add('bg-green-500', 'text-white');

      document.querySelectorAll('.pricelist-content').forEach(c => c.classList.add('hidden'));
      const target = document.getElementById('pricelist-' + tab.dataset.pricelistTab);
      if (target) target.classList.remove('hidden');
    });
  });

  // Network filter for data plans
  const networkFilter = document.getElementById('pricelist-network-filter');
  const typeFilter = document.getElementById('pricelist-type-filter');

  if (networkFilter) {
    networkFilter.addEventListener('change', () => {
      updatePlanTypeFilter();
      renderDataPlansTable();
    });
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', () => renderDataPlansTable());
  }

  // Render all tabs
  renderDataPlansTable();
  renderCablePlansTable();
  renderRechargeCardsTable();
  renderElectricityTable();
}

function updatePlanTypeFilter() {
  const networkFilter = document.getElementById('pricelist-network-filter');
  const typeFilter = document.getElementById('pricelist-type-filter');
  if (!typeFilter) return;

  const selectedNetwork = networkFilter ? networkFilter.value : 'All';

  // Collect all unique plan types
  const types = new Set();
  const networks = selectedNetwork === 'All' ? Object.keys(ALRAHUZ_DATA_PLANS) : [selectedNetwork];
  networks.forEach(net => {
    if (ALRAHUZ_DATA_PLANS[net]) {
      Object.keys(ALRAHUZ_DATA_PLANS[net]).forEach(t => types.add(t));
    }
  });

  const currentType = typeFilter.value;
  typeFilter.innerHTML = '<option value="All">All Plan Types</option>';
  [...types].sort().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    if (t === currentType) opt.selected = true;
    typeFilter.appendChild(opt);
  });
}

function renderDataPlansTable() {
  const tbody = document.getElementById('pricelist-data-tbody');
  if (!tbody) return;

  const networkFilter = document.getElementById('pricelist-network-filter');
  const typeFilter = document.getElementById('pricelist-type-filter');
  const selectedNetwork = networkFilter ? networkFilter.value : 'All';
  const selectedType = typeFilter ? typeFilter.value : 'All';

  const rows = [];
  const networks = selectedNetwork === 'All' ? Object.keys(ALRAHUZ_DATA_PLANS) : [selectedNetwork];

  networks.forEach(net => {
    const networkPlans = ALRAHUZ_DATA_PLANS[net];
    if (!networkPlans) return;
    const planTypes = selectedType === 'All' ? Object.keys(networkPlans) : [selectedType];
    planTypes.forEach(type => {
      const plans = networkPlans[type];
      if (!plans) return;
      plans.forEach(plan => {
        rows.push({ id: plan.id, network: net, type, size: plan.size, validity: plan.validity, price: plan.price });
      });
    });
  });

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-500">No plans found</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td class="text-slate-400 text-sm">${r.id}</td>
      <td class="text-sm font-medium text-white">${r.network}</td>
      <td><span class="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">${r.type}</span></td>
      <td class="text-sm font-semibold text-white">${r.size}</td>
      <td class="text-slate-400 text-sm">${r.validity}</td>
      <td class="text-green-400 font-semibold text-sm">${formatCurrency(r.price)}</td>
    </tr>`).join('');
}

function renderCablePlansTable() {
  const tbody = document.getElementById('pricelist-cable-tbody');
  if (!tbody) return;

  const rows = [];
  Object.entries(ALRAHUZ_CABLE_PLANS).forEach(([provider, plans]) => {
    plans.forEach(plan => {
      rows.push({ id: plan.id, provider, name: plan.name, price: plan.price });
    });
  });

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td class="text-slate-400 text-sm">${r.id}</td>
      <td class="text-sm font-medium text-white">${r.provider}</td>
      <td class="text-slate-300 text-sm">${r.name}</td>
      <td class="text-green-400 font-semibold text-sm">${formatCurrency(r.price)}</td>
    </tr>`).join('');
}

function renderRechargeCardsTable() {
  const tbody = document.getElementById('pricelist-recharge-tbody');
  if (!tbody) return;

  tbody.innerHTML = ALRAHUZ_RECHARGE_CARDS.map(r => `
    <tr>
      <td class="text-slate-400 text-sm">${r.id}</td>
      <td class="text-sm font-medium text-white">${r.network}</td>
      <td class="text-green-400 font-semibold text-sm">${formatCurrency(r.amount)}</td>
    </tr>`).join('');
}

function renderElectricityTable() {
  const tbody = document.getElementById('pricelist-electricity-tbody');
  if (!tbody) return;

  tbody.innerHTML = ALRAHUZ_DISCOS.map(d => `
    <tr>
      <td class="text-slate-400 text-sm">${d.id}</td>
      <td class="text-sm font-medium text-white">${d.name}</td>
    </tr>`).join('');
}
