# AminchiData

> Nigeria's most affordable VTU (Virtual Top-Up) and Bills Payment web application — now powered by PHP for seamless API and payment gateway integration.

## 🌐 Live Demo

🔗 **[Test the app here → aminchidatasuport-cloud.github.io/Aminchidata](https://aminchidatasuport-cloud.github.io/Aminchidata/)**

## 🔗 Demo Credentials

> **Demo Login:** `demo@aminchidata.com` / `password123`
>
> **Admin Login:** `admin@aminchidata.com` / `admin123`

**AminchiData** is a fully responsive PHP web application that enables Nigerian users to:
- 📶 Buy affordable data bundles (MTN, Airtel, Glo, 9mobile)
- 📱 Purchase airtime with 2% cashback discount
- 🎓 Buy WAEC, NECO, and NABTEB result checker pins
- ⚡ Pay electricity bills for all 11 DISCOs in Nigeria
- 💳 Integrate with payment gateways (Paystack, Flutterwave)
- 🔌 Connect to VTU provider APIs for real-time service delivery

---

## ✨ Features

- **Landing Page** — Hero section, pricing highlights, testimonials, and CTA
- **Authentication** — Login / Register with PHP session-based authentication and secure password hashing
- **Dashboard** — Wallet balance, quick actions, animated stats counters, recent transactions
- **Buy Data** — Network selection, plan cards, order summary, wallet deduction via PHP API
- **Buy Airtime** — Auto-detect network from phone prefix, quick-select amounts, 2% discount
- **Education Pins** — Buy WAEC/NECO/NABTEB scratch card PINs with instant display
- **Electricity** — DISCO selection, prepaid/postpaid toggle, meter verification, token generation
- **Transaction History** — Filterable table with pagination and status badges (database-backed)
- **Profile / Settings** — Edit personal info, change password, notification preferences, bank details
- **Admin Panel** — Separate admin login, dashboard overview, user management (search, adjust wallets, delete), transaction management (filter, search, update status), platform settings
- **Payment Gateway Ready** — Configuration for Paystack and Flutterwave integration
- **VTU API Ready** — Structured for connecting to data/airtime provider APIs
- **Toast Notifications** — Animated success / error / info / warning toasts
- **Modal Dialogs** — Confirmation modals before purchases
- **Fully Responsive** — Mobile-first design, sidebar drawer on mobile

---

## 🛠 Tech Stack

| Technology | Usage |
|---|---|
| **PHP 8.0+** | Backend logic, API endpoints, session management |
| **MySQL / MariaDB** | Database for users, transactions, pins, payments |
| **PDO** | Secure database access with prepared statements |
| HTML5 / PHP | Markup for all pages |
| [Tailwind CSS (CDN)](https://tailwindcss.com) | Utility-first styling |
| [Font Awesome 6 (CDN)](https://fontawesome.com) | Icons |
| Vanilla JavaScript (ES6+) | Frontend interactivity, calls PHP API via `fetch()` |

---

## 📁 Project Structure

```
Aminchidata/
├── index.php               # Landing page
├── login.php               # Login page
├── register.php            # Registration page
├── dashboard.php           # User dashboard (requires login)
├── data.php                # Buy data bundles (requires login)
├── airtime.php             # Buy airtime (requires login)
├── education.php           # Education pins (requires login)
├── electricity.php         # Electricity bill payment (requires login)
├── transactions.php        # Transaction history (requires login)
├── profile.php             # Profile & settings (requires login)
├── admin-login.php         # Admin login page
├── admin.php               # Admin panel (requires admin)
├── .htaccess               # Apache config, .html→.php redirect, security rules
│
├── config/
│   ├── app.php             # App settings, payment gateway keys, VTU API config
│   └── database.php        # Database connection credentials
│
├── includes/
│   ├── db.php              # PDO database connection (singleton)
│   ├── auth.php            # Session-based authentication helpers
│   └── functions.php       # Shared utilities (wallet, transactions, validation)
│
├── api/                    # JSON API endpoints (called by frontend JS)
│   ├── auth.php            # Login / Register / Logout / Session check
│   ├── wallet.php          # Get balance / Fund wallet
│   ├── data.php            # Purchase data bundles
│   ├── airtime.php         # Purchase airtime
│   ├── education.php       # Buy education PINs / Get PIN history
│   ├── electricity.php     # Verify meter / Pay electricity
│   ├── transactions.php    # Get transaction history with filters
│   ├── profile.php         # Update profile / Change password
│   └── admin.php           # Admin dashboard, user/transaction management, settings
│
├── database/
│   └── schema.sql          # MySQL schema + seed data (demo user, admin, settings)
│
├── css/
│   └── style.css           # Custom styles (animations, components)
│
├── js/
│   ├── app.js              # Shared utilities (Toast, Modal, Auth, Store, API helper)
│   ├── auth.js             # Login / Register logic (calls PHP API)
│   ├── dashboard.js        # Dashboard page logic
│   ├── data.js             # Buy data page logic (calls PHP API)
│   ├── airtime.js          # Buy airtime page logic (calls PHP API)
│   ├── education.js        # Education pins logic (calls PHP API)
│   ├── electricity.js      # Electricity payment logic (calls PHP API)
│   ├── transactions.js     # Transaction history logic (calls PHP API)
│   └── admin.js            # Admin panel logic
│
├── index.html              # (Legacy) Original static pages kept for reference
├── login.html              #
└── ...                     #
```

---

## 🚀 How to Run Locally

### Prerequisites

- **PHP 8.0+** with PDO MySQL extension
- **MySQL 5.7+** or **MariaDB 10.3+**
- **Apache** with `mod_rewrite` enabled (or any PHP-capable web server)

### Step 1 — Clone the repository

```bash
git clone https://github.com/aminchidatasuport-cloud/Aminchidata.git
cd Aminchidata
```

### Step 2 — Set up the database

```bash
# Log into MySQL and run the schema
mysql -u root -p < database/schema.sql
```

This creates the `aminchidata` database with all tables and seeds demo + admin users.

### Step 3 — Configure database credentials

Edit `config/database.php` with your MySQL credentials, or set environment variables:

```bash
export DB_HOST=localhost
export DB_NAME=aminchidata
export DB_USER=root
export DB_PASS=your_password
```

### Step 4 — Configure payment gateways (optional)

Edit `config/app.php` or set environment variables for Paystack/Flutterwave:

```bash
export PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
export PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

### Step 5 — Start the PHP development server

```bash
php -S localhost:8000
```

Then open **http://localhost:8000** in your browser.

### Demo Login
```
Email:    demo@aminchidata.com
Password: password123
```

### Admin Login
```
Email:    admin@aminchidata.com
Password: admin123
```

---

## 🌐 Deployment

### Apache / cPanel

1. Upload all files to your web host's `public_html` directory
2. Import `database/schema.sql` into your MySQL database (via phpMyAdmin or CLI)
3. Update `config/database.php` with your hosting database credentials
4. Ensure `mod_rewrite` is enabled (the `.htaccess` handles URL rewriting)

### Environment Variables

| Variable | Description |
|---|---|
| `DB_HOST` | Database host (default: `localhost`) |
| `DB_PORT` | Database port (default: `3306`) |
| `DB_NAME` | Database name (default: `aminchidata`) |
| `DB_USER` | Database username (default: `root`) |
| `DB_PASS` | Database password |
| `PAYSTACK_PUBLIC_KEY` | Paystack public API key |
| `PAYSTACK_SECRET_KEY` | Paystack secret API key |
| `FLW_PUBLIC_KEY` | Flutterwave public key |
| `FLW_SECRET_KEY` | Flutterwave secret key |
| `VTU_API_URL` | VTU provider API base URL |
| `VTU_API_KEY` | VTU provider API key |
| `VTU_API_SECRET` | VTU provider API secret |

---

## 🔒 Security

- Passwords are hashed with `password_hash()` (bcrypt) and verified with `password_verify()`
- All database queries use **PDO prepared statements** to prevent SQL injection
- PHP sessions are configured with `httponly` and `strict mode` cookies
- Sensitive directories (`config/`, `includes/`, `database/`) are protected via `.htaccess`
- The `.htaccess` redirects legacy `.html` URLs to `.php` for backward compatibility

---

## 💳 Payment Gateway Integration

The application is structured for easy integration with Nigerian payment gateways:

- **Paystack** — Configuration in `config/app.php` under `paystack` key
- **Flutterwave** — Configuration in `config/app.php` under `flutterwave` key

To enable real payments, implement the verification callbacks in `api/wallet.php` where indicated by `TODO` comments.

---

## 🏦 Wallet Funding with Virtual Accounts

AminchiData supports dedicated virtual bank accounts for wallet top-up. When a virtual account provider is configured, each user receives a unique account number — transfers to that account automatically credit the user's wallet.

### How It Works

1. **Provider configuration** — Set up your chosen virtual account provider's API credentials as environment variables (see below).
2. **On-demand retrieval** — Users can request their virtual account details at any time via:
   ```
   GET /api/wallet.php?action=virtual_account
   ```
   The response contains `account_number`, `account_name`, `bank_name`, and `bank_code`.
3. **Transfer to fund** — The user transfers any amount to the returned account. The provider reconciles the transfer and (via webhook) triggers wallet credit.

### Key Files

| File | Purpose |
|------|---------|
| `api/wallet.php` | `?action=virtual_account` endpoint — returns stored account details |
| `database/schema.sql` | `virtual_accounts` table definition |

> **Note:** The virtual account provider integration is currently a placeholder. Implement your provider's API calls in `api/wallet.php` and register a webhook endpoint to handle payment notifications.

---

## 🔌 VTU API Integration

Service delivery (data, airtime, education, electricity) is structured with `TODO` markers in each API endpoint for connecting to your VTU provider (e.g., VTpass, SMEPlug, BuyPower):

- `api/data.php` — Data bundle delivery
- `api/airtime.php` — Airtime delivery
- `api/education.php` — Education PIN generation
- `api/electricity.php` — Meter verification and token generation

---

## 📸 Pages

| Page | URL |
|------|-----|
| Landing Page | `/index.php` |
| Login | `/login.php` |
| Register | `/register.php` |
| Dashboard | `/dashboard.php` |
| Buy Data | `/data.php` |
| Buy Airtime | `/airtime.php` |
| Education Pins | `/education.php` |
| Electricity | `/electricity.php` |
| Transactions | `/transactions.php` |
| Profile | `/profile.php` |
| Admin Login | `/admin-login.php` |
| Admin Panel | `/admin.php` |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style (PHP for backend, vanilla JS for frontend, Tailwind CSS classes).

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">Made with ❤️ for Nigeria 🇳🇬</div> 
