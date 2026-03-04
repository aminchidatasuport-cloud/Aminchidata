<?php
/**
 * AminchiData - Airtime Purchase API
 * POST /api/airtime.php
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
$phone   = trim($input['phone'] ?? '');
$amount  = (float)($input['amount'] ?? 0);

// Validate
if (!in_array($network, ['MTN', 'Airtel', 'Glo', '9mobile'])) {
    jsonResponse(['error' => 'Invalid network selected.'], 400);
}
if (!isValidNigerianPhone($phone)) {
    jsonResponse(['error' => 'Enter a valid Nigerian phone number.'], 400);
}
if ($amount < 50 || $amount > 50000) {
    jsonResponse(['error' => 'Amount must be between ₦50 and ₦50,000.'], 400);
}

// Check balance and deduct
if (!deductWallet($userId, $amount)) {
    jsonResponse(['error' => 'Insufficient wallet balance.', 'balance' => getWalletBalance($userId)], 400);
}

// TODO: Call VTU provider API to deliver airtime.
// For now, simulate success.

$txnId = addTransaction($userId, 'Airtime', "$network Airtime", $amount, 'Success', $phone);

jsonResponse([
    'success'     => true,
    'transaction' => $txnId,
    'message'     => formatNaira($amount) . " $network airtime sent to $phone successfully!",
    'balance'     => getWalletBalance($userId),
]);
