<?php
/**
 * AminchiData - Lightweight .env File Loader
 *
 * Reads a .env file from the project root and populates PHP's environment
 * so that getenv() / $_ENV / $_SERVER work with the defined values.
 *
 * Usage: require_once __DIR__ . '/env.php';
 * This file is safe to require multiple times (loads only once).
 */

(function () {
    // Prevent loading more than once per request.
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    $envFile = __DIR__ . '/../.env';

    if (!is_file($envFile) || !is_readable($envFile)) {
        // No .env file present – rely on system-level environment variables.
        return;
    }

    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);

        // Skip comments
        if ($line === '' || $line[0] === '#') {
            continue;
        }

        // Each line must contain KEY=VALUE
        $eqPos = strpos($line, '=');
        if ($eqPos === false) {
            continue;
        }

        $key   = trim(substr($line, 0, $eqPos));
        $value = trim(substr($line, $eqPos + 1));

        // Strip surrounding quotes (single or double)
        if (
            strlen($value) >= 2
            && (($value[0] === '"' && $value[-1] === '"')
                || ($value[0] === "'" && $value[-1] === "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        // Only set if the variable is not already defined in the environment,
        // allowing system-level variables to take precedence.
        if (getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key]    = $value;
            $_SERVER[$key] = $value;
        }
    }
})();
