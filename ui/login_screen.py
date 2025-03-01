import customtkinter as ctk
from tkinter import messagebox
import os
from PIL import Image
from database import authenticate_user, register_user
from themes import LAZZFIT_COLORS, FONTS

class LoginScreen(ctk.CTkFrame):
    def __init__(self, master, login_callback):
        super().__init__(master, corner_radius=0)
        self.master = master
        self.login_callback = login_callback
        
        # Configuração do grid para ser responsivo
        self.grid_columnconfigure((0, 1), weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Criar os frames para login e registro
        self.login_frame = self.create_login_frame()
        self.register_frame = self.create_register_frame()
        
        # Mostrar frame de login por padrão
        self.show_login()
        
    def create_login_frame(self):
        """Cria o frame de login"""
        frame = ctk.CTkFrame(self)
        frame.grid_columnconfigure(0, weight=1)
        
        # Logo ou título
        logo_label = ctk.CTkLabel(
            frame, 
            text="LazzFit",
            font=ctk.CTkFont(family="Roboto", size=32, weight="bold"),
            text_color=LAZZFIT_COLORS["orange_primary"]
        )
        logo_label.grid(row=0, column=0, padx=20, pady=(40, 20))
        
        subtitle = ctk.CTkLabel(
            frame,
            text="Acompanhe seus treinos de corrida",
            font=ctk.CTkFont(family="Roboto", size=14)
        )
        subtitle.grid(row=1, column=0, padx=20, pady=(0, 40))
        
        # Formulário de login
        username_label = ctk.CTkLabel(frame, text="Nome de usuário:")
        username_label.grid(row=2, column=0, padx=20, pady=(10, 5), sticky="w")
        
        self.username_entry = ctk.CTkEntry(frame, width=300, placeholder_text="Digite seu nome de usuário")
        self.username_entry.grid(row=3, column=0, padx=20, pady=(0, 15))
        
        password_label = ctk.CTkLabel(frame, text="Senha:")
        password_label.grid(row=4, column=0, padx=20, pady=(10, 5), sticky="w")
        
        self.password_entry = ctk.CTkEntry(frame, width=300, placeholder_text="Digite sua senha", show="•")
        self.password_entry.grid(row=5, column=0, padx=20, pady=(0, 15))
        
        # Botão de login
        login_button = ctk.CTkButton(
            frame,
            text="Entrar",
            width=300,
            height=40,
            font=ctk.CTkFont(family="Roboto", size=14, weight="bold"),
            fg_color=LAZZFIT_COLORS["orange_primary"],
            hover_color=LAZZFIT_COLORS["orange_dark"],
            command=self.login
        )
        login_button.grid(row=6, column=0, padx=20, pady=(20, 10))
        
        # Link para registro
        register_link = ctk.CTkButton(
            frame,
            text="Não tem uma conta? Registre-se",
            width=300,
            fg_color="transparent",
            hover_color=LAZZFIT_COLORS["black_light"],
            command=self.show_register
        )
        register_link.grid(row=7, column=0, padx=20, pady=(10, 20))
        
        return frame
        
    def create_register_frame(self):
        """Cria o frame de registro"""
        frame = ctk.CTkFrame(self)
        frame.grid_columnconfigure(0, weight=1)
        
        # Título
        title = ctk.CTkLabel(
            frame, 
            text="Criar Conta",
            font=ctk.CTkFont(family="Roboto", size=28, weight="bold"),
            text_color=LAZZFIT_COLORS["orange_primary"]
        )
        title.grid(row=0, column=0, padx=20, pady=(40, 20))
        
        # Formulário de registro
        username_label = ctk.CTkLabel(frame, text="Nome de usuário:")
        username_label.grid(row=1, column=0, padx=20, pady=(10, 5), sticky="w")
        
        self.reg_username_entry = ctk.CTkEntry(frame, width=300, placeholder_text="Escolha um nome de usuário")
        self.reg_username_entry.grid(row=2, column=0, padx=20, pady=(0, 15))
        
        name_label = ctk.CTkLabel(frame, text="Nome completo (opcional):")
        name_label.grid(row=3, column=0, padx=20, pady=(10, 5), sticky="w")
        
        self.reg_name_entry = ctk.CTkEntry(frame, width=300, placeholder_text="Digite seu nome completo")
        self.reg_name_entry.grid(row=4, column=0, padx=20, pady=(0, 15))
        
        email_label = ctk.CTkLabel(frame, text="Email (opcional):")
        email_label.grid(row=5, column=0, padx=20, pady=(10, 5), sticky="w")
        
        self.reg_email_entry = ctk.CTkEntry(frame, width=300, placeholder_text="Digite seu email")
        self.reg_email_entry.grid(row=6, column=0, padx=20, pady=(0, 15))
        
        password_label = ctk.CTkLabel(frame, text="Senha:")
        password_label.grid(row=7, column=0, padx=20, pady=(10, 5), sticky="w")
        
        self.reg_password_entry = ctk.CTkEntry(frame, width=300, placeholder_text="Crie sua senha", show="•")
        self.reg_password_entry.grid(row=8, column=0, padx=20, pady=(0, 15))
        
        confirm_label = ctk.CTkLabel(frame, text="Confirme sua senha:")
        confirm_label.grid(row=9, column=0, padx=20, pady=(10, 5), sticky="w")
        
        self.reg_confirm_entry = ctk.CTkEntry(frame, width=300, placeholder_text="Confirme sua senha", show="•")
        self.reg_confirm_entry.grid(row=10, column=0, padx=20, pady=(0, 15))
        
        # Botão de registro
        register_button = ctk.CTkButton(
            frame,
            text="Criar conta",
            width=300,
            height=40,
            font=ctk.CTkFont(family="Roboto", size=14, weight="bold"),
            fg_color=LAZZFIT_COLORS["orange_primary"],
            hover_color=LAZZFIT_COLORS["orange_dark"],
            command=self.register
        )
        register_button.grid(row=11, column=0, padx=20, pady=(20, 10))
        
        # Link para voltar ao login
        login_link = ctk.CTkButton(
            frame,
            text="Já tem uma conta? Faça login",
            width=300,
            fg_color="transparent",
            hover_color=LAZZFIT_COLORS["black_light"],
            command=self.show_login
        )
        login_link.grid(row=12, column=0, padx=20, pady=(10, 20))
        
        return frame
    
    def show_login(self):
        """Exibe o frame de login"""
        if hasattr(self, 'register_frame'):
            self.register_frame.grid_forget()
        self.login_frame.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)
    
    def show_register(self):
        """Exibe o frame de registro"""
        self.login_frame.grid_forget()
        self.register_frame.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)
    
    def login(self):
        """Processa o login do usuário"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get()
        
        if not username or not password:
            messagebox.showerror("Erro", "Por favor, preencha todos os campos.")
            return
            
        success, user_id, message = authenticate_user(username, password)
        
        if success:
            self.login_callback(username, user_id)
        else:
            messagebox.showerror("Erro de Login", message)
    
    def register(self):
        """Processa o registro de um novo usuário"""
        username = self.reg_username_entry.get().strip()
        name = self.reg_name_entry.get().strip()
        email = self.reg_email_entry.get().strip()
        password = self.reg_password_entry.get()
        confirm_password = self.reg_confirm_entry.get()
        
        # Validações
        if not username or not password:
            messagebox.showerror("Erro", "Nome de usuário e senha são obrigatórios.")
            return
            
        if password != confirm_password:
            messagebox.showerror("Erro", "As senhas não coincidem.")
            return
            
        if len(password) < 6:
            messagebox.showerror("Erro", "A senha deve ter pelo menos 6 caracteres.")
            return
        
        # Tenta registrar o usuário
        success, message = register_user(username, password, name, email)
        
        if success:
            messagebox.showinfo("Sucesso", "Conta criada com sucesso! Faça login para continuar.")
            self.show_login()
            # Preenche o campo de usuário para facilitar o login
            self.username_entry.delete(0, 'end')
            self.username_entry.insert(0, username)
            self.password_entry.delete(0, 'end')
        else:
            messagebox.showerror("Erro", message)