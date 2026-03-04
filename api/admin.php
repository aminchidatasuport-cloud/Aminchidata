<?php
/**
 * AminchiData - Admin API
 * Handles admin dashboard, user management, transaction management, settings.
 * GET/POST /api/admin.php?action=...
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');
initSession();

if (!isAdmin()) {
    jsonResponse(['error' => 'Admin access required.'], 403);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'dashboard':
        handleDashboard();
        break;
    case 'users':
        handleUsers();
        break;
    case 'user_wallet':
        handleUserWallet();
        break;
    case 'delete_user':
        handleDeleteUser();
        break;
    case 'transactions':
        handleTransactions();
        break;
    case 'update_transaction':
        handleUpdateTransaction();
        break;
    case 'settings':
        handleSettings();
        break;
    case 'update_settings':
        handleUpdateSettings();
        break;
    default:
        jsonResponse(['error' => 'Invalid action.'], 400);
}

function handleDashboard(): void
{
    $db = getDB();

    $userCount = $db->query('SELECT COUNT(*) FROM users WHERE is_admin = 0')->fetchColumn();
    $txnCount  = $db->query('SELECT COUNT(*) FROM transactions')->fetchColumn();
    $revenue   = $db->query('SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = "Success"')->fetchColumn();
    $pending   = $db->query('SELECT COUNT(*) FROM transactions WHERE status = "Pending"')->fetchColumn();

    jsonResponse([
        'total_users'        => (int)$userCount,
        'total_transactions' => (int)$txnCount,
        'total_revenue'      => (float)$revenue,
        'pending_orders'     => (int)$pending,
    ]);
}

function handleUsers(): void
{
    $db     = getDB();
    $search = trim($_GET['search'] ?? '');
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 10;
    $offset  = ($page - 1) * $perPage;

    $where  = 'WHERE is_admin = 0';
    $params = [];

    if ($search) {
        $where .= ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        $like = "%$search%";
        $params = [$like, $like, $like];
    }

    $countStmt = $db->prepare("SELECT COUNT(*) FROM users $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $params[] = $perPage;
    $params[] = $offset;
    $stmt = $db->prepare("SELECT id, name, email, phone, wallet_balance, created_at FROM users $where ORDER BY created_at DESC LIMIT ? OFFSET ?");
    $stmt->execute($params);

    jsonResponse([
        'users'       => $stmt->fetchAll(),
        'total'       => $total,
        'page'        => $page,
        'total_pages' => (int)ceil($total / $perPage),
    ]);
}

function handleUserWallet(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed.'], 405);
    }

    $input  = getJsonInput();
    $userId = (int)($input['user_id'] ?? 0);
    $action = $input['wallet_action'] ?? '';
    $amount = (float)($input['amount'] ?? 0);

    if (!$userId || $amount <= 0) {
        jsonResponse(['error' => 'Invalid user or amount.'], 400);
    }

    if ($action === 'add') {
        fundWallet($userId, $amount);
    } elseif ($action === 'deduct') {
        if (!deductWallet($userId, $amount)) {
            jsonResponse(['error' => 'Insufficient balance for deduction.'], 400);
        }
    } else {
        jsonResponse(['error' => 'Invalid wallet action.'], 400);
    }

    jsonResponse(['success' => true, 'balance' => getWalletBalance($userId)]);
}

function handleDeleteUser(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed.'], 405);
    }

    $input  = getJsonInput();
    $userId = (int)($input['user_id'] ?? 0);

    if (!$userId) {
        jsonResponse(['error' => 'Invalid user ID.'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM users WHERE id = ? AND is_admin = 0');
    $stmt->execute([$userId]);

    jsonResponse(['success' => $stmt->rowCount() > 0]);
}

function handleTransactions(): void
{
    $db      = getDB();
    $search  = trim($_GET['search'] ?? '');
    $type    = $_GET['type'] ?? 'All';
    $status  = $_GET['status'] ?? 'All';
    $page    = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 10;
    $offset  = ($page - 1) * $perPage;

    $where  = 'WHERE 1=1';
    $params = [];

    if ($type !== 'All') {
        $where .= ' AND t.type = ?';
        $params[] = $type;
    }
    if ($status !== 'All') {
        $where .= ' AND t.status = ?';
        $params[] = $status;
    }
    if ($search) {
        $where .= ' AND (t.reference LIKE ? OR t.description LIKE ? OR u.name LIKE ?)';
        $like = "%$search%";
        $params = array_merge($params, [$like, $like, $like]);
    }

    $countStmt = $db->prepare("SELECT COUNT(*) FROM transactions t JOIN users u ON t.user_id = u.id $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $params[] = $perPage;
    $params[] = $offset;
    $stmt = $db->prepare("SELECT t.*, u.name as user_name, u.email as user_email FROM transactions t JOIN users u ON t.user_id = u.id $where ORDER BY t.created_at DESC LIMIT ? OFFSET ?");
    $stmt->execute($params);

    jsonResponse([
        'transactions' => $stmt->fetchAll(),
        'total'        => $total,
        'page'         => $page,
        'total_pages'  => (int)ceil($total / $perPage),
    ]);
}

function handleUpdateTransaction(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed.'], 405);
    }

    $input = getJsonInput();
    $txnId  = (int)($input['transaction_id'] ?? 0);
    $status = $input['status'] ?? '';

    if (!$txnId || !in_array($status, ['Pending', 'Success', 'Failed'])) {
        jsonResponse(['error' => 'Invalid transaction or status.'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('UPDATE transactions SET status = ? WHERE id = ?');
    $stmt->execute([$status, $txnId]);

    jsonResponse(['success' => $stmt->rowCount() > 0]);
}

function handleSettings(): void
{
    $db = getDB();
    $stmt = $db->query('SELECT setting_key, setting_value FROM settings');
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    jsonResponse(['settings' => $settings]);
}

function handleUpdateSettings(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['error' => 'Method not allowed.'], 405);
    }

    $input = getJsonInput();
    $db = getDB();

    foreach ($input as $key => $value) {
        $stmt = $db->prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?');
        $stmt->execute([$key, $value, $value]);
    }

    jsonResponse(['success' => true]);
}
