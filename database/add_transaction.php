<?php
/**
 * file: add_transaction.php
 * Deskripsi: API Endpoint untuk menyimpan data transaksi baru beserta rincian itemnya ke database.
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

$id           = isset($data['id']) ? trim($data['id']) : '';
$customerName = isset($data['customerName']) ? trim($data['customerName']) : '';
$phone        = isset($data['phone']) ? trim($data['phone']) : '';
$address      = isset($data['address']) ? trim($data['address']) : '';
$subtotal     = isset($data['subtotal']) ? intval($data['subtotal']) : 0;
$deliveryFee  = isset($data['deliveryFee']) ? intval($data['deliveryFee']) : 0;
$total        = isset($data['total']) ? intval($data['total']) : 0;
$splitCount   = isset($data['splitCount']) ? intval($data['splitCount']) : 1;
$splitResult  = isset($data['splitResult']) ? intval($data['splitResult']) : 0;
$status       = isset($data['status']) ? trim($data['status']) : 'Diproses';
$whatsappLink = isset($data['whatsappLink']) ? trim($data['whatsappLink']) : '';
$items        = isset($data['items']) ? $data['items'] : [];

if (empty($id) || empty($customerName) || empty($phone) || empty($address) || empty($items)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Data transaksi tidak lengkap (ID, nama, no HP, alamat, dan item wajib diisi)!"
    ]);
    exit();
}

try {
    // Mulai Transaksi Database (PDO Transaction) agar konsisten
    $pdo->beginTransaction();

    // 1. Simpan ke tabel transactions
    $queryTx = "INSERT INTO transactions (id, customerName, phone, address, subtotal, deliveryFee, total, splitCount, splitResult, status, whatsappLink) 
                VALUES (:id, :customerName, :phone, :address, :subtotal, :deliveryFee, :total, :splitCount, :splitResult, :status, :whatsappLink)";
    
    $stmtTx = $pdo->prepare($queryTx);
    $stmtTx->execute([
        ':id'           => $id,
        ':customerName' => $customerName,
        ':phone'        => $phone,
        ':address'      => $address,
        ':subtotal'     => $subtotal,
        ':deliveryFee'  => $deliveryFee,
        ':total'        => $total,
        ':splitCount'   => $splitCount,
        ':splitResult'  => $splitResult,
        ':status'       => $status,
        ':whatsappLink' => $whatsappLink
    ]);

    // 2. Simpan item detail ke tabel transaction_items
    $queryItem = "INSERT INTO transaction_items (transaction_id, menu_item_id, title, price, quantity) 
                  VALUES (:transaction_id, :menu_item_id, :title, :price, :quantity)";
    $stmtItem = $pdo->prepare($queryItem);

    foreach ($items as $item) {
        $menu_item_id = isset($item['id']) ? intval($item['id']) : 0;
        $itemTitle    = isset($item['title']) ? trim($item['title']) : '';
        $itemPrice    = isset($item['price']) ? intval($item['price']) : 0;
        $itemQty      = isset($item['quantity']) ? intval($item['quantity']) : 1;

        $stmtItem->execute([
            ':transaction_id' => $id,
            ':menu_item_id'   => $menu_item_id,
            ':title'          => $itemTitle,
            ':price'          => $itemPrice,
            ':quantity'       => $itemQty
        ]);
    }

    // Commit semua data ke database
    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        "status"  => "success",
        "message" => "Transaksi berhasil disimpan.",
        "id"      => $id
    ]);

} catch (PDOException $e) {
    // Rollback jika ada error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal menyimpan transaksi: " . $e->getMessage()
    ]);
}
?>
