# CoreHR Frontend

Fondasi dashboard admin CMS untuk CoreHR berbasis Angular modern. Project ini fokus pada layout, struktur aplikasi, styling system, dan reusable UI components sebelum integrasi backend HR dilakukan.

## Ringkasan

Saat ini project sudah memiliki:

- Login page modern
- Dashboard admin layout custom
- Sidebar kiri, topbar, content area
- State menu aktif
- Responsive sidebar untuk mobile
- Dummy stat cards
- Dummy recent employees table
- Dummy auth flow untuk simulasi login
- Theme warna brand CoreHR

## Tech Stack

- Angular 21
- Standalone Components
- Standalone Routing
- TypeScript
- Tailwind CSS v4
- PostCSS
- Flowbite Angular
- ng-primitives
- RxJS
- Vitest

## UI Direction

Desain mengikuti pendekatan:

- Modern enterprise HR dashboard
- Clean
- Profesional
- White surface cards
- Soft gray page background
- Thin borders
- Subtle shadows
- Elegant dark sidebar

## Brand Colors

Corporate Modern:

- `brand.blue`: `#1F6FB2`
- `brand.blueDark`: `#185A91`
- `brand.green`: `#2F7D4A`
- `brand.greenDark`: `#1F5E38`
- `brand.gold`: `#D9A11A`

Neutral:

- `ui.bg`: `#F8FAFC`
- `ui.surface`: `#FFFFFF`
- `ui.border`: `#E2E8F0`
- `ui.text`: `#0F172A`
- `ui.muted`: `#475569`

Semantic:

- `success`: `#16A34A`
- `warning`: `#F59E0B`
- `danger`: `#DC2626`
- `info`: `#0EA5E9`

## Project Structure

```text
src/app/
  core/
    constants/
    guards/
    interceptors/
    models/
    services/
  shared/
    components/
    types/
    ui/
    utils/
  layout/
    auth-layout/
    dashboard-layout/
    page-header/
    sidebar/
    topbar/
  features/
    auth/
      pages/login/
    dashboard/
      components/
        recent-employees-table/
        stat-card/
      pages/dashboard-home/
  app.config.ts
  app.routes.ts
```

## Routes

Route yang sudah tersedia:

- `/` -> redirect ke `/login`
- `/login`
- `/dashboard`

## Dummy Auth Flow

Autentikasi saat ini masih dummy dan belum terhubung ke backend.

Perilaku saat ini:

- User membuka `/login`
- Submit form login
- Session dummy disimpan ke `localStorage`
- User diarahkan ke `/dashboard`
- Route dashboard dilindungi guard

File terkait:

- `src/app/core/services/auth-session.service.ts`
- `src/app/core/guards/auth.guard.ts`
- `src/app/core/guards/guest.guard.ts`

## Menjalankan Project

Install dependency:

```bash
npm install
```

Jalankan local server:

```bash
npm start
```

Atau:

```bash
ng serve
```

Lalu buka:

```text
http://localhost:4200
```

## Available Scripts

Development:

```bash
npm start
```

Build production:

```bash
npm run build
```

Unit test:

```bash
npm test -- --watch=false
```

## Styling Notes

Theme global dan tokens disimpan di:

- `src/styles.css`

Tailwind diaktifkan melalui:

- `postcss.config.json`

Flowbite Angular digunakan untuk:

- Dropdown
- Modal
- Badge
- Pagination
- Form wrapper
- Table wrapper

Tetapi layout utama tetap custom buatan sendiri.

## Reusable Components

Komponen reusable utama saat ini:

- `app-page-header`
- `app-sidebar`
- `app-topbar`
- `app-stat-card`
- `app-recent-employees-table`
- `app-icon`

## Status Saat Ini

Yang sudah siap:

- Fondasi struktur project
- Fondasi theme system
- Dashboard layout
- Login layout
- Responsive behavior dasar
- UI dashboard untuk demo internal

Yang masih dummy:

- Login API
- User profile API
- Data employee API
- Attendance API
- Leave API
- Payroll API
- Notification API
- Search API

## Catatan Pengembangan Lanjutan

Tahap berikutnya yang disarankan:

1. Sambungkan login ke backend auth
2. Tambahkan HTTP service dan interceptor
3. Ganti mock dashboard data menjadi API data
4. Tambahkan feature modules/pages nyata seperti Employees, Attendance, Leave, Payroll, Settings
5. Tambahkan state management jika kebutuhan data makin kompleks

## Verification

Implementasi terakhir sudah diverifikasi dengan:

```bash
npm run build
npm test -- --watch=false
```
