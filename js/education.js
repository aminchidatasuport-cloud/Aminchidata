/**
 * AminchiData - education.js
 * Education Pins page logic
 */

const EDU_SERVICES = {
  WAEC: { name: 'WAEC', fullName: 'West African Examinations Council', price: 3500, color: 'blue' },
  NECO: { name: 'NECO', fullName: 'National Examinations Council', price: 1000, color: 'purple' },
  NABTEB: { name: 'NABTEB', fullName: 'National Business & Technical Examinations Board', price: 1000, color: 'orange' },
};

let selectedService = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  initServiceCards();
  initForm();
  initSidebar();
  initLogout();
  loadPurchasedPins();
});

function initServiceCards() {
  document.querySelectorAll('[data-service]').forEach(card => {
    card.addEventListener('click', () => selectService(card.dataset.service));
  });
}

function selectService(service) {
  selectedService = service;

  document.querySelectorAll('[data-service]').forEach(c => {
    c.classList.remove('border-green-500', 'bg-green-500/10');
    c.classList.add('border-slate-700');
  });

  const card = document.querySelector(`[data-service="${service}"]`);
  if (card) {
    card.classList.remove('border-slate-700');
    card.classList.add('border-green-500', 'bg-green-500/10');
  }

  // Update form info
  const info = EDU_SERVICES[service];
  const priceEl = document.getElementById('service-price');
  const summaryName = document.getElementById('summary-service');
  const summaryPrice = document.getElementById('summary-price');
  const formSection = document.getElementById('form-section');

  if (priceEl) priceEl.textContent = formatCurrency(info.price) + ' per pin';
  if (summaryName) summaryName.textContent = info.fullName;
  if (summaryPrice) updateTotalPrice();
  if (formSection) formSection.classList.remove('hidden');
}

function updateTotalPrice() {
  if (!selectedService) return;
  const info = EDU_SERVICES[selectedService];
  const qtyInput = document.getElementById('quantity');
  const qty = parseInt(qtyInput ? qtyInput.value : '1', 10) || 1;
  const total = info.price * qty;

  const summaryPrice = document.getElementById('summary-price');
  const totalEl = document.getElementById('total-price');
  if (summaryPrice) summaryPrice.textContent = formatCurrency(total);
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

function initForm() {
  const form = document.getElementById('edu-form');
  if (!form) return;

  const qtyInput = document.getElementById('quantity');
  const buyBtn   = document.getElementById('buy-btn');

  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      clearFieldError(qtyInput);
      updateTotalPrice();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedService) { Toast.show('Please select an examination body.', 'warning'); return; }

    const qtyOk = validateField(qtyInput, { required: true, min: 1, max: 10 });
    if (!qtyOk) return;

    const qty = parseInt(qtyInput.value, 10);
    const info = EDU_SERVICES[selectedService];
    const total = info.price * qty;

    const balance = getWalletBalance();
    if (balance < total) {
      Toast.show(`Insufficient wallet balance. Current balance: ${formatCurrency(balance)}`, 'error');
      return;
    }

    const confirmed = await Modal.confirm({
      title: 'Confirm Purchase',
      message: `Buy <strong>${qty} ${info.name} Result Checker Pin${qty > 1 ? 's' : ''}</strong> for <strong>${formatCurrency(total)}</strong>?`,
      confirmText: 'Buy Now',
    });

    if (!confirmed) return;

    setButtonLoading(buyBtn, true);
    await new Promise(r => setTimeout(r, 2500));

    deductWallet(total);

    // Generate mock pins
    const pins = [];
    for (let i = 0; i < qty; i++) {
      pins.push({
        id: `PIN-${Date.now()}-${i}`,
        service: selectedService,
        pin: generatePin(),
        serial: generateSerial(),
        purchasedAt: new Date().toISOString(),
      });
    }

    // Save pins to store
    const storedPins = Store.get('edu_pins', []);
    Store.set('edu_pins', [...pins, ...storedPins]);

    addTransaction({
      type: 'Education',
      description: `${info.name} Result Checker (×${qty})`,
      amount: total,
      status: 'Success',
      phone: '',
    });

    setButtonLoading(buyBtn, false);

    // Show pins
    showPinsModal(pins, info.name);
    loadPurchasedPins();

    // Reset
    form.reset();
  });
}

function generatePin() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 9000 + 1000)).join('-');
}

function generateSerial() {
  return 'SN' + Math.random().toString(36).substring(2, 12).toUpperCase();
}

function showPinsModal(pins, serviceName) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:520px">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <i class="fa-solid fa-graduation-cap text-green-400"></i>
        </div>
        <h3 class="text-xl font-bold text-white">${serviceName} Pin${pins.length > 1 ? 's' : ''} Ready!</h3>
      </div>
      <p class="text-slate-400 text-sm mb-4">Save your pin${pins.length > 1 ? 's' : ''} securely. They can also be found in your pin history below.</p>
      <div class="space-y-3 mb-5">
        ${pins.map(p => `
          <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-slate-500">Serial Number</span>
              <span class="text-xs text-slate-400 font-mono">${p.serial}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500">PIN</span>
              <span class="font-mono font-bold text-green-400 text-lg tracking-wider">${p.pin}</span>
            </div>
          </div>`).join('')}
      </div>
      <button id="close-pin-modal" class="btn-primary w-full">Done</button>
    </div>`;

  document.body.appendChild(overlay);
  overlay.querySelector('#close-pin-modal').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function loadPurchasedPins() {
  const container = document.getElementById('pins-history');
  if (!container) return;

  const pins = Store.get('edu_pins', []);

  if (pins.length === 0) {
    container.innerHTML = `<p class="text-slate-500 text-sm text-center py-4">No pins purchased yet.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="tx-table">
        <thead><tr>
          <th>Service</th>
          <th>Serial</th>
          <th>PIN</th>
          <th>Date</th>
        </tr></thead>
        <tbody>
          ${pins.slice(0, 10).map(p => `
            <tr>
              <td><span class="badge badge-success">${p.service}</span></td>
              <td class="font-mono text-sm text-slate-400">${p.serial}</td>
              <td class="font-mono font-bold text-green-400 tracking-wider">${p.pin}</td>
              <td class="text-slate-400 text-sm">${formatDateShort(p.purchasedAt)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
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
