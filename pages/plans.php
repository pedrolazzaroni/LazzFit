<?php
require_once '../includes/auth_functions.php';
require_once '../includes/dashboard_functions.php';

// ... existing authentication code ...

// Define active page for the sidebar
$activePage = 'plans';
$isSubDirectory = true; // We're in a subdirectory
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Planos - LazzFit</title>
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/dashboard.css">
    <link rel="stylesheet" href="../css/form-elements.css">
    <link rel="stylesheet" href="../css/responsive.css">
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
                <h1 class="text-xl font-bold">Meus Planos</h1>
                <div>
                    <a href="workout-planner.php" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                        <i class="fas fa-plus mr-2"></i> Novo Treino
                    </a>
                </div>
            </header>

            <div class="p-6">
                <!-- Content goes here -->
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="../js/main.js"></script>
    <script src="../js/dashboard.js"></script>
    <script src="../js/plans.js"></script>
    
</body>
</html>