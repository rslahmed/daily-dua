<?php
require_once __DIR__ . '/db.php';
set_cors_headers();

$pdo = get_db();
if (!$pdo) {
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'text/html') !== false) {
        header('Location: setup.php');
        exit();
    }
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Could not connect to database. Please visit /api/setup.php in your browser to configure and connect.',
        'setup_wizard_url' => 'setup.php'
    ]);
    exit();
}

try {
    // 1. Run Schema
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    $pdo->exec($schema);

    // 2. Load Seed Categories
    $categoriesFile = __DIR__ . '/data/categories.json';
    $categories = file_exists($categoriesFile) ? json_decode(file_get_contents($categoriesFile), true) : [];
    $catInserted = 0;

    $catStmt = $pdo->prepare("
        INSERT INTO categories (id, name_bangla, subtitle_bangla, time_bangla, icon, has_progress, sort_order)
        VALUES (:id, :name, :sub, :time, :icon, :prog, :sort)
        ON DUPLICATE KEY UPDATE
            name_bangla = VALUES(name_bangla),
            subtitle_bangla = VALUES(subtitle_bangla),
            time_bangla = VALUES(time_bangla),
            icon = VALUES(icon),
            has_progress = VALUES(has_progress)
    ");

    foreach ($categories as $index => $c) {
        $hasProg = isset($c['hasProgress']) ? ($c['hasProgress'] ? 1 : 0) : ($c['id'] === 'namaz' ? 0 : 1);
        $name = isset($c['nameBangla']) ? $c['nameBangla'] : $c['titleBangla'];
        $catStmt->execute([
            ':id' => $c['id'],
            ':name' => $name,
            ':sub' => $c['subtitleBangla'] ?? '',
            ':time' => $c['timeBangla'] ?? '',
            ':icon' => $c['icon'] ?? 'sunny-outline',
            ':prog' => $hasProg,
            ':sort' => $index
        ]);
        $catInserted++;
    }

    // 3. Load Seed Duas
    $duasFile = __DIR__ . '/data/duas.json';
    $duas = file_exists($duasFile) ? json_decode(file_get_contents($duasFile), true) : [];
    $duaInserted = 0;

    $duaStmt = $pdo->prepare("
        INSERT INTO duas (id, title_bangla, arabic, uccharon_bangla, meaning_bangla, fazilat_bangla, reference_bangla, repetition_count, repetition_text, sort_order)
        VALUES (:id, :title, :arabic, :uccharon, :meaning, :fazilat, :ref, :count, :countText, :sort)
        ON DUPLICATE KEY UPDATE
            title_bangla = VALUES(title_bangla),
            arabic = VALUES(arabic),
            uccharon_bangla = VALUES(uccharon_bangla),
            meaning_bangla = VALUES(meaning_bangla),
            fazilat_bangla = VALUES(fazilat_bangla),
            reference_bangla = VALUES(reference_bangla),
            repetition_count = VALUES(repetition_count),
            repetition_text = VALUES(repetition_text)
    ");

    $linkStmt = $pdo->prepare("
        INSERT IGNORE INTO category_duas (category_id, dua_id, sort_order)
        VALUES (:cat_id, :dua_id, :sort)
    ");

    foreach ($duas as $index => $d) {
        $duaStmt->execute([
            ':id' => $d['id'],
            ':title' => $d['titleBangla'] ?? '',
            ':arabic' => $d['arabic'] ?? '',
            ':uccharon' => $d['pronunciationBangla'] ?? '',
            ':meaning' => $d['meaningBangla'] ?? '',
            ':fazilat' => $d['benefitBangla'] ?? '',
            ':ref' => $d['referenceBangla'] ?? '',
            ':count' => (int)($d['repetitionCount'] ?? 1),
            ':countText' => $d['repetitionText'] ?? '১ বার',
            ':sort' => $index
        ]);

        $catIds = isset($d['categoryIds']) ? $d['categoryIds'] : (isset($d['categoryId']) ? [$d['categoryId']] : []);
        foreach ($catIds as $cId) {
            $linkStmt->execute([
                ':cat_id' => $cId,
                ':dua_id' => $d['id'],
                ':sort' => $index
            ]);
        }
        $duaInserted++;
    }

    // 4. Initialize Settings
    $pdo->exec("REPLACE INTO system_settings (setting_key, setting_value) VALUES ('data_version', '1')");
    $pdo->exec("REPLACE INTO system_settings (setting_key, setting_value) VALUES ('last_updated', NOW())");

    echo json_encode([
        'status' => 'success',
        'message' => 'Database successfully seeded!',
        'categoriesCount' => $catInserted,
        'duasCount' => $duaInserted,
        'version' => 1
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Seeding failed: ' . $e->getMessage()
    ]);
}
