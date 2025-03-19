<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Estabelece uma conexão com o banco de dados MySQL
 * @return PDO Conexão com o banco de dados
 */
function getDbConnection() {
    try {
        $conn = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME . ";charset=utf8mb4", 
                        DB_USERNAME, 
                        DB_PASSWORD);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        error_log("Erro na conexão com o banco: " . $e->getMessage());
        die("Falha na conexão com o banco de dados: " . $e->getMessage());
    }
}

// Definir constantes de sistema se não estiverem definidas
if (!defined('SESSION_TIME')) {
    define('SESSION_TIME', 1800); // 30 minutos em segundos
}
?>
