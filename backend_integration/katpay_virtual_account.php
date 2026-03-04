<?php
/**
 * AminchiData – Katpay Virtual Account Creation (Admin/Dev Reference)
 * ===================================================================
 * This file is a STANDALONE reference script for admins and developers.
 * It is NOT called directly by end-users; it demonstrates the Katpay
 * virtual-account API and is already integrated into the application via
 * includes/katpay.php and includes/auth.php.
 *
 * SECURITY: Keep this file and the credentials it contains out of
 * publicly accessible web directories.  Never expose apiKey or apiSecret
 * in frontend / client-side code.
 *
 * Integration points in the application:
 *   - includes/katpay.php        → service functions (createKatpayVirtualAccount, etc.)
 *   - includes/auth.php          → auto-called on new user registration
 *   - api/wallet.php             → GET ?action=virtual_account  (authenticated endpoint)
 *   - database/schema.sql        → virtual_accounts table
 *
 * Usage (CLI, for testing):
 *   php backend_integration/katpay_virtual_account.php
 */

// ---------------------------------------------------------------------------
// Credentials – ALWAYS use environment variables in production.
// Never commit real credentials to version control.
// The application reads these from config/app.php which falls back to
// environment variables set on the server.
// ---------------------------------------------------------------------------
$apiKey     = getenv('KATPAY_API_KEY')     ?: 'YOUR_KATPAY_API_KEY';
$apiSecret  = getenv('KATPAY_API_SECRET')  ?: 'YOUR_KATPAY_API_SECRET';
$merchantID = getenv('KATPAY_MERCHANT_ID') ?: 'YOUR_KATPAY_MERCHANT_ID';

// ---------------------------------------------------------------------------
// Example payload – replace with real user data when calling programmatically.
// ---------------------------------------------------------------------------
$data = [
    'email'       => 'user@example.com',
    'name'        => 'Test User',
    'phoneNumber' => '08012345678',
    'bankCode'    => ['PALMPAY'],
    'merchantID'  => $merchantID,
];

$headers = [
    'Authorization: Bearer ' . $apiSecret,
    'Content-Type: application/json',
    'api-key: ' . $apiKey,
];

// ---------------------------------------------------------------------------
// Make the API request
// ---------------------------------------------------------------------------
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => 'https://api.katpay.co/v1/virtual-accounts',
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($data),
    CURLOPT_HTTPHEADER     => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// ---------------------------------------------------------------------------
// Handle the response
// ---------------------------------------------------------------------------
if ($response === false) {
    echo 'cURL error: ' . $curlError . PHP_EOL;
    exit(1);
}

$result = json_decode($response, true);

if ($httpCode >= 200 && $httpCode < 300) {
    echo 'Virtual account created successfully:' . PHP_EOL;
    echo json_encode($result, JSON_PRETTY_PRINT) . PHP_EOL;
} else {
    echo 'Error (HTTP ' . $httpCode . '):' . PHP_EOL;
    echo json_encode($result, JSON_PRETTY_PRINT) . PHP_EOL;
    exit(1);
}
