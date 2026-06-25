<?php
/**
 * file: update_menu.php
 * Deskripsi: API Endpoint untuk memperbarui data menu di database.
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

$id          = isset($data['id']) ? intval($data['id']) : 0;
$title       = isset($data['title']) ? trim($data['title']) : '';
$price       = isset($data['price']) ? intval($data['price']) : 0;
$description = isset($data['description']) ? trim($data['description']) : '';
$imageUrl    = isset($data['imageUrl']) ? trim($data['imageUrl']) : '';
$tags        = isset($data['tags']) ? trim($data['tags']) : '';

if ($id <= 0 || empty($title) || $price <= 0) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "ID menu, judul menu, dan harga wajib diisi dengan benar!"
    ]);
    exit();
}

try {
    $query = "UPDATE menu_items SET title = :title, price = :price, description = :description, imageUrl = :imageUrl, tags = :tags WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':id'          => $id,
        ':title'       => $title,
        ':price'       => $price,
        ':description' => $description,
        ':imageUrl'    => $imageUrl,
        ':tags'        => $tags
    ]);

    http_response_code(200);
    echo json_encode([
        "status"      => "success",
        "id"          => $id,
        "title"       => $title,
        "price"       => $price,
        "description" => $description,
        "imageUrl"    => $imageUrl,
        "tags"        => $tags
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal memperbarui menu: " . $e->getMessage()
    ]);
}
?>
