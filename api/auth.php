<?php
/**
 * AminchiData - Auth API
 * POST /api/auth.php?action=login|register|logout
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'register':
        handleRegister();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        handleCheck();
        break;
    default:
        jsonResponse(['error' => 'Invalid action.'], 400);
}

function handleLogin(): void
{
    $input = getJsonInput();
    $email    = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        jsonResponse(['error' => 'Email and password are required.'], 400);
    }

    $user = attemptLogin($email, $password);
    if (!$user) {
        jsonResponse(['error' => 'Invalid email or password.'], 401);
    }

    jsonResponse([
        'success' => true,
        'user'    => [
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
        ],
    ]);
}

function handleRegister(): void
{
    $input = getJsonInput();
    $name     = trim($input['name'] ?? '');
    $email    = trim($input['email'] ?? '');
    $phone    = trim($input['phone'] ?? '');
    $password = $input['password'] ?? '';

    // Validate
    if (strlen($name) < 3) {
        jsonResponse(['error' => 'Name must be at least 3 characters.'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Enter a valid email address.'], 400);
    }
    if (!isValidNigerianPhone($phone)) {
        jsonResponse(['error' => 'Enter a valid Nigerian phone number.'], 400);
    }
    if (strlen($password) < 8) {
        jsonResponse(['error' => 'Password must be at least 8 characters.'], 400);
    }

    $result = registerUser($name, $email, $phone, $password);
    if (!$result['success']) {
        jsonResponse(['error' => $result['error']], 409);
    }

    jsonResponse(['success' => true, 'user' => $result['user']], 201);
}

function handleLogout(): void
{
    logout();
    jsonResponse(['success' => true]);
}

function handleCheck(): void
{
    if (isLoggedIn()) {
        $user = currentUser();
        jsonResponse(['loggedIn' => true, 'user' => $user]);
    } else {
        jsonResponse(['loggedIn' => false]);
    }
}
