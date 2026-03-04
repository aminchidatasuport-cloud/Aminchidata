/**
 * AminchiData - fund-account.js
 * Fund Account page logic – displays the user's virtual account details
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }

  const user = Auth.getUser();
  const avatarEl = document.getElementById('user-avatar-initial');
  if (avatarEl && user) avatarEl.textContent = user.name.charAt(0).toUpperCase();

  // Sidebar toggle
  initSidebar();

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  const logoutBtnMob = document.getElementById('logout-btn-mobile');
  [logoutBtn, logoutBtnMob].forEach(btn => {
    if (btn) btn.addEventListener('click', () => Auth.logout());
  });

  // Load virtual account
  loadVirtualAccount();

  // Retry button
  const retryBtn = document.getElementById('va-retry-btn');
  if (retryBtn) retryBtn.addEventListener('click', loadVirtualAccount);
});

async function loadVirtualAccount() {
  const loadingEl = document.getElementById('va-loading');
  const detailsEl = document.getElementById('va-details');
  const errorEl   = document.getElementById('va-error');

  // Show loading, hide others
  if (loadingEl) loadingEl.classList.remove('hidden');
  if (detailsEl) detailsEl.classList.add('hidden');
  if (errorEl)   errorEl.classList.add('hidden');

  try {
    const data = await API.get('api/wallet.php?action=virtual_account');

    if (data.error) {
      throw new Error(data.error);
    }

    // Populate details
    const bankNameEl   = document.getElementById('va-bank-name');
    const acctNumberEl = document.getElementById('va-account-number');
    const acctNameEl   = document.getElementById('va-account-name');

    if (bankNameEl)   bankNameEl.textContent   = data.bank_name || 'PalmPay';
    if (acctNumberEl) acctNumberEl.textContent = data.account_number || '—';
    if (acctNameEl)   acctNameEl.textContent   = data.account_name || '—';

    // Show details, hide loading
    if (loadingEl) loadingEl.classList.add('hidden');
    if (detailsEl) detailsEl.classList.remove('hidden');

    // Copy button
    const copyBtn = document.getElementById('copy-account-btn');
    if (copyBtn && data.account_number) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(data.account_number).then(() => {
          Toast.show('Account number copied!', 'success');
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
          }, 2000);
        }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = data.account_number;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          Toast.show('Account number copied!', 'success');
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
          }, 2000);
        });
      });
    }
  } catch {
    // Show error state
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl)   errorEl.classList.remove('hidden');
  }
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
