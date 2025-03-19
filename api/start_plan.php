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
if (!$data || !isset($data['plan_id']) || !isset($data['start_date'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

// Get user ID
$userId = $_SESSION['user_id'];
$planId = (int)$data['plan_id'];
$startDate = $data['start_date'];
$notes = $data['notes'] ?? '';

try {
    $conn = getDbConnection();
    
    // Start transaction
    $conn->beginTransaction();
    
    // Check if plan exists
    $checkStmt = $conn->prepare("SELECT * FROM plans WHERE plan_id = :id");
    $checkStmt->bindParam(':id', $planId);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        throw new Exception('Plano não encontrado');
    }
    
    $plan = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate end date based on plan duration
    $durationWeeks = $plan['duration_weeks'] > 0 ? $plan['duration_weeks'] : 12; // Default to 12 weeks if flexible
    $endDate = date('Y-m-d', strtotime($startDate . ' + ' . $durationWeeks . ' weeks'));
    
    // Check if user already has an active plan
    $activeStmt = $conn->prepare("SELECT * FROM user_plans WHERE user_id = :user_id AND status = 'Em andamento'");
    $activeStmt->bindParam(':user_id', $userId);
    $activeStmt->execute();
    
    // If user has active plans, mark them as abandoned
    if ($activeStmt->rowCount() > 0) {
        $updateStmt = $conn->prepare("UPDATE user_plans SET status = 'Abandonado', updated_at = CURRENT_TIMESTAMP WHERE user_id = :user_id AND status = 'Em andamento'");
        $updateStmt->bindParam(':user_id', $userId);
        $updateStmt->execute();
    }
    
    // Create new user plan
    $stmt = $conn->prepare("INSERT INTO user_plans 
                          (user_id, plan_id, start_date, end_date, status, notes, created_at) 
                          VALUES 
                          (:user_id, :plan_id, :start_date, :end_date, 'Em andamento', :notes, CURRENT_TIMESTAMP)");
    
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':plan_id', $planId);
    $stmt->bindParam(':start_date', $startDate);
    $stmt->bindParam(':end_date', $endDate);
    $stmt->bindParam(':notes', $notes);
    $stmt->execute();
    
    $userPlanId = $conn->lastInsertId();
    
    // Create a notification for the user
    $message = "Você iniciou o plano de treino: {$plan['name']}";
    
    $notifStmt = $conn->prepare("INSERT INTO notifications 
                               (user_id, notification_type, content, related_id) 
                               VALUES 
                               (:user_id, 'plan_started', :content, :plan_id)");
    $notifStmt->bindParam(':user_id', $userId);
    $notifStmt->bindParam(':content', $message);
    $notifStmt->bindParam(':plan_id', $planId);
    $notifStmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Plano iniciado com sucesso',
        'user_plan_id' => $userPlanId
    ]);
    
} catch (Exception $e) {
    // Roll back transaction on error
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    
    error_log("Erro ao iniciar plano: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao iniciar plano: ' . $e->getMessage()]);
}
?>
