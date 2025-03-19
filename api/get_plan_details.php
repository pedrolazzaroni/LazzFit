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

// Check if plan_id is provided
if (!isset($_GET['plan_id']) || !is_numeric($_GET['plan_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID do plano não fornecido ou inválido']);
    exit;
}

$planId = (int)$_GET['plan_id'];

try {
    $conn = getDbConnection();
    
    // Get plan details
    $stmt = $conn->prepare("SELECT * FROM plans WHERE plan_id = :id");
    $stmt->bindParam(':id', $planId);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Plano não encontrado']);
        exit;
    }
    
    $plan = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Return plan details
    echo json_encode([
        'success' => true,
        'plan' => $plan
    ]);
    
} catch (PDOException $e) {
    error_log("Erro ao obter detalhes do plano: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao obter detalhes do plano']);
}
?>
