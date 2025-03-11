import customtkinter as ctk
from database import DatabaseManager
from gui import LazzFitApp

def main():
    # Configurações do tema
    ctk.set_appearance_mode("dark")  # Tema escuro
    ctk.set_default_color_theme("orange")  # Tema laranja
    
    # Inicializa o banco de dados
    db = DatabaseManager("lazzfit.db")
    db.setup()
    
    # Inicia a aplicação
    app = LazzFitApp(db)
    app.mainloop()

if __name__ == "__main__":
    main()
