/**
 * AminchiData - data.js
 * Buy Data page logic
 */

const DATA_PLANS = {
  MTN: [
    { id: 'mtn-500mb', name: '500MB', validity: '1 Day', price: 150 },
    { id: 'mtn-1gb',   name: '1GB',   validity: '30 Days', price: 260 },
    { id: 'mtn-2gb',   name: '2GB',   validity: '30 Days', price: 520 },
    { id: 'mtn-3gb',   name: '3GB',   validity: '30 Days', price: 780 },
    { id: 'mtn-5gb',   name: '5GB',   validity: '30 Days', price: 1300 },
  ],
  Airtel: [
    { id: 'airt-500mb', name: '500MB', validity: '1 Day', price: 150 },
    { id: 'airt-1gb',   name: '1GB',   validity: '30 Days', price: 260 },
    { id: 'airt-2gb',   name: '2GB',   validity: '30 Days', price: 520 },
    { id: 'airt-3gb',   name: '3GB',   validity: '30 Days', price: 780 },
    { id: 'airt-5gb',   name: '5GB',   validity: '30 Days', price: 1300 },
  ],
  Glo: [
    { id: 'glo-500mb', name: '500MB', validity: '1 Day', price: 130 },
    { id: 'glo-1gb',   name: '1GB',   validity: '30 Days', price: 240 },
    { id: 'glo-2gb',   name: '2GB',   validity: '30 Days', price: 480 },
    { id: 'glo-3gb',   name: '3GB',   validity: '30 Days', price: 720 },
    { id: 'glo-5gb',   name: '5GB',   validity: '30 Days', price: 1200 },
  ],
  '9mobile': [
    { id: '9mob-500mb', name: '500MB', validity: '1 Day', price: 150 },
    { id: '9mob-1gb',   name: '1GB',   validity: '30 Days', price: 260 },
    { id: '9mob-2gb',   name: '2GB',   validity: '30 Days', price: 520 },
  ],
};

const NETWORK_COLORS = {
  MTN: '#fbbf24',
  Airtel: '#ef4444',
  Glo: '#22c55e',
  '9mobile': '#10b981',
};

let selectedNetwork = null;
let selectedPlan = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.php'; return; }

  initNetworkButtons();
  initForm();
  updateSummary();
  initSidebar();
  initLogout();
});

function initNetworkButtons() {
  const container = document.getElementById('network-buttons');
  if (!container) return;

  Object.keys(DATA_PLANS).forEach(network => {
    const btn = container.querySelector(`[data-network="${network}"]`);
    if (btn) {
      btn.addEventListener('click', () => selectNetwork(network));
    }
  });
}

function selectNetwork(network) {
  selectedNetwork = network;
  selectedPlan = null;

  // Update button styles
  document.querySelectorAll('[data-network]').forEach(btn => {
    btn.classList.remove('selected');
  });
  const btn = document.querySelector(`[data-network="${network}"]`);
  if (btn) btn.classList.add('selected');

  // Render plan cards
  renderPlans(network);
  updateSummary();
}

function renderPlans(network) {
  const container = document.getElementById('plans-container');
  const plansSection = document.getElementById('plans-section');
  if (!container) return;

  const plans = DATA_PLANS[network] || [];

  container.innerHTML = plans.map(plan => `
    <div class="plan-card" data-plan-id="${plan.id}" data-price="${plan.price}" data-name="${plan.name}">
      <div class="text-lg font-bold text-white">${plan.name}</div>
      <div class="text-xs text-slate-400 mt-0.5">${plan.validity}</div>
      <div class="text-green-400 font-bold mt-2 text-sm">${formatCurrency(plan.price)}</div>
    </div>`).join('');

  if (plansSection) plansSection.classList.remove('hidden');

  container.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPlan = {
        id: card.dataset.planId,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
      };
      updateSummary();
    });
  });
}

function updateSummary() {
  const networkEl = document.getElementById('summary-network');
  const planEl    = document.getElementById('summary-plan');
  const amountEl  = document.getElementById('summary-amount');
  const buyBtn    = document.getElementById('buy-btn');

  if (networkEl) networkEl.textContent = selectedNetwork || '—';
  if (planEl)    planEl.textContent    = selectedPlan ? selectedPlan.name : '—';
  if (amountEl)  amountEl.textContent  = selectedPlan ? formatCurrency(selectedPlan.price) : '₦0.00';
  if (buyBtn)    buyBtn.disabled       = !(selectedNetwork && selectedPlan);
}

function initForm() {
  const form = document.getElementById('data-form');
  if (!form) return;

  const phoneInput = document.getElementById('phone-number');
  const buyBtn     = document.getElementById('buy-btn');

  if (phoneInput) {
    phoneInput.addEventListener('blur', () => validateField(phoneInput, { required: true, phone: true }));
    phoneInput.addEventListener('input', clearFieldError.bind(null, phoneInput));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedNetwork) { Toast.show('Please select a network.', 'warning'); return; }
    if (!selectedPlan)    { Toast.show('Please select a data plan.', 'warning'); return; }

    const phoneOk = validateField(phoneInput, { required: true, phone: true });
    if (!phoneOk) return;

    const balance = getWalletBalance();
    if (balance < selectedPlan.price) {
      Toast.show(`Insufficient wallet balance. Current balance: ${formatCurrency(balance)}`, 'error');
      return;
    }

    const confirmed = await Modal.confirm({
      title: 'Confirm Purchase',
      message: `Buy <strong>${selectedPlan.name}</strong> data for <strong>${phoneInput.value}</strong> on <strong>${selectedNetwork}</strong> for <strong>${formatCurrency(selectedPlan.price)}</strong>?`,
      confirmText: 'Buy Now',
    });

    if (!confirmed) return;

    setButtonLoading(buyBtn, true);

    try {
      const result = await API.post('api/data.php', {
        network: selectedNetwork,
        plan_name: selectedPlan.name,
        price: selectedPlan.price,
        phone: phoneInput.value,
      });

      if (result.error) {
        setButtonLoading(buyBtn, false);
        Toast.show(result.error, 'error');
        return;
      }

      setButtonLoading(buyBtn, false);
      Toast.show(result.message || `${selectedNetwork} ${selectedPlan.name} data sent to ${phoneInput.value} successfully!`, 'success');
    } catch {
      setButtonLoading(buyBtn, false);
      Toast.show('Network error. Please try again.', 'error');
      return;
    }

    // Reset form
    form.reset();
    selectedPlan = null;
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('[data-network]').forEach(b => b.classList.remove('selected'));
    selectedNetwork = null;
    const plansSection = document.getElementById('plans-section');
    if (plansSection) plansSection.classList.add('hidden');
    updateSummary();
  });
}

function initSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');

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

function initLogout() {
  const btn = document.getElementById('logout-btn');
  const mob = document.getElementById('logout-btn-mobile');
  [btn, mob].forEach(b => { if (b) b.addEventListener('click', () => Auth.logout()); });
}
