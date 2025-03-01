import customtkinter as ctk
from tkinter import messagebox
import os
import sqlite3
import platform
import webbrowser
from themes import LAZZFIT_COLORS, FONTS, set_appearance_mode

class SettingsScreen(ctk.CTkFrame):
    def __init__(self, master, back_callback, apply_settings_callback):
        super().__init__(master, corner_radius=0)
        self.master = master
        self.back_callback = back_callback
        self.apply_settings_callback = apply_settings_callback
        
        # Configuração do grid
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Carregar configurações atuais
        self.load_current_settings()
        
        # Componentes
        self.create_header()
        self.create_content()
        
    def load_current_settings(self):
        """Carrega as configurações atuais do banco de dados"""
        self.current_settings = {
            'theme': 'dark'  # Padrão
        }
        
        try:
            conn = sqlite3.connect('lazzfit.db')
            cursor = conn.cursor()
            
            # Carregar tema
            cursor.execute("SELECT setting_value FROM settings WHERE setting_name = 'theme'")
            result = cursor.fetchone()
            if result:
                self.current_settings['theme'] = result[0]
            
            conn.close()
        except sqlite3.Error:
            # Em caso de erro, mantém configurações padrão
            pass
    
    def create_header(self):
        """Cria o cabeçalho da tela"""
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, padx=20, pady=20, sticky="ew")
        header.grid_columnconfigure(1, weight=1)
        
        # Botão Voltar
        back_button = ctk.CTkButton(
            header,
            text="← Voltar",
            font=ctk.CTkFont(size=14),
            fg_color="transparent",
            text_color=LAZZFIT_COLORS["orange_primary"],
            hover_color=LAZZFIT_COLORS["black_light"],
            width=100,
            height=32,
            command=self.back_callback
        )
        back_button.grid(row=0, column=0, sticky="w")
        
        # Título
        title = ctk.CTkLabel(
            header,
            text="Configurações",
            font=ctk.CTkFont(family="Roboto", size=24, weight="bold"),
        )
        title.grid(row=0, column=1, padx=20, sticky="w")
    
    def create_content(self):
        """Cria o conteúdo da tela de configurações"""
        content = ctk.CTkScrollableFrame(self)
        content.grid(row=1, column=0, padx=20, pady=(0, 20), sticky="nsew")
        content.grid_columnconfigure(0, weight=1)
        
        # Seção de Aparência
        appearance_frame = self.create_section(content, "Aparência", 0)
        
        # Seleção de tema
        theme_frame = ctk.CTkFrame(appearance_frame)
        theme_frame.grid(row=1, column=0, padx=20, pady=10, sticky="ew")
        theme_frame.grid_columnconfigure(1, weight=1)
        
        theme_label = ctk.CTkLabel(theme_frame, text="Tema:", anchor="w")
        theme_label.grid(row=0, column=0, padx=(0, 10), pady=10, sticky="w")
        
        self.theme_var = ctk.StringVar(value=self.current_settings['theme'])
        theme_options = ctk.CTkSegmentedButton(
            theme_frame,
            values=["dark", "light"],
            variable=self.theme_var,
            command=self.apply_theme
        )
        theme_options.grid(row=0, column=1, padx=10, pady=10, sticky="e")
        
        # Seção de Informações do App
        app_info_frame = self.create_section(content, "Informações do Aplicativo", 1)
        
        # Container para informações
        info_container = ctk.CTkFrame(app_info_frame, fg_color="transparent")
        info_container.grid(row=1, column=0, padx=20, pady=(0, 10), sticky="ew")
        info_container.grid_columnconfigure(1, weight=1)
        
        # Nome do App
        name_label = ctk.CTkLabel(
            info_container,
            text="Nome:",
            font=ctk.CTkFont(size=14),
            width=100,
            anchor="w"
        )
        name_label.grid(row=0, column=0, padx=(0, 10), pady=5, sticky="w")
        
        name_value = ctk.CTkLabel(
            info_container,
            text="LazzFit",
            font=ctk.CTkFont(size=14, weight="bold"),
        )
        name_value.grid(row=0, column=1, padx=10, pady=5, sticky="w")
        
        # Versão
        version_label = ctk.CTkLabel(
            info_container,
            text="Versão:",
            font=ctk.CTkFont(size=14),
            width=100,
            anchor="w"
        )
        version_label.grid(row=1, column=0, padx=(0, 10), pady=5, sticky="w")
        
        version_value = ctk.CTkLabel(
            info_container,
            text="1.0.0",
            font=ctk.CTkFont(size=14),
        )
        version_value.grid(row=1, column=1, padx=10, pady=5, sticky="w")
        
        # Autor
        author_label = ctk.CTkLabel(
            info_container,
            text="Autor:",
            font=ctk.CTkFont(size=14),
            width=100,
            anchor="w"
        )
        author_label.grid(row=2, column=0, padx=(0, 10), pady=5, sticky="w")
        
        author_value = ctk.CTkLabel(
            info_container,
            text="LazzFit Team",
            font=ctk.CTkFont(size=14),
        )
        author_value.grid(row=2, column=1, padx=10, pady=5, sticky="w")
        
        # Sistema
        system_label = ctk.CTkLabel(
            info_container,
            text="Sistema:",
            font=ctk.CTkFont(size=14),
            width=100,
            anchor="w"
        )
        system_label.grid(row=3, column=0, padx=(0, 10), pady=5, sticky="w")
        
        system_value = ctk.CTkLabel(
            info_container,
            text=f"{platform.system()} {platform.version()}",
            font=ctk.CTkFont(size=14),
        )
        system_value.grid(row=3, column=1, padx=10, pady=5, sticky="w")
        
        # Python
        python_label = ctk.CTkLabel(
            info_container,
            text="Python:",
            font=ctk.CTkFont(size=14),
            width=100,
            anchor="w"
        )
        python_label.grid(row=4, column=0, padx=(0, 10), pady=5, sticky="w")
        
        python_value = ctk.CTkLabel(
            info_container,
            text=platform.python_version(),
            font=ctk.CTkFont(size=14),
        )
        python_value.grid(row=4, column=1, padx=10, pady=5, sticky="w")
        
        # Link para repositório
        repo_button = ctk.CTkButton(
            app_info_frame,
            text="Visite o repositório",
            font=ctk.CTkFont(size=14),
            fg_color=LAZZFIT_COLORS["orange_primary"],
            hover_color=LAZZFIT_COLORS["orange_dark"],
            command=lambda: webbrowser.open("https://github.com/lazzfit/lazzfit")
        )
        repo_button.grid(row=2, column=0, padx=20, pady=(10, 20))
        
        # Seção de Gerenciamento de Dados
        data_frame = self.create_section(content, "Gerenciamento de Dados", 2)
        
        # Botões de gerenciamento de dados
        export_button = ctk.CTkButton(
            data_frame,
            text="Exportar Dados",
            font=ctk.CTkFont(size=14),
            fg_color=LAZZFIT_COLORS["gray_dark"],
            hover_color=LAZZFIT_COLORS["black_light"],
            command=self.export_data
        )
        export_button.grid(row=1, column=0, padx=20, pady=10)
        
        reset_button = ctk.CTkButton(
            data_frame,
            text="Resetar Dados",
            font=ctk.CTkFont(size=14),
            fg_color="#B00020",  # Vermelho para ações perigosas
            hover_color="#800000",
            command=self.reset_data
        )
        reset_button.grid(row=2, column=0, padx=20, pady=(10, 20))
    
    def create_section(self, parent, title, row):
        """Cria uma seção com título"""
        # Título da seção
        section_title = ctk.CTkLabel(
            parent,
            text=title,
            font=ctk.CTkFont(size=18, weight="bold"),
        )
        section_title.grid(row=row*3, column=0, padx=10, pady=(20, 10), sticky="w")
        
        # Separador
        separator = ctk.CTkFrame(parent, height=1, fg_color=LAZZFIT_COLORS["gray_dark"])
        separator.grid(row=row*3+1, column=0, padx=10, pady=(0, 10), sticky="ew")
        
        # Container para conteúdo da seção
        section_frame = ctk.CTkFrame(parent)
        section_frame.grid(row=row*3+2, column=0, padx=10, pady=0, sticky="ew")
        section_frame.grid_columnconfigure(0, weight=1)
        
        return section_frame
    
    def apply_theme(self, theme):
        """Aplica o tema selecionado"""
        self.apply_settings_callback(theme)
    
    def export_data(self):
        """Exporta dados para arquivo CSV"""
        # Esta é uma implementação simplificada, que apenas mostra um diálogo
        messagebox.showinfo(
            "Exportar Dados",
            "Esta funcionalidade exportaria seus dados para um arquivo CSV.\n\n"
            "Não implementada na versão atual."
        )
    
    def reset_data(self):
        """Reseta dados do usuário"""
        response = messagebox.askyesno(
            "Resetar Dados", 
            "Isso excluirá TODOS os seus registros de corridas.\n\n"
            "Esta ação não pode ser desfeita. Tem certeza?",
            icon='warning'
        )
        
        if response:
            messagebox.showinfo(
                "Resetar Dados",
                "Esta funcionalidade excluiria todos os seus registros.\n\n"
                "Não implementada completamente na versão atual."
            )