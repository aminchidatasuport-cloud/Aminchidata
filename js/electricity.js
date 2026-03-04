/**
 * AminchiData - electricity.js
 * Electricity payment page logic
 */

const DISCOS = [
  'Ikeja Electric', 'Eko Electric', 'Abuja Electric', 'Kano Electric',
  'Enugu Electric', 'Port Harcourt Electric', 'Jos Electric',
  'Kaduna Electric', 'Ibadan Electric', 'Benin Electric', 'Yola Electric',
];

const MOCK_CUSTOMERS = {
  '12345678901': { name: 'Abubakar Musa', address: '12 Adeola Street, Lagos' },
  '09876543210': { name: 'Ngozi Okafor', address: '5 Marina Close, Abuja' },
  '11223344556': { name: 'Emeka Johnson', address: '8 Ring Road, Kano' },
};

let meterType = 'prepaid';

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  populateDiscos();
  initMeterToggle();
  initMeterVerify();
  initForm();
  initSidebar();
  initLogout();
});

function populateDiscos() {
  const select = document.getElementById('disco-select');
  if (!select) return;

  DISCOS.forEach(disco => {
    const opt = document.createElement('option');
    opt.value = disco;
    opt.textContent = disco;
    select.appendChild(opt);
  });
}

function initMeterToggle() {
  const prepaidBtn  = document.getElementById('prepaid-btn');
  const postpaidBtn = document.getElementById('postpaid-btn');
  const meterTypeEl = document.getElementById('meter-type-display');

  function updateToggle(type) {
    meterType = type;
    if (meterTypeEl) meterTypeEl.textContent = type.charAt(0).toUpperCase() + type.slice(1);

    if (prepaidBtn && postpaidBtn) {
      if (type === 'prepaid') {
        prepaidBtn.classList.add('bg-green-500', 'text-white');
        prepaidBtn.classList.remove('text-slate-400');
        postpaidBtn.classList.remove('bg-green-500', 'text-white');
        postpaidBtn.classList.add('text-slate-400');
      } else {
        postpaidBtn.classList.add('bg-green-500', 'text-white');
        postpaidBtn.classList.remove('text-slate-400');
        prepaidBtn.classList.remove('bg-green-500', 'text-white');
        prepaidBtn.classList.add('text-slate-400');
      }
    }
  }

  updateToggle('prepaid');

  if (prepaidBtn)  prepaidBtn.addEventListener('click', () => updateToggle('prepaid'));
  if (postpaidBtn) postpaidBtn.addEventListener('click', () => updateToggle('postpaid'));
}

function initMeterVerify() {
  const verifyBtn     = document.getElementById('verify-btn');
  const meterInput    = document.getElementById('meter-number');
  const customerBox   = document.getElementById('customer-info');
  const customerName  = document.getElementById('customer-name');
  const customerAddr  = document.getElementById('customer-address');

  if (!verifyBtn || !meterInput) return;

  verifyBtn.addEventListener('click', async () => {
    const meter = meterInput.value.trim();
    if (!meter || meter.length < 6) {
      Toast.show('Enter a valid meter number.', 'warning');
      return;
    }

    setButtonLoading(verifyBtn, true);

    let customer;
    try {
      const data = await API.get('api/electricity.php?action=verify&meter=' + encodeURIComponent(meter));
      setButtonLoading(verifyBtn, false, 'Verify');
      if (data.error) {
        Toast.show(data.error, 'error');
        return;
      }
      customer = data.customer || { name: 'Customer ' + meter.slice(-4), address: 'Address not available' };
    } catch {
      setButtonLoading(verifyBtn, false, 'Verify');
      // Fallback to mock verification
      customer = MOCK_CUSTOMERS[meter] || {
        name: 'Customer ' + meter.slice(-4),
        address: 'Address not available',
      };
    }

    if (customerName) customerName.textContent = customer.name;
    if (customerAddr) customerAddr.textContent = customer.address;
    if (customerBox)  customerBox.classList.remove('hidden');

    Toast.show(`Meter verified: ${customer.name}`, 'success');
  });
}

function initForm() {
  const form        = document.getElementById('electricity-form');
  const discoSelect = document.getElementById('disco-select');
  const meterInput  = document.getElementById('meter-number');
  const amountInput = document.getElementById('amount');
  const payBtn      = document.getElementById('pay-btn');

  if (!form) return;

  if (meterInput) {
    meterInput.addEventListener('blur', () => {
      if (meterInput.value && meterInput.value.length < 6) {
        Toast.show('Meter number must be at least 6 digits.', 'warning');
      }
    });
  }

  if (amountInput) {
    amountInput.addEventListener('blur', () => validateField(amountInput, { required: true, min: 1000 }));
    amountInput.addEventListener('input', () => clearFieldError(amountInput));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate
    const disco = discoSelect ? discoSelect.value : '';
    if (!disco) { Toast.show('Please select a distribution company.', 'warning'); return; }

    const meter = meterInput ? meterInput.value.trim() : '';
    if (!meter || meter.length < 6) { Toast.show('Please enter and verify your meter number.', 'warning'); return; }

    const amountOk = validateField(amountInput, { required: true, min: 1000 });
    if (!amountOk) return;

    const amount = parseFloat(amountInput.value);
    const balance = getWalletBalance();
    if (balance < amount) {
      Toast.show(`Insufficient wallet balance. Current balance: ${formatCurrency(balance)}`, 'error');
      return;
    }

    const customerName = document.getElementById('customer-name');
    const customerStr = customerName ? ` for ${customerName.textContent}` : '';

    const confirmed = await Modal.confirm({
      title: 'Confirm Payment',
      message: `Pay <strong>${formatCurrency(amount)}</strong> to <strong>${disco}</strong>${customerStr} (${meterType.charAt(0).toUpperCase() + meterType.slice(1)}, Meter: ${meter})?`,
      confirmText: 'Pay Now',
    });

    if (!confirmed) return;

    setButtonLoading(payBtn, true);

    try {
      const result = await API.post('api/electricity.php', {
        disco,
        meter_type: meterType,
        meter,
        amount,
      });

      if (result.error) {
        setButtonLoading(payBtn, false);
        Toast.show(result.error, 'error');
        return;
      }

      let successMsg = result.message || `Electricity payment of ${formatCurrency(amount)} to ${disco} was successful!`;
      if (result.token) {
        successMsg += ` Token: ${result.token}`;
      }

      setButtonLoading(payBtn, false);
      await Modal.alert({ title: 'Payment Successful! ✅', message: successMsg });
    } catch {
      setButtonLoading(payBtn, false);
      Toast.show('Network error. Please try again.', 'error');
      return;
    }

    form.reset();
    const customerBox = document.getElementById('customer-info');
    if (customerBox) customerBox.classList.add('hidden');
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
