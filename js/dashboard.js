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

  // Check for Paystack payment callback
  checkPaymentCallback();

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  const logoutBtnMob = document.getElementById('logout-btn-mobile');
  [logoutBtn, logoutBtnMob].forEach(btn => {
    if (btn) btn.addEventListener('click', () => Auth.logout());
  });
});

async function updateWalletDisplay() {
  const el = document.getElementById('wallet-balance');
  if (!el) return;
  try {
    const data = await API.get('api/wallet.php?action=balance');
    el.textContent = formatCurrency(data.balance);
  } catch {
    el.textContent = formatCurrency(getWalletBalance());
  }
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

async function loadRecentTransactions() {
  const tbody = document.getElementById('recent-tx-body');
  if (!tbody) return;

  let txns;
  try {
    const data = await API.get('api/transactions.php?per_page=5');
    txns = data.transactions || [];
  } catch {
    txns = getMockTransactions().slice(0, 5);
  }

  if (txns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500">No transactions yet</td></tr>`;
    return;
  }

  tbody.innerHTML = txns.map(tx => `
    <tr>
      <td class="text-slate-400 text-sm whitespace-nowrap">${formatDateShort(tx.date || tx.created_at)}</td>
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
    <div class="modal-box max-w-md">
      <h3 class="text-xl font-bold mb-1 text-white">Fund Wallet</h3>
      <p class="text-slate-400 text-sm mb-5">Choose a funding method and enter the amount.</p>

      <!-- Payment Method Selection -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
        <div class="grid grid-cols-2 gap-3" id="payment-methods">
          <button type="button" data-method="paystack" class="payment-method-btn selected flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-green-500 bg-green-500/10 text-white text-sm font-medium transition-all hover:bg-green-500/20">
            <i class="fa-solid fa-credit-card text-green-400 text-lg"></i>
            <span>Card Payment</span>
            <span class="text-xs text-slate-400">Paystack</span>
          </button>
          <button type="button" data-method="bank_transfer" class="payment-method-btn flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-slate-600 bg-slate-800 text-white text-sm font-medium transition-all hover:border-slate-500 hover:bg-slate-700">
            <i class="fa-solid fa-building-columns text-blue-400 text-lg"></i>
            <span>Bank Transfer</span>
            <span class="text-xs text-slate-400">Virtual Account</span>
          </button>
        </div>
      </div>

      <!-- Amount Input (for card payment) -->
      <div id="amount-section">
        <div class="field-wrap mb-4">
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Amount (₦)</label>
          <input id="fund-amount" type="number" min="100" placeholder="e.g. 5000" class="form-input"/>
        </div>
      </div>

      <!-- Bank Transfer Details (hidden by default) -->
      <div id="bank-transfer-section" class="hidden">
        <div class="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
          <p class="text-sm text-slate-300 mb-3">Transfer any amount to the account below. Your wallet will be credited automatically.</p>
          <div id="va-loading" class="text-center py-4">
            <span class="spinner"></span>
            <p class="text-slate-400 text-sm mt-2">Loading account details...</p>
          </div>
          <div id="va-details" class="hidden space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">Bank</span>
              <span class="text-white font-medium text-sm" id="va-bank">—</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">Account Number</span>
              <span class="text-green-400 font-bold text-lg tracking-wide" id="va-number">—</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">Account Name</span>
              <span class="text-white font-medium text-sm" id="va-name">—</span>
            </div>
          </div>
          <div id="va-error" class="hidden text-center py-2">
            <p class="text-red-400 text-sm">Unable to load virtual account. Please try card payment instead.</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 justify-end mt-5">
        <button id="fund-cancel" class="btn-outline px-5 py-2.5 text-sm">Cancel</button>
        <button id="fund-confirm" class="btn-primary px-5 py-2.5 text-sm">Pay with Paystack</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  let selectedMethod = 'paystack';
  const methodBtns      = overlay.querySelectorAll('.payment-method-btn');
  const amountSection   = overlay.querySelector('#amount-section');
  const bankSection     = overlay.querySelector('#bank-transfer-section');
  const confirmBtn      = overlay.querySelector('#fund-confirm');

  // Payment method switching
  methodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      methodBtns.forEach(b => {
        b.classList.remove('selected', 'border-green-500', 'bg-green-500/10');
        b.classList.add('border-slate-600', 'bg-slate-800');
      });
      btn.classList.add('selected', 'border-green-500', 'bg-green-500/10');
      btn.classList.remove('border-slate-600', 'bg-slate-800');

      selectedMethod = btn.dataset.method;

      if (selectedMethod === 'bank_transfer') {
        amountSection.classList.add('hidden');
        bankSection.classList.remove('hidden');
        confirmBtn.classList.add('hidden');
        loadVirtualAccountDetails(overlay);
      } else {
        amountSection.classList.remove('hidden');
        bankSection.classList.add('hidden');
        confirmBtn.classList.remove('hidden');
        confirmBtn.textContent = 'Pay with Paystack';
      }
    });
  });

  overlay.querySelector('#fund-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  confirmBtn.addEventListener('click', async () => {
    if (selectedMethod === 'paystack') {
      await handlePaystackPayment(overlay);
    }
  });
}

/**
 * Load the user's virtual account details for bank transfer funding.
 */
async function loadVirtualAccountDetails(overlay) {
  const loading = overlay.querySelector('#va-loading');
  const details = overlay.querySelector('#va-details');
  const errorEl = overlay.querySelector('#va-error');

  loading.classList.remove('hidden');
  details.classList.add('hidden');
  errorEl.classList.add('hidden');

  try {
    const data = await API.get('api/wallet.php?action=virtual_account');

    if (data.error) {
      loading.classList.add('hidden');
      errorEl.classList.remove('hidden');
      return;
    }

    overlay.querySelector('#va-bank').textContent   = data.bank_name || '—';
    overlay.querySelector('#va-number').textContent = data.account_number || '—';
    overlay.querySelector('#va-name').textContent   = data.account_name || '—';

    loading.classList.add('hidden');
    details.classList.remove('hidden');
  } catch {
    loading.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

/**
 * Handle Paystack card payment for wallet funding.
 */
async function handlePaystackPayment(overlay) {
  const amtInput = overlay.querySelector('#fund-amount');
  const amount = parseFloat(amtInput.value);

  if (!amount || amount < 100) {
    Toast.show('Enter a valid amount (minimum ₦100)', 'warning');
    return;
  }

  const btn = overlay.querySelector('#fund-confirm');
  setButtonLoading(btn, true);

  try {
    // Step 1: Initialize payment on the backend
    const initResult = await API.post('api/wallet.php?action=init_payment', { amount });

    if (initResult.error) {
      setButtonLoading(btn, false);
      // If Paystack is not configured, fall back to direct funding
      if (initResult.error.includes('Unable to initialize')) {
        await handleDirectFunding(overlay, amount);
        return;
      }
      Toast.show(initResult.error, 'error');
      return;
    }

    setButtonLoading(btn, false);

    // Step 2: Open Paystack inline popup if available, otherwise redirect
    if (typeof PaystackPop !== 'undefined' && initResult.access_code) {
      const popup = new PaystackPop();
      popup.openIframe({
        access_code: initResult.access_code,
        onSuccess: async (transaction) => {
          overlay.remove();
          Toast.show('Payment successful! Verifying...', 'info');
          await verifyPaystackPayment(initResult.reference);
        },
        onCancel: () => {
          Toast.show('Payment cancelled.', 'warning');
        },
      });
    } else if (initResult.authorization_url) {
      // Redirect to Paystack checkout page
      window.location.href = initResult.authorization_url;
    } else {
      // Fallback: direct funding if Paystack not available
      await handleDirectFunding(overlay, amount);
    }
  } catch {
    setButtonLoading(btn, false);
    // Fallback to direct funding on network error
    await handleDirectFunding(overlay, amount);
  }
}

/**
 * Verify a Paystack payment after the user completes checkout.
 */
async function verifyPaystackPayment(reference) {
  try {
    const result = await API.post('api/wallet.php?action=verify_payment', { reference });

    if (result.error) {
      Toast.show(result.error, 'error');
      return;
    }

    Toast.show(result.message || 'Wallet funded successfully!', 'success');
    updateWalletDisplay();
  } catch {
    Toast.show('Unable to verify payment. Please check your balance or contact support.', 'warning');
  }
}

/**
 * Direct wallet funding fallback (when payment gateways are not configured).
 */
async function handleDirectFunding(overlay, amount) {
  try {
    const result = await API.post('api/wallet.php?action=fund', { amount });
    if (result.error) {
      Toast.show(result.error, 'error');
      return;
    }
  } catch {
    fundWallet(amount);
  }

  overlay.remove();
  updateWalletDisplay();
  Toast.show(`₦${amount.toLocaleString()} added to your wallet!`, 'success');
}

/**
 * Check URL for Paystack payment callback reference and verify the payment.
 * This runs on page load after the user is redirected back from Paystack checkout.
 */
async function checkPaymentCallback() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('payment_ref') || params.get('reference') || params.get('trxref');

  if (!ref) return;

  // Clean the URL to remove the query params
  const cleanUrl = window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);

  Toast.show('Verifying your payment...', 'info');
  await verifyPaystackPayment(ref);
}
