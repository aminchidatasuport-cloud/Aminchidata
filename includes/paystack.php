<?php
/**
 * AminchiData - Paystack Payment Gateway Helper
 * Handles payment initialization and verification via the Paystack API.
 */

require_once __DIR__ . '/db.php';

/**
 * Load Paystack configuration.
 */
function getPaystackConfig(): array
{
    $cfg = require __DIR__ . '/../config/app.php';
    return $cfg['paystack'];
}

/**
 * Initialize a Paystack transaction.
 *
 * @param string $email   Customer email address
 * @param float  $amount  Amount in Naira (will be converted to kobo)
 * @param string $reference Unique payment reference
 * @param string $callbackUrl URL Paystack redirects to after payment
 * @return array|null Paystack response data on success, null on failure
 */
function initializePaystackTransaction(string $email, float $amount, string $reference, string $callbackUrl): ?array
{
    $config = getPaystackConfig();

    if (empty($config['secret_key'])) {
        error_log('[Paystack] Secret key not configured.');
        return null;
    }

    $payload = json_encode([
        'email'        => $email,
        'amount'       => (int)($amount * 100), // Convert Naira to kobo
        'reference'    => $reference,
        'callback_url' => $callbackUrl,
        'currency'     => 'NGN',
    ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $config['base_url'] . '/transaction/initialize',
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $config['secret_key'],
            'Content-Type: application/json',
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
            '[Paystack] Initialize failed: HTTP %d, cURL error: %s, response: %s',
            $httpCode, $curlError, (string)$response
        ));
        return null;
    }

    $data = json_decode($response, true);
    if (!$data || empty($data['status'])) {
        error_log(sprintf('[Paystack] Invalid response: %s', $response));
        return null;
    }

    return $data['data'] ?? null;
}

/**
 * Verify a Paystack transaction by reference.
 *
 * @param string $reference The payment reference to verify
 * @return array|null The verified transaction data, or null on failure
 */
function verifyPaystackTransaction(string $reference): ?array
{
    $config = getPaystackConfig();

    if (empty($config['secret_key'])) {
        error_log('[Paystack] Secret key not configured.');
        return null;
    }

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $config['base_url'] . '/transaction/verify/' . rawurlencode($reference),
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $config['secret_key'],
            'Content-Type: application/json',
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
            '[Paystack] Verify failed for ref %s: HTTP %d, cURL error: %s, response: %s',
            $reference, $httpCode, $curlError, (string)$response
        ));
        return null;
    }

    $data = json_decode($response, true);
    if (!$data || empty($data['status'])) {
        error_log(sprintf('[Paystack] Invalid verify response for ref %s: %s', $reference, $response));
        return null;
    }

    return $data['data'] ?? null;
}

/**
 * Validate a Paystack webhook signature.
 *
 * @param string $payload   Raw request body
 * @param string $signature The X-Paystack-Signature header value
 * @return bool True if the signature is valid
 */
function validatePaystackWebhookSignature(string $payload, string $signature): bool
{
    $config = getPaystackConfig();

    if (empty($config['secret_key'])) {
        return false;
    }

    $expected = hash_hmac('sha512', $payload, $config['secret_key']);
    return hash_equals($expected, $signature);
}
