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

// Obter planos disponíveis
function getAvailablePlans() {
    $conn = getDbConnection();
    try {
        $stmt = $conn->prepare("SELECT * FROM plans ORDER BY difficulty_level, name");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Erro ao obter planos: " . $e->getMessage());
        return [];
    }
}

$availablePlans = getAvailablePlans();

// Define active page for the sidebar
$activePage = 'workout-planner';
$isSubDirectory = true;
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planejar Treinos - LazzFit</title>
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/dashboard.css">
    <link rel="stylesheet" href="../css/workout-planner.css">
    <link rel="stylesheet" href="../css/form-elements.css">
    <link rel="stylesheet" href="../css/responsive.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="dashboard-body">
    <div class="dashboard-container">
        <!-- Include Sidebar Component -->
        <?php include_once '../includes/components/sidebar.php'; ?>

        <!-- Main Content -->
        <main class="dashboard-main">
            <header class="dashboard-header">
                <button class="sidebar-toggle" id="sidebar-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                <h1>Planejar Treinos</h1>
                <div class="header-actions">
                    <button class="cta cta--primary new-workout-btn">
                        <i class="fas fa-plus"></i> Registrar Treino
                    </button>
                </div>
            </header>

            <div class="dashboard-content">
                <!-- Tabs -->
                <div class="planner-tabs">
                    <button class="tab-btn active" data-tab="quick">Treino Rápido</button>
                    <button class="tab-btn" data-tab="planned">Planejar Treino</button>
                    <button class="tab-btn" data-tab="plans">Planos de Treino</button>
                </div>
                
                <!-- Tab Content -->
                <div class="tab-content">
                    <!-- Quick Workout Tab -->
                    <div id="quick-tab" class="tab-pane active">
                        <div class="content-card">
                            <div class="card-header">
                                <h2>Registrar Treino Rápido</h2>
                            </div>
                            <div class="card-content">
                                <form id="quick-workout-form" class="workout-form">
                                    <div class="form-row">
                                        <div class="form-floating">
                                            <input type="date" class="form-control" id="workout-date" name="workout_date" required value="<?php echo date('Y-m-d'); ?>">
                                            <label for="workout-date">Data do Treino</label>
                                        </div>
                                        <div class="form-floating">
                                            <select class="form-select" id="workout-type" name="workout_type" required>
                                                <option value="running">Corrida</option>
                                                <option value="interval">Treino Intervalado</option>
                                                <option value="tempo">Corrida de Ritmo</option>
                                                <option value="long">Corrida Longa</option>
                                                <option value="recovery">Corrida de Recuperação</option>
                                            </select>
                                            <label for="workout-type">Tipo de Treino</label>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-floating">
                                            <input type="number" class="form-control" id="workout-distance" name="distance" step="0.01" min="0" placeholder="0" required>
                                            <label for="workout-distance">Distância (km)</label>
                                        </div>
                                        <div class="form-group">
                                            <label for="workout-duration">Duração Total</label>
                                            <div class="duration-inputs">
                                                <input type="number" id="workout-hours" name="hours" placeholder="hh" min="0" value="0" required>
                                                <span>:</span>
                                                <input type="number" id="workout-minutes" name="minutes" placeholder="mm" min="0" max="59" value="0" required>
                                                <span>:</span>
                                                <input type="number" id="workout-seconds" name="seconds" placeholder="ss" min="0" max="59" value="0" required>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Como você se sentiu?</label>
                                        <div class="feeling-selector">
                                            <label class="feeling-option">
                                                <input type="radio" name="feeling" value="good" required>
                                                <span class="feeling-icon good"><i class="fas fa-smile"></i></span>
                                                <span>Bem</span>
                                            </label>
                                            <label class="feeling-option">
                                                <input type="radio" name="feeling" value="average" required>
                                                <span class="feeling-icon average"><i class="fas fa-meh"></i></span>
                                                <span>Normal</span>
                                            </label>
                                            <label class="feeling-option">
                                                <input type="radio" name="feeling" value="bad" required>
                                                <span class="feeling-icon bad"><i class="fas fa-frown"></i></span>
                                                <span>Cansado</span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div class="form-floating">
                                        <textarea class="form-control" id="workout-notes" name="notes" rows="3" placeholder="Suas observações"></textarea>
                                        <label for="workout-notes">Notas</label>
                                    </div>
                                    
                                    <div class="form-actions">
                                        <button type="submit" class="cta cta--primary">Salvar Treino</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <div class="workout-summary card-preview">
                            <h3>Resumo do Treino</h3>
                            <div class="summary-content">
                                <div class="summary-item">
                                    <span class="label">Ritmo Médio:</span>
                                    <span class="value" id="avg-pace">--:--/km</span>
                                </div>
                                <div class="summary-item">
                                    <span class="label">Calorias:</span>
                                    <span class="value" id="calories">-- kcal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Planned Workout Tab -->
                    <div id="planned-tab" class="tab-pane">
                        <div class="content-card">
                            <div class="card-header">
                                <h2>Planejar Treino</h2>
                            </div>
                            <div class="card-content">
                                <form id="planned-workout-form" class="workout-form">
                                    <div class="form-row">
                                        <div class="form-floating">
                                            <input type="date" class="form-control" id="planned-date" name="workout_date" required value="<?php echo date('Y-m-d', strtotime('+1 day')); ?>">
                                            <label for="planned-date">Data do Treino</label>
                                        </div>
                                        <div class="form-floating">
                                            <input type="time" class="form-control" id="planned-time" name="workout_time" required>
                                            <label for="planned-time">Horário</label>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-floating">
                                            <select class="form-select" id="planned-type" name="workout_type" required>
                                                <option value="running">Corrida</option>
                                                <option value="interval">Treino Intervalado</option>
                                                <option value="tempo">Corrida de Ritmo</option>
                                                <option value="long">Corrida Longa</option>
                                                <option value="recovery">Corrida de Recuperação</option>
                                            </select>
                                            <label for="planned-type">Tipo de Treino</label>
                                        </div>
                                        <div class="form-floating">
                                            <select class="form-select" id="planned-goal" name="workout_goal" required>
                                                <option value="distance">Distância</option>
                                                <option value="time">Tempo</option>
                                                <option value="pace">Ritmo</option>
                                            </select>
                                            <label for="planned-goal">Objetivo</label>
                                        </div>
                                    </div>
                                    
                                    <div id="goal-distance" class="goal-input">
                                        <div class="form-floating">
                                            <input type="number" class="form-control" id="planned-distance" name="distance" step="0.01" min="0" placeholder="0">
                                            <label for="planned-distance">Distância Alvo (km)</label>
                                        </div>
                                    </div>
                                    
                                    <div id="goal-time" class="goal-input" style="display: none;">
                                        <div class="form-group">
                                            <label for="planned-duration">Duração Alvo</label>
                                            <div class="duration-inputs">
                                                <input type="number" id="planned-hours" name="hours" placeholder="hh" min="0" value="0">
                                                <span>:</span>
                                                <input type="number" id="planned-minutes" name="minutes" placeholder="mm" min="0" max="59" value="30">
                                                <span>:</span>
                                                <input type="number" id="planned-seconds" name="seconds" placeholder="ss" min="0" max="59" value="0">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div id="goal-pace" class="goal-input" style="display: none;">
                                        <div class="form-group">
                                            <label for="planned-pace">Ritmo Alvo (min/km)</label>
                                            <div class="pace-inputs">
                                                <input type="number" id="planned-pace-min" name="pace_min" min="3" max="10" value="5">
                                                <span>:</span>
                                                <input type="number" id="planned-pace-sec" name="pace_sec" min="0" max="59" value="30">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-floating">
                                        <textarea class="form-control" id="planned-notes" name="notes" rows="3" placeholder="Suas observações"></textarea>
                                        <label for="planned-notes">Notas</label>
                                    </div>
                                    
                                    <div class="form-actions">
                                        <button type="submit" class="cta cta--primary">Agendar Treino</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Training Plans Tab -->
                    <div id="plans-tab" class="tab-pane">
                        <div class="content-card">
                            <div class="card-header">
                                <h2>Planos de Treino Disponíveis</h2>
                            </div>
                            <div class="card-content">
                                <div class="plans-grid">
                                    <?php foreach ($availablePlans as $plan): ?>
                                    <div class="plan-card">
                                        <div class="plan-header">
                                            <h3><?php echo htmlspecialchars($plan['name']); ?></h3>
                                            <span class="plan-level <?php echo strtolower($plan['difficulty_level']); ?>">
                                                <?php echo htmlspecialchars($plan['difficulty_level']); ?>
                                            </span>
                                        </div>
                                        <div class="plan-details">
                                            <p><?php echo htmlspecialchars($plan['description']); ?></p>
                                            <ul class="plan-features">
                                                <?php if ($plan['duration_weeks'] > 0): ?>
                                                <li><i class="fas fa-calendar-week"></i> <?php echo $plan['duration_weeks']; ?> semanas</li>
                                                <?php else: ?>
                                                <li><i class="fas fa-calendar-week"></i> Flexível</li>
                                                <?php endif; ?>
                                                <li><i class="fas fa-bullseye"></i> Objetivo: <?php echo htmlspecialchars($plan['goal']); ?></li>
                                            </ul>
                                        </div>
                                        <div class="plan-actions">
                                            <button class="cta cta--secondary view-plan-btn" data-plan-id="<?php echo $plan['plan_id']; ?>">
                                                Ver Detalhes
                                            </button>
                                            <button class="cta cta--primary start-plan-btn" data-plan-id="<?php echo $plan['plan_id']; ?>">
                                                Iniciar Plano
                                            </button>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="../js/main.js"></script>
    <script src="../js/dashboard.js"></script>
    <script src="../js/workout-planner.js"></script>
    <script src="../js/sidebar.js"></script>
</body>
</html>
