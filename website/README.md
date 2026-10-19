# Daily Dua Website & cPanel Deployment Guide 🌙

This directory contains the responsive website frontend and the Lightweight PHP + MariaDB backend for Daily Dua.

---

## 📁 Structure

```
website/
├── api/                   # Lightweight PHP Backend for cPanel
│   ├── config.php         # Database credentials & Admin password
│   ├── db.php             # PDO database connection & helpers
│   ├── schema.sql         # MariaDB database table structures
│   ├── seed.php           # 1-Click Database Setup & Initial Seeder
│   ├── version.php        # Fast version endpoint for checking updates
│   ├── sync.php           # Full categories & duas payload
│   └── admin/             # Admin endpoints
│       ├── auth.php       # Password authentication
│       ├── categories.php # Category CRUD & hasProgress management
│       └── duas.php       # Dua CRUD & multi-category management
│
├── src/                   # React + Vite + Tailwind CSS Frontend
│   ├── components/        # Header, DuaCard, CategoryCard, ProgressBar, Settings
│   ├── pages/             # HomePage, CategoryDetailPage, AdminPage
│   ├── context/           # DuaContext (daily progress & settings)
│   └── services/          # API client
│
└── dist/                  # Built static web files ready for cPanel
```

---

## 🚀 How to Deploy to cPanel (2 Easy Steps)

### Step 1: Upload to cPanel `public_html`
1. Run `npm run build` inside `website/` (generates the `dist/` folder).
2. Upload all files from `website/dist/` into your cPanel `public_html/`.
3. Upload the `website/api/` folder into `public_html/api/`.

### Step 2: Set Up Database (1-Click)
1. In cPanel, open **MySQL Database Wizard**:
   - Create a database (e.g. `youruser_dailydua`).
   - Create a user and password (grant all privileges).
2. Edit `public_html/api/config.php` via cPanel File Manager and put your database name, user, and password:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'youruser_dailydua');
   define('DB_USER', 'youruser_dbuser');
   define('DB_PASS', 'your_password');
   define('ADMIN_PASSWORD', 'your_secret_admin_password');
   ```
3. Open your browser and visit:
   `https://yourdomain.com/api/seed.php`
   - ✅ It will automatically create all tables and import all 50+ existing duas and categories!

---

## 🛡️ Admin Portal

- **URL**: `https://yourdomain.com/admin` (or click the Shield icon in the top header)
- **Default Password**: `rsl12345` (you can change this in `api/config.php` or via the `ADMIN_PASSWORD` environment variable)
- **Workflow**:
  1. **Category Management**: View categories, add or edit name and toggle `hasProgress` (daily routine counter vs plain recitation).
  2. **Select Category**: Click "দোয়া দেখুন" on any category to view and manage its Duas.
  3. **Add Dua**: Click "+ নতুন দোয়া যোগ করুন" inside the category. Fill Title, Arabic (with live preview), Bangla uccharon, Bangla meaning, Fazilat, Reference, and Kotobar (repetition count).
  4. **Multi-category Assignment**: Checkboxes allow linking the same Dua to multiple categories (e.g. morning and evening).
  5. Every save automatically increments `data_version` so mobile apps and web visitors get the update automatically!

---

## 📱 Connecting the Mobile App

In `mobile-app/src/services/dataSyncService.ts`, set your production domain:
```typescript
export const DEFAULT_API_URL = 'https://yourdomain.com/api';
```
When online, the mobile app will automatically check `version.php`, download updates from `sync.php`, and save them locally so the app remains 100% functional offline!
