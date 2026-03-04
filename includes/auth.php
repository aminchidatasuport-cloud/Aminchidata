<?php
/**
 * AminchiData - Authentication Helpers
 * Session-based authentication with secure password hashing.
 */

require_once __DIR__ . '/db.php';

/**
 * Start a secure session if not already started.
 */
function initSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        $appConfig = require __DIR__ . '/../config/app.php';
        session_name($appConfig['session']['name']);
        session_start();
    }
}

/**
 * Check if the current user is logged in.
 */
function isLoggedIn(): bool
{
    initSession();
    return isset($_SESSION['user_id']);
}

/**
 * Get the currently logged-in user or null.
 */
function currentUser(): ?array
{
    if (!isLoggedIn()) {
        return null;
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT id, name, email, phone, created_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch() ?: null;
}

/**
 * Require the user to be logged in. Redirect to login page if not.
 */
function requireLogin(): void
{
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Attempt to log in a user with email and password.
 * Returns the user array on success, or null on failure.
 */
function attemptLogin(string $email, string $password): ?array
{
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([strtolower(trim($email))]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        return null;
    }

    initSession();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];

    return $user;
}

/**
 * Register a new user.
 * Returns ['success' => true, 'user' => ...] or ['success' => false, 'error' => ...].
 */
function registerUser(string $name, string $email, string $phone, string $password): array
{
    $db = getDB();
    $email = strtolower(trim($email));

    // Check for duplicate email
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        return ['success' => false, 'error' => 'An account with this email already exists.'];
    }

    $appConfig = require __DIR__ . '/../config/app.php';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $db->prepare(
        'INSERT INTO users (name, email, phone, password, wallet_balance, created_at) VALUES (?, ?, ?, ?, ?, NOW())'
    );
    $stmt->execute([$name, $email, $phone, $hashedPassword, $appConfig['default_wallet_balance']]);

    $userId = $db->lastInsertId();

    // Auto-login after registration
    initSession();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_email'] = $email;

    return ['success' => true, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'phone' => $phone]];
}

/**
 * Log out the current user.
 */
function logout(): void
{
    initSession();
    session_unset();
    session_destroy();
}

// ----- Admin Auth -----

/**
 * Check if the current session is an admin.
 */
function isAdmin(): bool
{
    initSession();
    return !empty($_SESSION['is_admin']);
}

/**
 * Require admin privileges. Redirect to admin login if not.
 */
function requireAdmin(): void
{
    if (!isAdmin()) {
        header('Location: admin-login.php');
        exit;
    }
}

/**
 * Attempt admin login.
 */
function attemptAdminLogin(string $email, string $password): ?array
{
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ? AND is_admin = 1');
    $stmt->execute([strtolower(trim($email))]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password'])) {
        return null;
    }

    initSession();
    $_SESSION['user_id'] = $admin['id'];
    $_SESSION['user_name'] = $admin['name'];
    $_SESSION['user_email'] = $admin['email'];
    $_SESSION['is_admin'] = true;

    return $admin;
}
