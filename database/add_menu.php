<?php
/**
 * file: add_menu.php
 * Deskripsi: API Endpoint untuk menambahkan menu baru ke database.
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

$title       = isset($data['title']) ? trim($data['title']) : '';
$price       = isset($data['price']) ? intval($data['price']) : 0;
$description = isset($data['description']) ? trim($data['description']) : '';
$imageUrl    = isset($data['imageUrl']) ? trim($data['imageUrl']) : '';
$tags        = isset($data['tags']) ? trim($data['tags']) : '';

if (empty($title) || $price <= 0) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Judul menu dan harga wajib diisi dengan benar!"
    ]);
    exit();
}

try {
    $query = "INSERT INTO menu_items (title, price, description, imageUrl, tags) VALUES (:title, :price, :description, :imageUrl, :tags)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':title'       => $title,
        ':price'       => $price,
        ':description' => $description,
        ':imageUrl'    => $imageUrl,
        ':tags'        => $tags
    ]);

    $newId = $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        "status"      => "success",
        "id"          => $newId,
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
        "message" => "Gagal menambahkan menu: " . $e->getMessage()
    ]);
}
?>
