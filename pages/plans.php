<?php
require_once '../includes/auth_functions.php';
require_once '../includes/dashboard_functions.php';

// Verificar se o usuário está autenticado
if (!isLoggedIn()) {
    header('Location: login.html');
    exit;
}

// Obter dados do usuário
$user = getCurrentUser();
if (!$user) {
    header('Location: ../auth/logout.php');
    exit;
}

// Função para obter planos do usuário
function getUserPlans($userId) {
    $conn = getDbConnection();
    $activePlans = [];
    $completedPlans = [];
    $abandonedPlans = [];
    
    try {
        // Planos ativos
        $stmt = $conn->prepare("SELECT up.*, p.name, p.description, p.difficulty_level, p.duration_weeks, p.goal
                               FROM user_plans up
                               JOIN plans p ON up.plan_id = p.plan_id
                               WHERE up.user_id = :user_id AND up.status = 'Em andamento'
                               ORDER BY up.start_date DESC");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $activePlans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Planos completados
        $stmt = $conn->prepare("SELECT up.*, p.name, p.description, p.difficulty_level, p.duration_weeks, p.goal
                               FROM user_plans up
                               JOIN plans p ON up.plan_id = p.plan_id
                               WHERE up.user_id = :user_id AND up.status = 'Concluído'
                               ORDER BY up.end_date DESC");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $completedPlans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Planos abandonados
        $stmt = $conn->prepare("SELECT up.*, p.name, p.description, p.difficulty_level, p.duration_weeks, p.goal
                               FROM user_plans up
                               JOIN plans p ON up.plan_id = p.plan_id
                               WHERE up.user_id = :user_id AND up.status = 'Abandonado'
                               ORDER BY up.updated_at DESC");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $abandonedPlans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'active' => $activePlans,
            'completed' => $completedPlans,
            'abandoned' => $abandonedPlans
        ];
        
    } catch (PDOException $e) {
        error_log("Erro ao obter planos do usuário: " . $e->getMessage());
        return [
            'active' => [],
            'completed' => [],
            'abandoned' => []
        ];
    }
}

// Função para obter detalhes da semana atual de um plano
function getCurrentWeekDetails($userPlanId) {
    $conn = getDbConnection();
    $weekDetails = [];
    
    try {
        $stmt = $conn->prepare("SELECT up.*, DATEDIFF(CURDATE(), up.start_date) AS days_elapsed,
                               p.duration_weeks
                               FROM user_plans up
                               JOIN plans p ON up.plan_id = p.plan_id
                               WHERE up.user_plan_id = :user_plan_id");
        $stmt->bindParam(':user_plan_id', $userPlanId);
        $stmt->execute();
        
        $plan = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($plan) {
            $daysElapsed = $plan['days_elapsed'];
            $currentWeek = floor($daysElapsed / 7) + 1;
            $weekDay = $daysElapsed % 7;
            
            // Gerar dados fictícios para a semana atual (em um sistema real, isso viria do banco de dados)
            $weekSchedule = [
                ['day' => 'Segunda', 'workout' => 'Corrida leve - 5km', 'status' => $weekDay >= 1 ? 'done' : ($weekDay == 0 ? 'today' : '')],
                ['day' => 'Terça', 'workout' => 'Descanso', 'status' => $weekDay >= 2 ? 'done' : ($weekDay == 1 ? 'today' : '')],
                ['day' => 'Quarta', 'workout' => 'Intervalos - 6x400m', 'status' => $weekDay >= 3 ? 'done' : ($weekDay == 2 ? 'today' : '')],
                ['day' => 'Quinta', 'workout' => 'Corrida moderada - 6km', 'status' => $weekDay >= 4 ? 'done' : ($weekDay == 3 ? 'today' : '')],
                ['day' => 'Sexta', 'workout' => 'Descanso', 'status' => $weekDay >= 5 ? 'done' : ($weekDay == 4 ? 'today' : '')],
                ['day' => 'Sábado', 'workout' => 'Ritmo - 3km', 'status' => $weekDay >= 6 ? 'done' : ($weekDay == 5 ? 'today' : '')],
                ['day' => 'Domingo', 'workout' => 'Corrida longa - 10km', 'status' => $weekDay >= 7 ? 'done' : ($weekDay == 6 ? 'today' : '')]
            ];
            
            $weekDetails = [
                'current_week' => $currentWeek,
                'total_weeks' => $plan['duration_weeks'],
                'schedule' => $weekSchedule
            ];
        }
        
        return $weekDetails;
        
    } catch (PDOException $e) {
        error_log("Erro ao obter detalhes da semana: " . $e->getMessage());
        return [];
    }
}

// Obter planos do usuário
$userPlans = getUserPlans($user['user_id']);

// Obter detalhes da semana atual do plano ativo (se houver)
$currentWeekDetails = [];
if (!empty($userPlans['active'])) {
    $currentWeekDetails = getCurrentWeekDetails($userPlans['active'][0]['user_plan_id']);
}

// Obter planos disponíveis para o usuário iniciar
function getAvailablePlans() {
    $conn = getDbConnection();
    try {
        $stmt = $conn->prepare("SELECT * FROM plans ORDER BY difficulty_level, name");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Erro ao obter planos disponíveis: " . $e->getMessage());
        return [];
    }
}

$availablePlans = getAvailablePlans();

// Formatar datas para exibição
function formatDate($dateString) {
    $date = new DateTime($dateString);
    return $date->format('d/m/Y');
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Planos - LazzFit</title>
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/dashboard.css">
    <link rel="stylesheet" href="../css/plans.css">
    <link rel="stylesheet" href="../css/form-elements.css">
    <link rel="stylesheet" href="../css/notifications.css">
    <link rel="stylesheet" href="../css/responsive.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="dashboard-body">
    <div class="dashboard-container">
        <!-- Sidebar Navigation -->
        <aside class="dashboard-sidebar">
            <div class="sidebar-header">
                <a href="../index.html" class="logo">
                    <h2>Lazz<span>Fit</span></h2>
                </a>
                <button class="sidebar-close" id="sidebar-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="user-profile">
                <div class="user-avatar">
                    <?php if (!empty($user['profile_image'])): ?>
                        <img src="<?php echo htmlspecialchars($user['profile_image']); ?>" alt="Perfil do usuário">
                    <?php else: ?>
                        <img src="../images/default-avatar.png" alt="Perfil do usuário">
                    <?php endif; ?>
                </div>
                <div class="user-info">
                    <h3 class="user-name"><?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?></h3>
                    <p class="user-level"><?php echo htmlspecialchars($user['runner_level']); ?></p>
                </div>
            </div>

            <nav class="sidebar-nav">
                <ul>
                    <li><a href="../dashboard.php"><i class="fas fa-home"></i> Visão Geral</a></li>
                    <li><a href="workout-planner.php"><i class="fas fa-running"></i> Planejar Treinos</a></li>
                    <li class="active"><a href="plans.php"><i class="fas fa-calendar-alt"></i> Meus Planos</a></li>
                    <li><a href="tracking.php"><i class="fas fa-chart-line"></i> Acompanhamento</a></li>
                    <li><a href="profile.php"><i class="fas fa-user-cog"></i> Perfil</a></li>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <a href="../auth/logout.php" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Sair</a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="dashboard-main">
            <header class="dashboard-header">
                <button class="sidebar-toggle" id="sidebar-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                <h1>Meus Planos de Treino</h1>
                <div class="header-actions">
                    <button class="cta cta--primary" id="explore-plans-btn">
                        <i class="fas fa-plus"></i> Novo Plano
                    </button>
                </div>
            </header>

            <div class="dashboard-content">
                <!-- Current Plans Section -->
                <section class="content-section">
                    <h2 class="section-title">Planos Ativos</h2>
                    
                    <?php if (!empty($userPlans['active'])): ?>
                        <?php foreach ($userPlans['active'] as $plan): ?>
                            <div class="plan-card active-plan">
                                <div class="plan-header">
                                    <div class="plan-title">
                                        <h3><?php echo htmlspecialchars($plan['name']); ?></h3>
                                        <span class="plan-level <?php echo strtolower($plan['difficulty_level']); ?>">
                                            <?php echo htmlspecialchars($plan['difficulty_level']); ?>
                                        </span>
                                    </div>
                                    <div class="plan-progress">
                                        <div class="progress-bar">
                                            <div class="progress" style="width: <?php echo $plan['progress_percent']; ?>%"></div>
                                        </div>
                                        <span class="progress-text"><?php echo number_format($plan['progress_percent'], 0); ?>% concluído</span>
                                    </div>
                                </div>
                                
                                <div class="plan-dates">
                                    <div class="date-item">
                                        <span class="date-label">Início</span>
                                        <span class="date-value"><?php echo formatDate($plan['start_date']); ?></span>
                                    </div>
                                    <div class="date-divider"></div>
                                    <div class="date-item">
                                        <span class="date-label">Término previsto</span>
                                        <span class="date-value"><?php echo formatDate($plan['end_date']); ?></span>
                                    </div>
                                </div>
                                
                                <div class="plan-meta">
                                    <div class="meta-item">
                                        <i class="fas fa-bullseye"></i>
                                        <span>Objetivo: <?php echo htmlspecialchars($plan['goal']); ?></span>
                                    </div>
                                    <div class="meta-item">
                                        <i class="fas fa-calendar-week"></i>
                                        <span>Duração: <?php echo $plan['duration_weeks']; ?> semanas</span>
                                    </div>
                                </div>
                                
                                <?php if (!empty($currentWeekDetails)): ?>
                                    <div class="plan-week">
                                        <h4>Semana <?php echo $currentWeekDetails['current_week']; ?> de <?php echo $currentWeekDetails['total_weeks']; ?></h4>
                                        <div class="week-schedule">
                                            <?php foreach ($currentWeekDetails['schedule'] as $day): ?>
                                                <div class="day-item <?php echo $day['status']; ?>">
                                                    <div class="day-header">
                                                        <span class="day-name"><?php echo $day['day']; ?></span>
                                                        <?php if ($day['status'] === 'done'): ?>
                                                            <span class="day-status"><i class="fas fa-check-circle"></i></span>
                                                        <?php elseif ($day['status'] === 'today'): ?>
                                                            <span class="day-status today">Hoje</span>
                                                        <?php endif; ?>
                                                    </div>
                                                    <div class="day-content">
                                                        <p><?php echo $day['workout']; ?></p>
                                                    </div>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                <?php endif; ?>
                                
                                <div class="plan-actions">
                                    <a href="workout-planner.php" class="cta cta--secondary">Registrar Treino</a>
                                    <button class="cta cta--outline plan-options-btn" data-plan-id="<?php echo $plan['user_plan_id']; ?>">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="empty-state">
                            <div class="empty-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <h3>Nenhum plano ativo</h3>
                            <p>Você não possui nenhum plano de treino ativo no momento.</p>
                            <button class="cta cta--primary explore-plans-trigger">Explorar Planos</button>
                        </div>
                    <?php endif; ?>
                </section>
                
                <!-- Completed Plans Section -->
                <section class="content-section">
                    <h2 class="section-title">Histórico de Planos</h2>
                    
                    <?php if (!empty($userPlans['completed']) || !empty($userPlans['abandoned'])): ?>
                        <div class="history-tabs">
                            <button class="history-tab active" data-tab="completed">Concluídos</button>
                            <button class="history-tab" data-tab="abandoned">Abandonados</button>
                        </div>
                        
                        <div class="history-content">
                            <!-- Completed Plans Tab -->
                            <div class="history-pane active" id="completed-plans">
                                <?php if (!empty($userPlans['completed'])): ?>
                                    <div class="plans-grid">
                                        <?php foreach ($userPlans['completed'] as $plan): ?>
                                            <div class="history-plan-card">
                                                <div class="plan-card-header">
                                                    <h3><?php echo htmlspecialchars($plan['name']); ?></h3>
                                                    <span class="plan-badge completed">Concluído</span>
                                                </div>
                                                <div class="plan-card-dates">
                                                    <p><i class="far fa-calendar"></i> <?php echo formatDate($plan['start_date']); ?> - <?php echo formatDate($plan['end_date']); ?></p>
                                                </div>
                                                <div class="plan-card-meta">
                                                    <span class="meta-item"><i class="fas fa-bullseye"></i> <?php echo htmlspecialchars($plan['goal']); ?></span>
                                                </div>
                                                <div class="plan-card-actions">
                                                    <button class="cta cta--text view-plan-details" data-plan-id="<?php echo $plan['user_plan_id']; ?>">Ver Detalhes</button>
                                                    <button class="cta cta--secondary restart-plan" data-plan-id="<?php echo $plan['plan_id']; ?>">Reiniciar</button>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                <?php else: ?>
                                    <div class="empty-history">
                                        <p>Você ainda não concluiu nenhum plano de treino.</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <!-- Abandoned Plans Tab -->
                            <div class="history-pane" id="abandoned-plans">
                                <?php if (!empty($userPlans['abandoned'])): ?>
                                    <div class="plans-grid">
                                        <?php foreach ($userPlans['abandoned'] as $plan): ?>
                                            <div class="history-plan-card">
                                                <div class="plan-card-header">
                                                    <h3><?php echo htmlspecialchars($plan['name']); ?></h3>
                                                    <span class="plan-badge abandoned">Abandonado</span>
                                                </div>
                                                <div class="plan-card-dates">
                                                    <p><i class="far fa-calendar"></i> <?php echo formatDate($plan['start_date']); ?> - <?php echo formatDate($plan['updated_at']); ?></p>
                                                </div>
                                                <div class="plan-card-meta">
                                                    <span class="meta-item"><i class="fas fa-bullseye"></i> <?php echo htmlspecialchars($plan['goal']); ?></span>
                                                </div>
                                                <div class="plan-card-actions">
                                                    <button class="cta cta--secondary restart-plan" data-plan-id="<?php echo $plan['plan_id']; ?>">Reiniciar</button>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                <?php else: ?>
                                    <div class="empty-history">
                                        <p>Você não possui planos abandonados.</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php else: ?>
                        <div class="empty-history">
                            <p>Seu histórico de planos estará disponível aqui quando você concluir ou abandonar um plano.</p>
                        </div>
                    <?php endif; ?>
                </section>
            </div>
        </main>
    </div>
    
    <!-- Modal para explorar novos planos -->
    <div class="modal" id="explore-plans-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Explorar Planos de Treino</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="filter-container">
                    <div class="filter-group">
                        <label for="filter-level">Nível</label>
                        <select id="filter-level" class="form-select">
                            <option value="">Todos</option>
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-goal">Objetivo</label>
                        <select id="filter-goal" class="form-select">
                            <option value="">Todos</option>
                            <option value="5K">5K</option>
                            <option value="10K">10K</option>
                            <option value="21K">Meia Maratona</option>
                            <option value="42K">Maratona</option>
                        </select>
                    </div>
                </div>
                
                <div class="available-plans">
                    <?php foreach ($availablePlans as $plan): ?>
                        <div class="explore-plan-card" data-level="<?php echo htmlspecialchars($plan['difficulty_level']); ?>" data-goal="<?php echo htmlspecialchars($plan['goal']); ?>">
                            <div class="plan-card-header">
                                <h3><?php echo htmlspecialchars($plan['name']); ?></h3>
                                <span class="plan-level <?php echo strtolower($plan['difficulty_level']); ?>"><?php echo htmlspecialchars($plan['difficulty_level']); ?></span>
                            </div>
                            <div class="plan-card-description">
                                <p><?php echo htmlspecialchars($plan['description']); ?></p>
                            </div>
                            <div class="plan-card-meta">
                                <div class="meta-item">
                                    <i class="fas fa-calendar-week"></i>
                                    <span><?php echo $plan['duration_weeks']; ?> semanas</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-bullseye"></i>
                                    <span>Objetivo: <?php echo htmlspecialchars($plan['goal']); ?></span>
                                </div>
                            </div>
                            <div class="plan-card-actions">
                                <button class="cta cta--secondary view-plan-details" data-plan-id="<?php echo $plan['plan_id']; ?>">Ver Detalhes</button>
                                <button class="cta cta--primary start-plan" data-plan-id="<?php echo $plan['plan_id']; ?>">Iniciar Plano</button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal para iniciar plano -->
    <div class="modal" id="start-plan-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Iniciar Plano de Treino</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="start-plan-form">
                    <input type="hidden" id="selected-plan-id" name="plan_id">
                    
                    <div class="form-floating">
                        <input type="date" class="form-control" id="start-date" name="start_date" required value="<?php echo date('Y-m-d'); ?>">
                        <label for="start-date">Data de início</label>
                    </div>
                    
                    <div class="form-floating">
                        <textarea class="form-control" id="plan-notes" name="notes" rows="3" placeholder="Adicione observações ou objetivos pessoais"></textarea>
                        <label for="plan-notes">Observações (opcional)</label>
                    </div>
                </form>
                
                <div class="plan-summary" id="plan-summary">
                    <!-- O resumo do plano será carregado dinamicamente -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="cta cta--secondary" id="cancel-start-plan">Cancelar</button>
                <button class="cta cta--primary" id="confirm-start-plan">Iniciar Plano</button>
            </div>
        </div>
    </div>
    
    <!-- Modal para opções de plano ativo -->
    <div class="modal" id="plan-options-modal">
        <div class="modal-content modal-sm">
            <div class="modal-header">
                <h2>Opções do Plano</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="options-list">
                    <button class="option-btn view-plan-btn">
                        <i class="fas fa-eye"></i>
                        <span>Ver detalhes do plano</span>
                    </button>
                    <button class="option-btn edit-plan-btn">
                        <i class="fas fa-edit"></i>
                        <span>Editar plano</span>
                    </button>
                    <button class="option-btn pause-plan-btn">
                        <i class="fas fa-pause"></i>
                        <span>Pausar plano</span>
                    </button>
                    <button class="option-btn complete-plan-btn">
                        <i class="fas fa-check-circle"></i>
                        <span>Marcar como concluído</span>
                    </button>
                    <button class="option-btn abandon-plan-btn danger">
                        <i class="fas fa-times-circle"></i>
                        <span>Abandonar plano</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Toast Container for Notifications -->
    <div class="toast-container" id="toast-container"></div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Dados de planos para uso no JavaScript
        const plansData = <?php echo json_encode($availablePlans); ?>;
    </script>
    <script src="../js/main.js"></script>
    <script src="../js/dashboard.js"></script>
    <script src="../js/plans.js"></script>
</body>
</html>
