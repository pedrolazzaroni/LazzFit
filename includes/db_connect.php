<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Estabelece uma conexão com o banco de dados MySQL
 * @return PDO Conexão com o banco de dados
 */
function getDbConnection() {
    static $conn;
    if ($conn === null) {
        try {
            $dsn = "mysql:host=" . DB_SERVER . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $conn = new PDO($dsn, DB_USERNAME, DB_PASSWORD, $options);
        } catch(PDOException $e) {
            error_log("Erro de conexão MySQL: " . $e->getMessage());
            die("Não foi possível conectar ao banco de dados. Por favor, tente novamente mais tarde.");
        }
    }
    return $conn;
}
?>
