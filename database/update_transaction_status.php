<?php
/**
 * file: update_transaction_status.php
 * Deskripsi: API Endpoint untuk mengubah status transaksi di database.
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

$id     = isset($data['id']) ? trim($data['id']) : '';
$status = isset($data['status']) ? trim($data['status']) : '';

// Validasi status diperbolehkan sesuai ENUM MySQL
$allowedStatuses = ['Diproses', 'dimasak', 'pengantaran', 'Sukses', 'Gagal'];

if (empty($id) || empty($status) || !in_array($status, $allowedStatuses)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "ID transaksi atau status tidak valid!"
    ]);
    exit();
}

try {
    $query = "UPDATE transactions SET status = :status WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':id'     => $id,
        ':status' => $status
    ]);

    http_response_code(200);
    echo json_encode([
        "status"  => "success",
        "message" => "Status transaksi berhasil diperbarui ke: " . $status,
        "id"      => $id,
        "new_status" => $status
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal memperbarui status transaksi: " . $e->getMessage()
    ]);
}
?>
