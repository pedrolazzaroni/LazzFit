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

// Definir período padrão (últimos 30 dias)
$periodStart = date('Y-m-d', strtotime('-30 days'));
$periodEnd = date('Y-m-d');

// Verificar se foi solicitado um período específico
if (isset($_GET['period_start']) && isset($_GET['period_end'])) {
    $periodStart = $_GET['period_start'];
    $periodEnd = $_GET['period_end'];
}

// Função para obter os treinos do período selecionado
function getWorkoutsForPeriod($userId, $startDate, $endDate) {
    $conn = getDbConnection();
    $workouts = [];
    
    try {
        $stmt = $conn->prepare("SELECT w.*, DATE_FORMAT(w.workout_date, '%Y-%m-%d') as workout_date_formatted,
                                ROUND(TIME_TO_SEC(w.duration)/60, 1) as duration_minutes,
                                TIME_FORMAT(w.duration, '%H:%i:%s') as duration_formatted
                                FROM workouts w
                                WHERE w.user_id = :user_id
                                AND w.workout_date BETWEEN :start_date AND :end_date
                                ORDER BY w.workout_date DESC");
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':start_date', $startDate);
        $stmt->bindParam(':end_date', $endDate);
        $stmt->execute();
        
        $workouts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatar dados adicionais para cada treino
        foreach ($workouts as &$workout) {
            // Formatar ritmo
            $paceInSeconds = $workout['pace'] ?? 0;
            if ($paceInSeconds > 0) {
                $paceMinutes = floor($paceInSeconds / 60);
                $paceSeconds = round($paceInSeconds % 60);
                $workout['pace_formatted'] = sprintf("%d:%02d min/km", $paceMinutes, $paceSeconds);
            } else {
                $workout['pace_formatted'] = "--:-- min/km";
            }
            
            // Formatar data para exibição
            $date = new DateTime($workout['workout_date']);
            $workout['date_formatted'] = $date->format('d/m/Y');
            
            // Determinar ícone para tipo de treino
            switch ($workout['workout_type']) {
                case 'interval':
                    $workout['type_icon'] = 'fa-stopwatch';
                    $workout['type_label'] = 'Treino Intervalado';
                    break;
                case 'tempo':
                    $workout['type_icon'] = 'fa-tachometer-alt';
                    $workout['type_label'] = 'Corrida de Ritmo';
                    break;
                case 'long':
                    $workout['type_icon'] = 'fa-road';
                    $workout['type_label'] = 'Corrida Longa';
                    break;
                case 'recovery':
                    $workout['type_icon'] = 'fa-heartbeat';
                    $workout['type_label'] = 'Corrida de Recuperação';
                    break;
                default:
                    $workout['type_icon'] = 'fa-running';
                    $workout['type_label'] = 'Corrida';
            }
        }
        
        return $workouts;
        
    } catch (PDOException $e) {
        error_log("Erro ao obter treinos: " . $e->getMessage());
        return [];
    }
}

// Obter dados de treino para o período selecionado
$userId = $user['user_id'];
$workouts = getWorkoutsForPeriod($userId, $periodStart, $periodEnd);

// Calcular estatísticas do período
function calculatePeriodStats($workouts) {
    if (empty($workouts)) {
        return [
            'total_workouts' => 0,
            'total_distance' => 0,
            'total_duration' => 0,
            'avg_pace' => 0,
            'avg_distance' => 0,
            'avg_duration' => 0,
            'pace_formatted' => '--:--',
            'duration_formatted' => '0h 0min',
            'best_pace' => ['value' => 0, 'formatted' => '--:--', 'date' => ''],
            'longest_distance' => ['value' => 0, 'date' => ''],
            'longest_duration' => ['value' => 0, 'formatted' => '0h 0min', 'date' => '']
        ];
    }
    
    $totalWorkouts = count($workouts);
    $totalDistance = array_sum(array_column($workouts, 'distance'));
    $totalDuration = array_sum(array_column($workouts, 'duration_minutes'));
    
    // Melhor ritmo (menor valor)
    $bestPace = INF;
    $bestPaceDate = '';
    
    // Maior distância
    $longestDistance = 0;
    $longestDistanceDate = '';
    
    // Maior duração
    $longestDuration = 0;
    $longestDurationDate = '';
    
    foreach ($workouts as $workout) {
        // Verificar melhor ritmo (só consideramos se tiver pace calculado)
        $pace = $workout['pace'] ?? 0;
        if ($pace > 0 && $pace < $bestPace) {
            $bestPace = $pace;
            $bestPaceDate = $workout['date_formatted'];
        }
        
        // Verificar maior distância
        if ($workout['distance'] > $longestDistance) {
            $longestDistance = $workout['distance'];
            $longestDistanceDate = $workout['date_formatted'];
        }
        
        // Verificar maior duração
        if ($workout['duration_minutes'] > $longestDuration) {
            $longestDuration = $workout['duration_minutes'];
            $longestDurationDate = $workout['date_formatted'];
        }
    }
    
    // Calcular médias
    $avgDistance = $totalDistance / $totalWorkouts;
    $avgDuration = $totalDuration / $totalWorkouts;
    
    // Calcular ritmo médio
    $avgPace = ($totalDuration > 0 && $totalDistance > 0) ? 
        ($totalDuration * 60) / $totalDistance : 0;
    
    // Formatar duração total
    $totalHours = floor($totalDuration / 60);
    $totalMinutes = round($totalDuration % 60);
    $durationFormatted = "{$totalHours}h {$totalMinutes}min";
    
    // Formatar ritmo médio
    $avgPaceMinutes = floor($avgPace / 60);
    $avgPaceSeconds = round($avgPace % 60);
    $avgPaceFormatted = sprintf("%d:%02d min/km", $avgPaceMinutes, $avgPaceSeconds);
    
    // Formatar melhor ritmo
    $bestPaceMinutes = floor($bestPace / 60);
    $bestPaceSeconds = round($bestPace % 60);
    $bestPaceFormatted = sprintf("%d:%02d min/km", $bestPaceMinutes, $bestPaceSeconds);
    
    // Formatar maior duração
    $longestHours = floor($longestDuration / 60);
    $longestMinutes = round($longestDuration % 60);
    $longestDurationFormatted = "{$longestHours}h {$longestMinutes}min";
    
    return [
        'total_workouts' => $totalWorkouts,
        'total_distance' => round($totalDistance, 1),
        'total_duration' => $totalDuration,
        'avg_pace' => $avgPace,
        'avg_distance' => round($avgDistance, 1),
        'avg_duration' => $avgDuration,
        'pace_formatted' => $avgPaceFormatted,
        'duration_formatted' => $durationFormatted,
        'best_pace' => [
            'value' => $bestPace, 
            'formatted' => $bestPaceFormatted,
            'date' => $bestPaceDate
        ],
        'longest_distance' => [
            'value' => $longestDistance,
            'date' => $longestDistanceDate
        ],
        'longest_duration' => [
            'value' => $longestDuration,
            'formatted' => $longestDurationFormatted,
            'date' => $longestDurationDate
        ]
    ];
}

// Obter estatísticas do período
$periodStats = calculatePeriodStats($workouts);

// Preparar dados para gráficos
function prepareChartData($workouts, $periodStart, $periodEnd) {
    // Criar array com todas as datas do período
    $start = new DateTime($periodStart);
    $end = new DateTime($periodEnd);
    $interval = new DateInterval('P1D');
    $dateRange = new DatePeriod($start, $interval, $end->modify('+1 day'));
    
    // Inicializar arrays para gráficos
    $distanceData = [];
    $paceData = [];
    $durationData = [];
    $labels = [];
    
    // Criar mapeamento de data para treino
    $workoutsByDate = [];
    foreach ($workouts as $workout) {
        $date = $workout['workout_date_formatted'];
        if (!isset($workoutsByDate[$date])) {
            $workoutsByDate[$date] = [];
        }
        $workoutsByDate[$date][] = $workout;
    }
    
    // Preencher dados para cada data no período
    foreach ($dateRange as $date) {
        $dateStr = $date->format('Y-m-d');
        $labels[] = $date->format('d/m');
        
        // Se tem treino nesta data
        if (isset($workoutsByDate[$dateStr])) {
            // Somar distâncias e durações para múltiplos treinos no mesmo dia
            $dailyDistance = array_sum(array_column($workoutsByDate[$dateStr], 'distance'));
            $dailyDuration = array_sum(array_column($workoutsByDate[$dateStr], 'duration_minutes'));
            
            $distanceData[] = round($dailyDistance, 1);
            $durationData[] = round($dailyDuration);
            
            // Calcular ritmo médio do dia
            $dailyPace = ($dailyDuration > 0 && $dailyDistance > 0) ? 
                ($dailyDuration * 60) / $dailyDistance : null;
            $paceData[] = $dailyPace ? round($dailyPace) : null;
        } else {
            // Sem treinos nesta data
            $distanceData[] = 0;
            $durationData[] = 0;
            $paceData[] = null;  // null para não conectar a linha no gráfico
        }
    }
    
    return [
        'labels' => $labels,
        'distance' => $distanceData,
        'pace' => $paceData,
        'duration' => $durationData
    ];
}

// Preparar dados para gráficos
$chartData = prepareChartData($workouts, $periodStart, $periodEnd);

// Preparar opções de período
$periodOptions = [
    '7d' => 'Últimos 7 dias',
    '30d' => 'Últimos 30 dias',
    '90d' => 'Últimos 3 meses',
    '180d' => 'Últimos 6 meses',
    '365d' => 'Último ano',
    'custom' => 'Personalizado'
];

// Identificar período atual
$currentPeriod = '30d'; // Padrão
if (isset($_GET['period'])) {
    $currentPeriod = $_GET['period'];
} elseif (isset($_GET['period_start']) && isset($_GET['period_end'])) {
    $currentPeriod = 'custom';
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acompanhamento - LazzFit</title>
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/dashboard.css">
    <link rel="stylesheet" href="../css/tracking.css">
    <link rel="stylesheet" href="../css/form-elements.css">
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
                    <li><a href="plans.php"><i class="fas fa-calendar-alt"></i> Meus Planos</a></li>
                    <li class="active"><a href="tracking.php"><i class="fas fa-chart-line"></i> Acompanhamento</a></li>
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
                <h1>Acompanhamento</h1>
                <div class="header-actions">
                    <a href="workout-planner.php" class="cta cta--primary"><i class="fas fa-plus"></i> Novo Treino</a>
                </div>
            </header>

            <div class="dashboard-content">
                <!-- Period Selector -->
                <section class="tracking-controls">
                    <div class="period-selector">
                        <h3>Período</h3>
                        <div class="period-options">
                            <?php foreach ($periodOptions as $key => $label): ?>
                                <button class="period-option <?php echo $currentPeriod === $key ? 'active' : ''; ?>" data-period="<?php echo $key; ?>">
                                    <?php echo $label; ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                        
                        <div class="custom-period" id="custom-period-container" style="<?php echo $currentPeriod === 'custom' ? '' : 'display: none;'; ?>">
                            <form id="custom-period-form" action="tracking.php" method="GET">
                                <input type="hidden" name="period" value="custom">
                                <div class="date-range-picker">
                                    <div class="form-floating">
                                        <input type="date" class="form-control" id="period-start" name="period_start" value="<?php echo $periodStart; ?>" required>
                                        <label for="period-start">Data inicial</label>
                                    </div>
                                    <span class="date-separator">até</span>
                                    <div class="form-floating">
                                        <input type="date" class="form-control" id="period-end" name="period_end" value="<?php echo $periodEnd; ?>" required>
                                        <label for="period-end">Data final</label>
                                    </div>
                                    <button type="submit" class="cta cta--secondary">Aplicar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
                
                <!-- Period Stats -->
                <section class="content-section period-stats">
                    <h2 class="section-title">Resumo do Período</h2>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-shoe-prints"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Total de Treinos</h3>
                                <p class="stat-value"><?php echo $periodStats['total_workouts']; ?></p>
                                <p class="stat-label">Treinos registrados</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-road"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Distância Total</h3>
                                <p class="stat-value"><?php echo $periodStats['total_distance']; ?> km</p>
                                <p class="stat-label"><?php echo round($periodStats['avg_distance'], 1); ?> km por treino</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Tempo Total</h3>
                                <p class="stat-value"><?php echo $periodStats['duration_formatted']; ?></p>
                                <p class="stat-label">Em movimento</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Ritmo Médio</h3>
                                <p class="stat-value"><?php echo $periodStats['pace_formatted']; ?></p>
                                <p class="stat-label">Por quilômetro</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="personal-records">
                        <h3>Destaques do Período</h3>
                        
                        <div class="records-grid">
                            <?php if ($periodStats['best_pace']['value'] !== INF && $periodStats['best_pace']['value'] > 0): ?>
                            <div class="record-card">
                                <div class="record-icon">
                                    <i class="fas fa-bolt"></i>
                                </div>
                                <div class="record-info">
                                    <h4>Melhor Ritmo</h4>
                                    <p class="record-value"><?php echo $periodStats['best_pace']['formatted']; ?></p>
                                    <p class="record-date"><?php echo $periodStats['best_pace']['date']; ?></p>
                                </div>
                            </div>
                            <?php endif; ?>
                            
                            <?php if ($periodStats['longest_distance']['value'] > 0): ?>
                            <div class="record-card">
                                <div class="record-icon">
                                    <i class="fas fa-route"></i>
                                </div>
                                <div class="record-info">
                                    <h4>Maior Distância</h4>
                                    <p class="record-value"><?php echo $periodStats['longest_distance']['value']; ?> km</p>
                                    <p class="record-date"><?php echo $periodStats['longest_distance']['date']; ?></p>
                                </div>
                            </div>
                            <?php endif; ?>
                            
                            <?php if ($periodStats['longest_duration']['value'] > 0): ?>
                            <div class="record-card">
                                <div class="record-icon">
                                    <i class="fas fa-hourglass"></i>
                                </div>
                                <div class="record-info">
                                    <h4>Maior Duração</h4>
                                    <p class="record-value"><?php echo $periodStats['longest_duration']['formatted']; ?></p>
                                    <p class="record-date"><?php echo $periodStats['longest_duration']['date']; ?></p>
                                </div>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </section>
                
                <!-- Charts Section -->
                <section class="content-section charts-section">
                    <h2 class="section-title">Gráficos de Progresso</h2>
                    
                    <div class="chart-tabs">
                        <button class="chart-tab active" data-chart="distance">Distância</button>
                        <button class="chart-tab" data-chart="pace">Ritmo</button>
                        <button class="chart-tab" data-chart="duration">Duração</button>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-panel active" id="distance-chart">
                            <div class="chart-wrapper">
                                <canvas id="distanceChartCanvas"></canvas>
                            </div>
                        </div>
                        
                        <div class="chart-panel" id="pace-chart">
                            <div class="chart-wrapper">
                                <canvas id="paceChartCanvas"></canvas>
                            </div>
                        </div>
                        
                        <div class="chart-panel" id="duration-chart">
                            <div class="chart-wrapper">
                                <canvas id="durationChartCanvas"></canvas>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Recent Workouts -->
                <section class="content-section recent-workouts">
                    <h2 class="section-title">Treinos Recentes</h2>
                    
                    <?php if (!empty($workouts)): ?>
                        <div class="workout-cards">
                            <?php foreach (array_slice($workouts, 0, 5) as $workout): ?>
                                <div class="workout-card">
                                    <div class="workout-type">
                                        <i class="fas <?php echo $workout['type_icon']; ?>"></i>
                                    </div>
                                    <div class="workout-details">
                                        <div class="workout-header">
                                            <h3><?php echo $workout['type_label']; ?></h3>
                                            <span class="workout-date"><?php echo $workout['date_formatted']; ?></span>
                                        </div>
                                        <div class="workout-stats">
                                            <div class="workout-stat">
                                                <i class="fas fa-route"></i>
                                                <span><?php echo $workout['distance']; ?> km</span>
                                            </div>
                                            <div class="workout-stat">
                                                <i class="fas fa-clock"></i>
                                                <span><?php echo $workout['duration_formatted']; ?></span>
                                            </div>
                                            <div class="workout-stat">
                                                <i class="fas fa-tachometer-alt"></i>
                                                <span><?php echo $workout['pace_formatted']; ?></span>
                                            </div>
                                        </div>
                                        <?php if (!empty($workout['notes'])): ?>
                                            <div class="workout-notes">
                                                <p><?php echo htmlspecialchars($workout['notes']); ?></p>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                    <div class="workout-actions">
                                        <button class="btn-icon view-workout-btn" data-id="<?php echo $workout['workout_id']; ?>">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        
                        <?php if (count($workouts) > 5): ?>
                            <div class="view-all-link">
                                <a href="workouts.php" class="cta cta--text">Ver todos os treinos <i class="fas fa-chevron-right"></i></a>
                            </div>
                        <?php endif; ?>
                        
                    <?php else: ?>
                        <div class="empty-state">
                            <div class="empty-icon">
                                <i class="fas fa-running"></i>
                            </div>
                            <h3>Sem treinos no período</h3>
                            <p>Você não tem treinos registrados no período selecionado.</p>
                            <a href="workout-planner.php" class="cta cta--primary">Registrar Treino</a>
                        </div>
                    <?php endif; ?>
                </section>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Dados para gráficos
        const chartData = <?php echo json_encode($chartData); ?>;
    </script>
    <script src="../js/main.js"></script>
    <script src="../js/dashboard.js"></script>
    <script src="../js/tracking.js"></script>
</body>
</html>
