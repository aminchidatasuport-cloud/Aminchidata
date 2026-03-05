<?php require_once __DIR__ . '/includes/auth.php'; requireLogin(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fund Account – AminchiData</title>
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
        <a href="fund-account.php" class="sidebar-link active"><i class="fa-solid fa-building-columns"></i> Fund Account</a>
        <a href="data.php" class="sidebar-link"><i class="fa-solid fa-wifi"></i> Buy Data</a>
        <a href="airtime.php" class="sidebar-link"><i class="fa-solid fa-mobile-screen"></i> Buy Airtime</a>
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
        <h1 class="font-semibold text-white text-lg">Fund Account</h1>
        <div class="ml-auto flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm" id="user-avatar-initial">U</div>
          </div>
          <button id="logout-btn-mobile" class="text-sm text-slate-400 hover:text-red-400 p-1.5">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div class="max-w-2xl mx-auto">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-white">Fund Your Account</h2>
            <p class="text-slate-400 text-sm mt-1">Transfer money to your virtual account below to fund your wallet automatically.</p>
          </div>

          <!-- Virtual Account Card -->
          <div id="virtual-account-section">
            <!-- Loading state -->
            <div id="va-loading" class="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
              <span class="spinner"></span>
              <p class="text-slate-400 mt-3">Loading your virtual account details...</p>
            </div>

            <!-- Account details (hidden until loaded) -->
            <div id="va-details" class="hidden">
              <div class="virtual-account-card p-6 sm:p-8 mb-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <i class="fa-solid fa-building-columns text-green-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white">Your Virtual Account</h3>
                    <p class="text-green-300 text-sm">Transfer funds to this account</p>
                  </div>
                </div>

                <div class="space-y-4">
                  <!-- Bank Name -->
                  <div class="flex items-center justify-between bg-slate-900/50 rounded-xl p-4">
                    <div>
                      <p class="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Bank Name</p>
                      <p id="va-bank-name" class="text-white font-semibold text-lg">—</p>
                    </div>
                    <div class="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <i class="fa-solid fa-university text-slate-400"></i>
                    </div>
                  </div>

                  <!-- Account Number -->
                  <div class="flex items-center justify-between bg-slate-900/50 rounded-xl p-4">
                    <div>
                      <p class="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Account Number</p>
                      <p id="va-account-number" class="text-white font-bold text-2xl tracking-wider">—</p>
                    </div>
                    <button id="copy-account-btn" class="btn-outline px-3 py-2 text-sm" title="Copy account number">
                      <i class="fa-regular fa-copy"></i> Copy
                    </button>
                  </div>

                  <!-- Account Name -->
                  <div class="flex items-center justify-between bg-slate-900/50 rounded-xl p-4">
                    <div>
                      <p class="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Account Name</p>
                      <p id="va-account-name" class="text-white font-semibold text-lg">—</p>
                    </div>
                    <div class="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <i class="fa-solid fa-user text-slate-400"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- How it works -->
              <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h4 class="font-bold text-white mb-4"><i class="fa-solid fa-circle-info text-green-400 mr-2"></i>How It Works</h4>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <div class="w-7 h-7 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-green-400 text-sm font-bold">1</span>
                    </div>
                    <p class="text-slate-300 text-sm">Copy the account number above and open your bank app or USSD.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-7 h-7 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-green-400 text-sm font-bold">2</span>
                    </div>
                    <p class="text-slate-300 text-sm">Transfer any amount to the virtual account displayed above.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-7 h-7 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-green-400 text-sm font-bold">3</span>
                    </div>
                    <p class="text-slate-300 text-sm">Your wallet will be credited automatically once the transfer is confirmed.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error state (hidden until error) -->
            <div id="va-error" class="hidden bg-slate-800 border border-red-500/30 rounded-2xl p-8 text-center">
              <div class="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-circle-exclamation text-red-400 text-2xl"></i>
              </div>
              <h3 class="text-white font-bold text-lg mb-2">Unable to Load Account</h3>
              <p class="text-slate-400 text-sm mb-4">We couldn't retrieve your virtual account details. Please try again.</p>
              <button id="va-retry-btn" class="btn-primary text-sm px-5 py-2.5">
                <i class="fa-solid fa-rotate-right mr-1.5"></i>Retry
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <script src="js/app.js"></script>
  <script src="js/fund-account.js"></script>
</body>
</html>
