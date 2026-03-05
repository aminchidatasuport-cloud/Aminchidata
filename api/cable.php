<?php
/**
 * AminchiData - Cable TV Subscription API
 * POST /api/cable.php          – Buy cable subscription
 * GET  /api/cable.php?action=validate&iuc=...&provider=...  – Validate IUC
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

// Cable provider display name → AlrahuzData code mapping
$providerMap = [
    'DSTV'      => 'dstv',
    'GOTV'      => 'gotv',
    'Startimes' => 'startimes',
];

// ---- Validate IUC (smartcard / decoder number) ----
if ($action === 'validate') {
    $iuc      = trim($_GET['iuc'] ?? '');
    $provider = $_GET['provider'] ?? '';

    if (strlen($iuc) < 8) {
        jsonResponse(['error' => 'Invalid IUC / smartcard number.'], 400);
    }
    if (!isset($providerMap[$provider])) {
        jsonResponse(['error' => 'Invalid cable provider.'], 400);
    }

    $apiResult = alrahuzValidateIUC($iuc, $providerMap[$provider]);

    if (isset($apiResult['error']) && !isset($apiResult['Customer_Name'])) {
        jsonResponse([
            'success'  => false,
            'error'    => $apiResult['error'] ?? 'Could not validate smartcard. Please check the number.',
        ], 400);
    }

    $customer = [
        'name'       => $apiResult['Customer_Name'] ?? $apiResult['name'] ?? ('Customer ' . substr($iuc, -4)),
        'due_date'   => $apiResult['Due_Date'] ?? $apiResult['due_date'] ?? '',
        'status'     => $apiResult['Status'] ?? $apiResult['status'] ?? '',
        'customer_type' => $apiResult['Customer_Type'] ?? '',
    ];

    jsonResponse(['success' => true, 'customer' => $customer]);
    exit;
}

// ---- Buy Cable Subscription ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$input = getJsonInput();

$provider   = $input['provider'] ?? '';
$iuc        = trim($input['iuc'] ?? '');
$planId     = (int)($input['plan_id'] ?? 0);
$planName   = $input['plan_name'] ?? '';
$price      = (float)($input['price'] ?? 0);

// Validate
if (!isset($providerMap[$provider])) {
    jsonResponse(['error' => 'Invalid cable provider.'], 400);
}
if (strlen($iuc) < 8) {
    jsonResponse(['error' => 'Invalid IUC / smartcard number.'], 400);
}
if ($planId <= 0 || $price <= 0) {
    jsonResponse(['error' => 'Invalid cable plan.'], 400);
}

// Check balance and deduct
if (!deductWallet($userId, $price)) {
    jsonResponse(['error' => 'Insufficient wallet balance.', 'balance' => getWalletBalance($userId)], 400);
}

// Call AlrahuzData API to subscribe cable
$apiResult = alrahuzBuyCable($providerMap[$provider], $iuc, $planId);

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
        'error'   => $apiResult['error'] ?? 'Cable subscription failed. Please try again.',
        'balance' => getWalletBalance($userId),
    ], 400);
}

$txnId = addTransaction($userId, 'CableTv', "$provider $planName", $price, $status, $iuc);

jsonResponse([
    'success'     => true,
    'transaction' => $txnId,
    'message'     => "$provider $planName subscription was successful!",
    'balance'     => getWalletBalance($userId),
]);
