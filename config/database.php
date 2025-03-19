<?php
// Configurações do banco de dados MySQL
define('DB_SERVER', 'localhost');
define('DB_PORT', '3306');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');  // Em produção, use variáveis de ambiente
define('DB_NAME', 'lazzfit_db');

// Configurações do site
define('SITE_URL', 'http://localhost:8081/ProjetosPHP/LazzFit');
define('SESSION_TIME', 60 * 60 * 24); // 24 horas de sessão
?>
