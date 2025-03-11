import os
import sys
import argparse

def main():
    """Main application launcher with UI mode selection"""
    parser = argparse.ArgumentParser(description="LazzFit - Gerenciador de Treinos de Corrida")
    parser.add_argument('--classic', action='store_true', help='Use classic CustomTkinter GUI')
    args = parser.parse_args()
    
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
        
        # Inicializa o banco de dados
        db = DatabaseManager("lazzfit.db")
        db.setup()
        
        # Inicia a aplicação
        app = LazzFitApp(db)
        app.mainloop()
    else:
        # Use modern PyWebView interface (default)
        print("Iniciando com interface moderna (PyWebView)...")
        from webview_app import start_app
        start_app()

if __name__ == "__main__":
    main()
