<?php
require_once '../includes/auth_functions.php';
require_once '../includes/dashboard_functions.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate data
if (!$data || !isset($data['date']) || !isset($data['distance']) || !isset($data['duration']) || !isset($data['feeling'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

// Process and save workout
$result = saveWorkout($data);

if ($result['success']) {
    echo json_encode([
        'success' => true, 
        'message' => $result['message'],
        'workout_id' => $result['workout_id']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $result['message']]);
}
?>
