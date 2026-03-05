/**
 * AminchiData - cable.js
 * Cable TV Subscription page logic (DSTV, GOTV, Startimes)
 */

const CABLE_PLANS = {
  DSTV: [
    { id: 1, name: 'DStv Padi', price: 2500 },
    { id: 2, name: 'DStv Yanga', price: 3500 },
    { id: 3, name: 'DStv Confam', price: 6200 },
    { id: 4, name: 'DStv Compact', price: 10500 },
    { id: 5, name: 'DStv Compact Plus', price: 16600 },
    { id: 6, name: 'DStv Premium', price: 29500 },
    { id: 7, name: 'DStv Asia', price: 7100 },
  ],
  GOTV: [
    { id: 20, name: 'GOtv Smallie', price: 1300 },
    { id: 21, name: 'GOtv Jinja', price: 2700 },
    { id: 22, name: 'GOtv Jolli', price: 4050 },
    { id: 23, name: 'GOtv Max', price: 5700 },
    { id: 24, name: 'GOtv Supa', price: 7600 },
  ],
  Startimes: [
    { id: 40, name: 'Nova (Antenna)', price: 1200 },
    { id: 41, name: 'Basic (Antenna)', price: 2100 },
    { id: 42, name: 'Smart (Antenna)', price: 2800 },
    { id: 43, name: 'Classic (Antenna)', price: 3000 },
    { id: 44, name: 'Super (Antenna)', price: 5500 },
  ],
};

let selectedProvider = null;
let selectedPlan = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  initProviderButtons();
  initVerify();
  initForm();
  initSidebar();
  initLogout();
  updateSummary();
});

function initProviderButtons() {
  document.querySelectorAll('[data-provider]').forEach(btn => {
    btn.addEventListener('click', () => selectProvider(btn.dataset.provider));
  });
}

function selectProvider(provider) {
  selectedProvider = provider;
  selectedPlan = null;

  document.querySelectorAll('[data-provider]').forEach(b => b.classList.remove('selected'));
  const btn = document.querySelector(`[data-provider="${provider}"]`);
  if (btn) btn.classList.add('selected');

  renderPlans(provider);
  updateSummary();
}

function renderPlans(provider) {
  const container = document.getElementById('plans-container');
  const section = document.getElementById('plans-section');
  if (!container) return;

  const plans = CABLE_PLANS[provider] || [];

  container.innerHTML = plans.map(plan => `
    <div class="plan-card cursor-pointer" data-plan-id="${plan.id}" data-price="${plan.price}" data-name="${plan.name}">
      <div class="text-sm font-bold text-white">${plan.name}</div>
      <div class="text-green-400 font-bold mt-1 text-sm">${formatCurrency(plan.price)}</div>
    </div>`).join('');

  if (section) section.classList.remove('hidden');

  container.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPlan = {
        id: parseInt(card.dataset.planId, 10),
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
      };
      updateSummary();
    });
  });
}

function updateSummary() {
  const providerEl = document.getElementById('summary-provider');
  const planEl     = document.getElementById('summary-plan');
  const amountEl   = document.getElementById('summary-amount');
  const summarySection = document.getElementById('summary-section');
  const buyBtn     = document.getElementById('buy-btn');

  if (providerEl) providerEl.textContent = selectedProvider || '—';
  if (planEl)     planEl.textContent     = selectedPlan ? selectedPlan.name : '—';
  if (amountEl)   amountEl.textContent   = selectedPlan ? formatCurrency(selectedPlan.price) : '₦0.00';
  if (summarySection) {
    if (selectedProvider && selectedPlan) {
      summarySection.classList.remove('hidden');
    } else {
      summarySection.classList.add('hidden');
    }
  }
  if (buyBtn) buyBtn.disabled = !(selectedProvider && selectedPlan);
}

function initVerify() {
  const verifyBtn    = document.getElementById('verify-btn');
  const iucInput     = document.getElementById('iuc-number');
  const customerBox  = document.getElementById('customer-info');
  const customerName = document.getElementById('customer-name');
  const customerStat = document.getElementById('customer-status');

  if (!verifyBtn || !iucInput) return;

  verifyBtn.addEventListener('click', async () => {
    const iuc = iucInput.value.trim();
    if (!iuc || iuc.length < 8) {
      Toast.show('Enter a valid IUC / smartcard number (at least 8 digits).', 'warning');
      return;
    }
    if (!selectedProvider) {
      Toast.show('Please select a cable provider first.', 'warning');
      return;
    }

    setButtonLoading(verifyBtn, true);

    try {
      const data = await API.get(
        'api/cable.php?action=validate&iuc=' + encodeURIComponent(iuc) +
        '&provider=' + encodeURIComponent(selectedProvider)
      );
      setButtonLoading(verifyBtn, false, 'Verify');

      if (data.error) {
        Toast.show(data.error, 'error');
        return;
      }

      const customer = data.customer || { name: 'Customer ' + iuc.slice(-4) };
      if (customerName) customerName.textContent = customer.name;
      if (customerStat) customerStat.textContent = customer.status ? ('Status: ' + customer.status) : '';
      if (customerBox) customerBox.classList.remove('hidden');

      Toast.show('Decoder verified: ' + customer.name, 'success');
    } catch {
      setButtonLoading(verifyBtn, false, 'Verify');
      Toast.show('Could not verify decoder. Please try again.', 'error');
    }
  });
}

function initForm() {
  const form    = document.getElementById('cable-form');
  const iucInput = document.getElementById('iuc-number');
  const buyBtn  = document.getElementById('buy-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedProvider) { Toast.show('Please select a cable provider.', 'warning'); return; }
    if (!selectedPlan)     { Toast.show('Please select a cable plan.', 'warning'); return; }

    const iuc = iucInput ? iucInput.value.trim() : '';
    if (!iuc || iuc.length < 8) {
      Toast.show('Enter a valid IUC / smartcard number.', 'warning');
      return;
    }

    const balance = getWalletBalance();
    if (balance < selectedPlan.price) {
      Toast.show('Insufficient wallet balance. Current balance: ' + formatCurrency(balance), 'error');
      return;
    }

    const confirmed = await Modal.confirm({
      title: 'Confirm Subscription',
      message: 'Subscribe to <strong>' + selectedPlan.name + '</strong> on <strong>' + selectedProvider + '</strong> for decoder <strong>' + iuc + '</strong> at <strong>' + formatCurrency(selectedPlan.price) + '</strong>?',
      confirmText: 'Subscribe Now',
    });

    if (!confirmed) return;

    setButtonLoading(buyBtn, true);

    try {
      const result = await API.post('api/cable.php', {
        provider: selectedProvider,
        iuc: iuc,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        price: selectedPlan.price,
      });

      if (result.error) {
        setButtonLoading(buyBtn, false);
        Toast.show(result.error, 'error');
        return;
      }

      setButtonLoading(buyBtn, false);
      Toast.show(result.message || selectedProvider + ' ' + selectedPlan.name + ' subscription was successful!', 'success');
    } catch {
      setButtonLoading(buyBtn, false);
      Toast.show('Network error. Please try again.', 'error');
      return;
    }

    // Reset
    form.reset();
    selectedPlan = null;
    selectedProvider = null;
    document.querySelectorAll('[data-provider]').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
    const plansSection = document.getElementById('plans-section');
    if (plansSection) plansSection.classList.add('hidden');
    const customerBox = document.getElementById('customer-info');
    if (customerBox) customerBox.classList.add('hidden');
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
