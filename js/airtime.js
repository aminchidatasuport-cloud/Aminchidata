/**
 * AminchiData - airtime.js
 * Buy Airtime page logic
 */

const AIRTIME_DISCOUNT = { MTN: 2, Airtel: 2, Glo: 2, '9mobile': 2 };
const NETWORK_PREFIXES = {
  MTN:      ['0703','0706','0803','0806','0810','0813','0814','0816','0903','0906','0913'],
  Airtel:   ['0701','0708','0802','0808','0812','0901','0902','0904','0907','0912'],
  Glo:      ['0705','0805','0807','0811','0815','0905'],
  '9mobile':['0809','0817','0818','0908','0909'],
};

let selectedAirtimeNetwork = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  initNetworkButtons();
  initForm();
  initSidebar();
  initLogout();
});

function initNetworkButtons() {
  document.querySelectorAll('[data-network]').forEach(btn => {
    btn.addEventListener('click', () => selectNetwork(btn.dataset.network));
  });
}

function selectNetwork(network) {
  selectedAirtimeNetwork = network;
  document.querySelectorAll('[data-network]').forEach(b => b.classList.remove('selected'));
  const btn = document.querySelector(`[data-network="${network}"]`);
  if (btn) btn.classList.add('selected');

  updateDiscount(network);
}

function detectNetworkFromPhone(phone) {
  const prefix = phone.substring(0, 4);
  for (const [net, prefixes] of Object.entries(NETWORK_PREFIXES)) {
    if (prefixes.includes(prefix)) return net;
  }
  return null;
}

function updateDiscount(network) {
  const discountEl = document.getElementById('discount-info');
  if (!discountEl) return;

  const discount = AIRTIME_DISCOUNT[network] || 0;
  if (discount > 0) {
    discountEl.textContent = `🎉 You get ${discount}% discount on ${network} airtime!`;
    discountEl.classList.remove('hidden');
  } else {
    discountEl.classList.add('hidden');
  }
}

function initForm() {
  const form       = document.getElementById('airtime-form');
  const phoneInput = document.getElementById('phone-number');
  const amountInput = document.getElementById('amount');
  const buyBtn     = document.getElementById('buy-btn');
  const netDetectEl = document.getElementById('detected-network');

  if (!form) return;

  // Auto-detect network from phone
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      clearFieldError(phoneInput);
      const val = phoneInput.value.trim();
      if (val.length >= 4) {
        const detected = detectNetworkFromPhone(val);
        if (detected && netDetectEl) {
          netDetectEl.textContent = `Detected: ${detected}`;
          netDetectEl.classList.remove('hidden');
          // Auto-select network if none selected
          if (!selectedAirtimeNetwork) {
            selectNetwork(detected);
          }
        } else if (netDetectEl) {
          netDetectEl.classList.add('hidden');
        }
      } else if (netDetectEl) {
        netDetectEl.classList.add('hidden');
      }
    });

    phoneInput.addEventListener('blur', () => validateField(phoneInput, { required: true, phone: true }));
  }

  if (amountInput) {
    amountInput.addEventListener('blur', () =>
      validateField(amountInput, { required: true, min: 50, max: 50000 }));
    amountInput.addEventListener('input', () => clearFieldError(amountInput));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedAirtimeNetwork) { Toast.show('Please select a network.', 'warning'); return; }

    const phoneOk  = validateField(phoneInput, { required: true, phone: true });
    const amountOk = validateField(amountInput, { required: true, min: 50, max: 50000 });
    if (!phoneOk || !amountOk) return;

    const amount = parseFloat(amountInput.value);
    const discount = AIRTIME_DISCOUNT[selectedAirtimeNetwork] || 0;
    const discountAmount = (discount / 100) * amount;
    const finalAmount = amount - discountAmount;

    const balance = getWalletBalance();
    if (balance < amount) {
      Toast.show(`Insufficient wallet balance. Current balance: ${formatCurrency(balance)}`, 'error');
      return;
    }

    const confirmed = await Modal.confirm({
      title: 'Confirm Purchase',
      message: `Buy <strong>${formatCurrency(amount)}</strong> ${selectedAirtimeNetwork} airtime for <strong>${phoneInput.value}</strong>?${discount > 0 ? `<br><small class="text-green-400">You save ${formatCurrency(discountAmount)} (${discount}% discount)</small>` : ''}`,
      confirmText: 'Buy Now',
    });

    if (!confirmed) return;

    setButtonLoading(buyBtn, true);
    await new Promise(r => setTimeout(r, 2000));

    deductWallet(amount);
    addTransaction({
      type: 'Airtime',
      description: `${selectedAirtimeNetwork} Airtime`,
      amount,
      status: 'Success',
      phone: phoneInput.value,
    });

    setButtonLoading(buyBtn, false);
    Toast.show(`${formatCurrency(amount)} ${selectedAirtimeNetwork} airtime sent to ${phoneInput.value} successfully!`, 'success');

    // Reset
    form.reset();
    selectedAirtimeNetwork = null;
    document.querySelectorAll('[data-network]').forEach(b => b.classList.remove('selected'));
    const discountEl = document.getElementById('discount-info');
    if (discountEl) discountEl.classList.add('hidden');
    if (netDetectEl) netDetectEl.classList.add('hidden');
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
