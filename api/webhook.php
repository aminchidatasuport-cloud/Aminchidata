<?php
/**
 * AminchiData - Webhook Handler
 * POST /api/webhook.php?provider=katpay|paystack
 *
 * Handles payment notifications from external providers.
 * This endpoint is called by payment gateways to notify us of successful payments.
 */

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/paystack.php';

header('Content-Type: application/json');

$provider = $_GET['provider'] ?? '';
$rawBody  = file_get_contents('php://input');

if (empty($rawBody)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request body.']);
    exit;
}

switch ($provider) {
    case 'katpay':
        handleKatpayWebhook($rawBody);
        break;

    case 'paystack':
        handlePaystackWebhook($rawBody);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown provider.']);
        exit;
}

/**
 * Handle Katpay webhook for virtual account payments.
 * When a user transfers money to their Katpay virtual account,
 * this webhook is called to automatically credit their wallet.
 */
function handleKatpayWebhook(string $rawBody): void
{
    $payload = json_decode($rawBody, true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload.']);
        exit;
    }

    // Log the webhook event
    logWebhookEvent('katpay', $rawBody);

    // Extract payment details from Katpay notification
    // Katpay may wrap data inside a 'data' key
    $data = $payload['data'] ?? $payload;

    $accountNumber = $data['accountNumber'] ?? ($data['account_number'] ?? '');
    $amount        = (float)($data['amount'] ?? 0);
    $reference     = $data['reference'] ?? ($data['sessionId'] ?? ($data['session_id'] ?? ''));
    $status        = strtolower($data['status'] ?? ($data['paymentStatus'] ?? ''));

    // Only process successful payments
    if (!in_array($status, ['success', 'successful', 'completed', 'paid'])) {
        http_response_code(200);
        echo json_encode(['message' => 'Non-success status ignored.', 'status' => $status]);
        exit;
    }

    if (empty($accountNumber) || $amount <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing account number or invalid amount.']);
        exit;
    }

    // Look up the user by their virtual account number
    $db = getDB();
    $stmt = $db->prepare('SELECT user_id FROM virtual_accounts WHERE account_number = ?');
    $stmt->execute([$accountNumber]);
    $vaRow = $stmt->fetch();

    if (!$vaRow) {
        error_log(sprintf('[Katpay Webhook] No user found for account number: %s', $accountNumber));
        http_response_code(200);
        echo json_encode(['message' => 'Account not found. Ignored.']);
        exit;
    }

    $userId = (int)$vaRow['user_id'];

    // Prevent duplicate processing using the reference
    if (!empty($reference)) {
        $existing = getPaymentByReference($reference);
        if ($existing && $existing['status'] === 'success') {
            http_response_code(200);
            echo json_encode(['message' => 'Payment already processed.']);
            exit;
        }
    } else {
        $reference = 'KAT_WH_' . time() . '_' . bin2hex(random_bytes(4));
    }

    // Credit the user's wallet
    fundWallet($userId, $amount);

    // Record the payment
    recordPayment($userId, 'katpay', $reference, $amount, 'success', $data);
    addTransaction($userId, 'Wallet', 'Wallet Funding (Bank Transfer)', $amount, 'Success');

    http_response_code(200);
    echo json_encode(['message' => 'Payment processed successfully.']);
}

/**
 * Handle Paystack webhook for payment events.
 * Paystack sends a POST with event data; we verify the signature before processing.
 */
function handlePaystackWebhook(string $rawBody): void
{
    // Validate the webhook signature
    $signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
    if (empty($signature) || !validatePaystackWebhookSignature($rawBody, $signature)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature.']);
        exit;
    }

    $payload = json_decode($rawBody, true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload.']);
        exit;
    }

    // Log the webhook event
    logWebhookEvent('paystack', $rawBody);

    $event = $payload['event'] ?? '';

    // Only handle successful charge events
    if ($event !== 'charge.success') {
        http_response_code(200);
        echo json_encode(['message' => 'Event ignored.', 'event' => $event]);
        exit;
    }

    $data      = $payload['data'] ?? [];
    $reference = $data['reference'] ?? '';
    $status    = $data['status'] ?? '';
    $amountKobo = (int)($data['amount'] ?? 0);
    $amountNaira = $amountKobo / 100;

    if (empty($reference) || $status !== 'success' || $amountNaira <= 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Invalid payment data. Ignored.']);
        exit;
    }

    // Check if this payment exists in our records and hasn't been processed yet
    $payment = getPaymentByReference($reference);
    if (!$payment) {
        error_log(sprintf('[Paystack Webhook] No payment record found for reference: %s', $reference));
        http_response_code(200);
        echo json_encode(['message' => 'Payment reference not found.']);
        exit;
    }

    if ($payment['status'] === 'success') {
        http_response_code(200);
        echo json_encode(['message' => 'Payment already processed.']);
        exit;
    }

    $userId = (int)$payment['user_id'];

    // Credit the wallet and update payment record
    fundWallet($userId, $amountNaira);
    updatePaymentStatus($reference, 'success', $data);
    addTransaction($userId, 'Wallet', 'Wallet Funding (Paystack)', $amountNaira, 'Success');

    http_response_code(200);
    echo json_encode(['message' => 'Payment processed successfully.']);
}

/**
 * Log a webhook event for audit and debugging purposes.
 */
function logWebhookEvent(string $provider, string $payload): void
{
    try {
        $db = getDB();
        $stmt = $db->prepare(
            'INSERT INTO webhook_logs (provider, payload, created_at) VALUES (?, ?, NOW())'
        );
        $stmt->execute([$provider, $payload]);
    } catch (\Exception $e) {
        // If the webhook_logs table doesn't exist yet, just log to error_log
        error_log(sprintf('[Webhook] %s event received: %s', $provider, substr($payload, 0, 500)));
    }
}
