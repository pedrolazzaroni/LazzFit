import os
import customtkinter as ctk
from tkinter import messagebox
import sqlite3
from PIL import Image

# Importações locais
from database import create_tables
from ui.login_screen import LoginScreen
from ui.dashboard import Dashboard
from ui.add_run import AddRunScreen
from ui.statistics import StatisticsScreen
from ui.settings import SettingsScreen
from themes import set_appearance_mode

# Configuração do CustomTkinter
ctk.set_appearance_mode("dark")  # Tema escuro por padrão
ctk.set_default_color_theme("dark-blue")  # Tema de cores base

class LazzFitApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Configurações da janela principal
        self.title("LazzFit - Registro de Corridas")
        self.geometry("1100x700")
        self.minsize(800, 600)
        
        # Cria diretório de assets se não existir
        if not os.path.exists("assets"):
            os.makedirs("assets")
            
        # Configurações iniciais
        self.current_user = None
        self.current_screen = None
        self.screens = {}
        
        # Inicializar banco de dados
        create_tables()
        
        # Carregar configurações
        self.load_settings()
        
        # Configurar grade principal
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)
        
        # Inicializar tela de login
        self.show_login()
        
    def load_settings(self):
        """Carrega configurações do usuário do banco de dados"""
        try:
            conn = sqlite3.connect('lazzfit.db')
            cursor = conn.cursor()
            cursor.execute("SELECT setting_value FROM settings WHERE setting_name = 'theme'")
            result = cursor.fetchone()
            
            if result:
                theme = result[0]
                set_appearance_mode(theme)
            
            conn.close()
        except sqlite3.Error:
            # Se ocorrer erro, usa as configurações padrão
            pass
    
    def show_login(self):
        """Exibe a tela de login"""
        if 'login' not in self.screens:
            self.screens['login'] = LoginScreen(self, self.login_callback)
        
        self.switch_screen('login')
    
    def login_callback(self, username, user_id):
        """Callback após login bem-sucedido"""
        self.current_user = {'username': username, 'id': user_id}
        self.show_dashboard()
    
    def show_dashboard(self):
        """Exibe a tela de dashboard"""
        if 'dashboard' not in self.screens:
            self.screens['dashboard'] = Dashboard(
                self, 
                self.current_user,
                self.show_add_run,
                self.show_statistics,
                self.show_settings,
                self.logout
            )
        else:
            # Atualiza os dados no dashboard existente
            self.screens['dashboard'].refresh_data()
        
        self.switch_screen('dashboard')
    
    def show_add_run(self):
        """Exibe a tela de adição de corrida"""
        if 'add_run' not in self.screens:
            self.screens['add_run'] = AddRunScreen(
                self, 
                self.current_user, 
                self.show_dashboard
            )
        
        self.switch_screen('add_run')
    
    def show_statistics(self):
        """Exibe a tela de estatísticas"""
        if 'statistics' not in self.screens:
            self.screens['statistics'] = StatisticsScreen(
                self, 
                self.current_user, 
                self.show_dashboard
            )
        else:
            # Atualiza as estatísticas
            self.screens['statistics'].load_statistics()
        
        self.switch_screen('statistics')
    
    def show_settings(self):
        """Exibe a tela de configurações"""
        if 'settings' not in self.screens:
            self.screens['settings'] = SettingsScreen(
                self, 
                self.show_dashboard, 
                self.apply_settings
            )
        
        self.switch_screen('settings')
        
    def apply_settings(self, theme):
        """Aplica as configurações selecionadas"""
        set_appearance_mode(theme)
        
        # Salva configurações no banco de dados
        try:
            conn = sqlite3.connect('lazzfit.db')
            cursor = conn.cursor()
            cursor.execute("INSERT OR REPLACE INTO settings (setting_name, setting_value) VALUES (?, ?)", 
                          ('theme', theme))
            conn.commit()
            conn.close()
        except sqlite3.Error as e:
            messagebox.showerror("Erro", f"Erro ao salvar configurações: {e}")
    
    def logout(self):
        """Desconecta o usuário atual"""
        self.current_user = None
        self.show_login()
    
    def switch_screen(self, screen_name):
        """Alterna entre telas"""
        if self.current_screen:
            # Oculta a tela atual
            self.screens[self.current_screen].grid_forget()
        
        # Exibe a nova tela
        self.screens[screen_name].grid(row=0, column=0, sticky="nsew")
        self.current_screen = screen_name

if __name__ == "__main__":
    app = LazzFitApp()
    app.mainloop()
