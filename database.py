import sqlite3
from datetime import datetime
import csv
import os

class DatabaseManager:
    def __init__(self, db_name):
        self.db_name = db_name
        self.conn = None
        self.cursor = None
        
        # Tipos de treino pré-definidos
        self.workout_types = [
            "Corrida de Rua",
            "Trail Running",
            "Corrida na Esteira",
            "Intervalado",
            "Long Run",
            "Recuperação",
            "Fartlek",
            "Corrida de Montanha",
            "Outro"
        ]
    
    def connect(self):
        self.conn = sqlite3.connect(self.db_name)
        self.cursor = self.conn.cursor()
    
    def disconnect(self):
        if self.conn:
            self.conn.close()
    
    def setup(self):
        """Cria a tabela de treinos se não existir e verifica se é necessário atualizar a estrutura"""
        self.connect()
        
        # Verifica se a tabela já existe
        self.cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='runs'")
        table_exists = self.cursor.fetchone()
        
        if table_exists:
            # Tabela existe, verificar a estrutura atual
            self.cursor.execute("PRAGMA table_info(runs)")
            columns = self.cursor.fetchall()
            column_names = [col[1] for col in columns]
            
            # Verificar se os novos campos existem
            missing_columns = []
            if "avg_bpm" not in column_names:
                missing_columns.append("avg_bpm INTEGER")
            if "max_bpm" not in column_names:
                missing_columns.append("max_bpm INTEGER")
            if "elevation_gain" not in column_names:
                missing_columns.append("elevation_gain INTEGER")
            if "workout_type" not in column_names:
                missing_columns.append("workout_type TEXT")
            
            # Adicionar colunas faltantes
            for col in missing_columns:
                col_name = col.split()[0]
                try:
                    self.cursor.execute(f"ALTER TABLE runs ADD COLUMN {col}")
                    print(f"Coluna '{col_name}' adicionada à tabela 'runs'")
                except sqlite3.OperationalError:
                    # Coluna já existe
                    pass
        else:
            # Criar tabela completa
            self.cursor.execute('''
            CREATE TABLE runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                distance REAL,
                duration INTEGER,
                avg_pace TEXT,
                avg_bpm INTEGER,
                max_bpm INTEGER,
                elevation_gain INTEGER,
                calories INTEGER,
                workout_type TEXT,
                notes TEXT
            )
            ''')
            print("Tabela 'runs' criada com sucesso")
            
        self.conn.commit()
        self.disconnect()
    
    def add_run(self, date, distance, duration, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes=""):
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
            "INSERT INTO runs (date, distance, duration, avg_pace, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (date, distance, duration, avg_pace, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes)
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
    
    def update_run(self, run_id, date, distance, duration, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes=""):
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
            "UPDATE runs SET date=?, distance=?, duration=?, avg_pace=?, avg_bpm=?, max_bpm=?, elevation_gain=?, calories=?, workout_type=?, notes=? WHERE id=?",
            (date, distance, duration, avg_pace, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes, run_id)
        )
        self.conn.commit()
        self.disconnect()
    
    def delete_run(self, run_id):
        """Exclui um registro de corrida pelo ID"""
        self.connect()
        self.cursor.execute("DELETE FROM runs WHERE id=?", (run_id,))
        self.conn.commit()
        self.disconnect()
        
    def export_runs_to_csv(self, file_path, run_ids=None):
        """Exporta os treinos para um arquivo CSV
        
        Args:
            file_path (str): Caminho completo para o arquivo de saída
            run_ids (list, optional): Lista de IDs de treinos para exportar. Se None, exporta todos.
        """
        self.connect()
        
        if run_ids:
            # Converte lista de IDs para formato adequado para IN do SQL
            id_placeholders = ','.join(['?' for _ in run_ids])
            query = f"SELECT * FROM runs WHERE id IN ({id_placeholders}) ORDER BY date DESC"
            self.cursor.execute(query, run_ids)
        else:
            self.cursor.execute("SELECT * FROM runs ORDER BY date DESC")
            
        runs = self.cursor.fetchall()
        self.disconnect()
        
        if not runs:
            return False
            
        # Nome das colunas para o cabeçalho do CSV
        headers = [
            'ID', 'Data', 'Distância (km)', 'Duração (min)', 'Ritmo (min/km)', 
            'BPM Médio', 'BPM Máximo', 'Ganho de Elevação (m)', 'Calorias', 
            'Tipo de Treino', 'Notas'
        ]
        
        try:
            with open(file_path, 'w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerow(headers)
                writer.writerows(runs)
            return True
        except Exception as e:
            print(f"Erro ao exportar dados: {e}")
            return False
            
    def get_workout_types(self):
        """Retorna a lista de tipos de treino disponíveis"""
        return self.workout_types
