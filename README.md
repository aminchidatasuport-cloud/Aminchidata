# AminchiData

> Nigeria's most affordable VTU (Virtual Top-Up) and Bills Payment web application.

## 🔗 Live Demo

**👉 [https://aminchidatasuport-cloud.github.io/Aminchidata/](https://aminchidatasuport-cloud.github.io/Aminchidata/)**

> **Demo Login:** `demo@aminchidata.com` / `password123`

**AminchiData** is a fully responsive, client-side web application that enables Nigerian users to:
- 📶 Buy affordable data bundles (MTN, Airtel, Glo, 9mobile)
- 📱 Purchase airtime with 2% cashback discount
- 🎓 Buy WAEC, NECO, and NABTEB result checker pins
- ⚡ Pay electricity bills for all 11 DISCOs in Nigeria

---

## ✨ Features

- **Landing Page** — Hero section, pricing highlights, testimonials, and CTA
- **Authentication** — Login / Register with localStorage-based sessions and form validation
- **Dashboard** — Wallet balance, quick actions, animated stats counters, recent transactions
- **Buy Data** — Network selection, plan cards, order summary, wallet deduction
- **Buy Airtime** — Auto-detect network from phone prefix, quick-select amounts, 2% discount
- **Education Pins** — Buy WAEC/NECO/NABTEB scratch card PINs with instant display
- **Electricity** — DISCO selection, prepaid/postpaid toggle, meter verification, token generation
- **Transaction History** — Filterable table with pagination and status badges
- **Profile / Settings** — Edit personal info, change password, notification preferences, bank details
- **Toast Notifications** — Animated success / error / info / warning toasts
- **Modal Dialogs** — Confirmation modals before purchases
- **Fully Responsive** — Mobile-first design, sidebar drawer on mobile

---

## 🛠 Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Markup for all pages |
| [Tailwind CSS (CDN)](https://tailwindcss.com) | Utility-first styling |
| [Font Awesome 6 (CDN)](https://fontawesome.com) | Icons |
| Vanilla JavaScript (ES6+) | All interactivity |
| localStorage | Session management and mock data |

> **No build step required.** Open any HTML file directly or serve via GitHub Pages.

---

## 📁 Project Structure

```
Aminchidata/
├── index.html          # Landing page
├── login.html          # Login page
├── register.html       # Registration page
├── dashboard.html      # User dashboard
├── data.html           # Buy data bundles
├── airtime.html        # Buy airtime
├── education.html      # Education pins (WAEC/NECO/NABTEB)
├── electricity.html    # Electricity bill payment
├── transactions.html   # Transaction history
├── profile.html        # Profile & settings
├── css/
│   └── style.css       # Custom styles (animations, components)
└── js/
    ├── app.js          # Shared utilities (Toast, Modal, Auth, Store)
    ├── auth.js         # Login / Register logic
    ├── dashboard.js    # Dashboard page logic
    ├── data.js         # Buy data page logic
    ├── airtime.js      # Buy airtime page logic
    ├── education.js    # Education pins logic
    ├── electricity.js  # Electricity payment logic
    └── transactions.js # Transaction history logic
```

---

## 🚀 How to Run Locally

### Option 1 — Open directly in browser
```bash
git clone https://github.com/aminchidatasuport-cloud/Aminchidata.git
cd Aminchidata
# Open index.html in your browser
open index.html   # macOS
# or double-click index.html on Windows/Linux
```

### Option 2 — Serve with any static server
```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# Then open http://localhost:8080
```

### Demo Login
```
Email:    demo@aminchidata.com
Password: password123
```

---

## 🌐 Deployment (GitHub Pages)

The app is automatically deployed via GitHub Actions on every push to `main`.

**Live URL:** [https://aminchidatasuport-cloud.github.io/Aminchidata/](https://aminchidatasuport-cloud.github.io/Aminchidata/)

To deploy your own fork:
1. Go to **Settings → Pages** in your fork.
2. Under **Source**, select **GitHub Actions**.
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` will build and publish automatically.

---

## 📸 Screenshots

| Page | URL |
|------|-----|
| Landing Page | [/index.html](https://aminchidatasuport-cloud.github.io/Aminchidata/index.html) |
| Login | [/login.html](https://aminchidatasuport-cloud.github.io/Aminchidata/login.html) |
| Dashboard | [/dashboard.html](https://aminchidatasuport-cloud.github.io/Aminchidata/dashboard.html) |
| Buy Data | [/data.html](https://aminchidatasuport-cloud.github.io/Aminchidata/data.html) |
| Buy Airtime | [/airtime.html](https://aminchidatasuport-cloud.github.io/Aminchidata/airtime.html) |
| Education Pins | [/education.html](https://aminchidatasuport-cloud.github.io/Aminchidata/education.html) |
| Electricity | [/electricity.html](https://aminchidatasuport-cloud.github.io/Aminchidata/electricity.html) |
| Transactions | [/transactions.html](https://aminchidatasuport-cloud.github.io/Aminchidata/transactions.html) |
| Profile | [/profile.html](https://aminchidatasuport-cloud.github.io/Aminchidata/profile.html) |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style (vanilla JS, Tailwind CSS classes, consistent naming).

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">Made with ❤️ for Nigeria 🇳🇬</div> 
