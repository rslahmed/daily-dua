<?php
/**
 * Daily Dua - 1-Click Database Setup & Connection Wizard
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

$configFile = __DIR__ . '/config.php';
$schemaFile = __DIR__ . '/schema.sql';
$categoriesFile = __DIR__ . '/data/categories.json';
$duasFile = __DIR__ . '/data/duas.json';

$message = '';
$messageType = '';
$isInstalled = false;

// Check existing connection
require_once $configFile;
$existingPdo = null;
try {
    $existingPdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    // Check if tables exist
    $check = $existingPdo->query("SHOW TABLES LIKE 'duas'")->fetch();
    if ($check) {
        $duaCount = $existingPdo->query("SELECT COUNT(*) FROM duas")->fetchColumn();
        $catCount = $existingPdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
        $isInstalled = true;
        $stats = "Installed: $catCount categories, $duaCount duas.";
    }
} catch (Exception $e) {
    $existingPdo = null;
}

// Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'setup';
    $dbHost = trim($_POST['db_host'] ?? 'localhost');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = $_POST['db_pass'] ?? '';
    $adminPass = trim($_POST['admin_pass'] ?? 'rsl12345');

    if (empty($dbName) || empty($dbUser)) {
        $message = 'Please provide both Database Name and Database User.';
        $messageType = 'error';
    } else {
        try {
            // 1. Test connection to server
            $pdo = null;
            try {
                $pdo = new PDO(
                    "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
                    $dbUser,
                    $dbPass,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                    ]
                );
            } catch (PDOException $ex) {
                // Try connecting without dbname and create it if allowed
                if (strpos($ex->getMessage(), 'Unknown database') !== false) {
                    try {
                        $rootPdo = new PDO("mysql:host=$dbHost", $dbUser, $dbPass);
                        $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                        $pdo = new PDO(
                            "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
                            $dbUser,
                            $dbPass,
                            [
                                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                            ]
                        );
                    } catch (Exception $createEx) {
                        throw new Exception("Database '$dbName' does not exist yet. Please create it in cPanel -> MySQL Database Wizard first.");
                    }
                } else {
                    throw $ex;
                }
            }

            // 2. Save new config to config.php
            $jwtSecret = bin2hex(random_bytes(24));
            $escapedDbHost = addslashes($dbHost);
            $escapedDbName = addslashes($dbName);
            $escapedDbUser = addslashes($dbUser);
            $escapedDbPass = addslashes($dbPass);
            $escapedAdminPass = addslashes($adminPass);
            $currDate = date('Y-m-d H:i:s');

            $newConfigCode = <<<PHP
<?php
// Configuration for Daily Dua API
// Generated automatically by 1-Click Setup Wizard on {$currDate}

define('DB_HOST', getenv('DB_HOST') ?: '{$escapedDbHost}');
define('DB_NAME', getenv('DB_NAME') ?: '{$escapedDbName}');
define('DB_USER', getenv('DB_USER') ?: '{$escapedDbUser}');
define('DB_PASS', getenv('DB_PASS') ?: '{$escapedDbPass}');
define('DB_CHARSET', 'utf8mb4');

define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: '{$escapedAdminPass}');
define('JWT_SECRET', getenv('JWT_SECRET') ?: '{$jwtSecret}');

function set_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");

    if (isset(\$_SERVER['REQUEST_METHOD']) && \$_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
PHP;

            if (@file_put_contents($configFile, $newConfigCode) === false) {
                // If direct write fails, check permissions
                throw new Exception("Unable to write to api/config.php. Please ensure file permissions allow writing.");
            }

            // 3. Run schema
            if (!file_exists($schemaFile)) {
                throw new Exception("schema.sql file not found in api folder.");
            }
            $schemaSql = file_get_contents($schemaFile);
            $pdo->exec($schemaSql);

            // 4. Import Categories
            $categories = file_exists($categoriesFile) ? json_decode(file_get_contents($categoriesFile), true) : [];
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

            $catCount = 0;
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
                $catCount++;
            }

            // 5. Import Duas
            $duas = file_exists($duasFile) ? json_decode(file_get_contents($duasFile), true) : [];
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

            $duaCount = 0;
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
                $duaCount++;
            }

            // 6. Save initial settings
            $pdo->exec("REPLACE INTO system_settings (setting_key, setting_value) VALUES ('data_version', '1')");
            $pdo->exec("REPLACE INTO system_settings (setting_key, setting_value) VALUES ('last_updated', NOW())");

            $message = "🎉 Database successfully connected, configured, and seeded with $catCount categories & $duaCount duas!";
            $messageType = 'success';
            $isInstalled = true;

        } catch (Exception $e) {
            $message = 'Connection / Setup Error: ' . $e->getMessage();
            $messageType = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Dua - 1-Click Database Setup</title>
    <style>
        :root {
            --primary: #059669;
            --primary-hover: #047857;
            --bg: #064e3b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        body {
            background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #1f2937;
        }
        .card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 520px;
            padding: 32px;
        }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { color: #065f46; font-size: 24px; margin-bottom: 6px; }
        .header p { color: #6b7280; font-size: 14px; }
        .alert {
            padding: 14px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.5;
        }
        .alert-success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.15s ease;
        }
        input[type="text"]:focus, input[type="password"]:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
        }
        .hint { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .btn {
            display: inline-block;
            width: 100%;
            padding: 12px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            transition: background 0.2s ease;
        }
        .btn:hover { background: var(--primary-hover); }
        .btn-outline {
            background: transparent;
            color: var(--primary);
            border: 1px solid var(--primary);
            margin-top: 10px;
        }
        .btn-outline:hover { background: #f0fdf4; }
        .links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 20px;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            background: #ecfdf5;
            color: #065f46;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 12px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <span class="badge">🌙 Daily Dua cPanel Installer</span>
            <h1>1-Click Database Setup</h1>
            <p>Connect your MariaDB database and automatically import all duas.</p>
        </div>

        <?php if ($message): ?>
            <div class="alert alert-<?php echo $messageType; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>

        <?php if ($isInstalled && $messageType === 'success'): ?>
            <div class="links">
                <a href="../" class="btn">🌐 Visit Website</a>
                <a href="../admin" class="btn btn-outline" style="margin-top: 0;">🛡️ Admin Portal</a>
            </div>
            <p style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 16px;">
                API Sync Endpoint: <a href="sync.php" style="color: #059669;" target="_blank">/api/sync.php</a>
            </p>
        <?php else: ?>
            <form method="POST">
                <div class="form-group">
                    <label for="db_host">Database Host</label>
                    <input type="text" id="db_host" name="db_host" value="<?php echo htmlspecialchars(DB_HOST ?: 'localhost'); ?>" required>
                    <p class="hint">Always <code>localhost</code> on cPanel.</p>
                </div>

                <div class="form-group">
                    <label for="db_name">Database Name</label>
                    <input type="text" id="db_name" name="db_name" value="<?php echo htmlspecialchars(DB_NAME !== 'dailydua_db' ? DB_NAME : 'rslahmed_dailydua'); ?>" placeholder="e.g. rslahmed_dailydua" required>
                    <p class="hint">The database created in cPanel MySQL Wizard.</p>
                </div>

                <div class="form-group">
                    <label for="db_user">Database User</label>
                    <input type="text" id="db_user" name="db_user" value="<?php echo htmlspecialchars(DB_USER !== 'dailydua_user' ? DB_USER : 'rslahmed_duauser'); ?>" placeholder="e.g. rslahmed_duauser" required>
                    <p class="hint">The MySQL user assigned to this database.</p>
                </div>

                <div class="form-group">
                    <label for="db_pass">Database Password</label>
                    <input type="password" id="db_pass" name="db_pass" value="<?php echo htmlspecialchars(DB_PASS); ?>" placeholder="Enter password" required>
                </div>

                <div class="form-group">
                    <label for="admin_pass">Admin Portal Password</label>
                    <input type="text" id="admin_pass" name="admin_pass" value="<?php echo htmlspecialchars(ADMIN_PASSWORD ?: 'rsl12345'); ?>" required>
                    <p class="hint">Used to login to <code>/admin</code> to add & edit duas.</p>
                </div>

                <button type="submit" class="btn">🚀 Connect, Create Tables & Import Data</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
