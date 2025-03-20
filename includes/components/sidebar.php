<?php
/**
 * Sidebar Component
 * 
 * @param string $activePage - The current active page (dashboard, workout-planner, plans, tracking, profile)
 * @param array $user - The current user data
 */

// Ensure the user data is available
if (!isset($user) || empty($user)) {
    // Try to get user data if not provided
    if (function_exists('getCurrentUser')) {
        $user = getCurrentUser();
    } else {
        // Default empty user if data can't be retrieved
        $user = [
            'first_name' => 'Usuário',
            'last_name' => '',
            'runner_level' => 'Corredor',
            'profile_image' => ''
        ];
    }
}

// Helper function to determine if a page is active
function isActive($currentPage, $pageName) {
    return $currentPage === $pageName ? 'bg-primary/10 text-primary font-medium border-l-4 border-primary' : 'text-gray font-medium hover:bg-primary/5 hover:text-primary';
}

// Determine if we're in the root directory or a subdirectory
$isRoot = !isset($isSubDirectory) || $isSubDirectory === false;
$basePath = $isRoot ? '' : '../';
?>

<aside class="w-72 bg-white border-r border-gray-200 shadow-lg fixed h-full transition-transform duration-300 z-50 lg:translate-x-0 -translate-x-full" id="sidebar">
    <div class="flex justify-between items-center p-5 border-b border-gray-100">
        <a href="<?php echo $basePath; ?>index.html" class="inline-block">
            <h2 class="text-2xl font-bold">Lazz<span class="text-primary">Fit</span></h2>
        </a>
        <button class="lg:hidden text-xl text-gray" id="sidebar-close">
            <i class="fas fa-times"></i>
        </button>
    </div>

    <div class="flex items-center p-4 border-b border-gray-100">
        <div class="w-14 h-14 rounded-full overflow-hidden shadow-md mr-4">
            <?php if (!empty($user['profile_image'])): ?>
                <img src="<?php echo htmlspecialchars($user['profile_image']); ?>" alt="Perfil" class="w-full h-full object-cover">
            <?php else: ?>
                <img src="<?php echo $basePath; ?>images/default-avatar.png" alt="Perfil" class="w-full h-full object-cover">
            <?php endif; ?>
        </div>
        <div>
            <h3 class="font-medium text-dark"><?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?></h3>
            <p class="text-sm text-gray"><?php echo htmlspecialchars($user['runner_level']); ?></p>
        </div>
    </div>

    <nav class="p-4">
        <ul class="space-y-1">
            <li>
                <a href="<?php echo $basePath; ?>dashboard.php" class="flex items-center px-4 py-3 <?php echo isActive($activePage, 'dashboard'); ?> rounded transition-colors">
                    <i class="fas fa-home w-5 mr-3"></i> Visão Geral
                </a>
            </li>
            <li>
                <a href="<?php echo $basePath; ?>pages/workout-planner.php" class="flex items-center px-4 py-3 <?php echo isActive($activePage, 'workout-planner'); ?> rounded transition-colors">
                    <i class="fas fa-running w-5 mr-3"></i> Planejar Treinos
                </a>
            </li>
            <li>
                <a href="<?php echo $basePath; ?>pages/plans.php" class="flex items-center px-4 py-3 <?php echo isActive($activePage, 'plans'); ?> rounded transition-colors">
                    <i class="fas fa-calendar-alt w-5 mr-3"></i> Meus Planos
                </a>
            </li>
            <li>
                <a href="<?php echo $basePath; ?>pages/tracking.php" class="flex items-center px-4 py-3 <?php echo isActive($activePage, 'tracking'); ?> rounded transition-colors">
                    <i class="fas fa-chart-line w-5 mr-3"></i> Acompanhamento
                </a>
            </li>
            <li>
                <a href="<?php echo $basePath; ?>pages/profile.php" class="flex items-center px-4 py-3 <?php echo isActive($activePage, 'profile'); ?> rounded transition-colors">
                    <i class="fas fa-user-cog w-5 mr-3"></i> Perfil
                </a>
            </li>
        </ul>
    </nav>

    <div class="absolute bottom-0 w-full p-4 border-t border-gray-100">
        <a href="<?php echo $basePath; ?>auth/logout.php" class="flex items-center text-gray hover:text-danger font-medium">
            <i class="fas fa-sign-out-alt mr-3"></i> Sair
        </a>
    </div>
</aside>
