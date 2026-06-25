<?php
/**
 * file: get_menu.php
 * Deskripsi: API Endpoint untuk mengambil seluruh menu aktif dari database.
 */

require_once 'koneksi.php';

try {
    // Jalankan query SQL
    $stmt = $pdo->prepare("SELECT id, title, price, description, imageUrl, tags FROM menu_items ORDER BY id ASC");
    $stmt->execute();
    $items = $stmt->fetchAll();
    
    // Kembalikan output JSON
    http_response_code(200);
    echo json_encode($items);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal memuat menu: " . $e->getMessage()
    ]);
}
?>
