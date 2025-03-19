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
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - LazzFit</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/form-elements.css">
    <link rel="stylesheet" href="css/responsive.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="dashboard-body">
    <div class="dashboard-container">
        <!-- Sidebar Navigation -->
        <aside class="dashboard-sidebar">
            <div class="sidebar-header">
                <a href="index.html" class="logo">
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
                        <img src="images/default-avatar.png" alt="Perfil do usuário">
                    <?php endif; ?>
                </div>
                <div class="user-info">
                    <h3 class="user-name"><?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?></h3>
                    <p class="user-level"><?php echo htmlspecialchars($user['runner_level']); ?></p>
                </div>
            </div>

            <nav class="sidebar-nav">
                <ul>
                    <li class="active"><a href="#"><i class="fas fa-home"></i> Visão Geral</a></li>
                    <li><a href="pages/workout-planner.php"><i class="fas fa-running"></i> Planejar Treinos</a></li>
                    <li><a href="pages/plans.php"><i class="fas fa-calendar-alt"></i> Meus Planos</a></li>
                    <li><a href="pages/tracking.php"><i class="fas fa-chart-line"></i> Acompanhamento</a></li>
                    <li><a href="pages/community.php"><i class="fas fa-users"></i> Comunidade</a></li>
                    <li><a href="pages/profile.php"><i class="fas fa-user-cog"></i> Perfil</a></li>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <a href="auth/logout.php" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Sair</a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="dashboard-main">
            <header class="dashboard-header">
                <button class="sidebar-toggle" id="sidebar-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                <h1>Dashboard</h1>
                <div class="header-actions">
                    <a href="pages/workout-planner.php" class="cta cta--primary"><i class="fas fa-plus"></i> Novo Treino</a>
                    <div class="notifications">
                        <button class="notification-btn">
                            <i class="fas fa-bell"></i>
                            <?php if ($notificationCount > 0): ?>
                                <span class="notification-badge"><?php echo $notificationCount; ?></span>
                            <?php endif; ?>
                        </button>
                    </div>
                </div>
            </header>

            <div class="dashboard-content">
                <!-- Welcome Card -->
                <section class="welcome-card">
                    <div class="welcome-content">
                        <h2>Bem-vindo, <?php echo htmlspecialchars($user['first_name']); ?>!</h2>
                        <?php if ($currentPlan): ?>
                            <p>Continue sua jornada de corrida. Seu próximo treino está programado para <strong>hoje às 18:00</strong>.</p>
                        <?php else: ?>
                            <p>Comece sua jornada de corrida hoje mesmo criando um plano de treinos personalizado!</p>
                        <?php endif; ?>
                    </div>
                    <div class="welcome-actions">
                        <?php if ($currentPlan): ?>
                            <a href="pages/tracking.php" class="cta cta--secondary">Ver Treino</a>
                        <?php else: ?>
                            <a href="pages/plans.php" class="cta cta--secondary">Criar Plano</a>
                        <?php endif; ?>
                    </div>
                </section>

                <!-- Stat Cards -->
                <section class="stat-cards">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Treinos Completos</h3>
                            <p class="stat-value"><?php echo $stats['total_workouts']; ?></p>
                            <p class="stat-change positive">+<?php echo $stats['workouts_this_week']; ?> esta semana</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-road"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Distância Total</h3>
                            <p class="stat-value"><?php echo $stats['total_distance']; ?> km</p>
                            <p class="stat-change positive">+<?php echo $stats['distance_this_month']; ?> km este mês</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-stopwatch"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Tempo em Movimento</h3>
                            <p class="stat-value"><?php echo $stats['total_duration']; ?></p>
                            <p class="stat-change neutral">Semelhante à média</p>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-medal"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Recordes Pessoais</h3>
                            <p class="stat-value"><?php echo count($stats['personal_records'] ?? []); ?></p>
                            <?php if (!empty($stats['personal_records'])): ?>
                                <p class="stat-change positive">Novo recorde de 5K!</p>
                            <?php else: ?>
                                <p class="stat-change neutral">Continue treinando!</p>
                            <?php endif; ?>
                        </div>
                    </div>
                </section>

                <!-- Recent Runs & Progress -->
                <div class="content-grid">
                    <!-- Recent Runs -->
                    <section class="content-card recent-runs">
                        <div class="card-header">
                            <h2>Corridas Recentes</h2>
                            <a href="pages/tracking.php" class="view-all">Ver todas</a>
                        </div>
                        <div class="card-content">
                            <table class="runs-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Distância</th>
                                        <th>Tempo</th>
                                        <th>Ritmo</th>
                                        <th>Sensação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (!empty($recentWorkouts)): ?>
                                        <?php foreach ($recentWorkouts as $workout): ?>
                                            <tr>
                                                <td><?php echo htmlspecialchars($workout['date_formatted']); ?></td>
                                                <td><?php echo htmlspecialchars($workout['distance']); ?> km</td>
                                                <td><?php echo htmlspecialchars($workout['duration_formatted']); ?></td>
                                                <td><?php echo htmlspecialchars($workout['pace_formatted']); ?></td>
                                                <td>
                                                    <div class="feeling <?php echo htmlspecialchars($workout['feeling']); ?>">
                                                        <i class="fas fa-<?php echo $workout['feeling'] === 'good' ? 'smile' : ($workout['feeling'] === 'average' ? 'meh' : 'frown'); ?>"></i>
                                                    </div>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php else: ?>
                                        <tr>
                                            <td colspan="5" style="text-align: center;">Nenhum treino registrado ainda.</td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <!-- Resto do conteúdo permanece o mesmo -->
                    <!-- Progress Chart -->
                    <section class="content-card progress-chart">
                        <div class="card-header">
                            <h2>Progresso</h2>
                            <div class="chart-options">
                                <button class="chart-option active" data-period="week">Semana</button>
                                <button class="chart-option" data-period="month">Mês</button>
                                <button class="chart-option" data-period="year">Ano</button>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="chart-container">
                                <canvas id="progressChart"></canvas>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Resto do dashboard permanece igual, mas pode ser convertido para PHP dinamicamente -->
                <!-- ... -->

            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="js/main.js"></script>
    <script src="js/dashboard.js"></script>
</body>
</html>
