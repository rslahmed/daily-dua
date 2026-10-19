<?php
// Configuration for Daily Dua API

// Database Settings
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'dailydua_db');
define('DB_USER', getenv('DB_USER') ?: 'dailydua_user');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Admin Password for Hidden Admin Portal
// Default password is 'rsl12345'
// You can change this to any password you want or set the ADMIN_PASSWORD environment variable.
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
