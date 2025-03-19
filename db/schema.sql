-- LazzFit Database Schema (MySQL)

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS lazzfit_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lazzfit_db;

-- Tabela de usuários
CREATE TABLE users (
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
) ENGINE=InnoDB;

-- Tabela de planos de treino
CREATE TABLE plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    difficulty_level VARCHAR(50) NULL,
    duration_weeks INT NULL,
    goal VARCHAR(50) NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela de planos de usuários
CREATE TABLE user_plans (
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
) ENGINE=InnoDB;

-- Tabela de treinos
CREATE TABLE workouts (
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
) ENGINE=InnoDB;

-- Tabela de segmentos de treinos
CREATE TABLE workout_segments (
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
) ENGINE=InnoDB;

-- Tabela de rotas
CREATE TABLE routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    distance DECIMAL(10,2) NULL,
    start_location VARCHAR(255) NULL,
    end_location VARCHAR(255) NULL,
    route_data TEXT NULL, -- GeoJSON ou formato similar para caminho da rota
    elevation_gain DECIMAL(10,2) NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de metas
CREATE TABLE goals (
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
) ENGINE=InnoDB;

-- Tabela de conquistas
CREATE TABLE achievements (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    badge_image VARCHAR(255) NULL,
    requirement_type VARCHAR(50) NULL, -- distance, frequency, streak
    requirement_value DECIMAL(10,2) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela de conquistas de usuários
CREATE TABLE user_achievements (
    user_achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    achievement_id INT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de comentários de treinos
CREATE TABLE workout_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT,
    user_id INT,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de curtidas de treinos
CREATE TABLE workout_likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (workout_id, user_id),
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de seguidores
CREATE TABLE user_follows (
    follow_id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT,
    following_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de preferências do usuário
CREATE TABLE user_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    distance_unit VARCHAR(10) DEFAULT 'km', -- km ou miles
    weight_unit VARCHAR(10) DEFAULT 'kg', -- kg or lbs
    pace_unit VARCHAR(10) DEFAULT 'min/km', -- min/km ou min/mile
    privacy_level VARCHAR(50) DEFAULT 'public', -- public, friends, private
    notification_settings JSON NULL, -- preferências de notificação
    theme_preference VARCHAR(50) DEFAULT 'system', -- light, dark, system
    language VARCHAR(10) DEFAULT 'pt-BR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de notificações
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    notification_type VARCHAR(50) NOT NULL, -- workout_comment, like, achievement, etc.
    content TEXT NOT NULL,
    related_id INT NULL, -- ID do conteúdo relacionado (workout_id, achievement_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de desafios
CREATE TABLE challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    challenge_type VARCHAR(50) NOT NULL, -- distance, time, streak, etc.
    target_value DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    badge_image VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela de participação em desafios
CREATE TABLE user_challenges (
    user_challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    challenge_id INT,
    current_progress DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Em andamento',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    UNIQUE KEY (user_id, challenge_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de zonas de treinamento
CREATE TABLE training_zones (
    zone_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    zone_number INT NOT NULL,
    zone_name VARCHAR(50) NOT NULL, -- Recovery, Aerobic, Threshold, etc.
    min_heart_rate INT NULL,
    max_heart_rate INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de configurações do sistema
CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NULL,
    setting_group VARCHAR(100) NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Criar índices para melhor performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(workout_date);
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
CREATE INDEX idx_workout_segments_workout_id ON workout_segments(workout_id);

-- Inserir conquistas padrão
INSERT INTO achievements (name, description, badge_image, requirement_type, requirement_value) VALUES 
('Primeiro Passo', 'Complete seu primeiro treino de corrida', 'badge-first-run.png', 'frequency', 1),
('Maratonista Iniciante', 'Acumule 42.2 km de corrida', 'badge-marathon-distance.png', 'distance', 42.2),
('Corredor Frequente', 'Complete 10 treinos de corrida', 'badge-frequent-runner.png', 'frequency', 10),
('Centena', 'Acumule 100 km de corrida', 'badge-100km.png', 'distance', 100),
('Madrugador', 'Complete um treino antes das 7h da manhã', 'badge-early-bird.png', 'special', 1);

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (setting_key, setting_value, setting_group, is_public) VALUES
('site_name', 'LazzFit', 'general', TRUE),
('contact_email', 'contato@lazzfit.com.br', 'general', TRUE),
('max_file_upload_size', '10', 'security', FALSE),
('enable_social_login', 'true', 'authentication', FALSE),
('default_plan_id', '1', 'plans', FALSE),
('privacy_policy_version', '1.0', 'legal', TRUE),
('terms_version', '1.0', 'legal', TRUE);
