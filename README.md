# CoreHR Frontend

CoreHR Frontend adalah aplikasi HR management berbasis Angular untuk mengelola karyawan, absensi, cuti, dan data organisasi dalam satu dashboard.

README ini ditulis untuk pengguna publik yang ingin clone repository, menjalankan project secara lokal, lalu menyesuaikannya untuk kebutuhan sendiri.

## Apa yang ada di project ini

Fitur utama yang sudah tersedia:

- Halaman login untuk HR
- Halaman login terpisah untuk employee
- Dashboard ringkasan HR
- Modul employee management
- Modul attendance management
- Modul leave management
- Modul organization management
- Layout admin yang responsive
- Route guard berbasis role
- Integrasi API menggunakan Angular `HttpClient`

## Tech stack

- Angular 21
- TypeScript
- Tailwind CSS v4
- PostCSS
- Flowbite Angular
- ng-primitives
- RxJS
- Vitest

## Sebelum mulai

Pastikan di komputer Anda sudah tersedia:

- Node.js versi LTS
- npm
- Backend API yang bisa diakses dari frontend

Secara default, project ini mengarah ke:

```text
http://localhost:3000/api
```

Konfigurasi endpoint saat ini ada di:

`src/app/core/constants/api.constants.ts`

## Quick start

### 1. Clone repository

```bash
git clone <url-repository-anda>
cd corehr-frontend
```

### 2. Install dependency

```bash
npm install
```

### 3. Pastikan backend API berjalan

Frontend ini membutuhkan backend untuk proses login dan pengambilan data modul seperti employee, attendance, leave, dan organization.

Jika backend Anda tidak berjalan di `http://localhost:3000/api`, ubah nilai berikut:

```ts
export const API_BASE_URL = 'http://localhost:3000/api';
```

File:

`src/app/core/constants/api.constants.ts`

### 4. Jalankan aplikasi

```bash
npm start
```

Setelah itu buka:

```text
http://localhost:4200
```

## Alur penggunaan pertama

Saat aplikasi dibuka, route awal akan diarahkan ke halaman login:

- `/login` untuk HR
- `/employee-login` untuk employee

Setelah login berhasil:

- akun HR diarahkan ke dashboard dan modul admin
- akun employee diarahkan ke halaman sesuai role

Session login disimpan di browser agar pengguna tetap terautentikasi selama sesi masih aktif.

## Modul yang tersedia

Project ini sudah memiliki struktur frontend untuk beberapa area utama:

- `Dashboard`
  Menampilkan ringkasan informasi HR dan pintasan ke modul utama.
- `Employees`
  Untuk melihat, menambah, mengubah, dan mengelola data karyawan.
- `Attendance`
  Untuk memantau dan mengelola data absensi.
- `Leave`
  Untuk membuat, meninjau, dan memproses pengajuan cuti.
- `Organization`
  Untuk mengelola departemen, posisi, dan jenis cuti.

## Struktur project

Berikut struktur utama folder aplikasi:

```text
src/app/
  core/
    constants/
    guards/
    interceptors/
    models/
    services/
    utils/
  features/
    auth/
    dashboard/
    employees/
    attendance/
    leave/
    organization/
  layout/
    auth-layout/
    dashboard-layout/
    page-header/
    sidebar/
    topbar/
  shared/
    components/
    types/
    ui/
    utils/
```

## Script yang bisa digunakan

Menjalankan development server:

```bash
npm start
```

Build production:

```bash
npm run build
```

Menjalankan test:

```bash
npm test
```

Build mode watch:

```bash
npm run watch
```

## Menyesuaikan project ini

Jika Anda ingin menggunakan project ini sebagai dasar aplikasi sendiri, titik awal yang paling penting biasanya:

1. Ubah `API_BASE_URL` agar sesuai dengan backend Anda.
2. Sesuaikan flow login dan struktur respons API pada service auth.
3. Sesuaikan model data pada modul employee, attendance, leave, dan organization.
4. Ubah branding seperti nama aplikasi, teks login, dan warna tema.

Beberapa file yang biasanya pertama kali diedit:

- `src/app/core/constants/api.constants.ts`
- `src/app/core/constants/app-shell.constants.ts`
- `src/app/core/services/auth-api.service.ts`
- `src/styles.css`

## Troubleshooting

### Login gagal

Hal yang paling sering menjadi penyebab:

- backend belum berjalan
- `API_BASE_URL` belum sesuai
- format respons login dari backend berbeda dengan yang diharapkan frontend

### Halaman terbuka tetapi data kosong

Biasanya berarti request API berhasil dipanggil tetapi endpoint data belum tersedia, responsnya berbeda, atau data dari backend memang belum ada.

### Ingin ganti port atau host backend

Edit file:

`src/app/core/constants/api.constants.ts`

## Build untuk production

Untuk membuat hasil build production:

```bash
npm run build
```

Hasil build akan tersedia di folder `dist/`.

## Catatan

Project ini saat ini belum memakai sistem environment terpisah untuk base URL API. Endpoint masih disimpan dalam konstanta sederhana, jadi jika Anda ingin deployment ke beberapa environment, langkah berikutnya yang disarankan adalah memindahkan konfigurasi API ke setup environment yang lebih fleksibel.
