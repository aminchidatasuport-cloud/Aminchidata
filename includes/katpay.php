<?php
/**
 * AminchiData - Katpay Virtual Account Service
 * Handles creation and retrieval of Katpay virtual accounts for wallet funding.
 */

require_once __DIR__ . '/db.php';

/**
 * Create a Katpay virtual account for a user via the Katpay API.
 * Returns the account data array on success, or null on failure.
 */
function createKatpayVirtualAccount(int $userId, string $name, string $email, string $phone): ?array
{
    $cfg = require __DIR__ . '/../config/app.php';
    $katpay = $cfg['katpay'];

    $payload = json_encode([
        'email'       => $email,
        'name'        => $name,
        'phoneNumber' => $phone,
        'bankCode'    => $katpay['bank_codes'],
        'merchantID'  => $katpay['merchant_id'],
    ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $katpay['base_url'] . '/virtual-accounts',
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $katpay['api_secret'],
            'Content-Type: application/json',
            'api-key: ' . $katpay['api_key'],
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
    ]);

    $response  = curl_exec($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false || $httpCode < 200 || $httpCode >= 300) {
        error_log(sprintf(
            '[Katpay] Virtual account creation failed for user %d: HTTP %d, cURL error: %s, response: %s',
            $userId, $httpCode, $curlError, (string)$response
        ));
        return null;
    }

    $data = json_decode($response, true);
    if (!$data) {
        error_log(sprintf('[Katpay] Invalid JSON response for user %d: %s', $userId, $response));
        return null;
    }

    // Validate that the response contains at minimum an account number
    $account = $data['data'] ?? $data;
    $acctNumber = $account['accountNumber'] ?? ($account['account_number'] ?? '');
    if (empty($acctNumber)) {
        error_log(sprintf('[Katpay] Missing account number in API response for user %d: %s', $userId, $response));
        return null;
    }

    // Persist the virtual account in the database
    storeVirtualAccount($userId, $data, $response);

    return $data;
}

/**
 * Persist a Katpay virtual account response in the database.
 */
function storeVirtualAccount(int $userId, array $data, string $rawJson): void
{
    $db = getDB();

    // Katpay wraps account details inside a 'data' key — handle both shapes
    $account     = $data['data'] ?? $data;
    $acctNumber  = $account['accountNumber']  ?? ($account['account_number']  ?? '');
    $acctName    = $account['accountName']    ?? ($account['account_name']    ?? '');
    $bankName    = $account['bankName']       ?? ($account['bank_name']       ?? '');
    $bankCode    = $account['bankCode']       ?? ($account['bank_code']       ?? '');
    $reference   = $account['reference']      ?? ($account['ref']             ?? '');

    if ($reference === '') {
        error_log(sprintf('[Katpay] Missing reference in API response for user %d', $userId));
        $reference = 'KAT_LOCAL_' . $userId . '_' . time();
    }

    $stmt = $db->prepare(
        'INSERT INTO virtual_accounts
            (user_id, account_number, account_name, bank_name, bank_code, reference, raw_response, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
            account_number = VALUES(account_number),
            account_name   = VALUES(account_name),
            bank_name      = VALUES(bank_name),
            bank_code      = VALUES(bank_code),
            reference      = VALUES(reference),
            raw_response   = VALUES(raw_response)'
    );
    $stmt->execute([$userId, $acctNumber, $acctName, $bankName, $bankCode, $reference, $rawJson]);
}

/**
 * Retrieve a stored virtual account for a user, or null if none exists.
 */
function getVirtualAccount(int $userId): ?array
{
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM virtual_accounts WHERE user_id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    return $row ?: null;
}
