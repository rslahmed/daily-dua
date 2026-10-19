<?php
require_once __DIR__ . '/db.php';
set_cors_headers();

$pdo = get_db();
$version = get_current_version($pdo);

$categories = [];
$duas = [];

if ($pdo) {
    try {
        // Fetch categories
        $catStmt = $pdo->query("SELECT id, name_bangla, subtitle_bangla, time_bangla, icon, has_progress, sort_order FROM categories ORDER BY sort_order ASC, created_at ASC");
        while ($row = $catStmt->fetch()) {
            $categories[] = [
                'id' => $row['id'],
                'nameBangla' => $row['name_bangla'],
                'titleBangla' => $row['name_bangla'],
                'subtitleBangla' => $row['subtitle_bangla'],
                'timeBangla' => $row['time_bangla'],
                'icon' => $row['icon'],
                'hasProgress' => (bool)$row['has_progress'],
                'sortOrder' => (int)$row['sort_order']
            ];
        }

        // Fetch category-dua relations
        $relStmt = $pdo->query("SELECT category_id, dua_id FROM category_duas ORDER BY sort_order ASC");
        $duaCatMap = [];
        while ($rel = $relStmt->fetch()) {
            $duaCatMap[$rel['dua_id']][] = $rel['category_id'];
        }

        // Fetch duas
        $duaStmt = $pdo->query("SELECT id, title_bangla, arabic, uccharon_bangla, meaning_bangla, fazilat_bangla, reference_bangla, repetition_count, repetition_text, sort_order FROM duas ORDER BY sort_order ASC, created_at ASC");
        while ($row = $duaStmt->fetch()) {
            $catIds = isset($duaCatMap[$row['id']]) ? $duaCatMap[$row['id']] : [];
            $primaryCat = count($catIds) > 0 ? $catIds[0] : '';

            $duas[] = [
                'id' => $row['id'],
                'categoryIds' => $catIds,
                'categoryId' => $primaryCat,
                'titleBangla' => $row['title_bangla'],
                'arabic' => $row['arabic'],
                'pronunciationBangla' => $row['uccharon_bangla'],
                'meaningBangla' => $row['meaning_bangla'],
                'benefitBangla' => $row['fazilat_bangla'],
                'referenceBangla' => $row['reference_bangla'],
                'repetitionCount' => (int)$row['repetition_count'],
                'repetitionText' => $row['repetition_text'],
                'sortOrder' => (int)$row['sort_order']
            ];
        }
    } catch (Exception $e) {
        $pdo = null; // fallback below
    }
}

// Fallback to JSON files if DB is empty or not yet connected
if (empty($categories)) {
    $catFile = __DIR__ . '/data/categories.json';
    if (file_exists($catFile)) {
        $raw = json_decode(file_get_contents($catFile), true) ?: [];
        foreach ($raw as $c) {
            $categories[] = [
                'id' => $c['id'],
                'nameBangla' => isset($c['nameBangla']) ? $c['nameBangla'] : $c['titleBangla'],
                'titleBangla' => isset($c['titleBangla']) ? $c['titleBangla'] : $c['nameBangla'],
                'subtitleBangla' => $c['subtitleBangla'] ?? '',
                'timeBangla' => $c['timeBangla'] ?? '',
                'icon' => $c['icon'] ?? 'sunny-outline',
                'hasProgress' => isset($c['hasProgress']) ? (bool)$c['hasProgress'] : ($c['id'] !== 'namaz'),
                'sortOrder' => $c['sortOrder'] ?? 0
            ];
        }
    }
}

if (empty($duas)) {
    $duaFile = __DIR__ . '/data/duas.json';
    if (file_exists($duaFile)) {
        $raw = json_decode(file_get_contents($duaFile), true) ?: [];
        foreach ($raw as $d) {
            $catIds = isset($d['categoryIds']) ? $d['categoryIds'] : (isset($d['categoryId']) ? [$d['categoryId']] : []);
            $duas[] = [
                'id' => $d['id'],
                'categoryIds' => $catIds,
                'categoryId' => $catIds[0] ?? '',
                'titleBangla' => $d['titleBangla'] ?? '',
                'arabic' => $d['arabic'] ?? '',
                'pronunciationBangla' => $d['pronunciationBangla'] ?? '',
                'meaningBangla' => $d['meaningBangla'] ?? '',
                'benefitBangla' => $d['benefitBangla'] ?? '',
                'referenceBangla' => $d['referenceBangla'] ?? '',
                'repetitionCount' => (int)($d['repetitionCount'] ?? 1),
                'repetitionText' => $d['repetitionText'] ?? '১ বার',
                'sortOrder' => $d['sortOrder'] ?? 0
            ];
        }
    }
}

echo json_encode([
    'version' => $version,
    'totalCategories' => count($categories),
    'totalDuas' => count($duas),
    'categories' => $categories,
    'duas' => $duas
], JSON_UNESCAPED_UNICODE);
