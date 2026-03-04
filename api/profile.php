<?php
/**
 * AminchiData - Profile API
 * POST /api/profile.php?action=update|change_password
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');
initSession();

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Authentication required.'], 401);
}

$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get':
        $user = currentUser();
        $user['wallet_balance'] = getWalletBalance($userId);
        jsonResponse(['user' => $user]);
        break;

    case 'update':
        handleUpdate($userId);
        break;

    case 'change_password':
        handleChangePassword($userId);
        break;

    default:
        jsonResponse(['error' => 'Invalid action.'], 400);
}

function handleUpdate(int $userId): void
{
    $input = getJsonInput();
    $name  = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');

    if (strlen($name) < 3) {
        jsonResponse(['error' => 'Name must be at least 3 characters.'], 400);
    }
    if ($phone && !isValidNigerianPhone($phone)) {
        jsonResponse(['error' => 'Enter a valid Nigerian phone number.'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?');
    $stmt->execute([$name, $phone, $userId]);

    $_SESSION['user_name'] = $name;

    jsonResponse(['success' => true, 'message' => 'Profile updated successfully.']);
}

function handleChangePassword(int $userId): void
{
    $input = getJsonInput();
    $currentPassword = $input['current_password'] ?? '';
    $newPassword     = $input['new_password'] ?? '';

    if (strlen($newPassword) < 8) {
        jsonResponse(['error' => 'New password must be at least 8 characters.'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($currentPassword, $user['password'])) {
        jsonResponse(['error' => 'Current password is incorrect.'], 400);
    }

    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([$hashed, $userId]);

    jsonResponse(['success' => true, 'message' => 'Password changed successfully.']);
}
