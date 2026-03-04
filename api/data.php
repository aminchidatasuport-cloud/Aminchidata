<?php
/**
 * AminchiData - Data Purchase API
 * POST /api/data.php
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');
initSession();

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Authentication required.'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$userId = $_SESSION['user_id'];
$input  = getJsonInput();

$network = $input['network'] ?? '';
$planName = $input['plan_name'] ?? '';
$price   = (float)($input['price'] ?? 0);
$phone   = trim($input['phone'] ?? '');

// Validate
if (!in_array($network, ['MTN', 'Airtel', 'Glo', '9mobile'])) {
    jsonResponse(['error' => 'Invalid network selected.'], 400);
}
if (!$planName || $price <= 0) {
    jsonResponse(['error' => 'Invalid data plan.'], 400);
}
if (!isValidNigerianPhone($phone)) {
    jsonResponse(['error' => 'Enter a valid Nigerian phone number.'], 400);
}

// Check balance and deduct
if (!deductWallet($userId, $price)) {
    jsonResponse(['error' => 'Insufficient wallet balance.', 'balance' => getWalletBalance($userId)], 400);
}

// TODO: Call VTU provider API to deliver data bundle.
// For now, simulate success.

$txnId = addTransaction($userId, 'Data', "$network $planName Data", $price, 'Success', $phone);

jsonResponse([
    'success'     => true,
    'transaction' => $txnId,
    'message'     => "$network $planName data sent to $phone successfully!",
    'balance'     => getWalletBalance($userId),
]);
