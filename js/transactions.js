/**
 * AminchiData - transactions.js
 * Transaction History page logic
 */

const PAGE_SIZE = 8;
let currentPage = 1;
let currentFilter = 'All';
let filteredTxns = [];
let totalFilteredCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  initFilters();
  loadTransactions();
  initSidebar();
  initLogout();
});

function initFilters() {
  const filters = document.querySelectorAll('[data-filter]');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => {
        b.classList.remove('bg-green-500', 'text-white');
        b.classList.add('text-slate-400', 'hover:text-white');
      });
      btn.classList.add('bg-green-500', 'text-white');
      btn.classList.remove('text-slate-400', 'hover:text-white');

      currentFilter = btn.dataset.filter;
      currentPage = 1;
      loadTransactions();
    });
  });
}

async function loadTransactions() {
  try {
    const data = await API.get(`api/transactions.php?type=${currentFilter}&page=${currentPage}&per_page=${PAGE_SIZE}`);
    filteredTxns = data.transactions || [];
    totalFilteredCount = data.total || filteredTxns.length;
    renderTable();
    renderPagination(data.total_pages || 1, data.total || 0);
    updateStats(data.stats || {});
  } catch {
    // Fallback to localStorage
    const allTxns = getMockTransactions();
    filteredTxns = currentFilter === 'All' ? allTxns : allTxns.filter(tx => tx.type === currentFilter);
    totalFilteredCount = filteredTxns.length;
    renderTable();
    renderPagination();
    updateStats(allTxns);
  }
}

function renderTable() {
  const tbody = document.getElementById('tx-table-body');
  const emptyEl = document.getElementById('tx-empty');

  if (!tbody) return;

  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filteredTxns.slice(start, start + PAGE_SIZE);

  if (paginated.length === 0) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');

  tbody.innerHTML = paginated.map(tx => `
    <tr>
      <td class="text-slate-400 text-sm whitespace-nowrap">${formatDate(tx.date || tx.created_at)}</td>
      <td>
        <span class="inline-flex items-center gap-1.5">
          <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs ${typeColorClass(tx.type)}">
            <i class="fa-solid ${typeIcon(tx.type)}"></i>
          </span>
          <span class="font-medium text-sm">${tx.type}</span>
        </span>
      </td>
      <td class="text-slate-300 text-sm hidden sm:table-cell">${tx.description}</td>
      <td class="font-semibold text-sm whitespace-nowrap">${formatCurrency(tx.amount)}</td>
      <td><span class="badge badge-${tx.status.toLowerCase()}">${tx.status}</span></td>
      <td class="text-slate-500 text-xs hidden md:table-cell font-mono">${tx.id}</td>
    </tr>`).join('');
}

function renderPagination(totalPages, totalCount) {
  const container = document.getElementById('pagination');
  if (!container) return;

  if (totalPages === undefined) {
    totalPages = Math.ceil(filteredTxns.length / PAGE_SIZE);
  }
  if (totalCount === undefined) {
    totalCount = filteredTxns.length;
  }

  const countEl = document.getElementById('tx-count');
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalCount);

  if (countEl) {
    countEl.textContent = totalCount === 0
      ? 'No results'
      : `Showing ${start}–${end} of ${totalCount}`;
  }

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
      <button class="pagination-btn w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === currentPage
        ? 'bg-green-500 text-white'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}" data-page="${page}">
        ${page}
      </button>`);
  });

  const prevDisabled = currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-700';
  const nextDisabled = currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-700';

  container.innerHTML = `
    <div class="flex items-center gap-1.5 flex-wrap">
      <button class="pagination-btn w-9 h-9 rounded-lg bg-slate-800 text-slate-300 text-sm ${prevDisabled}" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-left text-xs"></i>
      </button>
      ${pages.join('')}
      <button class="pagination-btn w-9 h-9 rounded-lg bg-slate-800 text-slate-300 text-sm ${nextDisabled}" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>
    </div>`;

  container.querySelectorAll('.pagination-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page, 10);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        renderTable();
        renderPagination();
        document.getElementById('tx-table-body').closest('section, div').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function updateStats(data) {
  // Support both object format from API and array format from fallback
  let totalCount, successCount, totalSpent;
  if (Array.isArray(data)) {
    const txns = data;
    const successTxns = txns.filter(t => t.status === 'Success');
    totalCount = txns.length;
    successCount = successTxns.length;
    totalSpent = successTxns.reduce((s, t) => s + t.amount, 0);
  } else {
    totalCount = data.total || 0;
    successCount = data.success_count || data.success || 0;
    totalSpent = data.total_spent || 0;
  }

  const totalEl   = document.getElementById('stat-total');
  const successEl = document.getElementById('stat-success');
  const spentEl   = document.getElementById('stat-spent');

  if (totalEl)   totalEl.textContent   = totalCount;
  if (successEl) successEl.textContent = successCount;
  if (spentEl)   spentEl.textContent   = formatCurrency(totalSpent);
}

function typeIcon(type) {
  const map = { Data: 'fa-wifi', Airtime: 'fa-mobile-screen', Education: 'fa-graduation-cap', Electricity: 'fa-bolt' };
  return map[type] || 'fa-receipt';
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
