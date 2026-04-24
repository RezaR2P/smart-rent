-- Ganti ROLE pengguna dengan 'admin' dengan kondisi untuk email '
UPDATE users SET role = 'admin' WHERE email = 'admin123@gmail.com';

CREATE DATABASE smartrent_db;
use smartrent_db;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- View untuk menampilkan profil user tanpa password
CREATE VIEW view_user_profiles AS
SELECT 
    id, 
    name, 
    email, 
    role, 
    created_at
FROM users;


CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price_per_day DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 1,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- View untuk menampilkan katalog barang dengan nama kategori
      CREATE VIEW view_katalog_barang AS
      SELECT 
        i.id, 
        i.name, 
        i.description, 
        i.price_per_day, 
        i.stock, 
        i.image_url, 
        i.created_at,
        c.name AS category_name
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id;

CREATE TABLE rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);

-- View untuk user melihat riwayat rental dengan info item
CREATE VIEW view_user_rentals AS
SELECT 
    r.id, 
    r.user_id,
    r.item_id,
    i.name AS item_name, 
    i.image_url,
    r.start_date,
    r.end_date,
    r.total_price,
    r.status,
    r.created_at
FROM rentals r
JOIN items i ON r.item_id = i.id;

-- View untuk admin melihat semua rental dengan info user dan item
CREATE VIEW view_admin_rentals AS
SELECT 
    r.*, 
    u.name AS user_name, 
    u.email AS user_email, 
    i.name AS item_name
FROM rentals r
JOIN users u ON r.user_id = u.id
JOIN items i ON r.item_id = i.id;

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rental_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  proof_image VARCHAR(255),
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rental_id) REFERENCES rentals(id)
);

INSERT INTO categories (name) VALUES 
('Elektronik'),
('Alat Camping'),
('Kamera'),
('Pakaian Formal'),
('Kendaraan');

INSERT INTO items (category_id, name, description, price_per_day, stock, image_url) VALUES 
(3, 'Kamera Sony A7II', 'Kamera mirrorless full frame dengan lensa 28-70mm.', 250000.00, 3, 'sony_a7ii.jpg'),
(2, 'Tenda Kapasitas 4 Orang', 'Tenda double layer tahan hujan dan angin.', 50000.00, 10, 'tenda_4p.jpg'),
(1, 'Projector Epson EB-X400', 'Proyektor terang 3300 lumens untuk presentasi.', 150000.00, 2, 'projector_epson.jpg'),
(4, 'Jas Hitam Slimfit', 'Jas formal ukuran L lengkap dengan celana.', 75000.00, 5, 'jas_hitam.jpg'),
(5, 'Sepeda Gunung Polygon', 'Sepeda MTB siap pakai untuk medan berat.', 100000.00, 4, 'polygon_mtb.jpg');


-- Daftar pengguna lewat api register agar password terenkripsi
-- INSERT INTO users (name, email, password, role) VALUES 
-- ('Admin SmartRent', 'admin@gmail.com', 'admin123', 'admin'),
-- ('Budi Santoso', 'budi@gmail.com', 'budi123', 'user');

INSERT INTO rentals (user_id, item_id, start_date, end_date, total_price, status) VALUES 
(2, 1, '2026-05-01', '2026-05-03', 500000.00, 'active');

INSERT INTO payments (rental_id, amount, proof_image, status, paid_at) VALUES 
(1, 500000.00, 'bukti_transfer_budi.jpg', 'verified', CURRENT_TIMESTAMP);

SELECT 
    i.name AS nama_barang, 
    c.name AS nama_kategori, 
    i.price_per_day 
FROM items i 
LEFT JOIN categories c ON i.category_id = c.id;