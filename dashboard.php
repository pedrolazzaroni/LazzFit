<?php
require_once 'includes/auth_functions.php';
require_once 'includes/dashboard_functions.php';

// Verificar se o usuário está autenticado
if (!isLoggedIn()) {
    header('Location: pages/login.html');
    exit;
}

// Obter dados do usuário logado
$user = getCurrentUser();
if (!$user) {
    header('Location: auth/logout.php');
    exit;
}

// Obter estatísticas do usuário
$stats = getUserStats();

// Obter treinos recentes
$recentWorkouts = getRecentWorkouts();

// Obter plano atual
$currentPlan = getCurrentPlan();

// Obter notificações não lidas
$notifications = getUnreadNotifications();
$notificationCount = count($notifications);

// Define active page for the sidebar
$activePage = 'dashboard';
$isSubDirectory = false; // We're in the root directory
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - LazzFit</title>
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
        <?php include_once 'includes/components/sidebar.php'; ?>

        <!-- Main Content -->
        <main class="lg:ml-72 w-full">
            <header class="bg-white p-4 flex items-center justify-between shadow z-10 sticky top-0">
                <button class="lg:hidden text-xl text-gray p-2" id="sidebar-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="text-xl font-bold">Dashboard</h1>
                <div class="flex items-center space-x-4">
                    <a href="pages/workout-planner.php" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                        <i class="fas fa-plus mr-2"></i> Novo Treino
                    </a>
                    <div class="relative">
                        <button class="text-gray hover:text-dark text-xl" id="notification-btn">
                            <i class="fas fa-bell"></i>
                            <?php if ($notificationCount > 0): ?>
                                <span class="absolute -top-1 -right-1 bg-danger text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"><?php echo $notificationCount; ?></span>
                            <?php endif; ?>
                        </button>
                    </div>
                </div>
            </header>

            <div class="p-6">
                <!-- Welcome Card -->
                <section class="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow mb-6">
                    <div class="p-6 flex flex-col md:flex-row items-center md:justify-between">
                        <div class="mb-4 md:mb-0">
                            <h2 class="text-2xl font-bold mb-2">Bem-vindo, <?php echo htmlspecialchars($user['first_name']); ?>!</h2>
                            <?php if ($currentPlan): ?>
                                <p class="text-white/90">Continue sua jornada de corrida. Seu próximo treino está programado para <strong>hoje às 18:00</strong>.</p>
                            <?php else: ?>
                                <p class="text-white/90">Comece sua jornada de corrida hoje mesmo criando um plano de treinos personalizado!</p>
                            <?php endif; ?>
                        </div>
                        <div>
                            <?php if ($currentPlan): ?>
                                <a href="pages/tracking.php" class="bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-lg inline-block transition-colors">
                                    Ver Treino
                                </a>
                            <?php else: ?>
                                <a href="pages/plans.php" class="bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-lg inline-block transition-colors">
                                    Criar Plano
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </section>

                <!-- Stat Cards -->
                <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                <i class="fas fa-fire text-primary text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-sm text-gray mb-1">Treinos Completos</h3>
                                <p class="text-2xl font-semibold mb-1"><?php echo $stats['total_workouts']; ?></p>
                                <p class="text-xs text-success flex items-center">
                                    <i class="fas fa-arrow-up mr-1"></i> +<?php echo $stats['workouts_this_week']; ?> esta semana
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center mr-4">
                                <i class="fas fa-road text-info text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-sm text-gray mb-1">Distância Total</h3>
                                <p class="text-2xl font-semibold mb-1"><?php echo $stats['total_distance']; ?> km</p>
                                <p class="text-xs text-success flex items-center">
                                    <i class="fas fa-arrow-up mr-1"></i> +<?php echo $stats['distance_this_month']; ?> km este mês
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4">
                                <i class="fas fa-stopwatch text-secondary text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-sm text-gray mb-1">Tempo em Movimento</h3>
                                <p class="text-2xl font-semibold mb-1"><?php echo $stats['total_duration']; ?></p>
                                <p class="text-xs text-gray flex items-center">
                                    <i class="fas fa-minus mr-1"></i> Semelhante à média
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mr-4">
                                <i class="fas fa-medal text-success text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-sm text-gray mb-1">Recordes Pessoais</h3>
                                <p class="text-2xl font-semibold mb-1"><?php echo count($stats['personal_records'] ?? []); ?></p>
                                <?php if (!empty($stats['personal_records'])): ?>
                                    <p class="text-xs text-success flex items-center">
                                        <i class="fas fa-trophy mr-1"></i> Novo recorde de 5K!
                                    </p>
                                <?php else: ?>
                                    <p class="text-xs text-gray flex items-center">
                                        <i class="fas fa-minus mr-1"></i> Continue treinando!
                                    </p>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Recent Runs & Progress -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Recent Runs -->
                    <section class="bg-white rounded-lg shadow">
                        <div class="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 class="text-lg font-medium">Corridas Recentes</h2>
                            <a href="pages/tracking.php" class="text-primary hover:text-primary-dark text-sm">Ver todas</a>
                        </div>
                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray uppercase tracking-wider">Data</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray uppercase tracking-wider">Distância</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray uppercase tracking-wider">Tempo</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray uppercase tracking-wider">Ritmo</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray uppercase tracking-wider">Sensação</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <?php if (!empty($recentWorkouts)): ?>
                                            <?php foreach ($recentWorkouts as $workout): ?>
                                                <tr class="hover:bg-gray-50">
                                                    <td class="px-4 py-3 text-sm"><?php echo htmlspecialchars($workout['date_formatted']); ?></td>
                                                    <td class="px-4 py-3 text-sm"><?php echo htmlspecialchars($workout['distance']); ?> km</td>
                                                    <td class="px-4 py-3 text-sm"><?php echo htmlspecialchars($workout['duration_formatted']); ?></td>
                                                    <td class="px-4 py-3 text-sm"><?php echo htmlspecialchars($workout['pace_formatted']); ?></td>
                                                    <td class="px-4 py-3 text-sm">
                                                        <div class="w-8 h-8 rounded-full flex items-center justify-center 
                                                            <?php if ($workout['feeling'] === 'good'): ?>bg-success/10 text-success
                                                            <?php elseif ($workout['feeling'] === 'average'): ?>bg-warning/10 text-warning
                                                            <?php else: ?>bg-danger/10 text-danger
                                                            <?php endif; ?>">
                                                            <i class="fas fa-<?php echo $workout['feeling'] === 'good' ? 'smile' : ($workout['feeling'] === 'average' ? 'meh' : 'frown'); ?>"></i>
                                                        </div>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <tr>
                                                <td colspan="5" class="px-4 py-4 text-center text-gray">Nenhum treino registrado ainda.</td>
                                            </tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <!-- Progress Chart -->
                    <section class="bg-white rounded-lg shadow">
                        <div class="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 class="text-lg font-medium">Progresso</h2>
                            <div class="flex space-x-2">
                                <button class="px-3 py-1 text-xs font-medium bg-primary text-white rounded-full" data-period="week">Semana</button>
                                <button class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray hover:bg-gray-200 rounded-full" data-period="month">Mês</button>
                                <button class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray hover:bg-gray-200 rounded-full" data-period="year">Ano</button>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="h-64">
                                <canvas id="progressChart"></canvas>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Current Plan -->
                <?php if ($currentPlan): ?>
                <section class="bg-white rounded-lg shadow mb-6">
                    <div class="flex justify-between items-center p-6 border-b border-gray-100">
                        <h2 class="text-lg font-medium">Plano de Treino Atual</h2>
                        <a href="pages/plans.php" class="text-primary hover:text-primary-dark text-sm">Gerenciar Planos</a>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <h3 class="text-xl font-medium mb-2"><?php echo htmlspecialchars($currentPlan['name']); ?></h3>
                            <div class="h-2 bg-gray-100 rounded-full mb-2">
                                <div class="h-full bg-primary rounded-full" style="width: <?php echo $currentPlan['progress_percent']; ?>%"></div>
                            </div>
                            <p class="text-sm text-gray"><?php echo $currentPlan['progress_percent']; ?>% completo</p>
                        </div>
                        
                        <div class="grid grid-cols-7 gap-2">
                            <?php foreach ($currentPlan['week_schedule'] as $day): ?>
                            <div class="border rounded-lg p-3 
                                <?php if ($day['status'] === 'completed'): ?>bg-success/5 border-success/20
                                <?php elseif ($day['status'] === 'today'): ?>bg-primary/5 border-primary/20
                                <?php else: ?>bg-white border-gray-200
                                <?php endif; ?>">
                                <div class="flex justify-between items-center mb-2">
                                    <h4 class="font-medium text-dark"><?php echo $day['day']; ?></h4>
                                    <?php if ($day['status'] === 'completed'): ?>
                                        <span class="text-success text-sm"><i class="fas fa-check-circle"></i></span>
                                    <?php elseif ($day['status'] === 'today'): ?>
                                        <span class="text-primary text-xs font-medium px-2 py-0.5 bg-primary/10 rounded-full">Hoje</span>
                                    <?php endif; ?>
                                </div>
                                <p class="text-xs text-gray"><?php echo $day['workout']; ?></p>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </section>
                <?php endif; ?>

                <!-- Community Activity -->
                <section class="bg-white rounded-lg shadow">
                    <div class="flex justify-between items-center p-6 border-b border-gray-100">
                        <h2 class="text-lg font-medium">Atividade da Comunidade</h2>
                        <a href="pages/community.php" class="text-primary hover:text-primary-dark text-sm">Ver mais</a>
                    </div>
                    <div class="divide-y divide-gray-100">
                        <div class="p-6">
                            <div class="flex mb-4">
                                <img src="images/user-1.jpg" alt="Ana Oliveira" class="w-12 h-12 rounded-full object-cover mr-4">
                                <div>
                                    <h4 class="font-medium">Ana Oliveira</h4>
                                    <p class="text-sm text-gray">2h atrás</p>
                                </div>
                            </div>
                            <div class="mb-3">
                                <p class="mb-2">Completou uma corrida de 10km em 48 minutos! 🏃‍♀️</p>
                                <div class="flex flex-wrap gap-2 text-sm text-gray">
                                    <span class="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full">
                                        <i class="fas fa-road mr-1 text-info"></i> 10km
                                    </span>
                                    <span class="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full">
                                        <i class="fas fa-stopwatch mr-1 text-secondary"></i> 48:20
                                    </span>
                                    <span class="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full">
                                        <i class="fas fa-fire mr-1 text-primary"></i> 520 cal
                                    </span>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button class="flex items-center text-sm text-gray hover:text-dark">
                                    <i class="fas fa-thumbs-up mr-1"></i> 15
                                </button>
                                <button class="flex items-center text-sm text-gray hover:text-dark">
                                    <i class="fas fa-comment mr-1"></i> 3
                                </button>
                            </div>
                        </div>

                        <div class="p-6">
                            <div class="flex mb-4">
                                <img src="images/user-2.jpg" alt="Carlos Santos" class="w-12 h-12 rounded-full object-cover mr-4">
                                <div>
                                    <h4 class="font-medium">Carlos Santos</h4>
                                    <p class="text-sm text-gray">5h atrás</p>
                                </div>
                            </div>
                            <div class="mb-3">
                                <p class="mb-2">Novo recorde pessoal na meia maratona! 💯</p>
                                <div class="flex flex-wrap gap-2 text-sm text-gray">
                                    <span class="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full">
                                        <i class="fas fa-road mr-1 text-info"></i> 21.1km
                                    </span>
                                    <span class="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full">
                                        <i class="fas fa-stopwatch mr-1 text-secondary"></i> 1:45:03
                                    </span>
                                    <span class="inline-flex items-center bg-success/10 text-success px-2.5 py-0.5 rounded-full">
                                        <i class="fas fa-medal mr-1"></i> PR
                                    </span>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button class="flex items-center text-sm text-gray hover:text-dark">
                                    <i class="fas fa-thumbs-up mr-1"></i> 24
                                </button>
                                <button class="flex items-center text-sm text-gray hover:text-dark">
                                    <i class="fas fa-comment mr-1"></i> 7
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <!-- Notification Panel -->
    <div class="fixed inset-0 bg-black/50 z-50 hidden" id="notification-panel-backdrop">
        <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 translate-x-full" id="notification-panel">
            <div class="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 class="font-medium text-lg">Notificações</h3>
                <button class="text-gray hover:text-dark" id="close-notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="p-4 max-h-screen overflow-y-auto">
                <?php if (!empty($notifications)): ?>
                    <div class="divide-y divide-gray-100">
                        <?php foreach ($notifications as $notification): ?>
                            <div class="py-3 flex">
                                <div class="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mr-3">
                                    <i class="fas fa-<?php echo $notification['icon']; ?> text-primary"></i>
                                </div>
                                <div>
                                    <p class="text-sm"><?php echo htmlspecialchars($notification['content']); ?></p>
                                    <p class="text-xs text-gray mt-1"><?php echo $notification['time_ago']; ?></p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-bell text-gray text-xl"></i>
                        </div>
                        <h4 class="text-lg font-medium text-dark mb-2">Sem notificações</h4>
                        <p class="text-gray text-sm">Você não tem novas notificações no momento.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Chart data
        const progressData = {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Distância (km)',
                data: [5, 0, 7, 6, 0, 8, 12],
                backgroundColor: 'rgba(255, 140, 0, 0.2)',
                borderColor: 'rgba(255, 140, 0, 1)',
                borderWidth: 2,
                tension: 0.3
            }]
        };
        
        document.addEventListener('DOMContentLoaded', function() {
            // Progress Chart
            const progressCtx = document.getElementById('progressChart').getContext('2d');
            const progressChart = new Chart(progressCtx, {
                type: 'line',
                data: progressData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Notification panel
            const notificationBtn = document.getElementById('notification-btn');
            const notificationPanel = document.getElementById('notification-panel');
            const notificationPanelBackdrop = document.getElementById('notification-panel-backdrop');
            const closeNotification = document.getElementById('close-notification');
            
            notificationBtn?.addEventListener('click', function() {
                notificationPanelBackdrop.classList.remove('hidden');
                setTimeout(() => {
                    notificationPanel.classList.remove('translate-x-full');
                }, 10);
            });
            
            function closeNotificationPanel() {
                notificationPanel.classList.add('translate-x-full');
                setTimeout(() => {
                    notificationPanelBackdrop.classList.add('hidden');
                }, 300);
            }
            
            closeNotification?.addEventListener('click', closeNotificationPanel);
            notificationPanelBackdrop?.addEventListener('click', function(e) {
                if (e.target === notificationPanelBackdrop) {
                    closeNotificationPanel();
                }
            });
            
            // Sidebar toggle
            const sidebarToggle = document.getElementById('sidebar-toggle');
            const sidebar = document.getElementById('sidebar');
            const sidebarClose = document.getElementById('sidebar-close');
            
            sidebarToggle?.addEventListener('click', function() {
                sidebar.classList.remove('-translate-x-full');
            });
            
            sidebarClose?.addEventListener('click', function() {
                sidebar.classList.add('-translate-x-full');
            });
        });
    </script>
    <script src="js/sidebar.js"></script>
</body>
</html>
