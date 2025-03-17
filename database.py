import sqlite3
from datetime import datetime
import csv
import os
import time
import sys
import traceback
import shutil  # Para operações de cópia de arquivos

# Verificar a disponibilidade do módulo openpyxl
EXCEL_AVAILABLE = False
try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    EXCEL_AVAILABLE = True
    print("✅ Módulo openpyxl encontrado - Exportação para Excel disponível.")
except ImportError:
    print("⚠️ Módulo 'openpyxl' não encontrado. A exportação para Excel não estará disponível.")
    print("Para instalar o módulo, execute: pip install openpyxl")

class DatabaseManager:
    def __init__(self, db_name):
        # Garantir que o caminho do banco de dados é absoluto e único
        if not os.path.isabs(db_name):
            app_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(app_dir, "data")
            if not os.path.exists(data_dir):
                os.makedirs(data_dir)
            self.db_name = os.path.join(data_dir, os.path.basename(db_name))
        else:
            self.db_name = db_name
            
        print(f"🔍 DatabaseManager usando banco de dados em: {self.db_name}")
        
        # Verificar se o diretório do banco existe
        db_dir = os.path.dirname(self.db_name)
        if not os.path.exists(db_dir):
            try:
                os.makedirs(db_dir)
                print(f"✓ Diretório do banco de dados criado: {db_dir}")
            except Exception as e:
                print(f"❌ Erro ao criar diretório do banco de dados: {e}")
        
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
        
        self.transaction_active = False  # Controle de transação ativa
        
        # Atributo para indicar disponibilidade de Excel
        self.EXCEL_AVAILABLE = EXCEL_AVAILABLE
        
    def connect(self):
        """Conecta ao banco de dados (sem iniciar transação)"""
        try:
            if self.conn:
                # Verificar se a conexão ainda está ativa
                try:
                    self.conn.execute("SELECT 1")
                    return True
                except sqlite3.Error:
                    # Conexão não está mais válida, fechamos e tentamos novamente
                    try:
                        self.conn.close()
                    except:
                        pass
                    self.conn = None
                    self.cursor = None
            
            # Verificar se o diretório do banco existe, se não, criar
            db_dir = os.path.dirname(self.db_name)
            if db_dir and not os.path.exists(db_dir):
                os.makedirs(db_dir)
                
            # Tenta conectar com timeout para evitar problemas de lock
            print(f"🔌 Tentando conectar ao banco de dados: {self.db_name}")
            
            # IMPORTANTE: Usar DEFERRED para controle explícito de transações
            self.conn = sqlite3.connect(self.db_name, timeout=30, isolation_level="DEFERRED")
            
            # Configurações para melhorar a persistência
            self.conn.execute("PRAGMA foreign_keys = ON")
            # Configuração mais robusta de journal
            self.conn.execute("PRAGMA journal_mode = DELETE")
            # Modo FULL para máxima segurança de dados
            self.conn.execute("PRAGMA synchronous = NORMAL")  # NORMAL é bom equilíbrio entre segurança e performance
            
            self.cursor = self.conn.cursor()
            return True
            
        except sqlite3.Error as e:
            print(f"❌ Erro de conexão ao banco: {e}")
            return False
    
    def begin_transaction(self):
        """Inicia uma transação explicitamente"""
        if self.conn and not self.transaction_active:
            try:
                self.conn.execute("BEGIN TRANSACTION")
                self.transaction_active = True
                return True
            except sqlite3.Error as e:
                print(f"❌ Erro ao iniciar transação: {e}")
                return False
        return self.transaction_active  # Já estava ativa
    
    def commit(self):
        """Faz commit da transação se houver uma ativa"""
        if self.conn and self.transaction_active:
            try:
                self.conn.commit()
                self.transaction_active = False
                return True
            except sqlite3.Error as e:
                print(f"❌ Erro ao fazer commit: {e}")
                return False
        return True  # Nada para fazer commit
    
    def rollback(self):
        """Desfaz a transação se houver uma ativa"""
        if self.conn and self.transaction_active:
            try:
                self.conn.rollback()
                self.transaction_active = False
                return True
            except sqlite3.Error as e:
                print(f"❌ Erro ao fazer rollback: {e}")
                return False
        return True  # Nada para fazer rollback
    
    def disconnect(self):
        """Desconecta do banco de dados, fazendo commit se necessário"""
        if self.conn:
            try:
                # Commit se houver uma transação ativa
                if self.transaction_active:
                    self.commit()
                
                self.conn.close()
                print("✓ Banco de dados fechado com sucesso")
            except sqlite3.Error as e:
                print(f"❌ Erro ao fechar conexão com banco de dados: {e}")
            finally:
                self.conn = None
                self.cursor = None
                self.transaction_active = False
    
    def setup(self):
        """Configura o banco de dados com tratamento de erros melhorado"""
        if not self.connect():
            print("❌ ERRO: Não foi possível conectar ao banco de dados para setup.")
            return False
            
        try:
            # Iniciar uma transação para todas as operações de setup
            self.begin_transaction()
            
            # Verificar se a tabela existe
            self.cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='runs'")
            table_exists = self.cursor.fetchone()
                
            # Criar a tabela se não existir
            if not table_exists:
                print("Tabela 'runs' não existe. Criando nova tabela...")
                self.cursor.execute('''
                CREATE TABLE IF NOT EXISTS runs (
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
                print("✓ Tabela 'runs' criada com sucesso")
            else:
                print("✓ Tabela 'runs' já existe")
                # Verificar colunas faltantes
                self.check_and_add_missing_columns()
            
            # Confirmar as alterações
            self.commit()
            return True
            
        except Exception as e:
            print(f"❌ ERRO durante setup do banco de dados: {e}")
            print(traceback.format_exc())
            self.rollback()  # Desfazer alterações em caso de erro
            return False
        finally:
            self.disconnect()
    
    def check_and_add_missing_columns(self):
        """Verifica e adiciona colunas faltantes na tabela runs"""
        try:
            self.cursor.execute("PRAGMA table_info(runs)")
            columns = self.cursor.fetchall()
            column_names = [col[1] for col in columns]
            
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
                    print(f"✓ Coluna '{col_name}' adicionada à tabela 'runs'")
                except sqlite3.OperationalError:
                    # Coluna já existe
                    pass
            
            return True
        except sqlite3.Error as e:
            print(f"❌ Erro ao verificar colunas da tabela: {e}")
            return False
    
    def add_run(self, date, distance, duration, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes=""):
        """Adiciona um novo registro de corrida"""
        if not self.connect():
            print("ERRO: Não foi possível conectar ao banco de dados para adicionar corrida.")
            return None
            
        try:
            # Iniciar transação
            self.begin_transaction()
            
            # Calcula o ritmo médio (pace) em formato min:seg por km
            if distance > 0:
                pace_seconds = (duration * 60) / distance
                minutes = int(pace_seconds // 60)
                seconds = int(pace_seconds % 60)
                avg_pace = f"{minutes}:{seconds:02d}"
            else:
                avg_pace = "0:00"
                
            self.cursor.execute(
                "INSERT INTO runs (date, distance, duration, avg_pace, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (date, distance, duration, avg_pace, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes)
            )
            
            # Commit da transação
            self.commit()
            print(f"✓ Adicionada corrida em {date}")
            run_id = self.cursor.lastrowid
            return run_id
        except sqlite3.Error as e:
            print(f"ERRO ao adicionar corrida: {e}")
            self.rollback()
            return None
        finally:
            self.disconnect()
    
    def get_all_runs(self):
        """Retorna todos os registros de corrida"""
        if not self.connect():
            print("ERRO: Não foi possível conectar ao banco de dados para obter corridas.")
            return []
            
        try:
            self.cursor.execute("SELECT * FROM runs ORDER BY date DESC")
            runs = self.cursor.fetchall()
            return runs
        except sqlite3.Error as e:
            print(f"ERRO ao obter corridas: {e}")
            return []
        finally:
            self.disconnect()
    
    def get_run(self, run_id):
        """Retorna um registro de corrida específico pelo ID"""
        if not self.connect():
            return None
            
        try:
            self.cursor.execute("SELECT * FROM runs WHERE id = ?", (run_id,))
            run = self.cursor.fetchone()
            return run
        except sqlite3.Error as e:
            print(f"ERRO ao obter corrida {run_id}: {e}")
            return None
        finally:
            self.disconnect()
    
    def update_run(self, run_id, date, distance, duration, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes=""):
        """Atualiza um registro de corrida existente"""
        if not self.connect():
            print("ERRO: Não foi possível conectar ao banco de dados para atualizar corrida.")
            return False
            
        try:
            # Iniciar transação
            self.begin_transaction()
            
            # Calcula o ritmo médio (pace) em formato min:seg por km
            if distance > 0:
                pace_seconds = (duration * 60) / distance
                minutes = int(pace_seconds // 60)
                seconds = int(pace_seconds % 60)
                avg_pace = f"{minutes}:{seconds:02d}"
            else:
                avg_pace = "0:00"
                
            self.cursor.execute(
                "UPDATE runs SET date=?, distance=?, duration=?, avg_pace=?, avg_bpm=?, max_bpm=?, elevation_gain=?, calories=?, workout_type=?, notes=? WHERE id=?",
                (date, distance, duration, avg_pace, avg_bpm, max_bpm, elevation_gain, calories, workout_type, notes, run_id)
            )
            
            # Commit da transação
            self.commit()
            print(f"✓ Atualizada corrida ID {run_id}")
            return True
        except sqlite3.Error as e:
            print(f"ERRO ao atualizar corrida {run_id}: {e}")
            self.rollback()
            return False
        finally:
            self.disconnect()
    
    def delete_run(self, run_id):
        """Exclui um registro de corrida pelo ID"""
        if not self.connect():
            print("ERRO: Não foi possível conectar ao banco de dados para excluir corrida.")
            return False
            
        try:
            # Iniciar transação
            self.begin_transaction()
            
            self.cursor.execute("DELETE FROM runs WHERE id=?", (run_id,))
            
            # Commit da transação
            self.commit()
            print(f"✓ Excluída corrida ID {run_id}")
            return True
        except sqlite3.Error as e:
            print(f"ERRO ao excluir corrida {run_id}: {e}")
            self.rollback()
            return False
        finally:
            self.disconnect()
        
    def export_runs_to_csv(self, file_path, run_ids=None):
        """Exporta os treinos para um arquivo CSV"""
        if not self.connect():
            return False
        
        try:
            if run_ids:
                # Converte lista de IDs para formato adequado para IN do SQL
                id_placeholders = ','.join(['?' for _ in run_ids])
                query = f"SELECT * FROM runs WHERE id IN ({id_placeholders}) ORDER BY date DESC"
                self.cursor.execute(query, run_ids)
            else:
                self.cursor.execute("SELECT * FROM runs ORDER BY date DESC")
                
            runs = self.cursor.fetchall()
            
            if not runs:
                return False
                
            # Nome das colunas para o cabeçalho do CSV
            headers = [
                'ID', 'Data', 'Distância (km)', 'Duração (min)', 'Ritmo (min/km)', 
                'BPM Médio', 'BPM Máximo', 'Ganho de Elevação (m)', 'Calorias', 
                'Tipo de Treino', 'Notas'
            ]
            
            with open(file_path, 'w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerow(headers)
                writer.writerows(runs)
            return True
        except Exception as e:
            print(f"Erro ao exportar dados para CSV: {e}")
            return False
        finally:
            self.disconnect()
            
    def export_runs_to_xlsx(self, file_path, run_ids=None):
        """Exporta os treinos para um arquivo Excel"""
        # Verificar novamente se o openpyxl está disponível
        excel_available = False
        try:
            import openpyxl
            excel_available = True
        except ImportError:
            excel_available = False
            
        if not excel_available:
            print("⚠️ A exportação para Excel não está disponível porque o módulo 'openpyxl' não está instalado.")
            return False
            
        if not self.connect():
            return False
        
        try:
            if run_ids:
                # Converte lista de IDs para formato adequado para IN do SQL
                id_placeholders = ','.join(['?' for _ in run_ids])
                query = f"SELECT * FROM runs WHERE id IN ({id_placeholders}) ORDER BY date DESC"
                self.cursor.execute(query, run_ids)
            else:
                self.cursor.execute("SELECT * FROM runs ORDER BY date DESC")
                
            runs = self.cursor.fetchall()
            
            if not runs:
                return False
                
            # Nome das colunas para o cabeçalho 
            headers = [
                'ID', 'Data', 'Distância (km)', 'Duração (min)', 'Ritmo (min/km)', 
                'BPM Médio', 'BPM Máximo', 'Ganho de Elevação (m)', 'Calorias', 
                'Tipo de Treino', 'Notas'
            ]
            
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
        finally:
            self.disconnect()
    
    def get_workout_types(self):
        """Retorna a lista de tipos de treino disponíveis"""
        return self.workout_types
    
    def ensure_connection_closed(self):
        """Garantir que a conexão esteja fechada"""
        if self.conn:
            try:
                # Se houver uma transação ativa, fazer commit
                if self.transaction_active:
                    self.commit()
                self.conn.close()
                print("✓ Conexão com banco fechada através de ensure_connection_closed")
            except Exception as e:
                print(f"Erro ao fechar conexão: {e}")
            finally:
                self.conn = None
                self.cursor = None
                self.transaction_active = False
    
    def __del__(self):
        """Destrutor para garantir que a conexão seja fechada"""
        self.ensure_connection_closed()
