import customtkinter as ctk
from tkinter import messagebox
import sqlite3
from datetime import datetime
from themes import LAZZFIT_COLORS, FONTS
from database import save_run

class AddRunScreen(ctk.CTkFrame):
    def __init__(self, master, user, back_callback):
        super().__init__(master, corner_radius=0)
        self.master = master
        self.user = user
        self.back_callback = back_callback
        
        # Configuração do grid
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Componentes
        self.create_header()
        self.create_form()
    
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
            text="Adicionar Nova Corrida",
            font=ctk.CTkFont(family="Roboto", size=24, weight="bold"),
        )
        title.grid(row=0, column=1, padx=20, sticky="w")
        
    def create_form(self):
        """Cria o formulário para adicionar nova corrida"""
        form_container = ctk.CTkScrollableFrame(self)
        form_container.grid(row=1, column=0, padx=20, pady=20, sticky="nsew")
        form_container.grid_columnconfigure(0, weight=1)
        
        # Título do formulário
        title = ctk.CTkLabel(
            form_container,
            text="Detalhes da Corrida",
            font=ctk.CTkFont(size=18, weight="bold"),
        )
        title.grid(row=0, column=0, padx=20, pady=(10, 20), sticky="w")
        
        # Frame principal do formulário
        form = ctk.CTkFrame(form_container)
        form.grid(row=1, column=0, padx=20, pady=10, sticky="ew")
        form.grid_columnconfigure((0, 1), weight=1)
        
        # Data
        date_label = ctk.CTkLabel(form, text="Data da corrida:")
        date_label.grid(row=0, column=0, padx=20, pady=(20, 5), sticky="w")
        
        # Frame para seleção de data (com comboboxes para dia, mês e ano)
        date_frame = ctk.CTkFrame(form, fg_color="transparent")
        date_frame.grid(row=1, column=0, padx=20, pady=(0, 15), sticky="w")
        
        # Dia
        self.day_var = ctk.StringVar(value=datetime.now().strftime('%d'))
        days = [f"{i:02d}" for i in range(1, 32)]
        day_combo = ctk.CTkComboBox(
            date_frame,
            values=days,
            variable=self.day_var,
            width=70
        )
        day_combo.grid(row=0, column=0, padx=(0, 5))
        
        # Mês
        self.month_var = ctk.StringVar(value=datetime.now().strftime('%m'))
        months = [f"{i:02d}" for i in range(1, 13)]
        month_combo = ctk.CTkComboBox(
            date_frame,
            values=months,
            variable=self.month_var,
            width=70
        )
        month_combo.grid(row=0, column=1, padx=5)
        
        # Ano
        current_year = datetime.now().year
        self.year_var = ctk.StringVar(value=str(current_year))
        years = [str(year) for year in range(current_year-5, current_year+1)]
        year_combo = ctk.CTkComboBox(
            date_frame,
            values=years,
            variable=self.year_var,
            width=90
        )
        year_combo.grid(row=0, column=2, padx=(5, 0))
        
        # Distância
        distance_label = ctk.CTkLabel(form, text="Distância (km):")
        distance_label.grid(row=0, column=1, padx=20, pady=(20, 5), sticky="w")
        
        self.distance_entry = ctk.CTkEntry(form, placeholder_text="Ex: 5.2")
        self.distance_entry.grid(row=1, column=1, padx=20, pady=(0, 15), sticky="ew")
        
        # Duração (hora, minuto, segundo)
        duration_label = ctk.CTkLabel(form, text="Duração:")
        duration_label.grid(row=2, column=0, padx=20, pady=(15, 5), sticky="w")
        
        duration_frame = ctk.CTkFrame(form, fg_color="transparent")
        duration_frame.grid(row=3, column=0, padx=20, pady=(0, 15), sticky="w")
        
        # Hora
        self.hours_var = ctk.StringVar(value="0")
        hours_combo = ctk.CTkComboBox(
            duration_frame,
            values=[str(i) for i in range(24)],
            variable=self.hours_var,
            width=60
        )
        hours_combo.grid(row=0, column=0, padx=(0, 5))
        
        hours_label = ctk.CTkLabel(duration_frame, text="h")
        hours_label.grid(row=0, column=1, padx=(0, 10))
        
        # Minuto
        self.minutes_var = ctk.StringVar(value="30")
        minutes_combo = ctk.CTkComboBox(
            duration_frame,
            values=[f"{i:02d}" for i in range(60)],
            variable=self.minutes_var,
            width=60
        )
        minutes_combo.grid(row=0, column=2, padx=(0, 5))
        
        minutes_label = ctk.CTkLabel(duration_frame, text="m")
        minutes_label.grid(row=0, column=3, padx=(0, 10))
        
        # Segundo
        self.seconds_var = ctk.StringVar(value="00")
        seconds_combo = ctk.CTkComboBox(
            duration_frame,
            values=[f"{i:02d}" for i in range(60)],
            variable=self.seconds_var,
            width=60
        )
        seconds_combo.grid(row=0, column=4, padx=(0, 5))
        
        seconds_label = ctk.CTkLabel(duration_frame, text="s")
        seconds_label.grid(row=0, column=5)
        
        # Frequência cardíaca
        heart_label = ctk.CTkLabel(form, text="Frequência cardíaca média (bpm):")
        heart_label.grid(row=2, column=1, padx=20, pady=(15, 5), sticky="w")
        
        self.heart_entry = ctk.CTkEntry(form, placeholder_text="Opcional")
        self.heart_entry.grid(row=3, column=1, padx=20, pady=(0, 15), sticky="ew")
        
        # Local da corrida
        location_label = ctk.CTkLabel(form, text="Local:")
        location_label.grid(row=4, column=0, padx=20, pady=(15, 5), sticky="w")
        
        self.location_entry = ctk.CTkEntry(form, placeholder_text="Ex: Parque da Cidade")
        self.location_entry.grid(row=5, column=0, padx=20, pady=(0, 15), sticky="ew")
        
        # Notas
        notes_label = ctk.CTkLabel(form, text="Observações:")
        notes_label.grid(row=6, column=0, columnspan=2, padx=20, pady=(15, 5), sticky="w")
        
        self.notes_entry = ctk.CTkTextbox(form, height=100)
        self.notes_entry.grid(row=7, column=0, columnspan=2, padx=20, pady=(0, 20), sticky="ew")
        
        # Botão de salvar
        save_button = ctk.CTkButton(
            form_container,
            text="Salvar Corrida",
            font=ctk.CTkFont(size=16, weight="bold"),
            fg_color=LAZZFIT_COLORS["orange_primary"],
            hover_color=LAZZFIT_COLORS["orange_dark"],
            height=45,
            command=self.save_run
        )
        save_button.grid(row=2, column=0, padx=20, pady=30)
        
    def save_run(self):
        """Salva os dados da corrida"""
        # Validação dos campos
        try:
            distance = float(self.distance_entry.get().replace(',', '.'))
            if distance <= 0:
                messagebox.showerror("Erro", "A distância deve ser maior que zero.")
                return
        except ValueError:
            messagebox.showerror("Erro", "Informe uma distância válida.")
            return
        
        # Calcular duração total em segundos
        try:
            hours = int(self.hours_var.get())
            minutes = int(self.minutes_var.get())
            seconds = int(self.seconds_var.get())
            duration = hours * 3600 + minutes * 60 + seconds
            
            if duration <= 0:
                messagebox.showerror("Erro", "A duração deve ser maior que zero.")
                return
        except ValueError:
            messagebox.showerror("Erro", "Informe uma duração válida.")
            return
        
        # Formatar data
        try:
            day = int(self.day_var.get())
            month = int(self.month_var.get())
            year = int(self.year_var.get())
            date_str = f"{year}-{month:02d}-{day:02d}"
            
            # Verificar se a data é válida
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            messagebox.showerror("Erro", "Data inválida.")
            return
        
        # Processar frequência cardíaca
        heart_rate = None
        if self.heart_entry.get().strip():
            try:
                heart_rate = int(self.heart_entry.get())
                if heart_rate <= 0 or heart_rate > 250:
                    messagebox.showerror("Erro", "Frequência cardíaca inválida.")
                    return
            except ValueError:
                messagebox.showerror("Erro", "Frequência cardíaca deve ser um número inteiro.")
                return
        
        # Obter outros campos
        location = self.location_entry.get().strip()
        notes = self.notes_entry.get("0.0", "end").strip()
        
        # Salvar no banco de dados
        success, run_id, message = save_run(
            self.user['id'],
            date_str,
            distance,
            duration,
            heart_rate,
            notes,
            location
        )
        
        if success:
            messagebox.showinfo("Sucesso", "Corrida registrada com sucesso!")
            self.back_callback()  # Voltar para o dashboard
        else:
            messagebox.showerror("Erro", message)