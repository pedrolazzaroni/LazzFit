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

// Define active page for the sidebar
$activePage = 'tracking';
$isSubDirectory = true;

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
                                TIME_FORMAT(w.duration, '%H:%i:%s') as duration_formatted,
                                COALESCE(w.workout_type, 'regular') as workout_type
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
            $workoutType = $workout['workout_type'];
            
            switch ($workoutType) {
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
    <!-- Tailwind CSS via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Configuração personalizada do Tailwind -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#FF8C00',
                        'primary-dark': '#FF6000',
                        secondary: '#2563EB',
                        dark: '#333333',
                        gray: '#6B7280',
                        success: '#34C759',
                        danger: '#FF3B30',
                        warning: '#FF9500',
                        info: '#0A84FF',
                        light: '#F2F2F7'
                    },
                    fontFamily: {
                        sans: ['Poppins', 'sans-serif']
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-light font-sans">
    <div class="flex min-h-screen">
        <!-- Include Sidebar Component -->
        <?php include_once '../includes/components/sidebar.php'; ?>

        <!-- Main Content -->
        <main class="lg:ml-72 w-full">
            <header class="bg-white p-4 flex items-center justify-between shadow z-10 sticky top-0">
                <button class="lg:hidden text-xl text-gray p-2" id="sidebar-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="text-xl font-bold">Acompanhamento</h1>
                <div>
                    <a href="workout-planner.php" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                        <i class="fas fa-plus mr-2"></i> Novo Treino
                    </a>
                </div>
            </header>

            <div class="p-6">
                <!-- Period Selector -->
                <section class="bg-white rounded-lg shadow p-6 mb-6">
                    <div>
                        <h3 class="text-lg font-medium mb-4">Período</h3>
                        <div class="flex flex-wrap gap-2 mb-6">
                            <?php foreach ($periodOptions as $key => $label): ?>
                                <button class="px-4 py-2 rounded-full <?php echo $currentPeriod === $key ? 'bg-primary text-white' : 'bg-gray-100 text-gray hover:bg-gray-200'; ?>" 
                                        data-period="<?php echo $key; ?>">
                                    <?php echo $label; ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                        
                        <div id="custom-period-container" class="<?php echo $currentPeriod === 'custom' ? 'block' : 'hidden'; ?> border-t border-gray-100 pt-4">
                            <form id="custom-period-form" action="tracking.php" method="GET">
                                <input type="hidden" name="period" value="custom">
                                <div class="flex flex-wrap items-center gap-4">
                                    <div class="relative">
                                        <input type="date" class="border rounded-lg p-3 pl-3 pt-5 w-full" 
                                               id="period-start" name="period_start" value="<?php echo $periodStart; ?>" required>
                                        <label for="period-start" class="absolute text-xs text-gray top-1.5 left-3">Data inicial</label>
                                    </div>
                                    <span class="text-gray">até</span>
                                    <div class="relative">
                                        <input type="date" class="border rounded-lg p-3 pl-3 pt-5 w-full" 
                                               id="period-end" name="period_end" value="<?php echo $periodEnd; ?>" required>
                                        <label for="period-end" class="absolute text-xs text-gray top-1.5 left-3">Data final</label>
                                    </div>
                                    <button type="submit" class="bg-gray-800 hover:bg-gray-900 text-white rounded-lg px-4 py-2">Aplicar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
                
                <!-- Stats Overview -->
                <section class="mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <!-- Total Workouts -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                    <i class="fas fa-running text-primary text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-gray mb-1">Total de Treinos</p>
                                    <h3 class="text-2xl font-semibold"><?php echo $periodStats['total_workouts']; ?></h3>
                                </div>
                            </div>
                        </div>

                        <!-- Total Distance -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center mr-4">
                                    <i class="fas fa-road text-info text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-gray mb-1">Distância Total</p>
                                    <h3 class="text-2xl font-semibold"><?php echo $periodStats['total_distance']; ?> km</h3>
                                </div>
                            </div>
                        </div>

                        <!-- Total Duration -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4">
                                    <i class="fas fa-stopwatch text-secondary text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-gray mb-1">Tempo Total</p>
                                    <h3 class="text-2xl font-semibold"><?php echo $periodStats['duration_formatted']; ?></h3>
                                </div>
                            </div>
                        </div>

                        <!-- Average Pace -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mr-4">
                                    <i class="fas fa-tachometer-alt text-success text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-gray mb-1">Ritmo Médio</p>
                                    <h3 class="text-2xl font-semibold"><?php echo $periodStats['pace_formatted']; ?></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Charts -->
                <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Distance Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-medium mb-4">Distância por Dia</h3>
                        <div class="h-64">
                            <canvas id="distanceChart"></canvas>
                        </div>
                    </div>

                    <!-- Pace Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-medium mb-4">Ritmo por Dia</h3>
                        <div class="h-64">
                            <canvas id="paceChart"></canvas>
                        </div>
                    </div>
                </section>

                <!-- Workout List -->
                <section class="bg-white rounded-lg shadow mb-6">
                    <div class="p-6 border-b border-gray-100">
                        <h3 class="text-lg font-medium">Treinos no Período</h3>
                    </div>
                    
                    <?php if (!empty($workouts)): ?>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="py-3 px-4 text-left text-sm font-medium text-gray">Data</th>
                                        <th class="py-3 px-4 text-left text-sm font-medium text-gray">Tipo</th>
                                        <th class="py-3 px-4 text-left text-sm font-medium text-gray">Distância</th>
                                        <th class="py-3 px-4 text-left text-sm font-medium text-gray">Duração</th>
                                        <th class="py-3 px-4 text-left text-sm font-medium text-gray">Ritmo</th>
                                        <th class="py-3 px-4 text-left text-sm font-medium text-gray">Ações</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <?php foreach ($workouts as $workout): ?>
                                        <tr class="hover:bg-gray-50">
                                            <td class="py-3 px-4 text-sm"><?php echo htmlspecialchars($workout['date_formatted']); ?></td>
                                            <td class="py-3 px-4 text-sm">
                                                <div class="flex items-center">
                                                    <span class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                                        <i class="fas fa-<?php echo htmlspecialchars($workout['type_icon']); ?> text-primary"></i>
                                                    </span>
                                                    <?php echo htmlspecialchars($workout['type_label']); ?>
                                                </div>
                                            </td>
                                            <td class="py-3 px-4 text-sm"><?php echo htmlspecialchars($workout['distance']); ?> km</td>
                                            <td class="py-3 px-4 text-sm"><?php echo htmlspecialchars($workout['duration_formatted']); ?></td>
                                            <td class="py-3 px-4 text-sm"><?php echo htmlspecialchars($workout['pace_formatted']); ?></td>
                                            <td class="py-3 px-4 text-sm">
                                                <div class="flex items-center space-x-2">
                                                    <button class="p-1 text-secondary hover:text-blue-700" title="Ver detalhes">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button class="p-1 text-gray hover:text-dark" title="Editar">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="p-1 text-danger hover:text-red-700" title="Excluir">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        <div class="p-6 text-center">
                            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <i class="fas fa-running text-gray text-xl"></i>
                            </div>
                            <h3 class="text-lg font-medium text-dark mb-2">Nenhum treino encontrado</h3>
                            <p class="text-gray mb-4">Não há registros de treinos para o período selecionado.</p>
                            <a href="workout-planner.php" class="inline-flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
                                <i class="fas fa-plus mr-2"></i> Registrar Treino
                            </a>
                        </div>
                    <?php endif; ?>
                </section>

                <!-- Personal Records -->
                <section class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-100">
                        <h3 class="text-lg font-medium">Recordes do Período</h3>
                    </div>
                    
                    <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Best Pace -->
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex items-center mb-2">
                                <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mr-3">
                                    <i class="fas fa-tachometer-alt text-success"></i>
                                </div>
                                <h4 class="text-md font-medium">Melhor Ritmo</h4>
                            </div>
                            <p class="text-xl font-semibold mb-1"><?php echo $periodStats['best_pace']['formatted']; ?></p>
                            <p class="text-sm text-gray"><?php echo $periodStats['best_pace']['date']; ?></p>
                        </div>
                        
                        <!-- Longest Distance -->
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex items-center mb-2">
                                <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center mr-3">
                                    <i class="fas fa-road text-info"></i>
                                </div>
                                <h4 class="text-md font-medium">Maior Distância</h4>
                            </div>
                            <p class="text-xl font-semibold mb-1"><?php echo $periodStats['longest_distance']['value']; ?> km</p>
                            <p class="text-sm text-gray"><?php echo $periodStats['longest_distance']['date']; ?></p>
                        </div>
                        
                        <!-- Longest Duration -->
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex items-center mb-2">
                                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                    <i class="fas fa-stopwatch text-primary"></i>
                                </div>
                                <h4 class="text-md font-medium">Maior Duração</h4>
                            </div>
                            <p class="text-xl font-semibold mb-1"><?php echo $periodStats['longest_duration']['formatted']; ?></p>
                            <p class="text-sm text-gray"><?php echo $periodStats['longest_duration']['date']; ?></p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Dados para gráficos
        const chartData = <?php echo json_encode($chartData); ?>;
        
        document.addEventListener('DOMContentLoaded', function() {
            // Configurar gráfico de distância
            const distanceCtx = document.getElementById('distanceChart').getContext('2d');
            const distanceChart = new Chart(distanceCtx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Distância (km)',
                        data: chartData.distance,
                        backgroundColor: 'rgba(255, 140, 0, 0.4)',
                        borderColor: 'rgba(255, 140, 0, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Distância (km)'
                            }
                        }
                    }
                }
            });
            
            // Configurar gráfico de ritmo
            const paceCtx = document.getElementById('paceChart').getContext('2d');
            const paceChart = new Chart(paceCtx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Ritmo (min/km)',
                        data: chartData.pace,
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            reverse: true,
                            title: {
                                display: true,
                                text: 'Ritmo (seg/km)'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const pace = context.raw;
                                    if (pace) {
                                        const min = Math.floor(pace / 60);
                                        const sec = Math.round(pace % 60);
                                        return `Ritmo: ${min}:${sec.toString().padStart(2, '0')} min/km`;
                                    }
                                    return 'Sem dados';
                                }
                            }
                        }
                    }
                }
            });
            
            // Botões de período
            const periodButtons = document.querySelectorAll('[data-period]');
            periodButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const period = this.getAttribute('data-period');
                    
                    if (period === 'custom') {
                        document.getElementById('custom-period-container').classList.remove('hidden');
                    } else {
                        // Redirecionar para o período selecionado
                        window.location.href = `tracking.php?period=${period}`;
                    }
                });
            });
        });
    </script>
    <script src="../js/main.js"></script>
    <script src="../js/dashboard.js"></script>
    <script src="../js/tracking.js"></script>
    <script src="../js/sidebar.js"></script>
</body>
</html>