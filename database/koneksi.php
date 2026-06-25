<?php
/**
 * file: koneksi.php
 * Deskripsi: File koneksi database MySQL menggunakan PDO untuk keamanan tingkat tinggi (anti SQL Injection).
 * Gunakan file ini sebagai koneksi utama pada backend API PHP Anda.
 */

// Konfigurasi koneksi database
$host     = "sql309.infinityfree.com";      // Alamat server database dari InfinityFree
$database = "if0_42224387_Kroket_grapes_ykt";  // Nama database MySQL Anda
$username = "if0_42224387";                 // Username MySQL Anda
$password = "sIBWdndAdf7";                 // Password MySQL Anda
$port     = 3306;                           // Port MySQL standar

// Header responses untuk CORS agar Next.js dapat mengakses secara lintas domain (Cross-Origin)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request OPTIONS untuk CORS keamanan modern
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Membuat koneksi PDO
    $dsn = "mysql:host=$host;dbname=$database;port=$port;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $pdo = new PDO($dsn, $username, $password, $options);
    
} catch (PDOException $e) {
    // Jika koneksi gagal, kembalikan respon error JSON
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Koneksi database gagal: " . $e->getMessage()
    ]);
    exit();
}
?>
