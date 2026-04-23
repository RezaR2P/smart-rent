CREATE DATABASE smart_rent_db;
USE smart_rent_db;

-- 1. Tabel Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Categories (Opsional tapi bagus untuk organisasi)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);

-- 3. Tabel Items (Barang yang disewakan)
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Tabel Rentals (Inti dari Logika Bisnis)
CREATE TABLE rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    penalty_fee DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('pending', 'active', 'completed', 'overdue', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- 5. Tabel Payments (Untuk bukti bayar)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rental_id INT,
    payment_method VARCHAR(50),
    payment_proof_url VARCHAR(255), -- Link foto bukti transfer
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
);

-- 1. Isi Tabel Categories
INSERT INTO categories (category_name) VALUES 
('Alat Camping'), 
('Fotografi'), 
('Alat Pertukangan');

-- 2. Isi Tabel Items (Menggunakan ID dari kategori di atas)
-- Kategori 1: Alat Camping, 2: Fotografi, 3: Alat Pertukangan
INSERT INTO items (category_id, item_name, description, price_per_day, stock, image_url) VALUES 
(1, 'Tenda Kapasitas 4 Orang', 'Tenda waterproof merk Eiger kualitas premium', 50000.00, 5, 'tenda_eiger.jpg'),
(1, 'Carrier 60L', 'Tas gunung nyaman untuk pendakian jauh', 35000.00, 8, 'carrier_60l.jpg'),
(2, 'Kamera Sony A6400', 'Kamera mirrorless untuk video & foto profesional', 150000.00, 2, 'sony_a6400.jpg'),
(3, 'Bor Listrik Bosch', 'Bor kuat untuk beton dan kayu', 45000.00, 3, 'bor_bosch.jpg');

-- 3. Isi Tabel Users
-- Password di bawah hanyalah placeholder, nanti di aplikasi asli harus menggunakan Bcrypt/Argon2
INSERT INTO users (username, email, password, role) VALUES 
('admin_reza', 'admin@rent.com', 'admin123', 'admin'),
('budi_pelanggan', 'budi@mail.com', 'user123', 'user'),
('siti_pelanggan', 'siti@mail.com', 'user123', 'user');

-- 4. Isi Tabel Rentals (Contoh Transaksi)
-- User Budi (ID 2) menyewa Tenda (ID 1) selama 3 hari
INSERT INTO rentals (user_id, item_id, start_date, end_date, total_price, status) VALUES 
(2, 1, '2026-05-01', '2026-05-04', 150000.00, 'pending');

-- 5. Isi Tabel Payments (Contoh Pembayaran untuk Rental ID 1)
INSERT INTO payments (rental_id, payment_method, payment_proof_url, payment_status) VALUES 
(1, 'Transfer Bank BCA', 'bukti_bayar_budi.jpg', 'unpaid');

select * from categories,items,payments,rentals,users;d

-- Tambah Kategori
-- INSERT INTO categories (category_name) VALUES ('Alat Camping'), ('Kamera');

-- -- Tambah Barang
-- INSERT INTO items (category_name, item_name, price_per_day, stock) 
-- VALUES (1, 'Tenda Kapasitas 4 Orang', 50000.00, 5);

-- -- Tambah Admin & User (Password nanti dihash di Node.js)
-- INSERT INTO users (username, email, password, role) 
-- VALUES ('admin_reza', 'admin@mail.com', 'hashed_password', 'admin'),
--        ('customer_test', 'user@mail.com', 'hashed_password', 'user');