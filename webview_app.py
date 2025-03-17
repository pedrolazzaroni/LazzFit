import webview
import os
import sys
import json
import threading
import time
import sqlite3
import traceback
from tkinter import Tk, filedialog
from database import DatabaseManager

# Variável global para compartilhar o objeto API entre módulos
global_api = None

class LazzFitAPI:
    def __init__(self):
        # Corrigir o problema de path do banco de dados usando um caminho absoluto fixo
        self.script_dir = os.path.abspath(os.path.dirname(__file__))
        data_dir = os.path.join(self.script_dir, "data")
        
        # Garantir que o diretório data existe
        if not os.path.exists(data_dir):
            try:
                os.makedirs(data_dir)
                print(f"✓ Diretório de dados criado: {data_dir}")
            except Exception as e:
                print(f"❌ ERRO ao criar diretório de dados: {e}")
        
        self.db_path = os.path.join(data_dir, "lazzfit.db")
        print(f"🔍 Inicializando banco de dados: {self.db_path}")
        
        # Inicializa o banco de dados com um bloco try-except explícito
        try:
            self.db = DatabaseManager(self.db_path)
            setup_success = self.db.setup()
            
            if not setup_success:
                print("❌ Falha na configuração do banco de dados")
            else:
                print("✓ Banco de dados configurado com sucesso")
            
            # Teste de verificação para garantir que está funcionando
            test_runs = self.db.get_all_runs()
            print(f"✓ Banco de dados conectado com sucesso! {len(test_runs)} registros encontrados.")
        except Exception as e:
            print(f"❌ ERRO FATAL ao acessar o banco de dados: {e}")
            print(traceback.format_exc())
    
    def recover_database(self):
        """Tenta abordagens mais agressivas de recuperação do banco de dados"""
        print("🔄 Tentando recuperação do banco de dados...")
        
        try:
            # 1. Remover o arquivo se existir
            if os.path.exists(self.db_path):
                os.remove(self.db_path)
                print("✓ Arquivo de banco de dados removido para recriação")
            
            # 2. Tentar criar um banco de dados novo e limpo
            self.db = DatabaseManager(self.db_path)
            setup_success = self.db.setup(force_new=True)
            
            if setup_success:
                print("✓ Banco de dados recriado com sucesso")
            else:
                print("❌ Falha ao recriar o banco de dados")
        except Exception as e:
            print(f"❌ Erro durante recuperação: {e}")
    
    def check_database_health(self):
        """Verifica a saúde do banco de dados com verificações detalhadas"""
        print("🔍 Verificando banco de dados...")
        
        # Verificar se o arquivo existe
        if os.path.exists(self.db_path):
            print(f"✓ Arquivo de banco de dados encontrado: {self.db_path}")
            file_size = os.path.getsize(self.db_path)
            print(f"  - Tamanho: {file_size} bytes")
            
            # Verificar permissões
            try:
                # Verificar permissão de leitura
                with open(self.db_path, 'rb') as f:
                    _ = f.read(1)
                print("✓ Permissão de leitura OK")
                
                # Verificar permissão de escrita
                with open(self.db_path, 'ab') as f:
                    pass
                print("✓ Permissão de escrita OK")
                
                # Testar conexão SQLite
                try:
                    conn = sqlite3.connect(self.db_path)
                    cursor = conn.cursor()
                    cursor.execute("PRAGMA quick_check")
                    result = cursor.fetchone()[0]
                    conn.close()
                    
                    if result == "ok":
                        print("✓ Verificação de integridade SQLite OK")
                    else:
                        print(f"⚠️ Verificação de integridade SQLite falhou: {result}")
                        self.backup_and_reset_database()
                except sqlite3.Error as e:
                    print(f"❌ Erro ao verificar banco SQLite: {e}")
                    self.backup_and_reset_database()
            except Exception as e:
                print(f"❌ Erro ao verificar permissões: {e}")
        else:
            print(f"ℹ️ Banco de dados não existe. Será criado um novo em: {self.db_path}")
    
    def backup_and_reset_database(self):
        """Cria um backup do banco de dados atual e cria um novo"""
        try:
            # Criar backup com timestamp
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(self.script_dir, f"lazzfit_backup_{timestamp}.db")
            
            if os.path.exists(self.db_path):
                import shutil
                shutil.copy2(self.db_path, backup_path)
                print(f"Backup criado: {backup_path}")
                
                # Remover banco de dados original
                os.remove(self.db_path)
                print("Banco de dados original removido. Um novo será criado.")
        except Exception as e:
            print(f"Erro ao fazer backup do banco de dados: {e}")

    def get_all_runs(self):
        """Get all runs from database and convert to a web-friendly format"""
        runs = self.db.get_all_runs()
        return [self._format_run_data(run) for run in runs]
    
    def get_run(self, run_id):
        """Get a specific run by ID"""
        run = self.db.get_run(run_id)
        if run:
            return self._format_run_data(run)
        return None
    
    def add_run(self, run_data):
        """Add a new run to the database"""
        try:
            # Extract data from the input dictionary
            date = run_data.get('date')
            distance = float(run_data.get('distance', 0))
            duration = int(run_data.get('duration', 0))
            avg_bpm = run_data.get('avg_bpm')
            max_bpm = run_data.get('max_bpm')
            elevation_gain = run_data.get('elevation_gain')
            calories = int(run_data.get('calories', 0)) if run_data.get('calories') else 0
            workout_type = run_data.get('workout_type', 'Corrida de Rua')
            notes = run_data.get('notes', '')
            
            # Add to database
            run_id = self.db.add_run(
                date, distance, duration, avg_bpm, max_bpm, 
                elevation_gain, calories, workout_type, notes
            )
            
            # Return the newly added run
            return self.get_run(run_id)
        except Exception as e:
            print(f"Error adding run: {str(e)}")
            return None
    
    def update_run(self, run_id, run_data):
        """Update an existing run in the database"""
        try:
            # Extract data
            date = run_data.get('date')
            distance = float(run_data.get('distance', 0))
            duration = int(run_data.get('duration', 0))
            avg_bpm = run_data.get('avg_bpm')
            max_bpm = run_data.get('max_bpm')
            elevation_gain = run_data.get('elevation_gain')
            calories = int(run_data.get('calories', 0)) if run_data.get('calories') else 0
            workout_type = run_data.get('workout_type', 'Corrida de Rua')
            notes = run_data.get('notes', '')
            
            # Update in database
            self.db.update_run(
                run_id, date, distance, duration, avg_bpm, max_bpm, 
                elevation_gain, calories, workout_type, notes
            )
            
            # Return the updated run
            return self.get_run(run_id)
        except Exception as e:
            print(f"Error updating run: {str(e)}")
            return None
    
    def delete_run(self, run_id):
        """Delete a run from the database"""
        try:
            self.db.delete_run(run_id)
            return True
        except Exception as e:
            print(f"Error deleting run: {str(e)}")
            return False
    
    def get_workout_types(self):
        """Get all available workout types"""
        return self.db.get_workout_types()
    
    def export_to_excel(self):
        """Export all runs to an Excel file"""
        try:
            # Verificação mais robusta do openpyxl
            try:
                import openpyxl
                excel_available = True
                print("✅ Verificação de openpyxl realizada com sucesso")
            except ImportError:
                excel_available = False
                webview.windows[0].evaluate_js("""
                    app.showNotification(
                        'O módulo openpyxl não está instalado. Execute o seguinte comando no terminal: pip install openpyxl',
                        'error'
                    );
                """)
                return False
                    
            # Show dialog to ask where to save
            file_path = self._get_save_filepath("Excel Files", ".xlsx")
            if not file_path:
                return False
            
            # Make sure it has the correct extension
            if not file_path.lower().endswith((".xlsx", ".xls")):
                file_path += ".xlsx"
            
            # Update UI to show exporting status
            webview.windows[0].evaluate_js("""
                app.showNotification('Exportando dados para Excel...', 'info');
            """)
            
            # Export to Excel
            success = self.db.export_runs_to_xlsx(file_path)
            
            # Notify UI of result
            if success:
                webview.windows[0].evaluate_js(f"""
                    app.showNotification('Dados exportados com sucesso para: {os.path.basename(file_path)}', 'success');
                """)
            else:
                webview.windows[0].evaluate_js("""
                    app.showNotification('Falha ao exportar dados para Excel.', 'error');
                """)
            
            return success
        except Exception as e:
            print(f"Error exporting to Excel: {str(e)}")
            print(traceback.format_exc())  # Adicionado para melhor diagnóstico
            webview.windows[0].evaluate_js(f"""
                app.showNotification('Erro ao exportar: {str(e)}', 'error');
            """)
            return False

    def export_to_csv(self):
        """Export all runs to a CSV file"""
        try:
            # Show dialog to ask where to save
            file_path = self._get_save_filepath("CSV Files", ".csv")
            if not file_path:
                return False
            
            # Make sure it has the correct extension
            if not file_path.lower().endswith(".csv"):
                file_path += ".csv"
            
            # Update UI to show exporting status
            webview.windows[0].evaluate_js("""
                app.showNotification('Exportando dados para CSV...', 'info');
            """)
            
            # Export to CSV
            success = self.db.export_runs_to_csv(file_path)
            
            # Notify UI of result
            if success:
                webview.windows[0].evaluate_js(f"""
                    app.showNotification('Dados exportados com sucesso para: {os.path.basename(file_path)}', 'success');
                """)
            else:
                webview.windows[0].evaluate_js("""
                    app.showNotification('Falha ao exportar dados para CSV.', 'error');
                """)
            
            return success
        except Exception as e:
            print(f"Error exporting to CSV: {str(e)}")
            webview.windows[0].evaluate_js(f"""
                app.showNotification('Erro ao exportar: {str(e)}', 'error');
            """)
            return False
    
    def export_selected_to_excel(self, run_ids):
        """Export selected runs to an Excel file"""
        try:
            # Verificação mais robusta do openpyxl
            try:
                import openpyxl
                excel_available = True
            except ImportError:
                excel_available = False
                webview.windows[0].evaluate_js("""
                    app.showNotification(
                        'O módulo openpyxl não está instalado. Execute o seguinte comando no terminal: pip install openpyxl',
                        'error'
                    );
                """)
                return False
                    
            # Show dialog to ask where to save
            file_path = self._get_save_filepath("Excel Files", ".xlsx")
            if not file_path:
                return False
            
            # Make sure it has the correct extension
            if not file_path.lower().endswith((".xlsx", ".xls")):
                file_path += ".xlsx"
            
            # Update UI to show exporting status
            webview.windows[0].evaluate_js("""
                app.showNotification('Exportando treinos selecionados para Excel...', 'info');
            """)
            
            # Export to Excel
            success = self.db.export_runs_to_xlsx(file_path, run_ids)
            
            # Notify UI of result
            if success:
                webview.windows[0].evaluate_js(f"""
                    app.showNotification('Treinos selecionados exportados com sucesso para: {os.path.basename(file_path)}', 'success');
                """)
            else:
                webview.windows[0].evaluate_js("""
                    app.showNotification('Falha ao exportar treinos selecionados.', 'error');
                """)
            
            return success
        except Exception as e:
            print(f"Error exporting selected runs to Excel: {str(e)}")
            webview.windows[0].evaluate_js(f"""
                app.showNotification('Erro ao exportar: {str(e)}', 'error');
            """)
            return False

    def export_selected_to_csv(self, run_ids):
        """Export selected runs to a CSV file"""
        try:
            # Show dialog to ask where to save
            file_path = self._get_save_filepath("CSV Files", ".csv")
            if not file_path:
                return False
            
            # Make sure it has the correct extension
            if not file_path.lower().endswith(".csv"):
                file_path += ".csv"
            
            # Update UI to show exporting status
            webview.windows[0].evaluate_js("""
                app.showNotification('Exportando treinos selecionados para CSV...', 'info');
            """)
            
            # Export to CSV
            success = self.db.export_runs_to_csv(file_path, run_ids)
            
            # Notify UI of result
            if success:
                webview.windows[0].evaluate_js(f"""
                    app.showNotification('Treinos selecionados exportados com sucesso para: {os.path.basename(file_path)}', 'success');
                """)
            else:
                webview.windows[0].evaluate_js("""
                    app.showNotification('Falha ao exportar treinos selecionados.', 'error');
                """)
            
            return success
        except Exception as e:
            print(f"Error exporting selected runs to CSV: {str(e)}")
            webview.windows[0].evaluate_js(f"""
                app.showNotification('Erro ao exportar: {str(e)}', 'error');
            """)
            return False
    
    def exit_app(self):
        """Encerra o aplicativo de forma segura, garantindo que os dados sejam salvos"""
        print("🔍 Encerrando aplicativo via API...")
        
        try:
            # Garantir que qualquer operação pendente no banco de dados seja concluída
            if hasattr(self, 'db'):
                try:
                    self.db.ensure_connection_closed()
                    print("✓ Garantido que o banco de dados foi fechado corretamente")
                except Exception as db_error:
                    print(f"⚠️ Aviso ao fechar banco: {db_error}")
        except Exception as e:
            print(f"❌ Erro ao fechar conexão com banco: {e}")
            print(traceback.format_exc())
        
        # Encerrar a aplicação de forma segura com pequeno atraso
        def delayed_exit():
            time.sleep(1.5)  # Atraso maior para garantir que operações pendentes sejam concluídas
            try:
                webview.windows[0].destroy()
                print("✓ Janela principal destruída")
            except Exception as e:
                print(f"❌ Erro ao destruir janela: {e}")
                sys.exit(0)  # Forçar saída em caso de erro
            
        # Iniciar thread e aguardar sua conclusão
        exit_thread = threading.Thread(target=delayed_exit)
        exit_thread.daemon = False  # Não é daemon para garantir que seja concluída
        exit_thread.start()
        return True
        
    def _get_save_filepath(self, file_type_desc, file_ext):
        """Open a native file dialog to get save filepath"""
        def run_dialog():
            # Use tkinter's file dialog since webview dialogs don't work well for saving
            root = Tk()
            root.withdraw()  # Hide the main window
            root.attributes('-topmost', True)  # Ensure dialog appears on top
            file_path = filedialog.asksaveasfilename(
                title="Salvar Como",
                filetypes=[(file_type_desc, f"*{file_ext}"), ("All Files", "*.*")],
                defaultextension=file_ext
            )
            
            # Write chosen path to a temporary file to avoid threading issues
            with open("temp_path.txt", "w", encoding="utf-8") as f:
                f.write(file_path if file_path else "")
            root.destroy()
            
        # File dialogs need to run in the main thread in a separate thread due to tkinter limitations
        dialog_thread = threading.Thread(target=run_dialog)
        dialog_thread.start()
        dialog_thread.join(timeout=60)  # Wait with timeout to avoid hanging
        
        # Read path from temporary file
        try:
            with open("temp_path.txt", "r", encoding="utf-8") as f:
                file_path = f.read().strip()
            
            # Clean up the temporary file
            if os.path.exists("temp_path.txt"):
                os.remove("temp_path.txt")
            return file_path
        except Exception as e:
            print(f"Error getting save path: {e}")
            return None
        
    def _format_run_data(self, run):
        """Convert a database row to a dictionary for JSON serialization"""
        # Function to safely access tuple elements
        def safe_get(lst, idx, default=None):
            try:
                val = lst[idx]
                return val if val is not None else default
            except IndexError:
                return default
        return {
            'id': safe_get(run, 0),
            'date': safe_get(run, 1),
            'distance': float(safe_get(run, 2, 0)),
            'duration': int(safe_get(run, 3, 0)),
            'avg_pace': safe_get(run, 4, '0:00'),
            'avg_bpm': safe_get(run, 5),
            'max_bpm': safe_get(run, 6),
            'elevation_gain': safe_get(run, 7),
            'calories': safe_get(run, 8, 0),
            'workout_type': safe_get(run, 9, 'Corrida de Rua'),
            'notes': safe_get(run, 10, '')
        }

    # Métodos para gerenciar planos de treino
    def create_training_plan(self, plan_data):
        """Cria um novo plano de treino"""
        try:
            name = plan_data.get('name', 'Novo Plano de Treino')
            goal = plan_data.get('goal', '')
            duration_weeks = int(plan_data.get('duration_weeks', 4))
            level = plan_data.get('level', 'Iniciante')
            notes = plan_data.get('notes', '')
            
            if not self.connect():
                print("Erro: Não foi possível conectar ao banco de dados")
                return None
            
            plan_id = self.db.create_training_plan(name, goal, duration_weeks, level, notes)
            
            if plan_id:
                return self.get_training_plan(plan_id)
            else:
                return None
        except Exception as e:
            print(f"Erro ao criar plano de treino: {e}")
            return None
    
    def get_all_training_plans(self):
        """Retorna todos os planos de treino"""
        try:
            plans = self.db.get_all_training_plans()
            
            # Formatar os planos para JSON
            formatted_plans = []
            for plan in plans:
                formatted_plans.append({
                    'id': plan[0],
                    'name': plan[1],
                    'goal': plan[2],
                    'duration_weeks': plan[3],
                    'level': plan[4],
                    'notes': plan[5],
                    'created_at': plan[6],
                    'updated_at': plan[7]
                })
                
            return formatted_plans
        except Exception as e:
            print(f"Erro ao obter planos de treino: {e}")
            return []
    
    def get_training_plan(self, plan_id):
        """Retorna um plano de treino específico"""
        try:
            return self.db.get_training_plan(plan_id)
        except Exception as e:
            print(f"Erro ao obter plano de treino {plan_id}: {e}")
            return None
    
    def update_training_plan(self, plan_id, plan_data):
        """Atualiza um plano de treino existente"""
        try:
            name = plan_data.get('name', 'Plano de Treino')
            goal = plan_data.get('goal', '')
            duration_weeks = int(plan_data.get('duration_weeks', 4))
            level = plan_data.get('level', 'Iniciante')
            notes = plan_data.get('notes', '')
            
            success = self.db.update_training_plan(plan_id, name, goal, duration_weeks, level, notes)
            
            if success:
                return self.get_training_plan(plan_id)
            else:
                return None
        except Exception as e:
            print(f"Erro ao atualizar plano de treino {plan_id}: {e}")
            return None
    
    def update_training_week(self, week_id, week_data):
        """Atualiza uma semana de treino"""
        try:
            focus = week_data.get('focus', '')
            total_distance = float(week_data.get('total_distance', 0))
            notes = week_data.get('notes', '')
            
            success = self.db.update_training_week(week_id, focus, total_distance, notes)
            
            return success
        except Exception as e:
            print(f"Erro ao atualizar semana de treino {week_id}: {e}")
            return False
    
    def update_training_session(self, session_id, session_data):
        """Atualiza uma sessão de treino"""
        try:
            workout_type = session_data.get('workout_type', 'Descanso')
            distance = float(session_data.get('distance', 0))
            duration = int(session_data.get('duration', 0))
            intensity = session_data.get('intensity', 'Baixa')
            pace_target = session_data.get('pace_target', '')
            hr_zone = session_data.get('hr_zone', '')
            details = session_data.get('details', '')
            
            success = self.db.update_training_session(session_id, workout_type, distance, duration, intensity, pace_target, hr_zone, details)
            
            return success
        except Exception as e:
            print(f"Erro ao atualizar sessão de treino {session_id}: {e}")
            return False
    
    def delete_training_plan(self, plan_id):
        """Deleta um plano de treino"""
        try:
            return self.db.delete_training_plan(plan_id)
        except Exception as e:
            print(f"Erro ao deletar plano de treino {plan_id}: {e}")
            return False
    
    def export_training_plan_to_excel(self, plan_id):
        """Exporta um plano de treino para Excel"""
        try:
            # Verificar se o módulo Excel está disponível
            try:
                import openpyxl
                excel_available = True
            except ImportError:
                excel_available = False
                webview.windows[0].evaluate_js("""
                    app.showNotification(
                        'O módulo openpyxl não está instalado. Execute o seguinte comando no terminal: pip install openpyxl',
                        'error'
                    );
                """)
                return False
                
            # Show dialog to ask where to save
            file_path = self._get_save_filepath("Excel Files", ".xlsx")
            if not file_path:
                return False
            
            # Make sure it has the correct extension
            if not file_path.lower().endswith((".xlsx", ".xls")):
                file_path += ".xlsx"
            
            # Update UI to show exporting status
            webview.windows[0].evaluate_js("""
                app.showNotification('Exportando plano de treino para Excel...', 'info');
            """)
            
            # Export to Excel
            success = self.db.export_training_plan_to_xlsx(plan_id, file_path)
            
            # Notify UI of result
            if success:
                webview.windows[0].evaluate_js(f"""
                    app.showNotification('Plano de treino exportado com sucesso para: {os.path.basename(file_path)}', 'success');
                """)
            else:
                webview.windows[0].evaluate_js("""
                    app.showNotification('Falha ao exportar plano de treino para Excel.', 'error');
                """)
            
            return success
        except Exception as e:
            print(f"Error exporting training plan to Excel: {str(e)}")
            print(traceback.format_exc())
            webview.windows[0].evaluate_js(f"""
                app.showNotification('Erro ao exportar: {str(e)}', 'error');
            """)
            return False

def get_resource_path(relative_path):
    """Get absolute path to resources in production or development"""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
        
    return os.path.join(base_path, relative_path)

def start_app():
    """Start the LazzFit application with PyWebView"""
    # Garantir que o diretório de trabalho é o diretório do script
    script_dir = os.path.abspath(os.path.dirname(__file__))
    print(f"📂 Diretório do aplicativo: {script_dir}")
    os.chdir(script_dir)
    
    # Verificar se o processo tem permissões de escrita no diretório atual
    try:
        test_file = os.path.join(script_dir, "test_write_permission.tmp")
        with open(test_file, 'w') as f:
            f.write("test")
        os.remove(test_file)
        print("✓ Permissões de escrita verificadas: OK")
    except Exception as e:
        print(f"❌ ERRO: Sem permissão de escrita no diretório atual: {e}")
    
    # Inicializar a API e torná-la globalmente acessível
    global global_api
    global_api = LazzFitAPI()
    
    # Determine web files location
    webui_dir = get_resource_path("webui")
    if not os.path.exists(webui_dir):
        print(f"Web UI directory not found at {webui_dir}, using current directory + /webui")
        webui_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "webui")
        # Verificação adicional para ajudar usuários em caso de problemas
        if not os.path.exists(webui_dir):
            print("ERRO: Pasta 'webui' não encontrada! Execute start_lazzfit.bat para configuração automática.")
            # Criar estrutura básica de diretórios para evitar erros
            try:
                os.makedirs(os.path.join(webui_dir, "css"), exist_ok=True)
                os.makedirs(os.path.join(webui_dir, "js"), exist_ok=True)
                print("Estrutura básica de diretórios criada. Crie ou copie os arquivos necessários.")
            except Exception as e:
                print(f"Erro ao criar diretórios: {e}")
    
    # Configurações para diferentes plataformas
    webview_config = {}
    
    # Configurações específicas para Windows
    if sys.platform == 'win32':
        # Verificar qual versão do pywebview estamos usando para compatibilidade
        try:
            webview_version = webview.__version__ if hasattr(webview, '__version__') else "unknown"
            print(f"Usando PyWebView versão: {webview_version}")
            
            # Em versões novas, passamos 'gui' diretamente para webview.start()
            if hasattr(webview, 'start'):
                webview_config = {'gui': 'edgechromium', 'debug': True}
            else:
                print("AVISO: Não foi possível determinar a versão do PyWebView. Usando configurações padrão.")
        except Exception as e:
            print(f"Erro ao configurar PyWebView: {e}")
    
    # Carregar configurações do tema
    try:
        theme_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "orange_theme.json")
        if os.path.exists(theme_path):
            with open(theme_path, 'r') as f:
                theme_data = json.load(f)
                # Usar a cor primária do tema para personalizar a aparência
                if 'CTkButton' in theme_data and 'fg_color' in theme_data['CTkButton']:
                    primary_color = theme_data['CTkButton']['fg_color'][0]  # Usar a primeira cor do tema
    except Exception as e:
        print(f"Couldn't load theme configuration: {e}")
    
    # Create the webview window
    window = webview.create_window(
        "LazzFit - Gerenciador de Treinos de Corrida",
        url=os.path.join(webui_dir, "index.html"),
        js_api=global_api,  # Use a variável global
        width=1100,
        height=700,
        min_size=(800, 600)
    )
    
    # Hook para injetar informações adicionais no JavaScript
    def on_loaded():
        print("✓ Evento 'loaded' disparado - Página web carregada")
        window.evaluate_js("""
            console.log('Verificação de API Python do servidor');
            if (window.pywebview && window.pywebview.api) {
                console.log('API Python detectada pelo servidor');
                window._serverConfirmedAPI = true;
            }
        """)
    
    window.events.loaded += on_loaded

    # CORREÇÃO: Adicionar gestão de evento de encerramento
    def on_closing():
        """Gerencia o processo de encerramento da aplicação"""
        print("🔍 Evento de encerramento detectado. Garantindo persistência dos dados...")
        
        # Garantir que conexão do banco esteja fechada adequadamente
        if global_api and hasattr(global_api, 'db'):  # Corrigido "e" para "and"
            try:
                global_api.db.ensure_connection_closed()
                print("✓ Banco de dados desconectado corretamente no evento de encerramento")
            except Exception as e:
                print(f"❌ Erro ao fechar conexão com banco: {e}")
    
    # Registrar eventos
    window.events.closed += on_closing  # Certifique-se de que este evento está correto
    window.events.closing += on_closing  # Adicionar um listener para o evento "closing" também
    
    # Start the application with proper config - FIX HERE!
    try:
        if webview_config:
            # Não passe debug=True explicitamente se já estiver em webview_config
            webview.start(**webview_config)  # webview_config já contém debug=True
        else:
            webview.start(debug=True, http_server=True)
    except Exception as e:
        print(f"❌ ERRO ao iniciar PyWebView: {e}")
        print(traceback.format_exc())
        
        # Tente uma vez mais com configuração mínima se a primeira tentativa falhar
        try:
            print("🔄 Tentando iniciar com configuração mínima...")
            webview.start()
        except Exception as e2:
            print(f"❌ ERRO final ao iniciar PyWebView: {e2}")

if __name__ == "__main__":
    start_app()
