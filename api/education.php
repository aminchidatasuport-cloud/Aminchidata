<?php
/**
 * AminchiData - Education Pins API
 * POST /api/education.php
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/alrahuzdata.php';

header('Content-Type: application/json');
initSession();

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Authentication required.'], 401);
}

$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? 'buy';

if ($action === 'history') {
    // Return purchased PINs
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM education_pins WHERE user_id = ? ORDER BY created_at DESC LIMIT 20');
    $stmt->execute([$userId]);
    jsonResponse(['pins' => $stmt->fetchAll()]);
    exit;
}

// Buy PIN
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$input = getJsonInput();

$service  = $input['service'] ?? '';
$quantity = (int)($input['quantity'] ?? 1);

$services = [
    'WAEC'   => ['name' => 'WAEC', 'fullName' => 'West African Examinations Council', 'price' => 3500, 'exam_type' => 1],
    'NECO'   => ['name' => 'NECO', 'fullName' => 'National Examinations Council', 'price' => 1000, 'exam_type' => 2],
    'NABTEB' => ['name' => 'NABTEB', 'fullName' => 'National Business & Technical Examinations Board', 'price' => 1000, 'exam_type' => 3],
];

if (!isset($services[$service])) {
    jsonResponse(['error' => 'Invalid examination service.'], 400);
}
if ($quantity < 1 || $quantity > 10) {
    jsonResponse(['error' => 'Quantity must be between 1 and 10.'], 400);
}

$info  = $services[$service];
$total = $info['price'] * $quantity;

// Check balance and deduct
if (!deductWallet($userId, $total)) {
    jsonResponse(['error' => 'Insufficient wallet balance.', 'balance' => getWalletBalance($userId)], 400);
}

// Call AlrahuzData API to purchase education PIN
$apiResult = alrahuzBuyEducationPin($info['exam_type'], $quantity);

$db   = getDB();
$pins = [];

// Check if provider returned pins
$providerPins = $apiResult['pins'] ?? $apiResult['cards'] ?? $apiResult['data'] ?? null;

if (is_array($providerPins) && !empty($providerPins)) {
    // Use real pins from the provider
    foreach ($providerPins as $providerPin) {
        $pin    = $providerPin['pin'] ?? $providerPin['Pin'] ?? $providerPin['token'] ?? '';
        $serial = $providerPin['serial'] ?? $providerPin['Serial'] ?? $providerPin['serial_number'] ?? '';

        $stmt = $db->prepare('INSERT INTO education_pins (user_id, service, pin, serial_number, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([$userId, $service, $pin, $serial]);

        $pins[] = ['id' => $db->lastInsertId(), 'service' => $service, 'pin' => $pin, 'serial' => $serial];
    }
} elseif (isset($apiResult['error']) && !isset($apiResult['Status'])) {
    // Provider error – refund the user
    fundWallet($userId, $total);
    jsonResponse([
        'error'   => $apiResult['error'] ?? 'Education pin purchase failed. Please try again.',
        'balance' => getWalletBalance($userId),
    ], 400);
} else {
    // Provider succeeded but returned pin(s) in an unexpected format
    for ($i = 0; $i < $quantity; $i++) {
        $pin    = $apiResult['pin'] ?? $apiResult['Pin'] ?? $apiResult['token'] ?? generatePin();
        $serial = $apiResult['serial'] ?? $apiResult['Serial'] ?? $apiResult['serial_number'] ?? generateSerial();

        $stmt = $db->prepare('INSERT INTO education_pins (user_id, service, pin, serial_number, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([$userId, $service, $pin, $serial]);

        $pins[] = ['id' => $db->lastInsertId(), 'service' => $service, 'pin' => $pin, 'serial' => $serial];
    }
}

$txnId = addTransaction($userId, 'Education', "{$info['name']} Result Checker (×{$quantity})", $total, 'Success');

jsonResponse([
    'success'     => true,
    'pins'        => $pins,
    'transaction' => $txnId,
    'balance'     => getWalletBalance($userId),
]);
