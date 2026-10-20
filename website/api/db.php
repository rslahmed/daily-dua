<?php
require_once __DIR__ . '/config.php';

function get_db() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // Return null if database is not reachable, so fallback can be used
        return null;
    }
}

function get_current_version($pdo) {
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'data_version'");
            $stmt->execute();
            $val = $stmt->fetchColumn();
            if ($val !== false) {
                return (int)$val;
            }
        } catch (Exception $e) {
            // fallback
        }
    }

    $verFile = __DIR__ . '/data/version.json';
    if (file_exists($verFile)) {
        $json = json_decode(file_get_contents($verFile), true);
        return isset($json['version']) ? (int)$json['version'] : 1;
    }
    return 1;
}

function bump_version($pdo) {
    $now = date('Y-m-d H:i:s');
    $current = get_current_version($pdo);
    $newVersion = max(1, (int)$current) + 1;

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("REPLACE INTO system_settings (setting_key, setting_value) VALUES ('data_version', :ver)");
            $stmt->execute([':ver' => (string)$newVersion]);

            $stmt = $pdo->prepare("REPLACE INTO system_settings (setting_key, setting_value) VALUES ('last_updated', :dt)");
            $stmt->execute([':dt' => $now]);
        } catch (Exception $e) {
            // fallback
        }
    }

    // Always persist in website data/version.json
    $verFile = __DIR__ . '/data/version.json';
    @file_put_contents($verFile, json_encode([
        'version' => $newVersion,
        'lastUpdated' => $now
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Also persist in mobile-app/src/data/version.json
    $mobileVerFile = dirname(__DIR__, 2) . '/mobile-app/src/data/version.json';
    if (file_exists(dirname($mobileVerFile))) {
        @file_put_contents($mobileVerFile, json_encode([
            'version' => $newVersion,
            'lastUpdated' => $now
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    return $newVersion;
}

function sync_mobile_app_data($duas = null, $categories = null) {
    $mobileAppDir = dirname(__DIR__, 2) . '/mobile-app/src/data';
    if (!is_dir($mobileAppDir)) return;

    if ($duas !== null) {
        @file_put_contents($mobileAppDir . '/duas.json', json_encode($duas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    if ($categories !== null) {
        @file_put_contents($mobileAppDir . '/categories.json', json_encode($categories, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

// Generate simple auth token
function generate_auth_token() {
    $payload = [
        'user' => 'admin',
        'time' => time(),
        'exp' => time() + (86400 * 30) // 30 days
    ];
    $json = json_encode($payload);
    $sig = hash_hmac('sha256', $json, JWT_SECRET);
    return base64_encode($json) . '.' . $sig;
}

// Verify auth token
function verify_auth_token($token) {
    if (!$token) return false;
    $parts = explode('.', $token);
    if (count($parts) !== 2) return false;

    $json = base64_decode($parts[0]);
    $sig = $parts[1];
    $expectedSig = hash_hmac('sha256', $json, JWT_SECRET);

    if (!hash_equals($expectedSig, $sig)) return false;

    $payload = json_decode($json, true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return false;
    }
    return true;
}

function require_admin_auth() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    $token = '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (isset($_COOKIE['admin_token'])) {
        $token = $_COOKIE['admin_token'];
    }

    if (!verify_auth_token($token)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Please login again.']);
        exit();
    }
}

function get_admin_password($pdo = null) {
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'admin_password'");
            $stmt->execute();
            $val = $stmt->fetchColumn();
            if ($val !== false && !empty($val)) {
                return $val;
            }
        } catch (Exception $e) {
            // fallback
        }
    }

    $cfgFile = __DIR__ . '/data/admin_config.json';
    if (file_exists($cfgFile)) {
        $cfg = json_decode(file_get_contents($cfgFile), true);
        if (!empty($cfg['password'])) {
            return $cfg['password'];
        }
    }

    return ADMIN_PASSWORD;
}

function set_admin_password($newPassword, $pdo = null) {
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("REPLACE INTO system_settings (setting_key, setting_value) VALUES ('admin_password', :pwd)");
            $stmt->execute([':pwd' => $newPassword]);
        } catch (Exception $e) {
            // fallback
        }
    }

    $cfgFile = __DIR__ . '/data/admin_config.json';
    $cfg = [
        'password' => $newPassword,
        'updatedAt' => date('Y-m-d H:i:s')
    ];
    file_put_contents($cfgFile, json_encode($cfg, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return true;
}

