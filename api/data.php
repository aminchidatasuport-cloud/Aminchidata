<?php
/**
 * AminchiData - Data Purchase API
 * POST /api/data.php
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

$network  = $input['network'] ?? '';
$planName = $input['plan_name'] ?? '';
$planId   = (int)($input['plan_id'] ?? 0);
$price    = (float)($input['price'] ?? 0);
$phone    = trim($input['phone'] ?? '');

// Network name → AlrahuzData network ID mapping
$networkIds = ['MTN' => 1, 'Glo' => 2, '9mobile' => 3, 'Airtel' => 4];

// Validate
if (!isset($networkIds[$network])) {
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

// Call AlrahuzData API to deliver data bundle
$apiResult = alrahuzBuyData($networkIds[$network], $phone, $planId);

// Determine transaction status from provider response
$status = 'Pending';
if (isset($apiResult['Status']) && strtolower($apiResult['Status']) === 'successful') {
    $status = 'Success';
} elseif (isset($apiResult['status']) && strtolower((string)$apiResult['status']) === 'success') {
    $status = 'Success';
} elseif (isset($apiResult['error']) && !isset($apiResult['Status'])) {
    // Provider returned an error – refund the user
    fundWallet($userId, $price);
    jsonResponse([
        'error'   => $apiResult['error'] ?? 'Data purchase failed. Please try again.',
        'balance' => getWalletBalance($userId),
    ], 400);
}

$txnId = addTransaction($userId, 'Data', "$network $planName Data", $price, $status, $phone);

jsonResponse([
    'success'     => true,
    'transaction' => $txnId,
    'message'     => "$network $planName data sent to $phone successfully!",
    'balance'     => getWalletBalance($userId),
]);
