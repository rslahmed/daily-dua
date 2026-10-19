<?php
require_once __DIR__ . '/../db.php';
set_cors_headers();

require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = get_db();

if ($method === 'GET') {
    $filterCat = $_GET['category_id'] ?? '';
    $duas = [];

    if ($pdo) {
        // Fetch dua categories mapping
        $relStmt = $pdo->query("SELECT category_id, dua_id FROM category_duas ORDER BY sort_order ASC");
        $duaCatMap = [];
        while ($rel = $relStmt->fetch()) {
            $duaCatMap[$rel['dua_id']][] = $rel['category_id'];
        }

        if (!empty($filterCat)) {
            $stmt = $pdo->prepare("
                SELECT d.* 
                FROM duas d
                JOIN category_duas cd ON d.id = cd.dua_id
                WHERE cd.category_id = :cat_id
                ORDER BY cd.sort_order ASC, d.sort_order ASC, d.created_at ASC
            ");
            $stmt->execute([':cat_id' => $filterCat]);
        } else {
            $stmt = $pdo->query("SELECT * FROM duas ORDER BY sort_order ASC, created_at ASC");
        }

        while ($row = $stmt->fetch()) {
            $catIds = $duaCatMap[$row['id']] ?? [];
            $duas[] = [
                'id' => $row['id'],
                'titleBangla' => $row['title_bangla'],
                'arabic' => $row['arabic'],
                'pronunciationBangla' => $row['uccharon_bangla'],
                'meaningBangla' => $row['meaning_bangla'],
                'benefitBangla' => $row['fazilat_bangla'],
                'referenceBangla' => $row['reference_bangla'],
                'repetitionCount' => (int)$row['repetition_count'],
                'repetitionText' => $row['repetition_text'],
                'sortOrder' => (int)$row['sort_order'],
                'categoryIds' => $catIds
            ];
        }
    } else {
        $duaFile = __DIR__ . '/../data/duas.json';
        $raw = file_exists($duaFile) ? json_decode(file_get_contents($duaFile), true) : [];
        foreach ($raw as $d) {
            $catIds = $d['categoryIds'] ?? (isset($d['categoryId']) ? [$d['categoryId']] : []);
            if (!empty($filterCat) && !in_array($filterCat, $catIds)) {
                continue;
            }
            $duas[] = [
                'id' => $d['id'],
                'titleBangla' => $d['titleBangla'] ?? '',
                'arabic' => $d['arabic'] ?? '',
                'pronunciationBangla' => $d['pronunciationBangla'] ?? '',
                'meaningBangla' => $d['meaningBangla'] ?? '',
                'benefitBangla' => $d['benefitBangla'] ?? '',
                'referenceBangla' => $d['referenceBangla'] ?? '',
                'repetitionCount' => (int)($d['repetitionCount'] ?? 1),
                'repetitionText' => $d['repetitionText'] ?? '১ বার',
                'sortOrder' => (int)($d['sortOrder'] ?? 0),
                'categoryIds' => $catIds
            ];
        }
    }

    echo json_encode(['duas' => $duas], JSON_UNESCAPED_UNICODE);
    exit();
}

function to_bangla_num($num) {
    $en = ['0','1','2','3','4','5','6','7','8','9'];
    $bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return str_replace($en, $bn, (string)$num);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = !empty($data['id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', strtolower(trim($data['id']))) : 'dua_' . time() . '_' . rand(100, 999);
    $title = trim($data['titleBangla'] ?? '');
    $arabic = trim($data['arabic'] ?? '');
    $uccharon = trim($data['pronunciationBangla'] ?? ($data['uccharonBangla'] ?? ''));
    $meaning = trim($data['meaningBangla'] ?? '');
    $fazilat = trim($data['benefitBangla'] ?? ($data['fazilatBangla'] ?? ''));
    $reference = trim($data['referenceBangla'] ?? '');
    $count = max(1, (int)($data['repetitionCount'] ?? 1));
    $countText = trim($data['repetitionText'] ?? (to_bangla_num($count) . ' বার'));
    $sort = (int)($data['sortOrder'] ?? 0);
    $categoryIds = is_array($data['categoryIds'] ?? null) ? $data['categoryIds'] : (!empty($data['categoryId']) ? [$data['categoryId']] : []);

    if (empty($title) || empty($arabic)) {
        http_response_code(400);
        echo json_encode(['error' => 'দোয়ার শিরোনাম ও আরবি পাঠ আবশ্যক।'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($pdo) {
        $stmt = $pdo->prepare("
            INSERT INTO duas (id, title_bangla, arabic, uccharon_bangla, meaning_bangla, fazilat_bangla, reference_bangla, repetition_count, repetition_text, sort_order)
            VALUES (:id, :title, :arabic, :uccharon, :meaning, :fazilat, :ref, :count, :countText, :sort)
        ");
        $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':arabic' => $arabic,
            ':uccharon' => $uccharon,
            ':meaning' => $meaning,
            ':fazilat' => $fazilat,
            ':ref' => $reference,
            ':count' => $count,
            ':countText' => $countText,
            ':sort' => $sort
        ]);

        $linkStmt = $pdo->prepare("INSERT IGNORE INTO category_duas (category_id, dua_id, sort_order) VALUES (:cat_id, :dua_id, :sort)");
        foreach ($categoryIds as $cId) {
            $linkStmt->execute([':cat_id' => $cId, ':dua_id' => $id, ':sort' => $sort]);
        }

        $newVer = bump_version($pdo);
    } else {
        $duaFile = __DIR__ . '/../data/duas.json';
        $duas = file_exists($duaFile) ? json_decode(file_get_contents($duaFile), true) : [];
        $duas[] = [
            'id' => $id,
            'titleBangla' => $title,
            'arabic' => $arabic,
            'pronunciationBangla' => $uccharon,
            'meaningBangla' => $meaning,
            'benefitBangla' => $fazilat,
            'referenceBangla' => $reference,
            'repetitionCount' => $count,
            'repetitionText' => $countText,
            'sortOrder' => $sort,
            'categoryIds' => $categoryIds,
            'categoryId' => $categoryIds[0] ?? ''
        ];
        file_put_contents($duaFile, json_encode($duas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $newVer = bump_version(null);
    }

    echo json_encode([
        'success' => true,
        'message' => 'দোয়া সফলভাবে যুক্ত হয়েছে।',
        'id' => $id,
        'version' => $newVer
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = trim($data['id'] ?? '');
    $title = trim($data['titleBangla'] ?? '');
    $arabic = trim($data['arabic'] ?? '');
    $uccharon = trim($data['pronunciationBangla'] ?? ($data['uccharonBangla'] ?? ''));
    $meaning = trim($data['meaningBangla'] ?? '');
    $fazilat = trim($data['benefitBangla'] ?? ($data['fazilatBangla'] ?? ''));
    $reference = trim($data['referenceBangla'] ?? '');
    $count = max(1, (int)($data['repetitionCount'] ?? 1));
    $countText = trim($data['repetitionText'] ?? (to_bangla_num($count) . ' বার'));
    $sort = (int)($data['sortOrder'] ?? 0);
    $categoryIds = is_array($data['categoryIds'] ?? null) ? $data['categoryIds'] : (!empty($data['categoryId']) ? [$data['categoryId']] : []);

    if (empty($id) || empty($title) || empty($arabic)) {
        http_response_code(400);
        echo json_encode(['error' => 'দোয়ার আইডি, শিরোনাম ও আরবি আবশ্যক।'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($pdo) {
        $stmt = $pdo->prepare("
            UPDATE duas 
            SET title_bangla = :title, arabic = :arabic, uccharon_bangla = :uccharon, 
                meaning_bangla = :meaning, fazilat_bangla = :fazilat, reference_bangla = :ref, 
                repetition_count = :count, repetition_text = :countText, sort_order = :sort
            WHERE id = :id
        ");
        $stmt->execute([
            ':title' => $title,
            ':arabic' => $arabic,
            ':uccharon' => $uccharon,
            ':meaning' => $meaning,
            ':fazilat' => $fazilat,
            ':ref' => $reference,
            ':count' => $count,
            ':countText' => $countText,
            ':sort' => $sort,
            ':id' => $id
        ]);

        // Sync categories
        $delStmt = $pdo->prepare("DELETE FROM category_duas WHERE dua_id = :id");
        $delStmt->execute([':id' => $id]);

        $insStmt = $pdo->prepare("INSERT INTO category_duas (category_id, dua_id, sort_order) VALUES (:cat_id, :dua_id, :sort)");
        foreach ($categoryIds as $cId) {
            $insStmt->execute([':cat_id' => $cId, ':dua_id' => $id, ':sort' => $sort]);
        }

        $newVer = bump_version($pdo);
    } else {
        $duaFile = __DIR__ . '/../data/duas.json';
        $duas = file_exists($duaFile) ? json_decode(file_get_contents($duaFile), true) : [];
        foreach ($duas as &$d) {
            if ($d['id'] === $id) {
                $d['titleBangla'] = $title;
                $d['arabic'] = $arabic;
                $d['pronunciationBangla'] = $uccharon;
                $d['meaningBangla'] = $meaning;
                $d['benefitBangla'] = $fazilat;
                $d['referenceBangla'] = $reference;
                $d['repetitionCount'] = $count;
                $d['repetitionText'] = $countText;
                $d['sortOrder'] = $sort;
                $d['categoryIds'] = $categoryIds;
                $d['categoryId'] = $categoryIds[0] ?? '';
            }
        }
        file_put_contents($duaFile, json_encode($duas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $newVer = bump_version(null);
    }

    echo json_encode([
        'success' => true,
        'message' => 'দোয়া সফলভাবে আপডেট হয়েছে।',
        'version' => $newVer
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'দোয়া আইডি প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM duas WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $newVer = bump_version($pdo);
    } else {
        $duaFile = __DIR__ . '/../data/duas.json';
        $duas = file_exists($duaFile) ? json_decode(file_get_contents($duaFile), true) : [];
        $duas = array_values(array_filter($duas, fn($d) => $d['id'] !== $id));
        file_put_contents($duaFile, json_encode($duas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $newVer = bump_version(null);
    }

    echo json_encode([
        'success' => true,
        'message' => 'দোয়া মুছে ফেলা হয়েছে।',
        'version' => $newVer
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
