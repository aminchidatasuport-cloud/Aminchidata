<?php require_once __DIR__ . '/includes/auth.php'; initSession(); if (isLoggedIn()) { header('Location: dashboard.php'); exit; } ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login – AminchiData</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center py-12 px-4">

  <div class="w-full max-w-md">
    <!-- Logo -->
    <div class="text-center mb-8">
      <a href="index.php" class="inline-flex items-center gap-2">
        <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
          <i class="fa-solid fa-bolt text-white text-lg"></i>
        </div>
        <span class="text-2xl font-extrabold"><span class="text-white">Aminchi</span><span class="text-green-400">Data</span></span>
      </a>
      <h1 class="text-2xl font-bold text-white mt-4">Welcome Back</h1>
      <p class="text-slate-400 text-sm mt-1">Sign in to your account</p>
    </div>

    <!-- Card -->
    <div class="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
      <!-- Demo hint -->
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-6 text-sm text-blue-300 flex items-start gap-2">
        <i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
        <div>Demo: <strong>demo@aminchidata.com</strong> / <strong>password123</strong></div>
      </div>

      <form id="login-form" novalidate>
        <!-- Email -->
        <div class="field-wrap mb-5">
          <label for="email" class="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
          <div class="relative">
            <i class="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
            <input id="email" type="email" placeholder="your@email.com" class="form-input pl-10" autocomplete="email" />
          </div>
        </div>

        <!-- Password -->
        <div class="field-wrap mb-2">
          <label for="password" class="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div class="relative">
            <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
            <input id="password" type="password" placeholder="Enter your password" class="form-input pl-10 pr-12" autocomplete="current-password" />
            <button type="button" id="toggle-pass" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <i class="fa-solid fa-eye"></i>
            </button>
          </div>
        </div>

        <!-- Remember / Forgot -->
        <div class="flex items-center justify-between mb-6 mt-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input id="remember-me" type="checkbox" class="w-4 h-4 rounded accent-green-500" />
            <span class="text-sm text-slate-400">Remember me</span>
          </label>
          <a href="#" class="text-sm text-green-400 hover:text-green-300 transition-colors">Forgot password?</a>
        </div>

        <button id="login-btn" type="submit" class="btn-primary w-full py-3 text-base">
          <i class="fa-solid fa-right-to-bracket mr-2"></i>Sign In
        </button>
      </form>

      <p class="text-center text-slate-400 text-sm mt-6">
        Don't have an account?
        <a href="register.php" class="text-green-400 font-semibold hover:text-green-300 ml-1">Create one free</a>
      </p>
    </div>

    <p class="text-center text-slate-600 text-xs mt-6">
      <a href="index.php" class="hover:text-slate-400 transition-colors"><i class="fa-solid fa-arrow-left mr-1"></i>Back to Home</a>
    </p>
  </div>

  <script src="js/app.js"></script>
  <script src="js/auth.js"></script>
</body>
</html>
