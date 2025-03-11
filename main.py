import customtkinter as ctk
import os
from database import DatabaseManager
from gui import LazzFitApp

def main():
    # Configurações do tema
    ctk.set_appearance_mode("dark")  # Tema escuro
    
    # Usar um tema incorporado ao invés do "orange" que não existe
    ctk.set_default_color_theme("blue")  # Tema base - será sobrescrito visualmente
    
    # Inicializa o banco de dados
    db = DatabaseManager("lazzfit.db")
    db.setup()
    
    # Inicia a aplicação
    app = LazzFitApp(db)
    app.mainloop()

if __name__ == "__main__":
    main()
