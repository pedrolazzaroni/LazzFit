import os
import sys
import argparse
import traceback  # Adicione esta importação

def main():
    """Main application launcher with UI mode selection"""
    try:  # Adicione tratamento de exceção
        parser = argparse.ArgumentParser(description="LazzFit - Gerenciador de Treinos de Corrida")
        parser.add_argument('--classic', action='store_true', help='Use classic CustomTkinter GUI')
        args = parser.parse_args()
        
        # Garantir que estamos no diretório correto antes de iniciar
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        print(f"Diretório da aplicação: {script_dir}")
        
        # Garantir que o diretório de dados existe
        data_dir = os.path.join(script_dir, "data")
        if not os.path.exists(data_dir):
            try:
                os.makedirs(data_dir)
                print(f"Diretório de dados criado: {data_dir}")
            except Exception as e:
                print(f"Erro ao criar diretório de dados: {e}")
                
        # Continua com o fluxo normal do aplicativo
        if args.classic:
            # Use classic CustomTkinter interface
            print("Iniciando com interface clássica (CustomTkinter)...")
            from database import DatabaseManager
            from gui import LazzFitApp
            
            # Configurações do tema
            import customtkinter as ctk
            ctk.set_appearance_mode("dark")  # Tema escuro
            
            # Carregar tema personalizado se existir
            theme_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "orange_theme.json")
            if os.path.exists(theme_path):
                ctk.set_default_color_theme(theme_path)
            else:
                # Usar um tema incorporado como fallback
                ctk.set_default_color_theme("blue")  # Tema base - será sobrescrito visualmente
            
            # Inicializa o banco de dados com caminho explícito para dentro da pasta data
            db_path = os.path.join(data_dir, "lazzfit.db")
            print(f"Main usando banco de dados em: {db_path}")
            db = DatabaseManager(db_path)
            db.setup()
            
            # Inicia a aplicação
            app = LazzFitApp(db)
            app.mainloop()
        else:
            # Use modern PyWebView interface (default)
            print("Iniciando com interface moderna (PyWebView)...")
            
            from webview_app import start_app
            start_app()
    except Exception as e:
        print(f"Erro ao inicializar aplicativo: {e}")
        print(traceback.format_exc())
        input("Pressione Enter para sair...")  # Mantém o console aberto para ver o erro

if __name__ == "__main__":
    main()
