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
if (!$data || !isset($data['date']) || !isset($data['time']) || !isset($data['type']) || !isset($data['goal_type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

// Get user ID
$userId = $_SESSION['user_id'];

// Process and format date/time
$dateTime = $data['date'] . ' ' . $data['time'];

try {
    $conn = getDbConnection();
    
    // Start transaction
    $conn->beginTransaction();
    
    // Create planned workout record
    $stmt = $conn->prepare("INSERT INTO workouts 
                          (user_id, workout_date, workout_type, planned, notes, created_at) 
                          VALUES 
                          (:user_id, :workout_date, :workout_type, 1, :notes, CURRENT_TIMESTAMP)");
    
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':workout_date', $dateTime);
    $stmt->bindParam(':workout_type', $data['type']);
    $stmt->bindParam(':notes', $data['notes']);
    $stmt->execute();
    
    $workoutId = $conn->lastInsertId();
    
    // Add goal-specific data
    switch ($data['goal_type']) {
        case 'distance':
            if (isset($data['distance']) && is_numeric($data['distance'])) {
                $distanceStmt = $conn->prepare("UPDATE workouts SET distance = :distance WHERE workout_id = :id");
                $distanceStmt->bindParam(':distance', $data['distance']);
                $distanceStmt->bindParam(':id', $workoutId);
                $distanceStmt->execute();
            }
            break;
            
        case 'time':
            if (isset($data['duration'])) {
                $durationStmt = $conn->prepare("UPDATE workouts SET target_duration = :duration WHERE workout_id = :id");
                $durationStmt->bindParam(':duration', $data['duration']);
                $durationStmt->bindParam(':id', $workoutId);
                $durationStmt->execute();
            }
            break;
            
        case 'pace':
            if (isset($data['pace'])) {
                // Convert pace to seconds per km
                $paceParts = explode(':', $data['pace']);
                $paceSeconds = (intval($paceParts[0]) * 60) + intval($paceParts[1]);
                
                $paceStmt = $conn->prepare("UPDATE workouts SET target_pace = :pace WHERE workout_id = :id");
                $paceStmt->bindParam(':pace', $paceSeconds);
                $paceStmt->bindParam(':id', $workoutId);
                $paceStmt->execute();
            }
            break;
    }
    
    // Create a notification for the user
    $workoutDate = date("d/m", strtotime($data['date']));
    $workoutTime = date("H:i", strtotime($data['time']));
    $message = "Você agendou um treino de {$data['type']} para {$workoutDate} às {$workoutTime}";
    
    $notifStmt = $conn->prepare("INSERT INTO notifications 
                               (user_id, notification_type, content, related_id) 
                               VALUES 
                               (:user_id, 'workout_planned', :content, :workout_id)");
    $notifStmt->bindParam(':user_id', $userId);
    $notifStmt->bindParam(':content', $message);
    $notifStmt->bindParam(':workout_id', $workoutId);
    $notifStmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Treino agendado com sucesso',
        'workout_id' => $workoutId
    ]);
    
} catch (PDOException $e) {
    // Roll back transaction on error
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    
    error_log("Erro ao agendar treino: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao agendar treino: ' . $e->getMessage()]);
}
?>
