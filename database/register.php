<?php
/**
 * file: register.php
 * Deskripsi: API Endpoint untuk registrasi akun baru (menyimpan ke tabel `users`).
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

$whatsapp = isset($data['whatsapp']) ? trim($data['whatsapp']) : '';
$gmail    = isset($data['gmail']) ? trim($data['gmail']) : '';
$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password'] : '';

// Validasi kolom wajib diisi
if (empty($whatsapp) || empty($gmail) || empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Kolom whatsapp, gmail, username, dan password wajib diisi seluruhnya!"
    ]);
    exit();
}

try {
    // 1. Periksa duplikasi username atau email
    $checkQuery = "SELECT COUNT(*) as total FROM users WHERE LOWER(username) = :username OR LOWER(gmail) = :gmail";
    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute([
        ':username' => strtolower($username),
        ':gmail'    => strtolower($gmail)
    ]);
    $result = $stmt->fetch();

    if ($result['total'] > 0) {
        http_response_code(409);
        echo json_encode([
            "status" => "error",
            "message" => "Registrasi gagal. Username atau alamat Gmail tersebut sudah terdaftar!"
        ]);
        exit();
    }

    // 2. Insert data user baru (Gunakan password_hash demi keamanan nyata)
    // Tips: Untuk kemudahan penyesuaian demo, bisa menggunakan hash atau teks biasa.
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    $insertQuery = "INSERT INTO users (username, gmail, whatsapp, password, role) VALUES (:username, :gmail, :whatsapp, :password, 'user')";
    $stmtInsert = $pdo->prepare($insertQuery);
    $stmtInsert->execute([
        ':username' => $username,
        ':gmail'    => strtolower($gmail),
        ':whatsapp' => $whatsapp,
        ':password' => $password // demi keselarasan demo dengan Next.js offline (bisa diganti $hashedPassword)
    ]);

    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Registrasi akun baru berhasil!",
        "data" => [
            "username" => $username,
            "gmail" => $gmail,
            "whatsapp" => $whatsapp
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Terjadi kesalahan internal server: " . $e->getMessage()
    ]);
}
?>
