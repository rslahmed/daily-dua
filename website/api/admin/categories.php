<?php
require_once __DIR__ . '/../db.php';
set_cors_headers();

require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = get_db();

if ($method === 'GET') {
    // List categories with dua count
    $categories = [];
    if ($pdo) {
        $stmt = $pdo->query("
            SELECT c.*, COUNT(cd.dua_id) as total_duas 
            FROM categories c 
            LEFT JOIN category_duas cd ON c.id = cd.category_id 
            GROUP BY c.id 
            ORDER BY c.sort_order ASC, c.created_at ASC
        ");
        while ($row = $stmt->fetch()) {
            $categories[] = [
                'id' => $row['id'],
                'nameBangla' => $row['name_bangla'],
                'subtitleBangla' => $row['subtitle_bangla'],
                'timeBangla' => $row['time_bangla'],
                'icon' => $row['icon'],
                'hasProgress' => (bool)$row['has_progress'],
                'sortOrder' => (int)$row['sort_order'],
                'totalDuas' => (int)$row['total_duas']
            ];
        }
    } else {
        // Fallback from JSON
        $catFile = __DIR__ . '/../data/categories.json';
        $duaFile = __DIR__ . '/../data/duas.json';
        $cats = file_exists($catFile) ? json_decode(file_get_contents($catFile), true) : [];
        $duas = file_exists($duaFile) ? json_decode(file_get_contents($duaFile), true) : [];
        foreach ($cats as $c) {
            $count = count(array_filter($duas, function($d) use ($c) {
                return (isset($d['categoryIds']) && in_array($c['id'], $d['categoryIds'])) ||
                       (isset($d['categoryId']) && $d['categoryId'] === $c['id']);
            }));
            $categories[] = [
                'id' => $c['id'],
                'nameBangla' => $c['nameBangla'] ?? ($c['titleBangla'] ?? ''),
                'subtitleBangla' => $c['subtitleBangla'] ?? '',
                'timeBangla' => $c['timeBangla'] ?? '',
                'icon' => $c['icon'] ?? 'sunny-outline',
                'hasProgress' => isset($c['hasProgress']) ? (bool)$c['hasProgress'] : ($c['id'] !== 'namaz'),
                'sortOrder' => $c['sortOrder'] ?? 0,
                'totalDuas' => $count
            ];
        }
    }
    echo json_encode(['categories' => $categories], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = !empty($data['id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', strtolower(trim($data['id']))) : 'cat_' . time();
    $name = trim($data['nameBangla'] ?? ($data['titleBangla'] ?? ''));
    $sub = trim($data['subtitleBangla'] ?? '');
    $time = trim($data['timeBangla'] ?? '');
    $icon = trim($data['icon'] ?? 'sunny-outline');
    $hasProg = isset($data['hasProgress']) ? ($data['hasProgress'] ? 1 : 0) : 1;
    $sort = (int)($data['sortOrder'] ?? 0);

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'ক্যাটাগরির নাম দেওয়া বাধ্যতামূলক।'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($pdo) {
        $stmt = $pdo->prepare("
            INSERT INTO categories (id, name_bangla, subtitle_bangla, time_bangla, icon, has_progress, sort_order)
            VALUES (:id, :name, :sub, :time, :icon, :prog, :sort)
        ");
        $stmt->execute([
            ':id' => $id,
            ':name' => $name,
            ':sub' => $sub,
            ':time' => $time,
            ':icon' => $icon,
            ':prog' => $hasProg,
            ':sort' => $sort
        ]);
        $newVer = bump_version($pdo);
    } else {
        $catFile = __DIR__ . '/../data/categories.json';
        $cats = file_exists($catFile) ? json_decode(file_get_contents($catFile), true) : [];
        $cats[] = [
            'id' => $id,
            'nameBangla' => $name,
            'titleBangla' => $name,
            'subtitleBangla' => $sub,
            'timeBangla' => $time,
            'icon' => $icon,
            'hasProgress' => (bool)$hasProg,
            'sortOrder' => $sort
        ];
        file_put_contents($catFile, json_encode($cats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        sync_mobile_app_data(null, $cats);
        $newVer = bump_version(null);
    }

    echo json_encode([
        'success' => true,
        'message' => 'ক্যাটাগরি সফলভাবে তৈরি হয়েছে।',
        'id' => $id,
        'version' => $newVer
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = trim($data['id'] ?? '');
    $name = trim($data['nameBangla'] ?? ($data['titleBangla'] ?? ''));
    $sub = trim($data['subtitleBangla'] ?? '');
    $time = trim($data['timeBangla'] ?? '');
    $icon = trim($data['icon'] ?? 'sunny-outline');
    $hasProg = isset($data['hasProgress']) ? ($data['hasProgress'] ? 1 : 0) : 1;
    $sort = (int)($data['sortOrder'] ?? 0);

    if (empty($id) || empty($name)) {
        http_response_code(400);
        echo json_encode(['error' => 'আইডি ও নাম প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($pdo) {
        $stmt = $pdo->prepare("
            UPDATE categories 
            SET name_bangla = :name, subtitle_bangla = :sub, time_bangla = :time, 
                icon = :icon, has_progress = :prog, sort_order = :sort
            WHERE id = :id
        ");
        $stmt->execute([
            ':name' => $name,
            ':sub' => $sub,
            ':time' => $time,
            ':icon' => $icon,
            ':prog' => $hasProg,
            ':sort' => $sort,
            ':id' => $id
        ]);
        $newVer = bump_version($pdo);
    } else {
        $catFile = __DIR__ . '/../data/categories.json';
        $cats = file_exists($catFile) ? json_decode(file_get_contents($catFile), true) : [];
        foreach ($cats as &$c) {
            if ($c['id'] === $id) {
                $c['nameBangla'] = $name;
                $c['titleBangla'] = $name;
                $c['subtitleBangla'] = $sub;
                $c['timeBangla'] = $time;
                $c['icon'] = $icon;
                $c['hasProgress'] = (bool)$hasProg;
                $c['sortOrder'] = $sort;
            }
        }
        file_put_contents($catFile, json_encode($cats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        sync_mobile_app_data(null, $cats);
        $newVer = bump_version(null);
    }

    echo json_encode([
        'success' => true,
        'message' => 'ক্যাটাগরি আপডেট সম্পন্ন হয়েছে।',
        'version' => $newVer
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ক্যাটাগরি আইডি প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $newVer = bump_version($pdo);
    } else {
        $catFile = __DIR__ . '/../data/categories.json';
        $cats = file_exists($catFile) ? json_decode(file_get_contents($catFile), true) : [];
        $cats = array_values(array_filter($cats, fn($c) => $c['id'] !== $id));
        file_put_contents($catFile, json_encode($cats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        sync_mobile_app_data(null, $cats);
        $newVer = bump_version(null);
    }

    echo json_encode([
        'success' => true,
        'message' => 'ক্যাটাগরি মুছে ফেলা হয়েছে।',
        'version' => $newVer
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
