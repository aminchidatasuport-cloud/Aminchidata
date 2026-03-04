<?php require_once __DIR__ . '/includes/auth.php'; requireLogin(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Education Pins – AminchiData</title>
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
        <a href="education.php" class="sidebar-link active"><i class="fa-solid fa-graduation-cap"></i> Education</a>
        <a href="electricity.php" class="sidebar-link"><i class="fa-solid fa-bolt"></i> Electricity</a>
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
        <h1 class="font-semibold text-white text-lg">Education Pins</h1>
        <div class="ml-auto flex items-center gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm" id="user-avatar-initial">U</div>
          <button id="logout-btn-mobile" class="text-sm text-slate-400 hover:text-red-400 p-1.5">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div class="max-w-3xl mx-auto">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-white">Buy Education Pins</h2>
            <p class="text-slate-400 text-sm mt-1">Purchase WAEC, NECO, and NABTEB result checker scratch cards instantly.</p>
          </div>

          <!-- Service Cards -->
          <div class="grid sm:grid-cols-3 gap-4 mb-6">
            <!-- WAEC -->
            <div data-service="WAEC" class="service-card p-5 cursor-pointer border-2 border-slate-700">
              <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
                <i class="fa-solid fa-graduation-cap text-blue-400 text-xl"></i>
              </div>
              <h3 class="font-bold text-white text-sm">WAEC</h3>
              <p class="text-slate-400 text-xs mt-1">West African Examinations Council</p>
              <div class="mt-3 text-green-400 font-bold text-sm">₦3,500 / pin</div>
            </div>

            <!-- NECO -->
            <div data-service="NECO" class="service-card p-5 cursor-pointer border-2 border-slate-700">
              <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3">
                <i class="fa-solid fa-book text-purple-400 text-xl"></i>
              </div>
              <h3 class="font-bold text-white text-sm">NECO</h3>
              <p class="text-slate-400 text-xs mt-1">National Examinations Council</p>
              <div class="mt-3 text-green-400 font-bold text-sm">₦1,000 / pin</div>
            </div>

            <!-- NABTEB -->
            <div data-service="NABTEB" class="service-card p-5 cursor-pointer border-2 border-slate-700">
              <div class="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3">
                <i class="fa-solid fa-certificate text-orange-400 text-xl"></i>
              </div>
              <h3 class="font-bold text-white text-sm">NABTEB</h3>
              <p class="text-slate-400 text-xs mt-1">National Business &amp; Technical Examinations</p>
              <div class="mt-3 text-green-400 font-bold text-sm">₦1,000 / pin</div>
            </div>
          </div>

          <!-- Purchase Form -->
          <div id="form-section" class="hidden">
            <form id="edu-form" novalidate>
              <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-white">Purchase Details</h3>
                  <span id="service-price" class="text-green-400 text-sm font-semibold"></span>
                </div>

                <!-- Quantity -->
                <div class="field-wrap mb-5">
                  <label for="quantity" class="block text-sm font-medium text-slate-300 mb-1.5">Number of Pins</label>
                  <input id="quantity" type="number" min="1" max="10" value="1" class="form-input w-full" placeholder="1" />
                  <div class="text-xs text-slate-500 mt-1">Max 10 pins per order</div>
                </div>

                <!-- Summary -->
                <div class="bg-slate-900 rounded-xl p-4 space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Service</span>
                    <span id="summary-service" class="font-medium text-white">—</span>
                  </div>
                  <div class="section-divider my-2"></div>
                  <div class="flex justify-between text-base font-bold">
                    <span class="text-white">Total</span>
                    <span id="summary-price" class="text-green-400">₦0.00</span>
                  </div>
                </div>

                <div class="text-xs text-slate-500 mt-3 flex items-start gap-1.5">
                  <i class="fa-solid fa-circle-info text-blue-400 mt-0.5"></i>
                  Pins are delivered instantly. Keep your pins safe — we cannot recover lost pins.
                </div>
              </div>

              <button id="buy-btn" type="submit" class="btn-primary w-full py-3.5 text-base">
                <i class="fa-solid fa-graduation-cap mr-2"></i>Buy Pin
              </button>
            </form>
          </div>

          <!-- Purchased Pins History -->
          <div class="mt-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-white">My Pins</h3>
              <span class="text-xs text-slate-500">Your purchased pins are stored locally</span>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <div id="pins-history">
                <p class="text-slate-500 text-sm text-center py-4">No pins purchased yet.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <script src="js/app.js"></script>
  <script src="js/education.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const user = Auth.getUser();
      const el = document.getElementById('user-avatar-initial');
      if (user && el) el.textContent = user.name.charAt(0).toUpperCase();
    });
  </script>
</body>
</html>
