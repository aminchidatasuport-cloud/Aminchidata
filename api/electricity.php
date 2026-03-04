<?php
/**
 * AminchiData - Electricity Payment API
 * POST /api/electricity.php
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');
initSession();

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Authentication required.'], 401);
}

$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? 'pay';

if ($action === 'verify') {
    // Verify meter number
    $meter = trim($_GET['meter'] ?? '');
    if (strlen($meter) < 6) {
        jsonResponse(['error' => 'Invalid meter number.'], 400);
    }

    // TODO: Call electricity provider API to verify meter.
    // Mock verification for now.
    $mockCustomers = [
        '12345678901' => ['name' => 'Abubakar Musa', 'address' => '12 Adeola Street, Lagos'],
        '09876543210' => ['name' => 'Ngozi Okafor', 'address' => '5 Marina Close, Abuja'],
        '11223344556' => ['name' => 'Emeka Johnson', 'address' => '8 Ring Road, Kano'],
    ];

    $customer = $mockCustomers[$meter] ?? [
        'name'    => 'Customer ' . substr($meter, -4),
        'address' => 'Address not available',
    ];

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

$validDiscos = [
    'Ikeja Electric', 'Eko Electric', 'Abuja Electric', 'Kano Electric',
    'Enugu Electric', 'Port Harcourt Electric', 'Jos Electric',
    'Kaduna Electric', 'Ibadan Electric', 'Benin Electric', 'Yola Electric',
];

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

// TODO: Call electricity provider API.
// For now, simulate success.

$meterTypeLabel = ucfirst($meterType);
$txnId = addTransaction($userId, 'Electricity', "$disco $meterTypeLabel", $amount, 'Success', $meter);

$response = [
    'success'     => true,
    'transaction' => $txnId,
    'balance'     => getWalletBalance($userId),
];

if ($meterType === 'prepaid') {
    $response['token'] = generateToken();
}

$response['message'] = "Electricity payment of " . formatNaira($amount) . " to $disco was successful!";

jsonResponse($response);
