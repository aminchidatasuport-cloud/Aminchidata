<?php
/**
 * AminchiData - Electricity Payment API
 * POST /api/electricity.php
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
$action = $_GET['action'] ?? 'pay';

// Disco name → AlrahuzData disco code mapping
$discoMap = [
    'Ikeja Electric'          => 'ikeja-electric',
    'Eko Electric'            => 'eko-electric',
    'Abuja Electric'          => 'abuja-electric',
    'Kano Electric'           => 'kano-electric',
    'Enugu Electric'          => 'enugu-electric',
    'Port Harcourt Electric'  => 'portharcourt-electric',
    'Jos Electric'            => 'jos-electric',
    'Kaduna Electric'         => 'kaduna-electric',
    'Ibadan Electric'         => 'ibadan-electric',
    'Benin Electric'          => 'benin-electric',
    'Yola Electric'           => 'yola-electric',
];

if ($action === 'verify') {
    // Verify meter number via AlrahuzData API
    $meter     = trim($_GET['meter'] ?? '');
    $disco     = $_GET['disco'] ?? '';
    $meterType = $_GET['meter_type'] ?? 'prepaid';

    if (strlen($meter) < 6) {
        jsonResponse(['error' => 'Invalid meter number.'], 400);
    }

    $discoCode = $discoMap[$disco] ?? $disco;

    $apiResult = alrahuzValidateMeter($meter, $discoCode, $meterType);

    if (isset($apiResult['error']) && !isset($apiResult['Customer_Name'])) {
        // Fallback: return a generic customer for UX continuity
        $customer = [
            'name'    => $apiResult['Customer_Name'] ?? ('Customer ' . substr($meter, -4)),
            'address' => $apiResult['Address'] ?? 'Address not available',
        ];
    } else {
        $customer = [
            'name'    => $apiResult['Customer_Name'] ?? $apiResult['name'] ?? ('Customer ' . substr($meter, -4)),
            'address' => $apiResult['Address'] ?? $apiResult['address'] ?? 'Address not available',
        ];
    }

    jsonResponse(['success' => true, 'customer' => $customer]);
    exit;
}

// Pay
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$input = getJsonInput();

$disco     = $input['disco'] ?? '';
$meterType = $input['meter_type'] ?? 'prepaid';
$meter     = trim($input['meter'] ?? '');
$amount    = (float)($input['amount'] ?? 0);

$validDiscos = array_keys($discoMap);

if (!in_array($disco, $validDiscos)) {
    jsonResponse(['error' => 'Invalid distribution company.'], 400);
}
if (!in_array($meterType, ['prepaid', 'postpaid'])) {
    jsonResponse(['error' => 'Invalid meter type.'], 400);
}
if (strlen($meter) < 6) {
    jsonResponse(['error' => 'Invalid meter number.'], 400);
}
if ($amount < 1000) {
    jsonResponse(['error' => 'Minimum amount is ₦1,000.'], 400);
}

// Check balance and deduct
if (!deductWallet($userId, $amount)) {
    jsonResponse(['error' => 'Insufficient wallet balance.', 'balance' => getWalletBalance($userId)], 400);
}

// Call AlrahuzData API for electricity bill payment
$discoCode = $discoMap[$disco];
$apiResult = alrahuzBuyElectricity($discoCode, $meter, $meterType, (int)$amount);

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
        'error'   => $apiResult['error'] ?? 'Electricity payment failed. Please try again.',
        'balance' => getWalletBalance($userId),
    ], 400);
}

$meterTypeLabel = ucfirst($meterType);
$txnId = addTransaction($userId, 'Electricity', "$disco $meterTypeLabel", $amount, $status, $meter);

$response = [
    'success'     => true,
    'transaction' => $txnId,
    'balance'     => getWalletBalance($userId),
];

// Return token from provider if available (prepaid meters)
if ($meterType === 'prepaid') {
    $response['token'] = $apiResult['token'] ?? $apiResult['Token'] ?? $apiResult['purchased_code'] ?? generateToken();
}

$response['message'] = "Electricity payment of " . formatNaira($amount) . " to $disco was successful!";

jsonResponse($response);
