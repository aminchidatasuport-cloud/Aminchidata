<?php
/**
 * AminchiData - Wallet API
 * POST /api/wallet.php?action=balance|fund
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/katpay.php';

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

        // TODO: Integrate Paystack/Flutterwave payment verification here.
        // For now, directly credit the wallet (simulating successful payment).
        fundWallet($userId, $amount);
        $newBalance = getWalletBalance($userId);

        jsonResponse(['success' => true, 'balance' => $newBalance]);
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
        if (!$account || empty($account['account_number'])) {
            jsonResponse(['error' => 'Virtual account not available. Please try again later.'], 503);
        }
        if (empty($account['account_name']) || empty($account['bank_name'])) {
            error_log(sprintf('[Wallet] Virtual account for user %d has incomplete data (name=%s, bank=%s)', $userId, $account['account_name'] ?? '', $account['bank_name'] ?? ''));
        }
        jsonResponse([
            'account_number' => $account['account_number'],
            'account_name'   => $account['account_name'] ?: '',
            'bank_name'      => $account['bank_name'] ?: '',
            'bank_code'      => $account['bank_code'] ?: '',
        ]);
        break;

    default:
        jsonResponse(['error' => 'Invalid action.'], 400);
}
