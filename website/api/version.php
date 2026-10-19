<?php
require_once __DIR__ . '/db.php';
set_cors_headers();

$pdo = get_db();
$version = get_current_version($pdo);

$lastUpdated = date('Y-m-d H:i:s');
if ($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'last_updated'");
        $stmt->execute();
        $val = $stmt->fetchColumn();
        if ($val) $lastUpdated = $val;
    } catch (Exception $e) {}
}

echo json_encode([
    'version' => $version,
    'lastUpdated' => $lastUpdated,
    'status' => 'ok'
]);
