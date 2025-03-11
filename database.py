import sqlite3
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_name):
        self.db_name = db_name
        self.conn = None
        self.cursor = None
    
    def connect(self):
        self.conn = sqlite3.connect(self.db_name)
        self.cursor = self.conn.cursor()
    
    def disconnect(self):
        if self.conn:
            self.conn.close()
    
    def setup(self):
        """Cria a tabela de treinos se não existir"""
        self.connect()
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            distance REAL,
            duration INTEGER,
            avg_pace TEXT,
            calories INTEGER,
            notes TEXT
        )
        ''')
        self.conn.commit()
        self.disconnect()
    
    def add_run(self, date, distance, duration, calories, notes=""):
        """Adiciona um novo registro de corrida"""
        # Calcula o ritmo médio (pace) em formato min:seg por km
        if distance > 0:
            pace_seconds = (duration * 60) / distance
            minutes = int(pace_seconds // 60)
            seconds = int(pace_seconds % 60)
            avg_pace = f"{minutes}:{seconds:02d}"
        else:
            avg_pace = "0:00"
            
        self.connect()
        self.cursor.execute(
            "INSERT INTO runs (date, distance, duration, avg_pace, calories, notes) VALUES (?, ?, ?, ?, ?, ?)",
            (date, distance, duration, avg_pace, calories, notes)
        )
        self.conn.commit()
        run_id = self.cursor.lastrowid
        self.disconnect()
        return run_id
    
    def get_all_runs(self):
        """Retorna todos os registros de corrida"""
        self.connect()
        self.cursor.execute("SELECT * FROM runs ORDER BY date DESC")
        runs = self.cursor.fetchall()
        self.disconnect()
        return runs
    
    def get_run(self, run_id):
        """Retorna um registro de corrida específico pelo ID"""
        self.connect()
        self.cursor.execute("SELECT * FROM runs WHERE id = ?", (run_id,))
        run = self.cursor.fetchone()
        self.disconnect()
        return run
    
    def update_run(self, run_id, date, distance, duration, calories, notes=""):
        """Atualiza um registro de corrida existente"""
        # Calcula o ritmo médio (pace) em formato min:seg por km
        if distance > 0:
            pace_seconds = (duration * 60) / distance
            minutes = int(pace_seconds // 60)
            seconds = int(pace_seconds % 60)
            avg_pace = f"{minutes}:{seconds:02d}"
        else:
            avg_pace = "0:00"
            
        self.connect()
        self.cursor.execute(
            "UPDATE runs SET date=?, distance=?, duration=?, avg_pace=?, calories=?, notes=? WHERE id=?",
            (date, distance, duration, avg_pace, calories, notes, run_id)
        )
        self.conn.commit()
        self.disconnect()
    
    def delete_run(self, run_id):
        """Exclui um registro de corrida pelo ID"""
        self.connect()
        self.cursor.execute("DELETE FROM runs WHERE id=?", (run_id,))
        self.conn.commit()
        self.disconnect()
