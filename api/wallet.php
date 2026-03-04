<?php
/**
 * AminchiData - Wallet API
 * POST /api/wallet.php?action=balance|fund|init_payment|verify_payment
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/katpay.php';
require_once __DIR__ . '/../includes/paystack.php';

header('Content-Type: application/json');
initSession();

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Authentication required.'], 401);
}

$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'balance':
        $balance = getWalletBalance($userId);
        jsonResponse(['balance' => $balance]);
        break;

    case 'fund':
        $input  = getJsonInput();
        $amount = (float)($input['amount'] ?? 0);

        if ($amount < 100) {
            jsonResponse(['error' => 'Minimum funding amount is ₦100.'], 400);
        }

        // Direct wallet credit (used as fallback when payment gateways are not configured).
        fundWallet($userId, $amount);
        $ref = generatePaymentReference('DIRECT');
        recordPayment($userId, 'direct', $ref, $amount, 'success');
        addTransaction($userId, 'Wallet', 'Wallet Funding (Direct)', $amount, 'Success');
        $newBalance = getWalletBalance($userId);

        jsonResponse(['success' => true, 'balance' => $newBalance]);
        break;

    case 'init_payment':
        // Initialize a Paystack payment for wallet funding
        $input  = getJsonInput();
        $amount = (float)($input['amount'] ?? 0);

        if ($amount < 100) {
            jsonResponse(['error' => 'Minimum funding amount is ₦100.'], 400);
        }

        $user = currentUser();
        if (!$user) {
            jsonResponse(['error' => 'Unable to load user profile.'], 500);
        }

        $cfg = require __DIR__ . '/../config/app.php';
        $reference   = generatePaymentReference('PSK');
        $callbackUrl = rtrim($cfg['url'], '/') . '/dashboard.html?payment_ref=' . $reference;

        $paystackData = initializePaystackTransaction(
            $user['email'],
            $amount,
            $reference,
            $callbackUrl
        );

        if (!$paystackData) {
            jsonResponse(['error' => 'Unable to initialize payment. Please try again or use bank transfer.'], 502);
        }

        // Record the pending payment
        recordPayment($userId, 'paystack', $reference, $amount, 'pending');

        jsonResponse([
            'success'        => true,
            'authorization_url' => $paystackData['authorization_url'] ?? '',
            'access_code'    => $paystackData['access_code'] ?? '',
            'reference'      => $reference,
        ]);
        break;

    case 'verify_payment':
        // Verify a Paystack payment and credit wallet if successful
        $input     = getJsonInput();
        $reference = trim($input['reference'] ?? '');

        if (empty($reference)) {
            jsonResponse(['error' => 'Payment reference is required.'], 400);
        }

        // Check if this payment has already been processed
        $existingPayment = getPaymentByReference($reference);
        if ($existingPayment && $existingPayment['status'] === 'success') {
            jsonResponse([
                'success' => true,
                'message' => 'Payment already verified.',
                'balance' => getWalletBalance($userId),
            ]);
            break;
        }

        // Verify with Paystack
        $txnData = verifyPaystackTransaction($reference);

        if (!$txnData || ($txnData['status'] ?? '') !== 'success') {
            $status = $txnData['status'] ?? 'unknown';
            if ($existingPayment) {
                updatePaymentStatus($reference, 'failed', $txnData);
            }
            jsonResponse(['error' => 'Payment verification failed. Status: ' . $status], 400);
        }

        // Convert amount from kobo to Naira
        $amountKobo  = (int)($txnData['amount'] ?? 0);
        $amountNaira = $amountKobo / 100;

        if ($amountNaira < 100) {
            jsonResponse(['error' => 'Invalid payment amount.'], 400);
        }

        // Credit the wallet
        fundWallet($userId, $amountNaira);
        updatePaymentStatus($reference, 'success', $txnData);
        addTransaction($userId, 'Wallet', 'Wallet Funding (Paystack)', $amountNaira, 'Success');

        jsonResponse([
            'success' => true,
            'message' => 'Payment verified! ' . formatNaira($amountNaira) . ' added to your wallet.',
            'balance' => getWalletBalance($userId),
        ]);
        break;

    case 'virtual_account':
        // Return the user's Katpay virtual account, creating it if it doesn't exist yet.
        $account = getVirtualAccount($userId);
        if (!$account) {
            $user = currentUser();
            if ($user) {
                createKatpayVirtualAccount($userId, $user['name'], $user['email'], $user['phone']);
                $account = getVirtualAccount($userId);
            }
        }
        if (!$account) {
            jsonResponse(['error' => 'Virtual account not available. Please try again later.'], 503);
        }
        jsonResponse([
            'account_number' => $account['account_number'],
            'account_name'   => $account['account_name'],
            'bank_name'      => $account['bank_name'],
            'bank_code'      => $account['bank_code'],
        ]);
        break;

    default:
        jsonResponse(['error' => 'Invalid action.'], 400);
}
