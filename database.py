import sqlite3
from hashlib import sha256
import os
from datetime import datetime

def create_tables():
    """Cria as tabelas necessárias no banco de dados SQLite"""
    conn = sqlite3.connect('lazzfit.db')
    cursor = conn.cursor()
    
    # Tabela de usuários
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Tabela de treinos
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date DATE NOT NULL,
        distance REAL NOT NULL,
        duration INTEGER NOT NULL,  -- Em segundos
        pace REAL,                  -- Ritmo médio (min/km)
        calories INTEGER,           -- Calorias estimadas
        heart_rate INTEGER,         -- Frequência cardíaca média (opcional)
        notes TEXT,                 -- Anotações adicionais
        location TEXT,              -- Local da corrida
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Tabela de configurações
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        setting_name TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL
    )
    ''')
    
    # Tabela de objetivos
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        goal_type TEXT NOT NULL,    -- 'distance', 'time', 'pace'
        target_value REAL NOT NULL,
        time_frame TEXT NOT NULL,   -- 'daily', 'weekly', 'monthly'
        start_date DATE NOT NULL,
        end_date DATE,
        completed INTEGER DEFAULT 0, -- 0=não, 1=sim
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Inserir configurações padrão se não existirem
    cursor.execute("INSERT OR IGNORE INTO settings (setting_name, setting_value) VALUES (?, ?)",
                 ('theme', 'dark'))
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Criptografa a senha usando SHA-256"""
    return sha256(password.encode()).hexdigest()

def register_user(username, password, name=None, email=None):
    """Registra um novo usuário no banco de dados"""
    try:
        conn = sqlite3.connect('lazzfit.db')
        cursor = conn.cursor()
        
        # Verifica se username já existe
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            conn.close()
            return False, "Nome de usuário já existe."
        
        # Criptografa a senha
        hashed_password = hash_password(password)
        
        # Insere o novo usuário
        cursor.execute(
            "INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)",
            (username, hashed_password, name, email)
        )
        
        conn.commit()
        conn.close()
        return True, "Usuário registrado com sucesso!"
    
    except sqlite3.Error as e:
        return False, f"Erro no banco de dados: {e}"

def authenticate_user(username, password):
    """Autentica um usuário"""
    try:
        conn = sqlite3.connect('lazzfit.db')
        cursor = conn.cursor()
        
        # Busca o usuário pelo username
        cursor.execute("SELECT id, password FROM users WHERE username = ?", (username,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return False, None, "Usuário não encontrado."
        
        user_id, stored_password = result
        
        # Verifica a senha
        if hash_password(password) == stored_password:
            conn.close()
            return True, user_id, "Login bem-sucedido!"
        else:
            conn.close()
            return False, None, "Senha incorreta."
    
    except sqlite3.Error as e:
        return False, None, f"Erro no banco de dados: {e}"

def save_run(user_id, date, distance, duration, heart_rate=None, notes=None, location=None):
    """Salva um novo registro de corrida"""
    try:
        conn = sqlite3.connect('lazzfit.db')
        cursor = conn.cursor()
        
        # Calcula o ritmo (pace) em minutos por km
        if distance > 0:
            pace = duration / 60 / distance  # minutos por km
        else:
            pace = 0
        
        # Estimativa simples de calorias queimadas (baseada na distância)
        calories = int(distance * 60)  # ~60 kcal por km
        
        # Insere o registro
        cursor.execute('''
        INSERT INTO runs (user_id, date, distance, duration, pace, calories, heart_rate, notes, location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, date, distance, duration, pace, calories, heart_rate, notes, location))
        
        conn.commit()
        run_id = cursor.lastrowid
        conn.close()
        
        return True, run_id, "Treino salvo com sucesso!"
    
    except sqlite3.Error as e:
        return False, None, f"Erro ao salvar treino: {e}"

def get_user_runs(user_id, limit=10):
    """Obtém os treinos do usuário"""
    try:
        conn = sqlite3.connect('lazzfit.db')
        conn.row_factory = sqlite3.Row  # Para acessar colunas pelo nome
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM runs 
        WHERE user_id = ? 
        ORDER BY date DESC 
        LIMIT ?
        ''', (user_id, limit))
        
        runs = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return runs
    
    except sqlite3.Error as e:
        print(f"Erro ao buscar treinos: {e}")
        return []

def get_user_stats(user_id):
    """Obtém estatísticas gerais do usuário"""
    stats = {
        'total_runs': 0,
        'total_distance': 0,
        'total_duration': 0,
        'avg_pace': 0,
        'fastest_pace': 0,
        'longest_run': 0,
        'total_calories': 0,
        'runs_this_month': 0,
        'distance_this_month': 0
    }
    
    try:
        conn = sqlite3.connect('lazzfit.db')
        cursor = conn.cursor()
        
        # Total de treinos
        cursor.execute("SELECT COUNT(*) FROM runs WHERE user_id = ?", (user_id,))
        stats['total_runs'] = cursor.fetchone()[0]
        
        if stats['total_runs'] == 0:
            conn.close()
            return stats
        
        # Distância total
        cursor.execute("SELECT SUM(distance) FROM runs WHERE user_id = ?", (user_id,))
        stats['total_distance'] = round(cursor.fetchone()[0], 2)
        
        # Duração total
        cursor.execute("SELECT SUM(duration) FROM runs WHERE user_id = ?", (user_id,))
        stats['total_duration'] = cursor.fetchone()[0]
        
        # Ritmo médio
        cursor.execute("SELECT AVG(pace) FROM runs WHERE user_id = ? AND pace > 0", (user_id,))
        result = cursor.fetchone()[0]
        stats['avg_pace'] = round(result, 2) if result else 0
        
        # Ritmo mais rápido
        cursor.execute("SELECT MIN(pace) FROM runs WHERE user_id = ? AND pace > 0", (user_id,))
        result = cursor.fetchone()[0]
        stats['fastest_pace'] = round(result, 2) if result else 0
        
        # Corrida mais longa
        cursor.execute("SELECT MAX(distance) FROM runs WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()[0]
        stats['longest_run'] = round(result, 2) if result else 0
        
        # Total de calorias
        cursor.execute("SELECT SUM(calories) FROM runs WHERE user_id = ?", (user_id,))
        stats['total_calories'] = cursor.fetchone()[0]
        
        # Corridas no mês atual
        current_month = datetime.now().strftime('%Y-%m')
        cursor.execute("SELECT COUNT(*) FROM runs WHERE user_id = ? AND date LIKE ?", 
                     (user_id, f"{current_month}%"))
        stats['runs_this_month'] = cursor.fetchone()[0]
        
        # Distância no mês atual
        cursor.execute("SELECT SUM(distance) FROM runs WHERE user_id = ? AND date LIKE ?", 
                     (user_id, f"{current_month}%"))
        result = cursor.fetchone()[0]
        stats['distance_this_month'] = round(result, 2) if result else 0
        
        conn.close()
        return stats
        
    except sqlite3.Error as e:
        print(f"Erro ao obter estatísticas: {e}")
        return stats

def get_monthly_distance(user_id, year):
    """Obtém a distância percorrida por mês em um ano específico"""
    monthly_data = [0] * 12  # Um valor para cada mês
    
    try:
        conn = sqlite3.connect('lazzfit.db')
        cursor = conn.cursor()
        
        for month in range(1, 13):
            # Formata o mês com zero à esquerda se necessário
            month_str = f"{year}-{month:02d}"
            
            cursor.execute(
                "SELECT SUM(distance) FROM runs WHERE user_id = ? AND date LIKE ?", 
                (user_id, f"{month_str}%")
            )
            
            result = cursor.fetchone()[0]
            if result:
                monthly_data[month-1] = round(result, 2)
        
        conn.close()
        return monthly_data
        
    except sqlite3.Error as e:
        print(f"Erro ao obter dados mensais: {e}")
        return monthly_data
