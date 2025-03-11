import sqlite3
from datetime import datetime
import csv
import os

# Verificar a disponibilidade do módulo openpyxl
EXCEL_AVAILABLE = False
try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    EXCEL_AVAILABLE = True
except ImportError:
    print("Módulo 'openpyxl' não encontrado. A exportação para Excel não estará disponível.")
    print("Para instalar o módulo, execute: pip install openpyxl")

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
            
    def export_runs_to_xlsx(self, file_path, run_ids=None):
        """Exporta os treinos para um arquivo Excel
        
        Args:
            file_path (str): Caminho completo para o arquivo de saída
            run_ids (list, optional): Lista de IDs de treinos para exportar. Se None, exporta todos.
        """
        # Verificar se o módulo openpyxl está disponível
        if not EXCEL_AVAILABLE:
            print("A exportação para Excel não está disponível porque o módulo 'openpyxl' não está instalado.")
            print("Para instalar o módulo, execute: pip install openpyxl")
            return False
            
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
            
        # Nome das colunas para o cabeçalho 
        headers = [
            'ID', 'Data', 'Distância (km)', 'Duração (min)', 'Ritmo (min/km)', 
            'BPM Médio', 'BPM Máximo', 'Ganho de Elevação (m)', 'Calorias', 
            'Tipo de Treino', 'Notas'
        ]
        
        try:
            # Criar um novo workbook e selecionar a planilha ativa
            wb = Workbook()
            ws = wb.active
            ws.title = "Treinos de Corrida"
            
            # Estilos
            header_font = Font(name='Arial', size=12, bold=True, color='FFFFFF')
            header_fill = PatternFill(start_color="FF6700", end_color="FF6700", fill_type="solid")
            centered_alignment = Alignment(horizontal='center', vertical='center')
            border = Border(
                left=Side(border_style="thin", color="DDDDDD"),
                right=Side(border_style="thin", color="DDDDDD"),
                top=Side(border_style="thin", color="DDDDDD"),
                bottom=Side(border_style="thin", color="DDDDDD")
            )

            # Adicionar cabeçalho
            for col_num, header in enumerate(headers, 1):
                cell = ws.cell(row=1, column=col_num)
                cell.value = header
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = centered_alignment
                cell.border = border
                
            # Ajustar a largura das colunas baseado nos cabeçalhos
            for col_num, header in enumerate(headers, 1):
                column_letter = ws.cell(row=1, column=col_num).column_letter
                ws.column_dimensions[column_letter].width = max(len(header) * 1.2, 12)

            # Adicionar dados
            for row_num, run in enumerate(runs, 2):
                for col_num, value in enumerate(run, 1):
                    cell = ws.cell(row=row_num, column=col_num)
                    
                    # Tratamento especial para alguns valores
                    if col_num == 3:  # Distância
                        cell.value = round(value, 2) if value else 0
                        cell.number_format = '0.00'
                    elif col_num in (6, 7, 8):  # BPM e Elevação
                        cell.value = value if value is not None else "N/A"
                    else:
                        cell.value = value if value is not None else ""
                    
                    cell.alignment = Alignment(vertical='center')
                    cell.border = border
                
                # Aplicar formatação alternada para linhas
                row_color = "F5F5F5" if row_num % 2 == 0 else "FFFFFF"
                for col_num in range(1, len(headers) + 1):
                    ws.cell(row=row_num, column=col_num).fill = PatternFill(
                        start_color=row_color, end_color=row_color, fill_type="solid"
                    )
            
            # Salvar o workbook
            wb.save(file_path)
            return True
        except Exception as e:
            print(f"Erro ao exportar dados para Excel: {e}")
            return False
    
    def get_workout_types(self):
        """Retorna a lista de tipos de treino disponíveis"""
        return self.workout_types
