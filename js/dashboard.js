/**
 * AminchiData - dashboard.js
 * Dashboard page logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if not logged in
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  const user = Auth.getUser();

  // Greet user
  const greetEl = document.getElementById('user-greeting');
  const userNameEl = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar-initial');

  if (greetEl) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    greetEl.textContent = `${greeting}, ${user.name.split(' ')[0]}! 👋`;
  }

  if (userNameEl) userNameEl.textContent = user.name;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();

  // Wallet balance
  updateWalletDisplay();

  // Stats
  loadStats();

  // Recent transactions
  loadRecentTransactions();

  // Animated counters
  initCounters();

  // Sidebar toggle
  initSidebar();

  // Fund Wallet modal
  const fundBtn = document.getElementById('fund-wallet-btn');
  if (fundBtn) {
    fundBtn.addEventListener('click', showFundWalletModal);
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  const logoutBtnMob = document.getElementById('logout-btn-mobile');
  [logoutBtn, logoutBtnMob].forEach(btn => {
    if (btn) btn.addEventListener('click', () => Auth.logout());
  });
});

function updateWalletDisplay() {
  const el = document.getElementById('wallet-balance');
  if (el) el.textContent = formatCurrency(getWalletBalance());
}

function loadStats() {
  const txns = getMockTransactions();

  const totalEl = document.getElementById('stat-total');
  const dataEl  = document.getElementById('stat-data');
  const airtimeEl = document.getElementById('stat-airtime');
  const spentEl = document.getElementById('stat-spent');

  if (totalEl) totalEl.dataset.target = txns.filter(t => t.status === 'Success').length;
  if (dataEl)  dataEl.dataset.target = txns.filter(t => t.type === 'Data' && t.status === 'Success').length;
  if (airtimeEl) airtimeEl.dataset.target = txns.filter(t => t.type === 'Airtime' && t.status === 'Success').length;

  const totalSpent = txns.filter(t => t.status === 'Success').reduce((s, t) => s + t.amount, 0);
  if (spentEl) {
    spentEl.dataset.target = totalSpent;
    spentEl.dataset.prefix = '₦';
  }
}

function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.target || '0', 10);
    const prefix = el.dataset.prefix || '';
    animateCounter(el, target, 1500, prefix, '');
  });
}

function loadRecentTransactions() {
  const tbody = document.getElementById('recent-tx-body');
  if (!tbody) return;

  const txns = getMockTransactions().slice(0, 5);

  if (txns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500">No transactions yet</td></tr>`;
    return;
  }

  tbody.innerHTML = txns.map(tx => `
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

function typeIcon(type) {
  const map = { Data: 'fa-wifi', Airtime: 'fa-mobile-screen', Education: 'fa-graduation-cap', Electricity: 'fa-bolt' };
  return map[type] || 'fa-receipt';
}

function typeColor(type) {
  const map = { Data: 'blue', Airtime: 'orange', Education: 'purple', Electricity: 'yellow' };
  return map[type] || 'slate';
}

function initSidebar() {
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

async function showFundWalletModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box max-w-sm">
      <h3 class="text-xl font-bold mb-1 text-white">Fund Wallet</h3>
      <p class="text-slate-400 text-sm mb-5">Enter the amount you want to add to your wallet.</p>

      <div class="field-wrap mb-4">
        <label class="block text-sm font-medium text-slate-300 mb-1.5">Amount (₦)</label>
        <input id="fund-amount" type="number" min="100" placeholder="e.g. 5000" class="form-input"/>
      </div>

      <div class="flex gap-3 justify-end mt-4">
        <button id="fund-cancel" class="btn-outline px-5 py-2.5 text-sm">Cancel</button>
        <button id="fund-confirm" class="btn-primary px-5 py-2.5 text-sm">Add Funds</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('#fund-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#fund-confirm').addEventListener('click', async () => {
    const amtInput = overlay.querySelector('#fund-amount');
    const amount = parseFloat(amtInput.value);

    if (!amount || amount < 100) {
      Toast.show('Enter a valid amount (minimum ₦100)', 'warning');
      return;
    }

    const btn = overlay.querySelector('#fund-confirm');
    setButtonLoading(btn, true);
    await new Promise(r => setTimeout(r, 1500));

    fundWallet(amount);
    overlay.remove();

    updateWalletDisplay();
    Toast.show(`₦${amount.toLocaleString()} added to your wallet!`, 'success');
  });
}
