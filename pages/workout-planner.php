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
        <?php include_once '../includes/components/sidebar.php'; ?>

        <!-- Main Content -->
        <main class="lg:ml-72 w-full">
            <header class="bg-white p-4 flex items-center justify-between shadow z-10 sticky top-0">
                <button class="lg:hidden text-xl text-gray p-2" id="sidebar-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="text-xl font-bold">Planejar Treinos</h1>
                <div>
                    <button class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center transition-colors new-workout-btn">
                        <i class="fas fa-plus mr-2"></i> Registrar Treino
                    </button>
                </div>
            </header>

            <div class="p-6">
                <!-- Tabs -->
                <div class="flex border-b border-gray-200 mb-6">
                    <button class="tab-btn py-3 px-4 border-b-2 border-primary text-primary font-medium" data-tab="quick">
                        Treino Rápido
                    </button>
                    <button class="tab-btn py-3 px-4 border-b-2 border-transparent text-gray hover:text-dark hover:border-gray-300 font-medium" data-tab="planned">
                        Planejar Treino
                    </button>
                    <button class="tab-btn py-3 px-4 border-b-2 border-transparent text-gray hover:text-dark hover:border-gray-300 font-medium" data-tab="plans">
                        Planos de Treino
                    </button>
                </div>
                
                <!-- Tab Content -->
                <div class="tab-content">
                    <!-- Quick Workout Tab -->
                    <div id="quick-tab" class="tab-pane">
                        <div class="bg-white rounded-lg shadow mb-6">
                            <div class="p-6 border-b border-gray-100">
                                <h2 class="text-lg font-medium">Registrar Treino Rápido</h2>
                            </div>
                            <div class="p-6">
                                <form id="quick-workout-form" class="space-y-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="relative">
                                            <input type="date" id="workout-date" name="workout_date" 
                                                   class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                   required value="<?php echo date('Y-m-d'); ?>">
                                            <label for="workout-date" 
                                                   class="absolute top-2 left-4 text-xs text-gray">
                                                Data do Treino
                                            </label>
                                        </div>
                                        <div class="relative">
                                            <select id="workout-type" name="workout_type" 
                                                    class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    required>
                                                <option value="running">Corrida</option>
                                                <option value="interval">Treino Intervalado</option>
                                                <option value="tempo">Corrida de Ritmo</option>
                                                <option value="long">Corrida Longa</option>
                                                <option value="recovery">Corrida de Recuperação</option>
                                            </select>
                                            <label for="workout-type" 
                                                   class="absolute top-2 left-4 text-xs text-gray">
                                                Tipo de Treino
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="relative">
                                            <input type="number" id="workout-distance" name="distance" step="0.01" min="0" placeholder="0"
                                                   class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                   required>
                                            <label for="workout-distance" 
                                                   class="absolute top-2 left-4 text-xs text-gray">
                                                Distância (km)
                                            </label>
                                        </div>
                                        <div>
                                            <label class="block mb-2 text-sm font-medium text-gray">Duração Total</label>
                                            <div class="flex items-center">
                                                <input type="number" id="workout-hours" name="hours" placeholder="hh" min="0" value="0"
                                                       class="border border-gray-300 rounded-l-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                       required>
                                                <span class="px-2 text-gray">:</span>
                                                <input type="number" id="workout-minutes" name="minutes" placeholder="mm" min="0" max="59" value="0"
                                                       class="border border-gray-300 px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                       required>
                                                <span class="px-2 text-gray">:</span>
                                                <input type="number" id="workout-seconds" name="seconds" placeholder="ss" min="0" max="59" value="0"
                                                       class="border border-gray-300 rounded-r-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                       required>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label class="block mb-2 text-sm font-medium text-gray">Como você se sentiu?</label>
                                        <div class="flex flex-wrap gap-4">
                                            <label class="flex items-center cursor-pointer">
                                                <input type="radio" name="feeling" value="good" class="sr-only" required>
                                                <span class="flex items-center justify-center w-10 h-10 bg-success/10 text-success rounded-full mr-2 feeling-icon">
                                                    <i class="fas fa-smile"></i>
                                                </span>
                                                <span>Bem</span>
                                            </label>
                                            <label class="flex items-center cursor-pointer">
                                                <input type="radio" name="feeling" value="average" class="sr-only" required>
                                                <span class="flex items-center justify-center w-10 h-10 bg-warning/10 text-warning rounded-full mr-2 feeling-icon">
                                                    <i class="fas fa-meh"></i>
                                                </span>
                                                <span>Normal</span>
                                            </label>
                                            <label class="flex items-center cursor-pointer">
                                                <input type="radio" name="feeling" value="bad" class="sr-only" required>
                                                <span class="flex items-center justify-center w-10 h-10 bg-danger/10 text-danger rounded-full mr-2 feeling-icon">
                                                    <i class="fas fa-frown"></i>
                                                </span>
                                                <span>Cansado</span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div class="relative">
                                        <textarea id="workout-notes" name="notes" rows="3" placeholder=" "
                                                  class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
                                        <label for="workout-notes" 
                                               class="absolute top-2 left-4 text-xs text-gray">
                                            Notas
                                        </label>
                                    </div>
                                    
                                    <div>
                                        <button type="submit" class="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors">
                                            Salvar Treino
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium mb-4">Resumo do Treino</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <span class="block text-gray text-sm mb-1">Ritmo Médio:</span>
                                    <span class="block text-xl font-semibold" id="avg-pace">--:--/km</span>
                                </div>
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <span class="block text-gray text-sm mb-1">Calorias:</span>
                                    <span class="block text-xl font-semibold" id="calories">-- kcal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Planned Workout Tab -->
                    <div id="planned-tab" class="tab-pane hidden">
                        <div class="bg-white rounded-lg shadow mb-6">
                            <div class="p-6 border-b border-gray-100">
                                <h2 class="text-lg font-medium">Planejar Treino</h2>
                            </div>
                            <div class="p-6">
                                <form id="planned-workout-form" class="space-y-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="relative">
                                            <input type="date" id="planned-date" name="workout_date" 
                                                   class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                   required value="<?php echo date('Y-m-d', strtotime('+1 day')); ?>">
                                            <label for="planned-date" 
                                                   class="absolute top-2 left-4 text-xs text-gray">
                                                Data do Treino
                                            </label>
                                        </div>
                                        <div class="relative">
                                            <input type="time" id="planned-time" name="workout_time" 
                                                   class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                   required>
                                            <label for="planned-time" 
                                                   class="absolute top-2 left-4 text-xs text-gray">
                                                Horário
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="relative">
                                            <select id="planned-type" name="workout_type" 
                                                    class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    required>
                                                <option value="running">Corrida</option>
                                                <option value="interval">Treino Intervalado</option>
                                                <option value="tempo">Corrida de Ritmo</option>
                                                <option value="long">Corrida Longa</option>
                                                <option value="recovery">Corrida de Recuperação</option>
                                            </select>
                                            <label for="planned-type" 
                                                   class="absolute top-2 left-4 text-xs text-gray">
                                                Tipo de Treino
                                            </label>
                                        </div>
                                        <div class="relative">
                                            <select id="planned-goal" name="workout_goal" 
                                                    class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    required>
                                                <option value="distance">Distância</option>
                                                <option value="time">Tempo</option>
                                                <option value="pace">Ritmo</option>
                                            </select>
                                            <label for="planned-goal" 
                                                   class="absolute top-2 left-4 text-xs text-gray">
                                                Objetivo
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div id="goal-distance" class="goal-input">
                                        <div class="relative">
                                            <input type="number" id="planned-distance" name="distance" step="0.01" min="0" placeholder="0"
                                                   class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50">
                                            <label for="planned-distance" 
                                                   class="absolute top-2 left-4 text-xs text-gray">
                                                Distância Alvo (km)
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div id="goal-time" class="goal-input hidden">
                                        <label class="block mb-2 text-sm font-medium text-gray">Duração Alvo</label>
                                        <div class="flex items-center">
                                            <input type="number" id="planned-hours" name="hours" placeholder="hh" min="0" value="0"
                                                   class="border border-gray-300 rounded-l-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                                            <span class="px-2 text-gray">:</span>
                                            <input type="number" id="planned-minutes" name="minutes" placeholder="mm" min="0" max="59" value="30"
                                                   class="border border-gray-300 px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                                            <span class="px-2 text-gray">:</span>
                                            <input type="number" id="planned-seconds" name="seconds" placeholder="ss" min="0" max="59" value="0"
                                                   class="border border-gray-300 rounded-r-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                                        </div>
                                    </div>
                                    
                                    <div id="goal-pace" class="goal-input hidden">
                                        <label class="block mb-2 text-sm font-medium text-gray">Ritmo Alvo (min/km)</label>
                                        <div class="flex items-center w-48">
                                            <input type="number" id="planned-pace-min" name="pace_min" min="3" max="10" value="5"
                                                   class="border border-gray-300 rounded-l-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                                            <span class="px-2 text-gray">:</span>
                                            <input type="number" id="planned-pace-sec" name="pace_sec" min="0" max="59" value="30"
                                                   class="border border-gray-300 rounded-r-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                                        </div>
                                    </div>
                                    
                                    <div class="relative">
                                        <textarea id="planned-notes" name="notes" rows="3" placeholder=" "
                                                  class="w-full border border-gray-300 rounded-lg px-4 py-3 pt-5 peer focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
                                        <label for="planned-notes" 
                                               class="absolute top-2 left-4 text-xs text-gray">
                                            Notas
                                        </label>
                                    </div>
                                    
                                    <div>
                                        <button type="submit" class="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors">
                                            Agendar Treino
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Training Plans Tab -->
                    <div id="plans-tab" class="tab-pane hidden">
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 border-b border-gray-100">
                                <h2 class="text-lg font-medium">Planos de Treino Disponíveis</h2>
                            </div>
                            <div class="p-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <?php foreach ($availablePlans as $plan): ?>
                                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                                        <div class="bg-primary/5 p-4">
                                            <div class="flex justify-between items-center mb-2">
                                                <h3 class="font-medium"><?php echo htmlspecialchars($plan['name']); ?></h3>
                                                <?php
                                                $levelClass = '';
                                                switch (strtolower($plan['difficulty_level'])) {
                                                    case 'iniciante':
                                                        $levelClass = 'bg-success/10 text-success';
                                                        break;
                                                    case 'intermediário':
                                                        $levelClass = 'bg-warning/10 text-warning';
                                                        break;
                                                    case 'avançado':
                                                        $levelClass = 'bg-danger/10 text-danger';
                                                        break;
                                                }
                                                ?>
                                                <span class="<?php echo $levelClass; ?> text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    <?php echo htmlspecialchars($plan['difficulty_level']); ?>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="p-4">
                                            <p class="text-gray text-sm mb-4"><?php echo htmlspecialchars(substr($plan['description'], 0, 100) . (strlen($plan['description']) > 100 ? '...' : '')); ?></p>
                                            <ul class="mb-4 space-y-2 text-sm">
                                                <?php if ($plan['duration_weeks'] > 0): ?>
                                                <li class="flex items-center text-gray">
                                                    <i class="fas fa-calendar-week w-5 text-primary"></i>
                                                    <span class="ml-2"><?php echo $plan['duration_weeks']; ?> semanas</span>
                                                </li>
                                                <?php else: ?>
                                                <li class="flex items-center text-gray">
                                                    <i class="fas fa-calendar-week w-5 text-primary"></i>
                                                    <span class="ml-2">Flexível</span>
                                                </li>
                                                <?php endif; ?>
                                                <li class="flex items-center text-gray">
                                                    <i class="fas fa-bullseye w-5 text-primary"></i>
                                                    <span class="ml-2">Objetivo: <?php echo htmlspecialchars($plan['goal']); ?></span>
                                                </li>
                                            </ul>
                                            <div class="flex space-x-2">
                                                <button class="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors view-plan-btn" data-plan-id="<?php echo $plan['plan_id']; ?>">
                                                    Ver Detalhes
                                                </button>
                                                <button class="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors start-plan-btn" data-plan-id="<?php echo $plan['plan_id']; ?>">
                                                    Iniciar Plano
                                                </button>
                                            </div>
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
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Tab switching functionality
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabPanes = document.querySelectorAll('.tab-pane');
            
            // Show first tab by default
            document.getElementById('quick-tab').classList.remove('hidden');
            
            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const tabName = this.getAttribute('data-tab');
                    
                    // Update button states
                    tabBtns.forEach(b => {
                        b.classList.remove('border-primary', 'text-primary');
                        b.classList.add('border-transparent', 'text-gray', 'hover:text-dark', 'hover:border-gray-300');
                    });
                    this.classList.remove('border-transparent', 'text-gray', 'hover:text-dark', 'hover:border-gray-300');
                    this.classList.add('border-primary', 'text-primary');
                    
                    // Show the selected tab
                    tabPanes.forEach(pane => pane.classList.add('hidden'));
                    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
                });
            });
            
            // Goal type switching
            const goalSelect = document.getElementById('planned-goal');
            const goalInputs = document.querySelectorAll('.goal-input');
            
            if (goalSelect) {
                goalSelect.addEventListener('change', function() {
                    const goal = this.value;
                    
                    goalInputs.forEach(input => input.classList.add('hidden'));
                    document.getElementById(`goal-${goal}`).classList.remove('hidden');
                });
            }
            
            // Feeling selector
            const feelingRadios = document.querySelectorAll('input[name="feeling"]');
            feelingRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    const icons = document.querySelectorAll('.feeling-icon');
                    icons.forEach(icon => {
                        icon.classList.remove('ring-2', 'ring-offset-2');
                    });
                    
                    if (this.checked) {
                        this.parentElement.querySelector('.feeling-icon').classList.add('ring-2', 'ring-offset-2');
                    }
                });
            });
            
            // Calculate pace and calories when form values change
            const workoutDistance = document.getElementById('workout-distance');
            const workoutHours = document.getElementById('workout-hours');
            const workoutMinutes = document.getElementById('workout-minutes');
            const workoutSeconds = document.getElementById('workout-seconds');
            const avgPaceElement = document.getElementById('avg-pace');
            const caloriesElement = document.getElementById('calories');
            
            function updateCalculations() {
                const distance = parseFloat(workoutDistance.value) || 0;
                const hours = parseInt(workoutHours.value) || 0;
                const minutes = parseInt(workoutMinutes.value) || 0;
                const seconds = parseInt(workoutSeconds.value) || 0;
                
                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                
                if (distance > 0 && totalSeconds > 0) {
                    // Calculate pace (min:sec per km)
                    const paceInSeconds = totalSeconds / distance;
                    const paceMinutes = Math.floor(paceInSeconds / 60);
                    const paceSeconds = Math.round(paceInSeconds % 60);
                    
                    avgPaceElement.textContent = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}/km`;
                    
                    // Rough calorie calculation (using 60 calories per km as estimate)
                    const estimatedCalories = Math.round(distance * 60);
                    caloriesElement.textContent = `${estimatedCalories} kcal`;
                } else {
                    avgPaceElement.textContent = '--:--/km';
                    caloriesElement.textContent = '-- kcal';
                }
            }
            
            [workoutDistance, workoutHours, workoutMinutes, workoutSeconds].forEach(input => {
                if (input) {
                    input.addEventListener('input', updateCalculations);
                }
            });
        });
    </script>
    <script src="../js/sidebar.js"></script>
</body>
</html>
