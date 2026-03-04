<?php require_once __DIR__ . '/includes/auth.php'; initSession(); if (isAdmin()) { header('Location: admin.php'); exit; } ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Login – AminchiData</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center py-12 px-4" style="background: linear-gradient(135deg, #0f172a 0%, #0d2240 50%, #051a0d 100%);">

  <div class="w-full max-w-md">
    <!-- Logo -->
    <div class="text-center mb-8">
      <a href="index.php" class="inline-flex items-center gap-2">
        <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
          <i class="fa-solid fa-shield-halved text-white text-lg"></i>
        </div>
        <span class="text-2xl font-extrabold"><span class="text-white">Aminchi</span><span class="text-green-400">Data</span></span>
      </a>
      <h1 class="text-2xl font-bold text-white mt-4">Admin Panel</h1>
      <p class="text-slate-400 text-sm mt-1">Sign in to the admin dashboard</p>
    </div>

    <!-- Card -->
    <div class="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
      <!-- Demo hint -->
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-6 text-sm text-blue-300 flex items-start gap-2">
        <i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
        <div>Default: <strong>admin@aminchidata.com</strong> / <strong>admin123</strong></div>
      </div>

      <form id="admin-login-form" novalidate>
        <!-- Email -->
        <div class="field-wrap mb-5">
          <label for="email" class="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
          <div class="relative">
            <i class="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
            <input id="email" type="email" placeholder="admin@aminchidata.com" class="form-input pl-10" autocomplete="email" />
          </div>
        </div>

        <!-- Password -->
        <div class="field-wrap mb-6">
          <label for="password" class="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div class="relative">
            <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
            <input id="password" type="password" placeholder="Enter admin password" class="form-input pl-10 pr-12" autocomplete="current-password" />
            <button type="button" id="toggle-pass" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <i class="fa-solid fa-eye"></i>
            </button>
          </div>
        </div>

        <button id="admin-login-btn" type="submit" class="btn-primary w-full py-3 text-base">
          <i class="fa-solid fa-shield-halved mr-2"></i>Sign In to Admin
        </button>
      </form>
    </div>

    <p class="text-center text-slate-600 text-xs mt-6">
      <a href="index.php" class="hover:text-slate-400 transition-colors"><i class="fa-solid fa-arrow-left mr-1"></i>Back to main site</a>
    </p>
  </div>

  <script src="js/app.js"></script>
  <script>
    // Redirect if already logged in
    if (Store.get('admin_user')) {
      window.location.href = 'admin.php';
    }

    // Toggle password visibility
    const toggleBtn = document.getElementById('toggle-pass');
    const passInput = document.getElementById('password');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = passInput.type === 'password';
        passInput.type = isHidden ? 'text' : 'password';
        toggleBtn.querySelector('i').className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      });
    }

    // Form submit
    document.getElementById('admin-login-form').addEventListener('submit', function (e) {
      e.preventDefault();

      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const btn = document.getElementById('admin-login-btn');

      const emailValid = validateField(emailInput, { required: true, type: 'email' });
      const passValid = validateField(passwordInput, { required: true, minLength: 4 });

      if (!emailValid || !passValid) return;

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      setButtonLoading(btn, true);

      setTimeout(() => {
        // Check hardcoded default credentials
        const isDefault = email === 'admin@aminchidata.com' && password === 'admin123';

        // Check additional admin accounts
        const adminUsers = Store.get('admin_users', []);
        const additionalAdmin = adminUsers.find(
          u => u.email.toLowerCase() === email && u.password === password
        );

        if (isDefault || additionalAdmin) {
          const adminData = {
            email: email,
            name: isDefault ? 'Super Admin' : additionalAdmin.name || 'Admin',
            role: isDefault ? 'super_admin' : additionalAdmin.role || 'admin',
            loggedInAt: new Date().toISOString()
          };
          Store.set('admin_user', adminData);
          Toast.show('Welcome back, Admin!', 'success');
          setTimeout(() => { window.location.href = 'admin.php'; }, 600);
        } else {
          Toast.show('Invalid admin credentials', 'error');
          setButtonLoading(btn, false);
        }
      }, 1000);
    });
  </script>
</body>
</html>
