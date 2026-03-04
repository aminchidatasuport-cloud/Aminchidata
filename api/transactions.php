<?php
/**
 * AminchiData - Transactions API
 * GET /api/transactions.php
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');
initSession();

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Authentication required.'], 401);
}

$userId  = $_SESSION['user_id'];
$type    = $_GET['type'] ?? 'All';
$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(50, max(1, (int)($_GET['per_page'] ?? 10)));

$result = getTransactions($userId, $type, $page, $perPage);

// Also return aggregate stats
$db = getDB();
$statsStmt = $db->prepare(
    'SELECT COUNT(*) as total, SUM(CASE WHEN status = "Success" THEN 1 ELSE 0 END) as success_count, SUM(CASE WHEN status = "Success" THEN amount ELSE 0 END) as total_spent FROM transactions WHERE user_id = ?'
);
$statsStmt->execute([$userId]);
$stats = $statsStmt->fetch();

$result['stats'] = [
    'total'         => (int)$stats['total'],
    'success_count' => (int)$stats['success_count'],
    'total_spent'   => (float)$stats['total_spent'],
];

jsonResponse($result);
