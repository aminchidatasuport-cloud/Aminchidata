<?php
/**
 * AminchiData - Shared Utility Functions
 */

require_once __DIR__ . '/db.php';

/**
 * Format an amount as Nigerian Naira.
 */
function formatNaira(float $amount): string
{
    return '₦' . number_format($amount, 2);
}

/**
 * Send a JSON response and exit.
 */
function jsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Read JSON request body.
 */
function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

/**
 * Get the wallet balance for a user.
 */
function getWalletBalance(int $userId): float
{
    $db = getDB();
    $stmt = $db->prepare('SELECT wallet_balance FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    return $row ? (float)$row['wallet_balance'] : 0.0;
}

/**
 * Deduct from wallet. Returns true on success, false if insufficient balance.
 */
function deductWallet(int $userId, float $amount): bool
{
    $db = getDB();
    $stmt = $db->prepare('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ? AND wallet_balance >= ?');
    $stmt->execute([$amount, $userId, $amount]);
    return $stmt->rowCount() > 0;
}

/**
 * Add funds to a user's wallet.
 */
function fundWallet(int $userId, float $amount): bool
{
    $db = getDB();
    $stmt = $db->prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?');
    $stmt->execute([$amount, $userId]);
    return $stmt->rowCount() > 0;
}

/**
 * Record a transaction.
 */
function addTransaction(int $userId, string $type, string $description, float $amount, string $status, string $phone = ''): int
{
    $db = getDB();
    $ref = 'TXN' . time() . rand(100, 999);
    $stmt = $db->prepare(
        'INSERT INTO transactions (user_id, reference, type, description, amount, status, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())'
    );
    $stmt->execute([$userId, $ref, $type, $description, $amount, $status, $phone]);
    return (int)$db->lastInsertId();
}

/**
 * Get transactions for a user with optional filters.
 */
function getTransactions(int $userId, string $type = 'All', int $page = 1, int $perPage = 10): array
{
    $db = getDB();
    $offset = ($page - 1) * $perPage;

    $where = 'WHERE user_id = ?';
    $params = [$userId];

    if ($type !== 'All') {
        $where .= ' AND type = ?';
        $params[] = $type;
    }

    // Count total
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM transactions $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['total'];

    // Fetch page
    $params[] = $perPage;
    $params[] = $offset;
    $stmt = $db->prepare("SELECT * FROM transactions $where ORDER BY created_at DESC LIMIT ? OFFSET ?");
    $stmt->execute($params);

    return [
        'transactions' => $stmt->fetchAll(),
        'total'        => $total,
        'page'         => $page,
        'per_page'     => $perPage,
        'total_pages'  => (int)ceil($total / $perPage),
    ];
}

/**
 * Validate a Nigerian phone number.
 */
function isValidNigerianPhone(string $phone): bool
{
    return (bool)preg_match('/^0[7-9][0-1]\d{8}$/', $phone);
}

/**
 * Generate a random PIN (e.g. for education services).
 */
function generatePin(): string
{
    $parts = [];
    for ($i = 0; $i < 4; $i++) {
        $parts[] = str_pad((string)random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
    }
    return implode('-', $parts);
}

/**
 * Generate a serial number.
 */
function generateSerial(): string
{
    return 'SN' . strtoupper(bin2hex(random_bytes(5)));
}

/**
 * Generate a prepaid electricity token.
 */
function generateToken(): string
{
    $parts = [];
    for ($i = 0; $i < 4; $i++) {
        $parts[] = str_pad((string)random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
    }
    return implode('-', $parts);
}
