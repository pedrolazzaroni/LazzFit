import webview
import os
import sys
import json
import threading
from tkinter import Tk, filedialog
from database import DatabaseManager

class LazzFitAPI:
    def __init__(self):
        self.db = DatabaseManager("lazzfit.db")
        self.db.setup()
        
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
            # Verificar se o módulo Excel está disponível
            if not self.db.EXCEL_AVAILABLE:
                webview.windows[0].evaluate_js("""
                    app.showNotification(
                        'O módulo openpyxl não está instalado. A exportação para Excel não está disponível.',
                        'error'
                    );
                """)
                return False
                
            # Create a file save dialog
            file_path = self._get_save_filepath("Excel Files", ".xlsx")
            if not file_path:
                return False
                
            # Make sure it has the correct extension
            if not file_path.lower().endswith((".xlsx", ".xls")):
                file_path += ".xlsx"
                
            # Export to Excel
            success = self.db.export_runs_to_xlsx(file_path)
            
            # Mostrar mensagem de sucesso na interface
            if success:
                webview.windows[0].evaluate_js(f"""
                    app.showNotification(
                        'Dados exportados com sucesso para {file_path}',
                        'success'
                    );
                """)
                
            return success
        except Exception as e:
            print(f"Error exporting to Excel: {str(e)}")
            return False
    
    def export_to_csv(self):
        """Export all runs to a CSV file"""
        try:
            # Create a file save dialog
            file_path = self._get_save_filepath("CSV Files", ".csv")
            if not file_path:
                return False
                
            # Make sure it has the correct extension
            if not file_path.lower().endswith(".csv"):
                file_path += ".csv"
                
            # Export to CSV
            return self.db.export_runs_to_csv(file_path)
        except Exception as e:
            print(f"Error exporting to CSV: {str(e)}")
            return False
    
    def export_selected_to_excel(self, run_ids):
        """Export selected runs to an Excel file"""
        try:
            # Verificar se o módulo Excel está disponível
            if not self.db.EXCEL_AVAILABLE:
                webview.windows[0].evaluate_js("""
                    app.showNotification(
                        'O módulo openpyxl não está instalado. A exportação para Excel não está disponível.',
                        'error'
                    );
                """)
                return False
                
            # Create a file save dialog
            file_path = self._get_save_filepath("Excel Files", ".xlsx")
            if not file_path:
                return False
                
            # Make sure it has the correct extension
            if not file_path.lower().endswith((".xlsx", ".xls")):
                file_path += ".xlsx"
                
            # Export to Excel
            success = self.db.export_runs_to_xlsx(file_path, run_ids)
            
            # Mostrar mensagem de sucesso na interface
            if success:
                webview.windows[0].evaluate_js(f"""
                    app.showNotification(
                        'Treinos selecionados exportados com sucesso para {file_path}',
                        'success'
                    );
                """)
                
            return success
        except Exception as e:
            print(f"Error exporting selected runs to Excel: {str(e)}")
            return False

    def export_selected_to_csv(self, run_ids):
        """Export selected runs to a CSV file"""
        try:
            # Create a file save dialog
            file_path = self._get_save_filepath("CSV Files", ".csv")
            if not file_path:
                return False
                
            # Make sure it has the correct extension
            if not file_path.lower().endswith(".csv"):
                file_path += ".csv"
                
            # Export to CSV
            return self.db.export_runs_to_csv(file_path, run_ids)
        except Exception as e:
            print(f"Error exporting selected runs to CSV: {str(e)}")
            return False
    
    def _get_save_filepath(self, file_type_desc, file_ext):
        """Open a native file dialog to get save filepath"""
        def run_dialog():
            # Use tkinter's file dialog since webview dialogs don't work well for saving
            from tkinter import Tk, filedialog
            root = Tk()
            root.withdraw()  # Hide the main window
            file_path = filedialog.asksaveasfilename(
                title="Salvar Como",
                filetypes=[(file_type_desc, f"*{file_ext}"), ("All Files", "*.*")],
                defaultextension=file_ext
            )
            # Write chosen path to a temporary file to avoid threading issues
            with open("temp_path.txt", "w") as f:
                f.write(file_path if file_path else "")
            root.destroy()
            
        # File dialogs need to run in the main thread
        dialog_thread = threading.Thread(target=run_dialog)
        dialog_thread.start()
        dialog_thread.join()  # Wait for the dialog to complete
        
        # Read path from temporary file
        try:
            with open("temp_path.txt", "r") as f:
                file_path = f.read().strip()
            
            # Clean up the temporary file
            os.remove("temp_path.txt")
            return file_path
        except:
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
    api = LazzFitAPI()
    
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
        js_api=api,
        width=1100,
        height=700,
        min_size=(800, 600)
    )
    
    # Start the application with the appropriate configuration
    if webview_config:
        webview.start(**webview_config)
    else:
        webview.start(debug=True)

if __name__ == "__main__":
    start_app()
