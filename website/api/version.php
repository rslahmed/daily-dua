<?php
require_once __DIR__ . '/db.php';
set_cors_headers();

$pdo = get_db();
$version = get_current_version($pdo);

$lastUpdated = date('Y-m-d H:i:s');
$catCount = 0;
$duaCount = 0;
$dataHash = '';

$verFile = __DIR__ . '/data/version.json';
$catFile = __DIR__ . '/data/categories.json';
$duaFile = __DIR__ . '/data/duas.json';

if ($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'last_updated'");
        $stmt->execute();
        $val = $stmt->fetchColumn();
        if ($val) $lastUpdated = $val;

        $catCount = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
        $duaCount = (int)$pdo->query("SELECT COUNT(*) FROM duas")->fetchColumn();
        $dataHash = md5($version . '_' . $catCount . '_' . $duaCount . '_' . $lastUpdated);
    } catch (Exception $e) {}
} else {
    if (file_exists($verFile)) {
        $vData = json_decode(file_get_contents($verFile), true);
        if (!empty($vData['lastUpdated'])) {
            $lastUpdated = $vData['lastUpdated'];
        }
    }
    $cats = file_exists($catFile) ? json_decode(file_get_contents($catFile), true) : [];
    $duas = file_exists($duaFile) ? json_decode(file_get_contents($duaFile), true) : [];
    $catCount = count($cats);
    $duaCount = count($duas);
    $catMtime = file_exists($catFile) ? filemtime($catFile) : 0;
    $duaMtime = file_exists($duaFile) ? filemtime($duaFile) : 0;
    $dataHash = md5($version . '_' . $catCount . '_' . $duaCount . '_' . $catMtime . '_' . $duaMtime);
}

echo json_encode([
    'version' => $version,
    'lastUpdated' => $lastUpdated,
    'totalCategories' => $catCount,
    'totalDuas' => $duaCount,
    'hash' => $dataHash,
    'status' => 'ok'
], JSON_UNESCAPED_UNICODE);
