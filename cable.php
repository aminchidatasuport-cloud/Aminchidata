<?php require_once __DIR__ . '/includes/auth.php'; requireLogin(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cable TV Subscription – AminchiData</title>
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
        <a href="cable.php" class="sidebar-link active"><i class="fa-solid fa-tv"></i> Cable TV</a>
        <a href="transactions.php" class="sidebar-link"><i class="fa-solid fa-clock-rotate-left"></i> Transactions</a>
        <a href="profile.php" class="sidebar-link"><i class="fa-solid fa-user-gear"></i> Profile</a>
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
        <h1 class="font-semibold text-white text-lg">Cable TV Subscription</h1>
        <div class="ml-auto flex items-center gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm" id="user-avatar-initial">U</div>
          <button id="logout-btn-mobile" class="text-sm text-slate-400 hover:text-red-400 p-1.5">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div class="max-w-2xl mx-auto">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-white">Cable TV Subscription</h2>
            <p class="text-slate-400 text-sm mt-1">Subscribe to DSTV, GOTV, and Startimes instantly.</p>
          </div>

          <!-- Provider Selection -->
          <div class="mb-5">
            <label class="block text-sm font-medium text-slate-300 mb-3">Select Provider</label>
            <div id="provider-buttons" class="grid grid-cols-3 gap-3">
              <button type="button" data-provider="DSTV" class="provider-card service-card p-4 text-center group">
                <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-500/30 transition-colors">
                  <i class="fa-solid fa-satellite-dish text-blue-400 text-xl"></i>
                </div>
                <div class="text-sm font-semibold text-white">DSTV</div>
              </button>
              <button type="button" data-provider="GOTV" class="provider-card service-card p-4 text-center group">
                <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-green-500/30 transition-colors">
                  <i class="fa-solid fa-satellite-dish text-green-400 text-xl"></i>
                </div>
                <div class="text-sm font-semibold text-white">GOTV</div>
              </button>
              <button type="button" data-provider="Startimes" class="provider-card service-card p-4 text-center group">
                <div class="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-500/30 transition-colors">
                  <i class="fa-solid fa-satellite-dish text-orange-400 text-xl"></i>
                </div>
                <div class="text-sm font-semibold text-white">Startimes</div>
              </button>
            </div>
          </div>

          <form id="cable-form" novalidate>
            <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-5">

              <!-- IUC / Smartcard Number -->
              <div class="field-wrap mb-4">
                <label for="iuc-number" class="block text-sm font-medium text-slate-300 mb-1.5">IUC / Smartcard Number</label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <i class="fa-solid fa-id-card absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                    <input id="iuc-number" type="text" placeholder="Enter IUC / smartcard number" class="form-input pl-10" maxlength="15" />
                  </div>
                  <button type="button" id="verify-btn" class="btn-primary px-4 py-2.5 text-sm whitespace-nowrap flex-shrink-0">
                    Verify
                  </button>
                </div>
              </div>

              <!-- Customer Info (shown after verify) -->
              <div id="customer-info" class="hidden bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-5">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-user-check text-green-400"></i>
                  </div>
                  <div>
                    <div class="text-xs text-green-400 font-semibold mb-0.5">Decoder Verified</div>
                    <div id="customer-name" class="font-bold text-white text-sm"></div>
                    <div id="customer-status" class="text-slate-400 text-xs mt-0.5"></div>
                  </div>
                </div>
              </div>

              <!-- Plan Selection -->
              <div id="plans-section" class="hidden mb-5">
                <label class="block text-sm font-medium text-slate-300 mb-2">Select Plan</label>
                <div id="plans-container" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
              </div>

              <!-- Order Summary -->
              <div id="summary-section" class="hidden bg-slate-900 border border-slate-700 rounded-xl p-4 mb-5">
                <h4 class="text-sm font-semibold text-slate-300 mb-3">Order Summary</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Provider</span>
                    <span id="summary-provider" class="text-white font-medium">—</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Plan</span>
                    <span id="summary-plan" class="text-white font-medium">—</span>
                  </div>
                  <div class="flex justify-between border-t border-slate-700 pt-2 mt-2">
                    <span class="text-slate-400 font-semibold">Total</span>
                    <span id="summary-amount" class="text-green-400 font-bold">₦0.00</span>
                  </div>
                </div>
              </div>

              <button id="buy-btn" type="submit" disabled class="btn-primary w-full py-3.5 text-base">
                <i class="fa-solid fa-tv mr-2"></i>Subscribe Now
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>

  <script src="js/app.js"></script>
  <script src="js/cable.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const user = Auth.getUser();
      const el = document.getElementById('user-avatar-initial');
      if (user && el) el.textContent = user.name.charAt(0).toUpperCase();
    });
  </script>
</body>
</html>
