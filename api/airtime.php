<?php
/**
 * AminchiData - Airtime Purchase API
 * POST /api/airtime.php
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/alrahuzdata.php';

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

// Network name → AlrahuzData network ID mapping
$networkIds = ['MTN' => 1, 'Glo' => 2, '9mobile' => 3, 'Airtel' => 4];

// Validate
if (!isset($networkIds[$network])) {
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

// Call AlrahuzData API to deliver airtime
$apiResult = alrahuzBuyAirtime($networkIds[$network], $phone, (int)$amount);

// Determine transaction status from provider response
$status = 'Pending';
if (isset($apiResult['Status']) && strtolower($apiResult['Status']) === 'successful') {
    $status = 'Success';
} elseif (isset($apiResult['status']) && strtolower((string)$apiResult['status']) === 'success') {
    $status = 'Success';
} elseif (isset($apiResult['error']) && !isset($apiResult['Status'])) {
    // Provider returned an error – refund the user
    fundWallet($userId, $amount);
    jsonResponse([
        'error'   => $apiResult['error'] ?? 'Airtime purchase failed. Please try again.',
        'balance' => getWalletBalance($userId),
    ], 400);
}

$txnId = addTransaction($userId, 'Airtime', "$network Airtime", $amount, $status, $phone);

jsonResponse([
    'success'     => true,
    'transaction' => $txnId,
    'message'     => formatNaira($amount) . " $network airtime sent to $phone successfully!",
    'balance'     => getWalletBalance($userId),
]);
