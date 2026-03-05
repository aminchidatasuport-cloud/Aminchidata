/**
 * AminchiData - cable.js
 * Cable TV Subscription page logic (DSTV, GOTV, Startimes)
 */

const CABLE_PLANS = {
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
    { id: 28, name: 'DStv Padi + ExtraView', price: 10400 },
    { id: 27, name: 'DStv Yanga + ExtraView', price: 12000 },
    { id: 26, name: 'DStv Confam + ExtraView', price: 17000 },
    { id: 29, name: 'DStv Compact + Extra View', price: 25000 },
    { id: 31, name: 'DStv Compact Plus + Extra View', price: 36000 },
    { id: 30, name: 'DStv Premium + Extra View', price: 50500 },
    { id: 33, name: 'ExtraView Access', price: 6000 },
  ],
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
  Startimes: [
    { id: 37, name: 'Nova - 1 Week', price: 700 },
    { id: 14, name: 'Nova - 1 Month', price: 2100 },
    { id: 38, name: 'Basic - 1 Week', price: 1400 },
    { id: 12, name: 'Basic - 1 Month', price: 4000 },
    { id: 39, name: 'Smart - 1 Week', price: 1700 },
    { id: 13, name: 'Smart - 1 Month', price: 5100 },
    { id: 40, name: 'Classic - 1 Week', price: 2000 },
    { id: 11, name: 'Classic - 1 Month', price: 6000 },
    { id: 41, name: 'Super - 1 Week', price: 3300 },
    { id: 48, name: 'Super - 1 Month', price: 9000 },
    { id: 15, name: 'Super - 1 Month (₦9800)', price: 9800 },
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
