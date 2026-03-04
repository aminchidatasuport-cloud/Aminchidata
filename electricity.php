<?php require_once __DIR__ . '/includes/auth.php'; requireLogin(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Electricity Payment – AminchiData</title>
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
        <a href="data.php" class="sidebar-link"><i class="fa-solid fa-wifi"></i> Buy Data</a>
        <a href="airtime.php" class="sidebar-link"><i class="fa-solid fa-mobile-screen"></i> Buy Airtime</a>
        <a href="education.php" class="sidebar-link"><i class="fa-solid fa-graduation-cap"></i> Education</a>
        <a href="electricity.php" class="sidebar-link active"><i class="fa-solid fa-bolt"></i> Electricity</a>
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
        <h1 class="font-semibold text-white text-lg">Electricity Payment</h1>
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
            <h2 class="text-2xl font-bold text-white">Pay Electricity Bill</h2>
            <p class="text-slate-400 text-sm mt-1">Pay for all 11 distribution companies across Nigeria.</p>
          </div>

          <form id="electricity-form" novalidate>
            <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-5">
              <!-- Distribution Company -->
              <div class="field-wrap mb-5">
                <label for="disco-select" class="block text-sm font-medium text-slate-300 mb-1.5">Distribution Company</label>
                <div class="relative">
                  <i class="fa-solid fa-building-columns absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none"></i>
                  <select id="disco-select" class="form-input pl-10 appearance-none cursor-pointer">
                    <option value="">— Select DISCO —</option>
                  </select>
                  <i class="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none"></i>
                </div>
              </div>

              <!-- Meter Type -->
              <div class="mb-5">
                <label class="block text-sm font-medium text-slate-300 mb-2">Meter Type</label>
                <div class="inline-flex bg-slate-900 rounded-xl p-1 border border-slate-700">
                  <button type="button" id="prepaid-btn" class="px-5 py-2 rounded-lg text-sm font-semibold transition-all">
                    Prepaid
                  </button>
                  <button type="button" id="postpaid-btn" class="px-5 py-2 rounded-lg text-sm font-semibold transition-all text-slate-400">
                    Postpaid
                  </button>
                </div>
                <div class="text-xs text-slate-500 mt-1.5">
                  Selected: <span id="meter-type-display" class="text-green-400 font-medium">Prepaid</span>
                </div>
              </div>

              <!-- Meter Number -->
              <div class="field-wrap mb-4">
                <label for="meter-number" class="block text-sm font-medium text-slate-300 mb-1.5">Meter Number</label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <i class="fa-solid fa-tachometer-alt absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                    <input id="meter-number" type="text" placeholder="Enter meter number" class="form-input pl-10" maxlength="13" />
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
                    <div class="text-xs text-green-400 font-semibold mb-0.5">Meter Verified</div>
                    <div id="customer-name" class="font-bold text-white text-sm"></div>
                    <div id="customer-address" class="text-slate-400 text-xs mt-0.5"></div>
                  </div>
                </div>
              </div>

              <!-- Amount -->
              <div class="field-wrap mb-5">
                <label for="amount" class="block text-sm font-medium text-slate-300 mb-1.5">Amount (₦)</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₦</span>
                  <input id="amount" type="number" min="1000" placeholder="e.g. 5000" class="form-input pl-8" />
                </div>
                <div class="text-xs text-slate-500 mt-1">Minimum amount: ₦1,000</div>
              </div>

              <!-- Quick Amounts -->
              <div class="mb-5">
                <div class="text-sm text-slate-400 mb-2">Quick select:</div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" onclick="document.getElementById('amount').value=1000" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦1,000</button>
                  <button type="button" onclick="document.getElementById('amount').value=2000" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦2,000</button>
                  <button type="button" onclick="document.getElementById('amount').value=5000" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦5,000</button>
                  <button type="button" onclick="document.getElementById('amount').value=10000" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦10,000</button>
                  <button type="button" onclick="document.getElementById('amount').value=20000" class="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-1.5 transition-colors">₦20,000</button>
                </div>
              </div>

              <div class="text-xs text-slate-500 flex items-start gap-1.5 mb-5">
                <i class="fa-solid fa-circle-info text-blue-400 mt-0.5"></i>
                For prepaid meters, a token will be generated after payment. For postpaid, amount will be applied to your bill.
              </div>

              <button id="pay-btn" type="submit" class="btn-primary w-full py-3.5 text-base">
                <i class="fa-solid fa-bolt mr-2"></i>Pay Now
              </button>
            </div>
          </form>

          <!-- Sample meter numbers hint -->
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
            <div class="font-semibold mb-1.5 flex items-center gap-2">
              <i class="fa-solid fa-circle-info"></i> Demo Meter Numbers
            </div>
            <div class="space-y-1 text-xs font-mono">
              <div>12345678901 – Abubakar Musa (Lagos)</div>
              <div>09876543210 – Ngozi Okafor (Abuja)</div>
              <div>11223344556 – Emeka Johnson (Kano)</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <script src="js/app.js"></script>
  <script src="js/electricity.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const user = Auth.getUser();
      const el = document.getElementById('user-avatar-initial');
      if (user && el) el.textContent = user.name.charAt(0).toUpperCase();
    });
  </script>
</body>
</html>
