import os
import sys
import webview
import traceback
from datetime import datetime
from database import DatabaseManager

# Declaração da variável global - definir ANTES de qualquer uso
global_api = None

class LazzFitAPI:
    """Classe principal da API que será exposta para a interface web"""
    
    def __init__(self):
        """Inicializa a API do LazzFit"""
        try:
            # Obter o caminho do arquivo do banco de dados
            app_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(app_dir, "data")
            
            if not os.path.exists(data_dir):
                os.makedirs(data_dir)
                print(f"Criado diretório de dados: {data_dir}")
            
            db_path = os.path.join(data_dir, "lazzfit.db")
            print(f"API usando banco de dados em: {db_path}")
            
            # Inicializar o banco de dados
            self.db = DatabaseManager(db_path)
            self.db.setup()
            print("✅ Banco de dados inicializado com sucesso")
        except Exception as e:
            print(f"❌ Erro ao inicializar API: {e}")
            traceback.print_exc()
            self.db = None
    
    # === CORRIDAS ===
    def get_all_runs(self):
        """Retorna todos os registros de corrida"""
        if not hasattr(self, 'db') or self.db is None:
            return []
            
        try:
            runs = self.db.get_all_runs()
            
            # Converter para formato compatível com JavaScript
            formatted_runs = []
            for run in runs:
                formatted_run = {
                    'id': run[0],
                    'date': run[1],
                    'distance': run[2],
                    'duration': run[3],
                    'avg_pace': run[4],
                    'avg_bpm': run[5],
                    'max_bpm': run[6],
                    'elevation_gain': run[7],
                    'calories': run[8],
                    'workout_type': run[9],
                    'notes': run[10]
                }
                formatted_runs.append(formatted_run)
            
            return formatted_runs
        except Exception as e:
            print(f"❌ Erro ao obter corridas: {e}")
            return []
    
    def get_run(self, run_id):
        """Retorna um registro de corrida específico"""
        if not hasattr(self, 'db') or self.db is None:
            return None
            
        try:
            run = self.db.get_run(run_id)
            
            if not run:
                return None
                
            # Converter para formato compatível com JavaScript
            formatted_run = {
                'id': run[0],
                'date': run[1],
                'distance': run[2],
                'duration': run[3],
                'avg_pace': run[4],
                'avg_bpm': run[5],
                'max_bpm': run[6],
                'elevation_gain': run[7],
                'calories': run[8],
                'workout_type': run[9],
                'notes': run[10]
            }
            
            return formatted_run
        except Exception as e:
            print(f"❌ Erro ao obter corrida {run_id}: {e}")
            return None
    
    def add_run(self, run_data):
        """Adiciona um novo registro de corrida"""
        if not hasattr(self, 'db') or self.db is None:
            return False
            
        try:
            # Extrair dados da corrida
            date = run_data.get('date')
            distance = float(run_data.get('distance', 0))
            duration = int(run_data.get('duration', 0))
            avg_bpm = int(run_data.get('avg_bpm')) if run_data.get('avg_bpm') else None
            max_bpm = int(run_data.get('max_bpm')) if run_data.get('max_bpm') else None
            elevation_gain = int(run_data.get('elevation_gain')) if run_data.get('elevation_gain') else None
            calories = int(run_data.get('calories')) if run_data.get('calories') else None
            workout_type = run_data.get('workout_type', 'Corrida de Rua')
            notes = run_data.get('notes', '')
            
            # Adicionar corrida ao banco de dados
            run_id = self.db.add_run(
                date, distance, duration, avg_bpm, max_bpm,
                elevation_gain, calories, workout_type, notes
            )
            
            return run_id is not None
        except Exception as e:
            print(f"❌ Erro ao adicionar corrida: {e}")
            traceback.print_exc()
            return False
    
    def update_run(self, run_id, run_data):
        """Atualiza um registro de corrida existente"""
        if not hasattr(self, 'db') or self.db is None:
            return False
            
        try:
            # Extrair dados da corrida
            date = run_data.get('date')
            distance = float(run_data.get('distance', 0))
            duration = int(run_data.get('duration', 0))
            avg_bpm = int(run_data.get('avg_bpm')) if run_data.get('avg_bpm') else None
            max_bpm = int(run_data.get('max_bpm')) if run_data.get('max_bpm') else None
            elevation_gain = int(run_data.get('elevation_gain')) if run_data.get('elevation_gain') else None
            calories = int(run_data.get('calories')) if run_data.get('calories') else None
            workout_type = run_data.get('workout_type', 'Corrida de Rua')
            notes = run_data.get('notes', '')
            
            # Atualizar corrida no banco de dados
            success = self.db.update_run(
                run_id, date, distance, duration, avg_bpm, max_bpm,
                elevation_gain, calories, workout_type, notes
            )
            
            return success
        except Exception as e:
            print(f"❌ Erro ao atualizar corrida {run_id}: {e}")
            traceback.print_exc()
            return False
    
    def delete_run(self, run_id):
        """Exclui um registro de corrida"""
        if not hasattr(self, 'db') or self.db is None:
            return False
            
        try:
            # Excluir corrida do banco de dados
            success = self.db.delete_run(run_id)
            
            return success
        except Exception as e:
            print(f"❌ Erro ao excluir corrida {run_id}: {e}")
            return False
    
    # === UTILITÁRIOS ===
    def check_database_connection(self):
        """Verifica se a conexão com o banco de dados está funcionando"""
        return hasattr(self, 'db') and self.db is not None
    
    def get_workout_types(self):
        """Retorna os tipos de treino disponíveis"""
        if not hasattr(self, 'db') or self.db is None:
            return ["Corrida de Rua", "Trail Running", "Corrida na Esteira", "Outro"]
            
        return self.db.get_workout_types()
    
    # === EXPORTAÇÃO ===
    def export_to_excel(self, file_path=None):
        """Exporta todos os registros de corrida para Excel"""
        if not hasattr(self, 'db') or self.db is None or not self.db.EXCEL_AVAILABLE:
            return False
            
        try:
            # Definir caminho padrão se não especificado
            if not file_path:
                file_path = os.path.join("exports", f"lazzfit_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
                
                # Garantir que o diretório existe
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
            # Exportar para Excel
            success = self.db.export_runs_to_xlsx(file_path)
            
            return {'success': success, 'path': file_path if success else None}
        except Exception as e:
            print(f"❌ Erro ao exportar para Excel: {e}")
            return {'success': False, 'error': str(e)}
    
    def export_to_csv(self, file_path=None):
        """Exporta todos os registros de corrida para CSV"""
        if not hasattr(self, 'db') or self.db is None:
            return False
            
        try:
            # Definir caminho padrão se não especificado
            if not file_path:
                file_path = os.path.join("exports", f"lazzfit_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
                
                # Garantir que o diretório existe
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
            # Exportar para CSV
            success = self.db.export_runs_to_csv(file_path)
            
            return {'success': success, 'path': file_path if success else None}
        except Exception as e:
            print(f"❌ Erro ao exportar para CSV: {e}")
            return {'success': False, 'error': str(e)}
    
    def export_selected_runs_to_excel(self, run_ids):
        """Exporta registros de corrida selecionados para Excel"""
        if not hasattr(self, 'db') or self.db is None or not self.db.EXCEL_AVAILABLE:
            return False
            
        try:
            # Definir caminho
            file_path = os.path.join("exports", f"lazzfit_selected_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
            
            # Garantir que o diretório existe
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Exportar para Excel
            success = self.db.export_runs_to_xlsx(file_path, run_ids)
            
            return {'success': success, 'path': file_path if success else None}
        except Exception as e:
            print(f"❌ Erro ao exportar seleção para Excel: {e}")
            return {'success': False, 'error': str(e)}
    
    def export_selected_runs_to_csv(self, run_ids):
        """Exporta registros de corrida selecionados para CSV"""
        if not hasattr(self, 'db') or self.db is None:
            return False
            
        try:
            # Definir caminho
            file_path = os.path.join("exports", f"lazzfit_selected_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
            
            # Garantir que o diretório existe
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Exportar para CSV
            success = self.db.export_runs_to_csv(file_path, run_ids)
            
            return {'success': success, 'path': file_path if success else None}
        except Exception as e:
            print(f"❌ Erro ao exportar seleção para CSV: {e}")
            return {'success': False, 'error': str(e)}
    
    # === PLANOS DE TREINO ===
    def get_all_training_plans(self):
        """Retorna todos os planos de treinamento"""
        if not hasattr(self, 'db') or self.db is None:
            return []
            
        try:
            plans = self.db.get_all_training_plans()
            
            # Converter para formato compatível com JavaScript
            formatted_plans = []
            for plan in plans:
                formatted_plan = {
                    'id': plan[0],
                    'name': plan[1],
                    'goal': plan[2],
                    'duration_weeks': plan[3],
                    'level': plan[4],
                    'notes': plan[5],
                    'created_at': plan[6],
                    'updated_at': plan[7]
                }
                formatted_plans.append(formatted_plan)
            
            return formatted_plans
        except Exception as e:
            print(f"❌ Erro ao obter planos de treinamento: {e}")
            return []
    
    def create_training_plan(self, plan_data):
        """Cria um novo plano de treinamento"""
        if not hasattr(self, 'db') or self.db is None:
            return False
            
        try:
            name = plan_data.get('name')
            goal = plan_data.get('goal', '')
            duration_weeks = int(plan_data.get('duration_weeks', 4))
            level = plan_data.get('level', 'Iniciante')
            notes = plan_data.get('notes', '')
            
            # Criar plano no banco de dados
            plan_id = self.db.create_training_plan(name, goal, duration_weeks, level, notes)
            
            return plan_id is not None
        except Exception as e:
            print(f"❌ Erro ao criar plano de treino: {e}")
            traceback.print_exc()
            return False

    def get_training_plan(self, plan_id):
        """Retorna um plano de treinamento específico"""
        if not hasattr(self, 'db') or self.db is None:
            return None
            
        try:
            plan = self.db.get_training_plan(plan_id)
            return plan
        except Exception as e:
            print(f"❌ Erro ao obter plano de treinamento {plan_id}: {e}")
            return None
    
    def delete_training_plan(self, plan_id):
        """Exclui um plano de treinamento"""
        if not hasattr(self, 'db') or self.db is None:
            return False
            
        try:
            success = self.db.delete_training_plan(plan_id)
            return success
        except Exception as e:
            print(f"❌ Erro ao excluir plano de treinamento {plan_id}: {e}")
            return False


def get_resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


def get_storage_path():
    """Determina o caminho correto para armazenamento de dados da aplicação"""
    try:
        # Obter diretório de dados do usuário com base no sistema operacional
        if sys.platform == 'win32':
            storage_path = os.path.join(os.environ['APPDATA'], 'LazzFit')
        elif sys.platform == 'darwin':
            storage_path = os.path.join(os.path.expanduser('~/Library/Application Support'), 'LazzFit')
        else:
            storage_path = os.path.join(os.path.expanduser('~/.local/share'), 'LazzFit')
        
        # Criar diretório se não existir
        if not os.path.exists(storage_path):
            os.makedirs(storage_path)
            print(f"Criado diretório de armazenamento: {storage_path}")
            
        return storage_path
    except Exception as e:
        print(f"Erro ao determinar caminho de armazenamento: {e}")
        # Fallback para o diretório atual + /data
        fallback = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
        if not os.path.exists(fallback):
            os.makedirs(fallback)
        return fallback


def start_app():
    """Inicializa a janela PyWebView com a interface web"""
    try:
        # Criar o diretório para os arquivos de exportação se não existir
        os.makedirs("exports", exist_ok=True)
        
        # Configurar a API - usando 'global' ANTES da atribuição
        global global_api
        global_api = LazzFitAPI()

        # Verificar se a pasta webui existe
        webui_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "webui")
        if not os.path.exists(webui_dir):
            raise Exception(f"Pasta webui não encontrada em {webui_dir}")

        # Configurações da janela
        window = webview.create_window(
            title='LazzFit - Gerenciador de Treinos',
            url=f'{os.path.dirname(os.path.realpath(__file__))}/webui/index.html',
            js_api=global_api,
            width=1200,
            height=800,
            min_size=(800, 600),
            text_select=True,
            frameless=False,
            easy_drag=False,
            background_color='#101010',
            draggable=True
        )

        # Inicializar a janela do webview (sem debug para não abrir DevTools)
        webview.start(storage_path=get_storage_path())
        return True
        
    except Exception as e:
        print(f"Erro ao iniciar aplicação: {e}")
        traceback.print_exc()
        return False


def close_app():
    """Encerra a aplicação com segurança"""
    try:
        if global_api and hasattr(global_api, 'db'):
            global_api.db.ensure_connection_closed()
            print("✓ Banco de dados fechado com segurança")
    except Exception as e:
        print(f"Erro ao fechar app: {e}")
        traceback.print_exc()


# Garantir que funções de limpeza sejam executadas ao sair
if __name__ == "__main__":
    try:
        if start_app():
            print("✅ Aplicação iniciada e encerrada com sucesso")
        else:
            print("❌ Aplicação falhou ao iniciar")
    finally:
        close_app()