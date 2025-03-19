<?php
require_once '../includes/auth_functions.php';

// Realizar logout
logoutUser();

// Remover cookie de "lembrar de mim"
if (isset($_COOKIE['remember_token'])) {
    setcookie('remember_token', '', time() - 3600, "/");
}

// Redirecionar para a página inicial
header('Location: ../index.html');
exit;
?>
