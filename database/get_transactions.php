<?php
/**
 * file: get_transactions.php
 * Deskripsi: API Endpoint untuk mengambil seluruh daftar transaksi beserta rincian itemnya dari database.
 */

require_once 'koneksi.php';

// Hanya izinkan request GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Metode request tidak diizinkan. Gunakan GET."
    ]);
    exit();
}

try {
    // 1. Ambil semua transaksi diurutkan dari yang terbaru (berdasarkan created_at)
    $queryTx = "SELECT * FROM transactions ORDER BY created_at DESC";
    $stmtTx = $pdo->query($queryTx);
    $transactions = $stmtTx->fetchAll(PDO::FETCH_ASSOC);

    $result = [];

    foreach ($transactions as $tx) {
        $txId = $tx['id'];

        // 2. Ambil detail items untuk masing-masing transaksi
        $queryItems = "SELECT menu_item_id as id, title, price, quantity FROM transaction_items WHERE transaction_id = :tx_id";
        $stmtItems = $pdo->prepare($queryItems);
        $stmtItems->execute([':tx_id' => $txId]);
        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        // Format data sesuai dengan interface React/TypeScript
        $result[] = [
            "id"           => $tx['id'],
            "date"         => date('j M Y, H:i', strtotime($tx['created_at'])), // Format tanggal readable
            "customerName" => $tx['customerName'],
            "phone"        => $tx['phone'],
            "address"      => $tx['address'],
            "subtotal"     => intval($tx['subtotal']),
            "deliveryFee"  => intval($tx['deliveryFee']),
            "total"        => intval($tx['total']),
            "splitCount"   => intval($tx['splitCount']),
            "splitResult"  => intval($tx['splitResult']),
            "status"       => $tx['status'],
            "whatsappLink" => $tx['whatsappLink'] ?: '',
            "items"        => array_map(function($it) {
                return [
                    "id"       => intval($it['id']),
                    "title"    => $it['title'],
                    "price"    => intval($it['price']),
                    "quantity" => intval($it['quantity'])
                ];
            }, $items)
        ];
    }

    http_response_code(200);
    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal mengambil data transaksi: " . $e->getMessage()
    ]);
}
?>
