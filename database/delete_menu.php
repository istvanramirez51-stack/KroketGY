<?php
/**
 * file: delete_menu.php
 * Deskripsi: API Endpoint untuk menghapus menu dari database berdasarkan ID.
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

if (empty($data)) {
    $data = $_POST;
}

$id = isset($data['id']) ? intval($data['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "ID menu tidak valid!"
    ]);
    exit();
}

try {
    $query = "DELETE FROM menu_items WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':id' => $id]);

    http_response_code(200);
    echo json_encode([
        "status"  => "success",
        "message" => "Menu berhasil dihapus dari database."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal menghapus menu: " . $e->getMessage()
    ]);
}
?>
