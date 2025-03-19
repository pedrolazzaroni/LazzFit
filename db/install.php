<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Script para instalação do banco de dados LazzFit
 */
echo "====================================================\n";
echo "      INSTALAÇÃO DO BANCO DE DADOS LAZZFIT\n";
echo "====================================================\n\n";

try {
    // Primeiro, criar a conexão sem especificar o banco de dados
    $dsn = "mysql:host=" . DB_SERVER . ";port=" . DB_PORT . ";charset=utf8mb4";
    
    echo "Conectando ao servidor MySQL... ";
    $conn = new PDO($dsn, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "CONECTADO!\n\n";
    
    // Criar o banco de dados
    echo "Criando banco de dados... ";
    $conn->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " 
                DEFAULT CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci");
    echo "CONCLUÍDO!\n\n";
    
    // Selecionar o banco de dados
    echo "Selecionando banco de dados... ";
    $conn->exec("USE " . DB_NAME);
    echo "CONCLUÍDO!\n\n";
    
    // Ler e executar o arquivo schema.sql
    echo "Importando estrutura do banco de dados... ";
    $sql = file_get_contents(__DIR__ . '/schema.sql');
    
    // Dividir em comandos individuais
    $statements = explode(';', $sql);
    foreach ($statements as $statement) {
        if (trim($statement) != '') {
            $conn->exec($statement);
        }
    }
    echo "CONCLUÍDO!\n\n";
    
    // Criar usuário padrão para testes
    echo "Criando usuário de teste... ";
    $username = 'demo';
    $email = 'demo@lazzfit.com';
    $password = password_hash('senha123', PASSWORD_DEFAULT);
    $firstName = 'Usuário';
    $lastName = 'Demo';
    
    // Verificar se o usuário já existe
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = :email OR username = :username");
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    
    if ($stmt->fetchColumn() == 0) {
        $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, first_name, last_name, created_at)
                                VALUES (:username, :email, :password_hash, :first_name, :last_name, NOW())");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password_hash', $password);
        $stmt->bindParam(':first_name', $firstName);
        $stmt->bindParam(':last_name', $lastName);
        $stmt->execute();
        
        // Criar preferências para o usuário
        $userId = $conn->lastInsertId();
        $stmt = $conn->prepare("INSERT INTO user_preferences (user_id) VALUES (:user_id)");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        echo "CONCLUÍDO!\n";
        echo "   Usuário: demo\n";
        echo "   Senha: senha123\n\n";
    } else {
        echo "JÁ EXISTE!\n\n";
    }
    
    echo "====================================================\n";
    echo "      INSTALAÇÃO CONCLUÍDA COM SUCESSO!\n";
    echo "====================================================\n";
    
} catch(PDOException $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
?>
