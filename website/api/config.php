<?php
// Configuration for Daily Dua API

// Load .env file if present
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val, " \t\n\r\0\x0B\"'");
            putenv("$key=$val");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

// Database Settings
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'rslahmed_daily_dua');
define('DB_USER', getenv('DB_USER') ?: 'rslahmed_daily_dua');
define('DB_PASS', getenv('DB_PASS') ?: 'SIGZmgG,{6xFEipd');
define('DB_CHARSET', 'utf8mb4');

// Admin Password for Hidden Admin Portal (/admin)
define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: 'rsl12345');

// Secret key for JWT / Admin Token signing
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'daily_dua_secret_key_change_me_in_production_2026');

// CORS Headers helper
function set_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
