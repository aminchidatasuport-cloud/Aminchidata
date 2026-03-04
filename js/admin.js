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
      const titles = { dashboard: 'Dashboard', users: 'User Management', transactions: 'Transactions', settings: 'Settings' };
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
      <td class="text-slate-300 text-sm">${formatCurrency(getWalletBalance())}</td>
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
        <p class="text-green-400 font-semibold">${formatCurrency(getWalletBalance())}</p>
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

    if (action === 'add') {
      fundWallet(amount);
      Toast.show(`₦${amount.toLocaleString()} added to ${user.name}'s wallet`, 'success');
    } else {
      const balance = getWalletBalance();
      if (amount > balance) {
        Toast.show('Insufficient wallet balance for deduction', 'error');
        setButtonLoading(btn, false);
        return;
      }
      deductWallet(amount);
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
