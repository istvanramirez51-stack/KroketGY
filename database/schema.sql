-- ==========================================
-- FILE: schema.sql
-- DESKRIPSI: Skema database MySQL untuk aplikasi JedaKuliah.
-- Petunjuk: Import file ini ke dalam phpMyAdmin atau MySQL client Anda.
-- ==========================================

-- 1. Membuat Database (Opsional - sesuaikan jika sudah ada database)
CREATE DATABASE IF NOT EXISTS `jedakuliah_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `jedakuliah_db`;

-- 2. Tabel Menu Utama (Katalog Makanan Jeda)
CREATE TABLE IF NOT EXISTS `menu_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT 'Nama menu makanan/minuman',
    `price` INT NOT NULL DEFAULT 0 COMMENT 'Harga dalam Rupiah',
    `description` TEXT NULL COMMENT 'Deskripsi detail cita rasa',
    `imageUrl` VARCHAR(512) NULL COMMENT 'Tautan gambar menu',
    `tags` VARCHAR(255) NULL COMMENT 'Tag terpisah koma (e.g. "Terlaris,Ayam,Pedas")',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Transaksi Utama (Checkout)
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Format TRX-XXXX',
    `customerName` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NOT NULL COMMENT 'Nomor WhatsApp pembeli',
    `address` TEXT NOT NULL COMMENT 'Detail alamat pengiriman / lokasi kelas',
    `subtotal` INT NOT NULL DEFAULT 0,
    `deliveryFee` INT NOT NULL DEFAULT 0,
    `total` INT NOT NULL DEFAULT 0,
    `splitCount` INT NOT NULL DEFAULT 1 COMMENT 'Jumlah pembagian patungan',
    `splitResult` INT NOT NULL DEFAULT 0 COMMENT 'Hasil pembagian per kepala',
    `status` ENUM('Diproses', 'dimasak', 'pengantaran', 'Sukses', 'Gagal') NOT NULL DEFAULT 'Diproses',
    `whatsappLink` TEXT NULL COMMENT 'Link direct checkout ke WA',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Detail Item Transaksi (Relasi items pada satu transaksi)
CREATE TABLE IF NOT EXISTS `transaction_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaction_id` VARCHAR(50) NOT NULL,
    `menu_item_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `price` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5. Tabel Pengguna (Users) untuk Registrasi & Login JedaKuliah
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Username unik untuk login',
    `gmail` VARCHAR(150) NOT NULL UNIQUE COMMENT 'Alamat Gmail aktif',
    `whatsapp` VARCHAR(30) NOT NULL COMMENT 'Nomor WhatsApp aktif pembeli',
    `password` VARCHAR(255) NOT NULL COMMENT 'Kata sandi atau password akun',
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT 'Peran akses pengguna',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- SEED DATA: ADMIN DEFAULT
-- ==========================================

-- Seed Akun Admin Default JedaKuliah
INSERT INTO `users` (`id`, `username`, `gmail`, `whatsapp`, `password`, `role`) VALUES
(1, 'admin', 'admin@gmail.com', '08123456789', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`), `password`=VALUES(`password`);
