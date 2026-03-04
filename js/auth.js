/**
 * AminchiData - auth.js
 * Login and Registration logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop();

  if (path === 'login.php' || path === 'login.html') initLogin();
  else if (path === 'register.php' || path === 'register.html') initRegister();
});

// ===================== Login =====================
function initLogin() {
  // Redirect if already logged in
  if (Auth.isLoggedIn()) { window.location.href = 'dashboard.html'; return; }

  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passInput  = document.getElementById('password');
  const submitBtn  = document.getElementById('login-btn');
  const togglePass = document.getElementById('toggle-pass');

  // Toggle password visibility
  if (togglePass && passInput) {
    togglePass.addEventListener('click', () => {
      const isText = passInput.type === 'text';
      passInput.type = isText ? 'password' : 'text';
      togglePass.querySelector('i').className = `fa-solid ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
    });
  }

  // Real-time validation
  if (emailInput) emailInput.addEventListener('blur', () => validateField(emailInput, { required: true, email: true }));
  if (passInput)  passInput.addEventListener('blur', () => validateField(passInput, { required: true, minLength: 6 }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailOk = validateField(emailInput, { required: true, email: true });
    const passOk  = validateField(passInput, { required: true, minLength: 6 });

    if (!emailOk || !passOk) return;

    setButtonLoading(submitBtn, true);

    let result;
    try {
      result = await API.post('api/auth.php?action=login', {
        email: emailInput.value.trim(),
        password: passInput.value,
      });
    } catch {
      // Backend unavailable — use client-side auth fallback
      const localUser = LocalUsers.authenticate(emailInput.value.trim(), passInput.value);
      if (localUser) {
        result = { success: true, user: localUser };
      } else {
        result = { error: 'Invalid email or password.' };
      }
    }

    if (result.error) {
      setButtonLoading(submitBtn, false);
      Toast.show(result.error, 'error');
      return;
    }

    // Save to localStorage for UI state
    Store.set('user', result.user);

    // Remember me
    const rememberMe = document.getElementById('remember-me');
    if (rememberMe && rememberMe.checked) {
      Store.set('remember_email', result.user.email);
    } else {
      Store.remove('remember_email');
    }

    Toast.show(`Welcome back, ${result.user.name.split(' ')[0]}!`, 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  });

  // Pre-fill remembered email
  const remembered = Store.get('remember_email');
  if (remembered && emailInput) {
    emailInput.value = remembered;
    const rememberMe = document.getElementById('remember-me');
    if (rememberMe) rememberMe.checked = true;
  }

}

// ===================== Register =====================
function initRegister() {
  if (Auth.isLoggedIn()) { window.location.href = 'dashboard.html'; return; }

  const form = document.getElementById('register-form');
  if (!form) return;

  const nameInput    = document.getElementById('fullname');
  const emailInput   = document.getElementById('email');
  const phoneInput   = document.getElementById('phone');
  const passInput    = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const submitBtn    = document.getElementById('register-btn');
  const togglePass   = document.getElementById('toggle-pass');
  const toggleConf   = document.getElementById('toggle-confirm');

  // Password visibility toggles
  if (togglePass && passInput) {
    togglePass.addEventListener('click', () => {
      const isText = passInput.type === 'text';
      passInput.type = isText ? 'password' : 'text';
      togglePass.querySelector('i').className = `fa-solid ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
    });
  }

  if (toggleConf && confirmInput) {
    toggleConf.addEventListener('click', () => {
      const isText = confirmInput.type === 'text';
      confirmInput.type = isText ? 'password' : 'text';
      toggleConf.querySelector('i').className = `fa-solid ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
    });
  }

  // Real-time validation
  if (nameInput)    nameInput.addEventListener('blur', () => validateField(nameInput, { required: true, minLength: 3 }));
  if (emailInput)   emailInput.addEventListener('blur', () => validateField(emailInput, { required: true, email: true }));
  if (phoneInput)   phoneInput.addEventListener('blur', () => validateField(phoneInput, { required: true, phone: true }));
  if (passInput)    passInput.addEventListener('blur', () => validateField(passInput, { required: true, minLength: 8 }));
  if (confirmInput) confirmInput.addEventListener('blur', () => {
    validateField(confirmInput, { required: true, match: { value: passInput.value, message: 'Passwords do not match.' } });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ok = [
      validateField(nameInput, { required: true, minLength: 3 }),
      validateField(emailInput, { required: true, email: true }),
      validateField(phoneInput, { required: true, phone: true }),
      validateField(passInput, { required: true, minLength: 8 }),
      validateField(confirmInput, { required: true, match: { value: passInput.value, message: 'Passwords do not match.' } }),
    ].every(Boolean);

    const termsCheck = document.getElementById('terms');
    if (termsCheck && !termsCheck.checked) {
      Toast.show('Please accept the Terms & Conditions.', 'warning');
      return;
    }

    if (!ok) return;

    setButtonLoading(submitBtn, true);

    let result;
    try {
      result = await API.post('api/auth.php?action=register', {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        password: passInput.value,
      });
    } catch {
      // Backend unavailable — use client-side registration fallback
      result = LocalUsers.create(
        nameInput.value.trim(),
        emailInput.value.trim(),
        phoneInput.value.trim(),
        passInput.value
      );
    }

    if (result.error) {
      setButtonLoading(submitBtn, false);
      Toast.show(result.error, 'error');
      return;
    }

    Store.set('user', result.user);

    Toast.show('Account created successfully! Welcome to AminchiData!', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
  });
}

// ===================== Helpers =====================
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }


