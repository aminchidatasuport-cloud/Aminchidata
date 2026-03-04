<?php require_once __DIR__ . '/includes/auth.php'; requireLogin(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Profile – AminchiData</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="bg-slate-900 text-slate-100">

  <div id="sidebar-overlay" class="hidden fixed inset-0 bg-black/50 z-10 lg:hidden sidebar-overlay"></div>

  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside id="sidebar" class="sidebar flex flex-col z-20">
      <div class="p-5 border-b border-slate-700">
        <a href="index.php" class="flex items-center gap-2">
          <div class="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
            <i class="fa-solid fa-bolt text-white"></i>
          </div>
          <span class="text-xl font-extrabold"><span class="text-white">Aminchi</span><span class="text-green-400">Data</span></span>
        </a>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <a href="dashboard.php" class="sidebar-link"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
        <a href="fund-account.php" class="sidebar-link"><i class="fa-solid fa-building-columns"></i> Fund Account</a>
        <a href="data.php" class="sidebar-link"><i class="fa-solid fa-wifi"></i> Buy Data</a>
        <a href="airtime.php" class="sidebar-link"><i class="fa-solid fa-mobile-screen"></i> Buy Airtime</a>
        <a href="education.php" class="sidebar-link"><i class="fa-solid fa-graduation-cap"></i> Education</a>
        <a href="electricity.php" class="sidebar-link"><i class="fa-solid fa-bolt"></i> Electricity</a>
        <a href="transactions.php" class="sidebar-link"><i class="fa-solid fa-clock-rotate-left"></i> Transactions</a>
        <a href="profile.php" class="sidebar-link active"><i class="fa-solid fa-user-gear"></i> Profile</a>
      </nav>
      <div class="p-4 border-t border-slate-700">
        <button id="logout-btn" class="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-400">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-slate-800/70 border-b border-slate-700 px-4 sm:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-10">
        <button id="sidebar-toggle" class="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700">
          <i class="fa-solid fa-bars text-lg"></i>
        </button>
        <h1 class="font-semibold text-white text-lg">Profile &amp; Settings</h1>
        <div class="ml-auto flex items-center gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm" id="user-avatar-initial">U</div>
          <button id="logout-btn-mobile" class="text-sm text-slate-400 hover:text-red-400 p-1.5">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div class="max-w-3xl mx-auto space-y-6">

          <!-- Profile Card -->
          <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div class="flex items-center gap-5 mb-6">
              <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-extrabold text-2xl" id="profile-avatar">U</div>
              <div>
                <h2 id="profile-name" class="text-xl font-bold text-white">—</h2>
                <p id="profile-email" class="text-slate-400 text-sm mt-0.5">—</p>
                <p id="profile-phone" class="text-slate-500 text-xs mt-0.5">—</p>
              </div>
            </div>

            <h3 class="font-semibold text-white mb-4 pb-2 border-b border-slate-700">Personal Information</h3>
            <form id="profile-form" novalidate class="space-y-4">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="field-wrap">
                  <label class="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input id="edit-name" type="text" class="form-input" placeholder="Full Name" />
                </div>
                <div class="field-wrap">
                  <label class="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                  <input id="edit-phone" type="tel" class="form-input" placeholder="08012345678" maxlength="11" />
                </div>
              </div>
              <div class="field-wrap">
                <label class="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <input id="edit-email" type="email" class="form-input" placeholder="your@email.com" />
              </div>
              <button id="save-profile-btn" type="submit" class="btn-primary px-6 py-2.5 text-sm">
                <i class="fa-solid fa-floppy-disk mr-1.5"></i>Save Changes
              </button>
            </form>
          </div>

          <!-- Change Password -->
          <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 class="font-semibold text-white mb-4 pb-2 border-b border-slate-700">Change Password</h3>
            <form id="password-form" novalidate class="space-y-4">
              <div class="field-wrap">
                <label class="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
                <div class="relative">
                  <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                  <input id="current-password" type="password" class="form-input pl-10" placeholder="Current password" />
                </div>
              </div>
              <div class="field-wrap">
                <label class="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                <div class="relative">
                  <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                  <input id="new-password" type="password" class="form-input pl-10" placeholder="New password (min 8 chars)" />
                </div>
              </div>
              <div class="field-wrap">
                <label class="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                <div class="relative">
                  <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                  <input id="confirm-new-password" type="password" class="form-input pl-10" placeholder="Repeat new password" />
                </div>
              </div>
              <button id="change-pass-btn" type="submit" class="btn-primary px-6 py-2.5 text-sm">
                <i class="fa-solid fa-key mr-1.5"></i>Change Password
              </button>
            </form>
          </div>

          <!-- Notification Preferences -->
          <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 class="font-semibold text-white mb-4 pb-2 border-b border-slate-700">Notification Preferences</h3>
            <div class="space-y-4">
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <div class="text-sm font-medium text-white">Transaction Alerts</div>
                  <div class="text-xs text-slate-500">Get notified on every transaction</div>
                </div>
                <input type="checkbox" id="notif-transactions" class="w-5 h-5 accent-green-500" checked />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <div class="text-sm font-medium text-white">Promotional Offers</div>
                  <div class="text-xs text-slate-500">Receive news about discounts and offers</div>
                </div>
                <input type="checkbox" id="notif-promo" class="w-5 h-5 accent-green-500" />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <div class="text-sm font-medium text-white">Weekly Summary</div>
                  <div class="text-xs text-slate-500">Weekly spending report via email</div>
                </div>
                <input type="checkbox" id="notif-weekly" class="w-5 h-5 accent-green-500" checked />
              </label>
            </div>
            <button id="save-notif-btn" class="btn-outline px-6 py-2.5 text-sm mt-5">Save Preferences</button>
          </div>

          <!-- Bank Account -->
          <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 class="font-semibold text-white mb-4 pb-2 border-b border-slate-700">Bank Account (Withdrawals)</h3>
            <form id="bank-form" novalidate class="space-y-4">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="field-wrap">
                  <label class="block text-sm font-medium text-slate-300 mb-1.5">Bank Name</label>
                  <select id="bank-name" class="form-input appearance-none cursor-pointer">
                    <option value="">— Select Bank —</option>
                    <option>Access Bank</option>
                    <option>First Bank</option>
                    <option>Guaranty Trust Bank</option>
                    <option>Zenith Bank</option>
                    <option>United Bank for Africa</option>
                    <option>Fidelity Bank</option>
                    <option>Stanbic IBTC</option>
                    <option>Polaris Bank</option>
                    <option>Opay</option>
                    <option>Moniepoint</option>
                    <option>Kuda Bank</option>
                    <option>PalmPay</option>
                  </select>
                </div>
                <div class="field-wrap">
                  <label class="block text-sm font-medium text-slate-300 mb-1.5">Account Number</label>
                  <input id="account-number" type="text" class="form-input" placeholder="0123456789" maxlength="10" />
                </div>
              </div>
              <div class="field-wrap">
                <label class="block text-sm font-medium text-slate-300 mb-1.5">Account Name</label>
                <input id="account-name" type="text" class="form-input" placeholder="Account holder name" />
              </div>
              <button id="save-bank-btn" type="submit" class="btn-primary px-6 py-2.5 text-sm">
                <i class="fa-solid fa-building-columns mr-1.5"></i>Save Bank Details
              </button>
            </form>
          </div>

          <!-- Danger Zone -->
          <div class="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h3 class="font-semibold text-red-400 mb-3">Danger Zone</h3>
            <p class="text-slate-400 text-sm mb-4">Once you delete your account, all data will be permanently removed.</p>
            <button id="delete-account-btn" class="px-5 py-2.5 rounded-lg text-sm font-semibold border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors">
              <i class="fa-solid fa-trash mr-1.5"></i>Delete Account
            </button>
          </div>

        </div>
      </main>
    </div>
  </div>

  <script src="js/app.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (!Auth.isLoggedIn()) { window.location.href = 'login.php'; return; }

      const user = Auth.getUser();

      // Populate profile
      const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
      const setInput = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

      setEl('profile-name', user.name);
      setEl('profile-email', user.email);
      setEl('profile-phone', user.phone);
      const avatar = document.getElementById('profile-avatar');
      if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
      const topAvatar = document.getElementById('user-avatar-initial');
      if (topAvatar) topAvatar.textContent = user.name.charAt(0).toUpperCase();

      setInput('edit-name', user.name);
      setInput('edit-email', user.email);
      setInput('edit-phone', user.phone);

      // Load saved bank details
      const bank = Store.get('bank_details', {});
      if (bank.bankName) document.getElementById('bank-name').value = bank.bankName;
      setInput('account-number', bank.accountNumber);
      setInput('account-name', bank.accountName);

      // Sidebar
      const toggleBtn = document.getElementById('sidebar-toggle');
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.toggle('open');
          if (overlay) overlay.classList.toggle('hidden');
        });
      }
      if (overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.add('hidden'); });

      // Logout
      ['logout-btn', 'logout-btn-mobile'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => Auth.logout());
      });

      // Save profile
      document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameEl = document.getElementById('edit-name');
        const emailEl = document.getElementById('edit-email');
        const phoneEl = document.getElementById('edit-phone');
        const nameOk = validateField(nameEl, { required: true, minLength: 3 });
        const emailOk = validateField(emailEl, { required: true, email: true });
        const phoneOk = validateField(phoneEl, { required: true, phone: true });
        if (!nameOk || !emailOk || !phoneOk) return;
        const btn = document.getElementById('save-profile-btn');
        setButtonLoading(btn, true);
        const result = await API.post('api/profile.php?action=update', {
          name: nameEl.value.trim(),
          phone: phoneEl.value.trim(),
        });
        setButtonLoading(btn, false);
        if (result.error) {
          Toast.show(result.error, 'error'); return;
        }
        // Update local UI state
        const updatedUser = { ...user, name: nameEl.value.trim(), email: emailEl.value.trim(), phone: phoneEl.value.trim() };
        Store.set('user', updatedUser);
        setEl('profile-name', updatedUser.name);
        setEl('profile-email', updatedUser.email);
        setEl('profile-phone', updatedUser.phone);
        if (avatar) avatar.textContent = updatedUser.name.charAt(0).toUpperCase();
        if (topAvatar) topAvatar.textContent = updatedUser.name.charAt(0).toUpperCase();
        Toast.show('Profile updated successfully!', 'success');
      });

      // Change password
      document.getElementById('password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const curPass = document.getElementById('current-password');
        const newPass = document.getElementById('new-password');
        const confPass = document.getElementById('confirm-new-password');
        if (!curPass.value) { Toast.show('Enter your current password.', 'warning'); return; }
        const ok1 = validateField(newPass, { required: true, minLength: 8 });
        const ok2 = validateField(confPass, { required: true, match: { value: newPass.value, message: 'Passwords do not match.' } });
        if (!ok1 || !ok2) return;
        const btn = document.getElementById('change-pass-btn');
        setButtonLoading(btn, true);
        const result = await API.post('api/profile.php?action=change_password', {
          current_password: curPass.value,
          new_password: newPass.value,
        });
        setButtonLoading(btn, false);
        if (result.error) {
          Toast.show(result.error, 'error'); return;
        }
        document.getElementById('password-form').reset();
        Toast.show('Password changed successfully!', 'success');
      });

      // Save notifications
      document.getElementById('save-notif-btn').addEventListener('click', () => {
        Store.set('notif_prefs', {
          transactions: document.getElementById('notif-transactions').checked,
          promo: document.getElementById('notif-promo').checked,
          weekly: document.getElementById('notif-weekly').checked,
        });
        Toast.show('Notification preferences saved!', 'success');
      });

      // Load notification prefs
      const notifPrefs = Store.get('notif_prefs', {});
      if (notifPrefs.transactions !== undefined) document.getElementById('notif-transactions').checked = notifPrefs.transactions;
      if (notifPrefs.promo !== undefined)         document.getElementById('notif-promo').checked = notifPrefs.promo;
      if (notifPrefs.weekly !== undefined)        document.getElementById('notif-weekly').checked = notifPrefs.weekly;

      // Save bank
      document.getElementById('bank-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const bankName = document.getElementById('bank-name').value;
        const accNum  = document.getElementById('account-number').value;
        const accName = document.getElementById('account-name').value;
        if (!bankName) { Toast.show('Please select a bank.', 'warning'); return; }
        if (!accNum || accNum.length !== 10) { Toast.show('Account number must be 10 digits.', 'warning'); return; }
        if (!accName) { Toast.show('Enter the account name.', 'warning'); return; }
        const btn = document.getElementById('save-bank-btn');
        setButtonLoading(btn, true);
        await new Promise(r => setTimeout(r, 1000));
        Store.set('bank_details', { bankName, accountNumber: accNum, accountName: accName });
        setButtonLoading(btn, false);
        Toast.show('Bank details saved!', 'success');
      });

      // Delete account
      document.getElementById('delete-account-btn').addEventListener('click', async () => {
        const confirmed = await Modal.confirm({
          title: 'Delete Account',
          message: 'This action is permanent and cannot be undone. All your data will be deleted.',
          confirmText: 'Yes, Delete',
          cancelText: 'Cancel',
        });
        if (!confirmed) return;
        // Remove user data
        const users = Store.get('users', []).filter(u => u.id !== user.id);
        Store.set('users', users);
        Store.remove('user');
        Store.remove('wallet_balance');
        Store.remove('transactions');
        Toast.show('Account deleted.', 'info');
        setTimeout(() => { window.location.href = 'index.php'; }, 1500);
      });
    });
  </script>
</body>
</html>
