<?php
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth_functions.php';

/**
 * Obtém os treinos recentes do usuário
 * @param int $limit Número de treinos a retornar
 * @return array Lista de treinos
 */
function getRecentWorkouts($limit = 5) {
    if (!isLoggedIn()) {
        return [];
    }
    
    $userId = $_SESSION['user_id'];
    $conn = getDbConnection();
    $workouts = [];
    
    try {
        // Adaptado para MySQL: TIME_TO_SEC(duration)/60 em vez de EXTRACT(EPOCH FROM duration)/60
        $stmt = $conn->prepare("SELECT workout_id, workout_date, distance, 
                                TIME_TO_SEC(duration)/60 as duration_minutes, 
                                pace, feeling, notes
                               FROM workouts 
                               WHERE user_id = :user_id 
                               ORDER BY workout_date DESC 
                               LIMIT :limit");
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $workouts = $stmt->fetchAll();
        
        // Formatar os dados para exibição
        foreach ($workouts as &$workout) {
            // Converter minutos para formato hh:mm
            $hours = floor($workout['duration_minutes'] / 60);
            $minutes = round($workout['duration_minutes'] % 60);
            $workout['duration_formatted'] = sprintf("%02d:%02d", $hours, $minutes);
            
            // Formatar o ritmo (pace)
            $paceMinutes = floor($workout['pace'] / 60);
            $paceSeconds = round($workout['pace'] % 60);
            $workout['pace_formatted'] = sprintf("%d:%02d/km", $paceMinutes, $paceSeconds);
            
            // Formatar a data (MySQL retorna Y-m-d)
            $date = new DateTime($workout['workout_date']);
            $workout['date_formatted'] = $date->format('d/m/Y');
        }
        
    } catch (PDOException $e) {
        error_log("Erro ao obter treinos: " . $e->getMessage());
    }
    
    return $workouts;
}

/**
 * Salva um novo treino para o usuário
 * @param array $workoutData Dados do treino
 * @return array Status da operação
 */
function saveWorkout($workoutData) {
    if (!isLoggedIn()) {
        return ['success' => false, 'message' => 'Usuário não logado'];
    }
    
    $userId = $_SESSION['user_id'];
    $conn = getDbConnection();
    $result = ['success' => false, 'message' => ''];
    
    try {
        // Calcular o pace baseado na distância e duração
        $duration = explode(':', $workoutData['duration']);
        $hours = isset($duration[0]) ? (int)$duration[0] : 0;
        $minutes = isset($duration[1]) ? (int)$duration[1] : 0;
        $seconds = isset($duration[2]) ? (int)$duration[2] : 0;
        
        $durationSeconds = ($hours * 3600) + ($minutes * 60) + $seconds;
        $pace = $durationSeconds / $workoutData['distance'];
        
        // Estimar calorias queimadas (fórmula simplificada)
        $user = getCurrentUser();
        $weight = $user['weight'] ?? 70; // Peso padrão se não tiver informado
        $caloriesPerKm = 0.9 * $weight;
        $caloriesBurned = $caloriesPerKm * $workoutData['distance'];
        
        $formattedDuration = sprintf("%02d:%02d:%02d", $hours, $minutes, $seconds);
        
        // MySQL usa TIME em vez de interval
        $stmt = $conn->prepare("INSERT INTO workouts 
                               (user_id, workout_date, distance, duration, pace, 
                                calories_burned, feeling, notes, created_at)
                               VALUES 
                               (:user_id, :date, :distance, :duration, :pace, 
                                :calories, :feeling, :notes, NOW())");
        
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':date', $workoutData['date']);
        $stmt->bindParam(':distance', $workoutData['distance']);
        $stmt->bindParam(':duration', $formattedDuration);
        $stmt->bindParam(':pace', $pace);
        $stmt->bindParam(':calories', $caloriesBurned, PDO::PARAM_INT);
        $stmt->bindParam(':feeling', $workoutData['feeling']);
        $stmt->bindParam(':notes', $workoutData['notes']);
        
        $stmt->execute();
        $workoutId = $conn->lastInsertId();
        
        // Atualizar estatísticas do usuário
        updateUserStats($userId);
        
        // Verificar conquistas
        checkAchievements($userId);
        
        $result['success'] = true;
        $result['message'] = "Treino salvo com sucesso!";
        $result['workout_id'] = $workoutId;
        
    } catch (PDOException $e) {
        $result['message'] = "Erro ao salvar treino: " . $e->getMessage();
        error_log("Erro ao salvar treino: " . $e->getMessage());
    }
    
    return $result;
}

/**
 * Obtém estatísticas do usuário para o dashboard
 * @return array Estatísticas do usuário
 */
function getUserStats() {
    if (!isLoggedIn()) {
        return [];
    }
    
    $userId = $_SESSION['user_id'];
    $conn = getDbConnection();
    $stats = [
        'total_workouts' => 0,
        'total_distance' => 0,
        'total_duration' => 0,
        'personal_records' => []
    ];
    
    try {
        // Total de treinos
        $stmt = $conn->prepare("SELECT COUNT(*) FROM workouts WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $stats['total_workouts'] = $stmt->fetchColumn();
        
        // Total de distância
        $stmt = $conn->prepare("SELECT COALESCE(SUM(distance), 0) FROM workouts WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $stats['total_distance'] = round($stmt->fetchColumn(), 1);
        
        // Total de duração em minutos (MySQL)
        $stmt = $conn->prepare("SELECT COALESCE(SUM(TIME_TO_SEC(duration))/60, 0) FROM workouts WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $totalMinutes = $stmt->fetchColumn();
        
        // Formatar em horas e minutos
        $hours = floor($totalMinutes / 60);
        $minutes = round($totalMinutes % 60);
        $stats['total_duration'] = sprintf("%dh %dm", $hours, $minutes);
        
        // Treinos completados na semana atual (MySQL)
        $stmt = $conn->prepare("SELECT COUNT(*) FROM workouts 
                               WHERE user_id = :user_id 
                               AND YEARWEEK(workout_date, 1) = YEARWEEK(CURDATE(), 1)");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $stats['workouts_this_week'] = $stmt->fetchColumn();
        
        // Distância no mês atual (MySQL)
        $stmt = $conn->prepare("SELECT COALESCE(SUM(distance), 0) FROM workouts 
                               WHERE user_id = :user_id 
                               AND YEAR(workout_date) = YEAR(CURRENT_DATE()) 
                               AND MONTH(workout_date) = MONTH(CURRENT_DATE())");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $stats['distance_this_month'] = round($stmt->fetchColumn(), 1);
        
    } catch (PDOException $e) {
        error_log("Erro ao obter estatísticas: " . $e->getMessage());
    }
    
    return $stats;
}

/**
 * Atualiza estatísticas do usuário
 * @param int $userId ID do usuário
 * @return bool Sucesso da operação
 */
function updateUserStats($userId) {
    // Esta função seria implementada para atualizar estatísticas agregadas
    // Pode ser expandida conforme necessário
    return true;
}

/**
 * Verifica conquistas após um novo treino
 * @param int $userId ID do usuário
 * @return array Novas conquistas desbloqueadas
 */
function checkAchievements($userId) {
    $conn = getDbConnection();
    $newAchievements = [];
    
    try {
        // Primeiro treino
        $stmt = $conn->prepare("SELECT COUNT(*) FROM workouts WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $workoutCount = $stmt->fetchColumn();
        
        // Verificar achievement "Primeiro Passo"
        if ($workoutCount == 1) {
            addUserAchievement($userId, 1); // ID 1 = Primeiro Passo
            $newAchievements[] = ['id' => 1, 'name' => 'Primeiro Passo'];
        }
        
        // Verificar achievement "Corredor Frequente"
        if ($workoutCount == 10) {
            addUserAchievement($userId, 3); // ID 3 = Corredor Frequente
            $newAchievements[] = ['id' => 3, 'name' => 'Corredor Frequente'];
        }
        
        // Verificar achievements por distância
        $stmt = $conn->prepare("SELECT SUM(distance) FROM workouts WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $totalDistance = $stmt->fetchColumn();
        
        // Maratonista Iniciante (42.2km)
        if ($totalDistance >= 42.2 && !hasAchievement($userId, 2)) {
            addUserAchievement($userId, 2); // ID 2 = Maratonista Iniciante
            $newAchievements[] = ['id' => 2, 'name' => 'Maratonista Iniciante'];
        }
        
        // Centena (100km)
        if ($totalDistance >= 100 && !hasAchievement($userId, 4)) {
            addUserAchievement($userId, 4); // ID 4 = Centena
            $newAchievements[] = ['id' => 4, 'name' => 'Centena'];
        }
        
        // Verificar treinos matutinos (antes das 7h) - MySQL
        $stmt = $conn->prepare("SELECT COUNT(*) FROM workouts 
                               WHERE user_id = :user_id 
                               AND HOUR(created_at) < 7");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $earlyRuns = $stmt->fetchColumn();
        
        if ($earlyRuns > 0 && !hasAchievement($userId, 5)) {
            addUserAchievement($userId, 5); // ID 5 = Madrugador
            $newAchievements[] = ['id' => 5, 'name' => 'Madrugador'];
        }
        
    } catch (PDOException $e) {
        error_log("Erro ao verificar conquistas: " . $e->getMessage());
    }
    
    return $newAchievements;
}

/**
 * Verifica se o usuário já possui uma conquista
 * @param int $userId ID do usuário
 * @param int $achievementId ID da conquista
 * @return bool Se o usuário possui a conquista
 */
function hasAchievement($userId, $achievementId) {
    $conn = getDbConnection();
    
    try {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM user_achievements 
                               WHERE user_id = :user_id AND achievement_id = :achievement_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':achievement_id', $achievementId);
        $stmt->execute();
        
        return $stmt->fetchColumn() > 0;
    } catch (PDOException $e) {
        error_log("Erro ao verificar conquista: " . $e->getMessage());
        return false;
    }
}

/**
 * Adiciona uma conquista para o usuário
 * @param int $userId ID do usuário
 * @param int $achievementId ID da conquista
 * @return bool Sucesso da operação
 */
function addUserAchievement($userId, $achievementId) {
    $conn = getDbConnection();
    
    try {
        $stmt = $conn->prepare("INSERT INTO user_achievements (user_id, achievement_id) 
                               VALUES (:user_id, :achievement_id)");
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':achievement_id', $achievementId);
        $stmt->execute();
        
        // Adicionar notificação para o usuário
        $stmt = $conn->prepare("SELECT name FROM achievements WHERE achievement_id = :id");
        $stmt->bindParam(':id', $achievementId);
        $stmt->execute();
        $achievementName = $stmt->fetchColumn();
        
        $content = "Parabéns! Você desbloqueou a conquista: " . $achievementName;
        
        $notifStmt = $conn->prepare("INSERT INTO notifications 
                                    (user_id, notification_type, content, related_id) 
                                    VALUES (:user_id, 'achievement', :content, :achievement_id)");
        $notifStmt->bindParam(':user_id', $userId);
        $notifStmt->bindParam(':content', $content);
        $notifStmt->bindParam(':achievement_id', $achievementId);
        $notifStmt->execute();
        
        return true;
    } catch (PDOException $e) {
        error_log("Erro ao adicionar conquista: " . $e->getMessage());
        return false;
    }
}

/**
 * Obtém o plano de treino atual do usuário
 * @return array|null Dados do plano ou null se não houver
 */
function getCurrentPlan() {
    if (!isLoggedIn()) {
        return null;
    }
    
    $userId = $_SESSION['user_id'];
    $conn = getDbConnection();
    
    try {
        $stmt = $conn->prepare("SELECT up.*, p.name, p.description, p.difficulty_level, p.duration_weeks
                               FROM user_plans up
                               JOIN plans p ON up.plan_id = p.plan_id
                               WHERE up.user_id = :user_id AND up.status = 'Em andamento'
                               ORDER BY up.start_date DESC
                               LIMIT 1");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch();
        }
    } catch (PDOException $e) {
        error_log("Erro ao obter plano atual: " . $e->getMessage());
    }
    
    return null;
}

/**
 * Obtém notificações não lidas do usuário
 * @param int $limit Limite de notificações
 * @return array Lista de notificações
 */
function getUnreadNotifications($limit = 10) {
    if (!isLoggedIn()) {
        return [];
    }
    
    $userId = $_SESSION['user_id'];
    $conn = getDbConnection();
    $notifications = [];
    
    try {
        $stmt = $conn->prepare("SELECT * FROM notifications
                               WHERE user_id = :user_id AND is_read = false
                               ORDER BY created_at DESC
                               LIMIT :limit");
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $notifications = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($notifications as &$notification) {
            $createdAt = new DateTime($notification['created_at']);
            $now = new DateTime();
            $interval = $createdAt->diff($now);
            
            if ($interval->y > 0) {
                $notification['time_ago'] = "Há " . $interval->y . " ano" . ($interval->y > 1 ? "s" : "");
            } elseif ($interval->m > 0) {
                $notification['time_ago'] = "Há " . $interval->m . " mês" . ($interval->m > 1 ? "es" : "");
            } elseif ($interval->d > 0) {
                $notification['time_ago'] = "Há " . $interval->d . " dia" . ($interval->d > 1 ? "s" : "");
            } elseif ($interval->h > 0) {
                $notification['time_ago'] = "Há " . $interval->h . " hora" . ($interval->h > 1 ? "s" : "");
            } elseif ($interval->i > 0) {
                $notification['time_ago'] = "Há " . $interval->i . " minuto" . ($interval->i > 1 ? "s" : "");
            } else {
                $notification['time_ago'] = "Agora";
            }
        }
        
    } catch (PDOException $e) {
        error_log("Erro ao obter notificações: " . $e->getMessage());
    }
    
    return $notifications;
}

/**
 * Marca todas as notificações como lidas
 * @return bool Sucesso da operação
 */
function markAllNotificationsAsRead() {
    if (!isLoggedIn()) {
        return false;
    }
    
    $userId = $_SESSION['user_id'];
    $conn = getDbConnection();
    
    try {
        $stmt = $conn->prepare("UPDATE notifications 
                               SET is_read = true 
                               WHERE user_id = :user_id AND is_read = false");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        return true;
    } catch (PDOException $e) {
        error_log("Erro ao marcar notificações como lidas: " . $e->getMessage());
        return false;
    }
}
?>
