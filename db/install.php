<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Script para instalação do banco de dados LazzFit (versão single-user)
 */
echo "<h1>INSTALAÇÃO DO BANCO DE DADOS LAZZFIT</h1>";
echo "<p>Versão: Single-User</p>";

try {
    // Primeiro, criar a conexão sem especificar o banco de dados
    $dsn = "mysql:host=" . DB_SERVER . ";port=" . DB_PORT . ";charset=utf8mb4";
    
    echo "<p>Conectando ao servidor MySQL... ";
    $conn = new PDO($dsn, DB_USERNAME, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "CONECTADO!</p>";
    
    // Criar o banco de dados
    echo "<p>Criando banco de dados... ";
    $conn->exec("DROP DATABASE IF EXISTS " . DB_NAME);
    $conn->exec("CREATE DATABASE " . DB_NAME . " 
                DEFAULT CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci");
    echo "CONCLUÍDO!</p>";
    
    // Selecionar o banco de dados
    echo "<p>Selecionando banco de dados... ";
    $conn->exec("USE " . DB_NAME);
    echo "CONCLUÍDO!</p>";
    
    echo "<p>Criando tabelas:</p><ul>";
    
    // Tabela de usuário único
    echo "<li>Tabela de usuário... ";
    $conn->exec("CREATE TABLE users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE NULL,
        gender VARCHAR(20) NULL,
        weight DECIMAL(5,2) NULL,
        height DECIMAL(5,2) NULL,
        profile_image VARCHAR(255) NULL,
        runner_level VARCHAR(50) DEFAULT 'Iniciante',
        is_premium BOOLEAN DEFAULT FALSE,
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de planos de treino
    echo "<li>Tabela de planos de treino... ";
    $conn->exec("CREATE TABLE plans (
        plan_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        difficulty_level VARCHAR(50) NULL,
        duration_weeks INT NULL,
        goal VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de planos do usuário
    echo "<li>Tabela de planos do usuário... ";
    $conn->exec("CREATE TABLE user_plans (
        user_plan_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        plan_id INT,
        start_date DATE NULL,
        end_date DATE NULL,
        progress_percent DECIMAL(5,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Em andamento',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE SET NULL
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de treinos
    echo "<li>Tabela de treinos... ";
    $conn->exec("CREATE TABLE workouts (
        workout_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_plan_id INT NULL,
        workout_date DATE NOT NULL,
        distance DECIMAL(10,2) NULL,
        duration TIME NULL,
        pace DECIMAL(10,2) NULL, -- in seconds per km
        calories_burned INT NULL,
        avg_heart_rate INT NULL,
        max_heart_rate INT NULL,
        feeling VARCHAR(50) NULL,
        notes TEXT NULL,
        weather_condition VARCHAR(50) NULL,
        temperature DECIMAL(5,2) NULL,
        humidity DECIMAL(5,2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (user_plan_id) REFERENCES user_plans(user_plan_id) ON DELETE SET NULL
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de segmentos de treinos
    echo "<li>Tabela de segmentos de treinos... ";
    $conn->exec("CREATE TABLE workout_segments (
        segment_id INT AUTO_INCREMENT PRIMARY KEY,
        workout_id INT,
        segment_type VARCHAR(50), -- warmup, interval, recovery, cooldown
        distance DECIMAL(10,2) NULL,
        duration TIME NULL,
        pace DECIMAL(10,2) NULL,
        sequence_order INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de rotas
    echo "<li>Tabela de rotas... ";
    $conn->exec("CREATE TABLE routes (
        route_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(100) NOT NULL,
        distance DECIMAL(10,2) NULL,
        start_location VARCHAR(255) NULL,
        end_location VARCHAR(255) NULL,
        route_data TEXT NULL, -- GeoJSON ou formato similar para caminho da rota
        elevation_gain DECIMAL(10,2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de metas
    echo "<li>Tabela de metas... ";
    $conn->exec("CREATE TABLE goals (
        goal_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        goal_type VARCHAR(50) NOT NULL, -- distance, frequency, time, etc.
        target_value DECIMAL(10,2) NOT NULL,
        current_value DECIMAL(10,2) DEFAULT 0,
        time_period VARCHAR(50) NULL, -- weekly, monthly, yearly
        start_date DATE NOT NULL,
        end_date DATE NULL,
        status VARCHAR(50) DEFAULT 'Em andamento',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de conquistas
    echo "<li>Tabela de conquistas... ";
    $conn->exec("CREATE TABLE achievements (
        achievement_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        badge_image VARCHAR(255) NULL,
        requirement_type VARCHAR(50) NULL, -- distance, frequency, streak
        requirement_value DECIMAL(10,2) NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de conquistas do usuário
    echo "<li>Tabela de conquistas do usuário... ";
    $conn->exec("CREATE TABLE user_achievements (
        user_achievement_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        achievement_id INT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    // Tabela de preferências do usuário
    echo "<li>Tabela de preferências do usuário... ";
    $conn->exec("CREATE TABLE user_preferences (
        preference_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE,
        distance_unit VARCHAR(10) DEFAULT 'km', -- km ou miles
        weight_unit VARCHAR(10) DEFAULT 'kg', -- kg or lbs
        pace_unit VARCHAR(10) DEFAULT 'min/km', -- min/km ou min/mile
        theme_preference VARCHAR(50) DEFAULT 'system', -- light, dark, system
        language VARCHAR(10) DEFAULT 'pt-BR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB");
    echo "CONCLUÍDO!</li>";
    
    echo "</ul>";
    
    // Inserir planos de treino padrão
    echo "<p>Inserindo planos de treino padrão... ";
    $conn->exec("INSERT INTO plans (name, description, difficulty_level, duration_weeks, goal) VALUES 
        ('Iniciante 5K', 'Plano para iniciantes que desejam completar uma corrida de 5K', 'Iniciante', 8, '5K'),
        ('Intermediário 10K', 'Melhore seu tempo de 10K com este plano progressivo', 'Intermediário', 10, '10K'),
        ('Meia Maratona', 'Prepare-se para sua primeira meia maratona', 'Intermediário', 12, '21K'),
        ('Maratona', 'Plano completo para preparação de maratona', 'Avançado', 16, '42K'),
        ('Condicionamento Geral', 'Mantenha-se em forma com este plano de corrida', 'Iniciante', 0, 'Saúde')");
    echo "CONCLUÍDO!</p>";
    
    // Inserir conquistas padrão
    echo "<p>Inserindo conquistas padrão... ";
    $conn->exec("INSERT INTO achievements (name, description, badge_image, requirement_type, requirement_value) VALUES 
        ('Primeiro Passo', 'Complete seu primeiro treino de corrida', 'badge-first-run.png', 'frequency', 1),
        ('Maratonista Iniciante', 'Acumule 42.2 km de corrida', 'badge-marathon-distance.png', 'distance', 42.2),
        ('Corredor Frequente', 'Complete 10 treinos de corrida', 'badge-frequent-runner.png', 'frequency', 10),
        ('Centena', 'Acumule 100 km de corrida', 'badge-100km.png', 'distance', 100),
        ('Madrugador', 'Complete um treino antes das 7h da manhã', 'badge-early-bird.png', 'special', 1),
        ('Velocista', 'Mantenha um ritmo abaixo de 4:30/km por 5km', 'badge-speedster.png', 'pace', 4.5)");
    echo "CONCLUÍDO!</p>";
    
    echo "<h2>Instalação concluída com sucesso!</h2>";
    echo "<p><a href='../index.html' class='button'>Voltar para a página inicial</a></p>";
    
    // Estilo para a página
    echo "<style>
        body { font-family: 'Poppins', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
        h1, h2 { color: #FF8C00; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
        .button { display: inline-block; background-color: #FF8C00; color: white; padding: 10px 20px; 
                text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .button:hover { background-color: #FF7000; }
    </style>";
    
} catch (PDOException $e) {
    die("<p>Erro na instalação: " . $e->getMessage() . "</p>");
}
?>
