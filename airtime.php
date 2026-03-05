<?php require_once __DIR__ . '/includes/auth.php'; requireLogin(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Buy Airtime – AminchiData</title>
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
        <a href="airtime.php" class="sidebar-link active"><i class="fa-solid fa-mobile-screen"></i> Buy Airtime</a>
        <a href="education.php" class="sidebar-link"><i class="fa-solid fa-graduation-cap"></i> Education</a>
        <a href="electricity.php" class="sidebar-link"><i class="fa-solid fa-bolt"></i> Electricity</a>
        <a href="cable.php" class="sidebar-link"><i class="fa-solid fa-tv"></i> Cable TV</a>
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
      <!-- Top Bar -->
      <header class="bg-slate-800/70 border-b border-slate-700 px-4 sm:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-10">
        <button id="sidebar-toggle" class="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700">
          <i class="fa-solid fa-bars text-lg"></i>
        </button>
        <h1 class="font-semibold text-white text-lg">Buy Airtime</h1>
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
            <h2 class="text-2xl font-bold text-white">Buy Airtime</h2>
            <p class="text-slate-400 text-sm mt-1">Recharge any network with instant delivery and 2% discount.</p>
          </div>

          <!-- Discount banner -->
          <div class="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-5 flex items-center gap-2 text-sm text-green-300">
            <i class="fa-solid fa-tag text-green-400"></i>
            Get <strong class="mx-1">2% cashback discount</strong> on all airtime purchases!
          </div>

          <form id="airtime-form" novalidate>
            <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <!-- Network Selection -->
              <h3 class="font-semibold text-white mb-4">Select Network</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button type="button" data-network="MTN" class="network-btn">
                  <div class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-900 font-black text-sm">MTN</div>
                  <div class="text-sm font-semibold text-white">MTN</div>
                </button>
                <button type="button" data-network="Airtel" class="network-btn">
                  <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-black text-xs">AIRT</div>
                  <div class="text-sm font-semibold text-white">Airtel</div>
                </button>
                <button type="button" data-network="Glo" class="network-btn">
                  <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-black text-sm">GLO</div>
                  <div class="text-sm font-semibold text-white">Glo</div>
                </button>
                <button type="button" data-network="9mobile" class="network-btn">
                  <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-black text-xs">9MOB</div>
                  <div class="text-sm font-semibold text-white">9mobile</div>
                </button>
              </div>

              <!-- Phone Number -->
              <div class="field-wrap mb-4">
                <label for="phone-number" class="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                <div class="relative">
                  <i class="fa-solid fa-mobile-screen absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                  <input id="phone-number" type="tel" placeholder="08012345678" class="form-input pl-10" maxlength="11" />
                </div>
                <div id="detected-network" class="hidden text-xs text-green-400 mt-1.5 flex items-center gap-1">
                  <i class="fa-solid fa-check-circle"></i> <span></span>
                </div>
              </div>

              <!-- Amount -->
              <div class="field-wrap mb-5">
                <label for="amount" class="block text-sm font-medium text-slate-300 mb-1.5">Amount (₦)</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₦</span>
                  <input id="amount" type="number" min="50" max="50000" placeholder="e.g. 500" class="form-input pl-8" />
                </div>
                <div class="text-xs text-slate-500 mt-1">Min: ₦50 · Max: ₦50,000</div>
              </div>

              <!-- Discount notice -->
              <div id="discount-info" class="hidden bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-sm text-green-300 mb-5"></div>

              <!-- Quick amounts -->
              <div class="mb-5">
                <div class="text-sm text-slate-400 mb-2">Quick select:</div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" onclick="document.getElementById('amount').value=100;document.getElementById('amount').dispatchEvent(new Event('input'))" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦100</button>
                  <button type="button" onclick="document.getElementById('amount').value=200;document.getElementById('amount').dispatchEvent(new Event('input'))" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦200</button>
                  <button type="button" onclick="document.getElementById('amount').value=500;document.getElementById('amount').dispatchEvent(new Event('input'))" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦500</button>
                  <button type="button" onclick="document.getElementById('amount').value=1000;document.getElementById('amount').dispatchEvent(new Event('input'))" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦1,000</button>
                  <button type="button" onclick="document.getElementById('amount').value=2000;document.getElementById('amount').dispatchEvent(new Event('input'))" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦2,000</button>
                  <button type="button" onclick="document.getElementById('amount').value=5000;document.getElementById('amount').dispatchEvent(new Event('input'))" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦5,000</button>
                </div>
              </div>

              <button id="buy-btn" type="submit" class="btn-primary w-full py-3.5 text-base">
                <i class="fa-solid fa-mobile-screen mr-2"></i>Buy Airtime
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>

  <script src="js/app.js"></script>
  <script src="js/airtime.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const user = Auth.getUser();
      const el = document.getElementById('user-avatar-initial');
      if (user && el) el.textContent = user.name.charAt(0).toUpperCase();
    });
  </script>
</body>
</html>
