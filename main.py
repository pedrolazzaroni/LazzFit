import customtkinter as ctk
import os
from database import DatabaseManager
from gui import LazzFitApp

def main():
    # Configurações do tema
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

if __name__ == "__main__":
    main()
