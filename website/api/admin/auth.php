<?php
require_once __DIR__ . '/../db.php';
set_cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $password = isset($input['password']) ? trim($input['password']) : '';

    if ($password === ADMIN_PASSWORD) {
        $token = generate_auth_token();
        echo json_encode([
            'success' => true,
            'token' => $token,
            'message' => 'Authentication successful'
        ]);
        exit();
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'ভুল পাসওয়ার্ড। দয়া করে সঠিক পাসওয়ার্ড দিন।'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
} elseif ($method === 'GET') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    $token = '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
    
    if (verify_auth_token($token)) {
        echo json_encode(['authenticated' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['authenticated' => false]);
    }
    exit();
}
