<?php
require_once __DIR__ . '/../db.php';
set_cors_headers();
require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit();
}

$pdo = get_db();
$input = json_decode(file_get_contents('php://input'), true) ?: [];
$oldPassword = isset($input['oldPassword']) ? trim($input['oldPassword']) : '';
$newPassword = isset($input['newPassword']) ? trim($input['newPassword']) : '';

if (empty($oldPassword) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'বর্তমান ও নতুন পাসওয়ার্ড উভয়টি দেওয়া আবশ্যক।'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

if (strlen($newPassword) < 4) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

$currentPassword = get_admin_password($pdo);
if ($oldPassword !== $currentPassword) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'বর্তমান পাসওয়ার্ড সঠিক নয়।'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

set_admin_password($newPassword, $pdo);

echo json_encode([
    'success' => true,
    'message' => 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।'
], JSON_UNESCAPED_UNICODE);
