<?php
/**
 * file: login.php
 * Deskripsi: API Endpoint untuk validasi masuk pengguna & admin dari database.
 */

require_once 'koneksi.php';

// Hanya izinkan request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Metode request tidak diizinkan. Gunakan POST."
    ]);
    exit();
}

// Ambil input JSON raw
$inputRaw = file_get_contents("php://input");
$data = json_decode($inputRaw, true);

// Fallback ke $_POST jika pengiriman berformat form-data biasa
if (empty($data)) {
    $data = $_POST;
}

$identifier = isset($data['identifier']) ? trim($data['identifier']) : '';
$password   = isset($data['password']) ? $data['password'] : '';

if (empty($identifier) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Username/Gmail dan Password wajib diisi!"
    ]);
    exit();
}

try {
    // Cari user berdasarkan username ATAU email
    $query = "SELECT id, username, gmail, whatsapp, password, role FROM users WHERE LOWER(username) = :id1 OR LOWER(gmail) = :id2";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':id1' => strtolower($identifier),
        ':id2' => strtolower($identifier)
    ]);
    $user = $stmt->fetch();

    if ($user) {
        // Lakukan pencocokan password (mendukung teks murni untuk kecocokan demo atau password_verify untuk keamanan)
        $passwordMatch = ($password === $user['password']) || password_verify($password, $user['password']);

        if ($passwordMatch) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Selamat datang kembali, " . $user['username'] . "!",
                "user" => [
                    "id" => $user['id'],
                    "username" => $user['username'],
                    "gmail" => $user['gmail'],
                    "whatsapp" => $user['whatsapp'],
                    "role" => $user['role']
                ]
            ]);
            exit();
        }
    }

    // Jika tidak cocok
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Username/Gmail atau Kata Sandi Anda salah."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Terjadi kesalahan database: " . $e->getMessage()
    ]);
}
?>
