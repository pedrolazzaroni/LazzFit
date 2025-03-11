import customtkinter as ctk
from tkinter import messagebox, filedialog
import tkinter as tk
from datetime import datetime
from tkcalendar import DateEntry
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from PIL import Image, ImageTk
import os
import sys
import time
import threading

# Classes de animação para interface mais moderna
class AnimatedLabel(ctk.CTkLabel):
    """Label com animação de fade in"""
    def __init__(self, master, **kwargs):
        self.delay = kwargs.pop('delay', 0)
        self.fade_duration = kwargs.pop('fade_duration', 10)
        super().__init__(master, **kwargs)
        
        # Iniciar invisível
        self.alpha = 0
        self.configure(text_color_disabled=self.cget("text_color"))
        
        # Iniciar a animação com um pequeno atraso
        if self.winfo_exists():
            self.after(self.delay, self.start_fade_in)
    
    def start_fade_in(self):
        """Inicia a animação de fade in"""
        if self.winfo_exists():
            self._fade_step()
    
    def _fade_step(self):
        """Executa um passo da animação de fade"""
        if not self.winfo_exists():
            return
            
        self.alpha += 0.1
        if self.alpha <= 1:
            # Continuar a animação
            self.configure(text_color=self.cget("text_color"))
            self.after(self.fade_duration, self._fade_step)

class AnimatedFrame(ctk.CTkFrame):
    """Frame com animação de slide-in"""
    def __init__(self, master, **kwargs):
        self.direction = kwargs.pop('direction', 'right')
        self.animation_speed = kwargs.pop('animation_speed', 10)
        self.animation_distance = kwargs.pop('animation_distance', 100)
        super().__init__(master, **kwargs)
        
        # Posição inicial
        self.offset = self.animation_distance
        self.original_pos = None
        
        # Iniciar a animação quando o widget for mapeado
        self.bind('<Map>', self.start_animation)
    
    def start_animation(self, event=None):
        """Inicia a animação de entrada"""
        if not self.winfo_exists():
            return
            
        # Guardar a posição original
        if self.original_pos is None:
            info = self.grid_info()
            self.original_pos = (int(info['row']), int(info['column']))
            
            if self.direction == 'right':
                self.place(x=self.offset, y=0, relx=0, rely=0)
            elif self.direction == 'left':
                self.place(x=-self.offset, y=0, relx=0, rely=0)
            elif self.direction == 'up':
                self.place(x=0, y=-self.offset, relx=0, rely=0)
            elif self.direction == 'down':
                self.place(x=0, y=self.offset, relx=0, rely=0)
        
        # Iniciar a animação
        self._animate_step()
    
    def _animate_step(self):
        """Executa um passo da animação"""
        if not self.winfo_exists():
            return
            
        place_info = self.place_info()
        x = int(place_info['x'])
        y = int(place_info['y'])
        
        finished = False
        
        if self.direction == 'right':
            x -= 5
            if x <= 0:
                x = 0
                finished = True
        elif self.direction == 'left':
            x += 5
            if x >= 0:
                x = 0
                finished = True
        elif self.direction == 'up':
            y += 5
            if y >= 0:
                y = 0
                finished = True
        elif self.direction == 'down':
            y -= 5
            if y <= 0:
                y = 0
                finished = True
        
        self.place(x=x, y=y, relx=0, rely=0)
        
        if not finished:
            self.after(self.animation_speed, self._animate_step)
        else:
            # Volta para o gerenciador de layout original
            self.place_forget()
            self.grid(row=self.original_pos[0], column=self.original_pos[1], sticky="nsew")

# Card interativo para exibição de treinos
class RunCard(ctk.CTkFrame):
    """Card interativo que mostra um treino"""
    def __init__(self, master, run_data, on_edit=None, on_delete=None, colors=None, **kwargs):
        self.run_data = run_data
        self.on_edit = on_edit
        self.on_delete = on_delete
        self.colors = colors or {"primary": "#FF6700", "secondary": "#FF8533", "text": "white"}
        self.expanded = False
        
        # ID do treino está em run_data[0]
        self.run_id = run_data[0]
        
        # Configurar frame com aparência de card
        super().__init__(
            master, 
            corner_radius=10, 
            border_width=1, 
            border_color=self.colors["secondary"],
            fg_color=("#F9F9F9", "#323232"),
            **kwargs
        )
        
        self.create_widgets()
        self.bind("<Enter>", self.on_hover_enter)
        self.bind("<Leave>", self.on_hover_leave)
        
    def create_widgets(self):
        """Cria os widgets internos do card"""
        self.columnconfigure(0, weight=2)
        self.columnconfigure(1, weight=3)
        self.columnconfigure(2, weight=2)
        self.columnconfigure(3, weight=1)
        
        # Função auxiliar para acessar valores com segurança
        def safe_get(idx, default="-"):
            try:
                val = self.run_data[idx]
                return val if val is not None else default
            except IndexError:
                return default

        # Data e tipo de treino
        date = safe_get(1, "Sem data")
        workout_type = safe_get(9, "Corrida")
        
        date_frame = ctk.CTkFrame(self, fg_color="transparent")
        date_frame.grid(row=0, column=0, padx=15, pady=(15, 5), sticky="nw")
        
        # Ícone de calendário + data
        date_label = ctk.CTkLabel(
            date_frame, 
            text=f"📅 {date}",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        date_label.pack(anchor="w")
        
        # Badge para o tipo de treino
        type_badge = ctk.CTkLabel(
            date_frame,
            text=f" {workout_type} ",
            fg_color=self.colors["primary"],
            corner_radius=5,
            font=ctk.CTkFont(size=12),
            text_color="white"
        )
        type_badge.pack(anchor="w", pady=(5, 0))
        
        # Informações principais
        distance = float(safe_get(2, 0))
        duration = int(safe_get(3, 0))
        pace = safe_get(4, "0:00")
        
        stats_frame = ctk.CTkFrame(self, fg_color="transparent")
        stats_frame.grid(row=0, column=1, padx=5, pady=(15, 5), sticky="n")
        
        # Distância
        dist_frame = ctk.CTkFrame(stats_frame, fg_color="transparent")
        dist_frame.pack(anchor="w", pady=2)
        
        ctk.CTkLabel(
            dist_frame, 
            text="🏃", 
            font=ctk.CTkFont(size=16)
        ).pack(side="left")
        
        ctk.CTkLabel(
            dist_frame, 
            text=f" {distance:.2f} km",
            font=ctk.CTkFont(size=16, weight="bold")
        ).pack(side="left")
        
        # Duração
        time_frame = ctk.CTkFrame(stats_frame, fg_color="transparent")
        time_frame.pack(anchor="w", pady=2)
        
        hours = duration // 60
        minutes = duration % 60
        duration_text = f"{hours}h {minutes}min" if hours > 0 else f"{minutes} min"
        
        ctk.CTkLabel(
            time_frame, 
            text="⏱️", 
            font=ctk.CTkFont(size=16)
        ).pack(side="left")
        
        ctk.CTkLabel(
            time_frame, 
            text=f" {duration_text}",
            font=ctk.CTkFont(size=16)
        ).pack(side="left")
        
        # Ritmo
        pace_frame = ctk.CTkFrame(stats_frame, fg_color="transparent")
        pace_frame.pack(anchor="w", pady=2)
        
        ctk.CTkLabel(
            pace_frame, 
            text="⚡", 
            font=ctk.CTkFont(size=16)
        ).pack(side="left")
        
        ctk.CTkLabel(
            pace_frame, 
            text=f" {pace} min/km",
            font=ctk.CTkFont(size=16)
        ).pack(side="left")
        
        # BPM e calorias
        health_frame = ctk.CTkFrame(self, fg_color="transparent")
        health_frame.grid(row=0, column=2, padx=5, pady=(15, 5), sticky="n")
        
        # BPM
        bpm_avg = safe_get(5, "-")
        bpm_max = safe_get(6, "-")
        
        if bpm_avg != "-":
            bpm_frame = ctk.CTkFrame(health_frame, fg_color="transparent")
            bpm_frame.pack(anchor="w", pady=2)
            
            ctk.CTkLabel(
                bpm_frame, 
                text="❤️", 
                font=ctk.CTkFont(size=16)
            ).pack(side="left")
            
            ctk.CTkLabel(
                bpm_frame, 
                text=f" {bpm_avg} BPM (máx: {bpm_max})",
                font=ctk.CTkFont(size=16)
            ).pack(side="left")
            
        # Calorias
        calories = safe_get(8, 0)
        if calories:
            cal_frame = ctk.CTkFrame(health_frame, fg_color="transparent")
            cal_frame.pack(anchor="w", pady=2)
            
            ctk.CTkLabel(
                cal_frame, 
                text="🔥", 
                font=ctk.CTkFont(size=16)
            ).pack(side="left")
            
            ctk.CTkLabel(
                cal_frame, 
                text=f" {calories} kcal",
                font=ctk.CTkFont(size=16)
            ).pack(side="left")
            
        # Elevação
        elevation = safe_get(7, "-")
        if elevation != "-":
            elev_frame = ctk.CTkFrame(health_frame, fg_color="transparent")
            elev_frame.pack(anchor="w", pady=2)
            
            ctk.CTkLabel(
                elev_frame, 
                text="🏔️", 
                font=ctk.CTkFont(size=16)
            ).pack(side="left")
            
            ctk.CTkLabel(
                elev_frame, 
                text=f" {elevation} m",
                font=ctk.CTkFont(size=16)
            ).pack(side="left")
        
        # Botões de ação
        action_frame = ctk.CTkFrame(self, fg_color="transparent")
        action_frame.grid(row=0, column=3, padx=15, pady=(15, 5), sticky="ne")
        
        # Botão para editar
        edit_btn = ctk.CTkButton(
            action_frame,
            text="✏️",
            width=30,
            height=30,
            corner_radius=15,
            fg_color=self.colors["secondary"],
            hover_color=self.colors["primary"],
            command=self._on_edit_click
        )
        edit_btn.pack(pady=2)
        
        # Botão para excluir
        delete_btn = ctk.CTkButton(
            action_frame,
            text="🗑️",
            width=30,
            height=30,
            corner_radius=15,
            fg_color="#D32F2F",
            hover_color="#FF5252",
            command=self._on_delete_click
        )
        delete_btn.pack(pady=2)
        
        # Botão para expandir
        self.expand_btn = ctk.CTkButton(
            action_frame,
            text="🔽",
            width=30,
            height=30,
            corner_radius=15,
            fg_color="#555555",
            hover_color="#777777",
            command=self.toggle_expand
        )
        self.expand_btn.pack(pady=2)
        
        # Área expandida (oculta por padrão)
        self.expanded_frame = ctk.CTkFrame(self, fg_color=("gray95", "gray20"))
        
        # Notas
        notes = safe_get(10, "")
        if notes:
            notes_label = ctk.CTkLabel(
                self.expanded_frame,
                text="📝 Notas:",
                font=ctk.CTkFont(size=14, weight="bold")
            )
            notes_label.pack(anchor="w", padx=15, pady=(10, 5))
            
            notes_text = ctk.CTkTextbox(self.expanded_frame, height=80)
            notes_text.pack(fill="x", padx=15, pady=5)
            notes_text.insert("1.0", notes)
            notes_text.configure(state="disabled")
    
    def _on_edit_click(self):
        """Evento ao clicar no botão de editar"""
        if self.on_edit:
            self.on_edit(self.run_id)
    
    def _on_delete_click(self):
        """Evento ao clicar no botão de excluir"""
        if self.on_delete:
            self.on_delete(self.run_id)
    
    def toggle_expand(self):
        """Alterna a exibição da área expandida"""
        self.expanded = not self.expanded
        
        if self.expanded:
            self.expanded_frame.grid(row=1, column=0, columnspan=4, sticky="ew", padx=10, pady=10)
            self.expand_btn.configure(text="🔼")
        else:
            self.expanded_frame.grid_forget()
            self.expand_btn.configure(text="🔽")
    
    def on_hover_enter(self, event):
        """Efeito ao passar o mouse sobre o card"""
        self.configure(fg_color=("#EFEFEF", "#3A3A3A"))
        
    def on_hover_leave(self, event):
        """Efeito ao tirar o mouse do card"""
        self.configure(fg_color=("#F9F9F9", "#323232"))

# Modificações na classe LazzFitApp
class LazzFitApp(ctk.CTk):
    def __init__(self, db_manager):
        super().__init__()
        
        self.db = db_manager
        self.title("LazzFit - Gerenciador de Treinos de Corrida")
        self.geometry("1100x700")  # Tamanho aumentado para acomodar os cards
        self.resizable(True, True)
        
        # Cores - definição explícita das cores laranja e preto
        self.orange = "#FF6700"
        self.orange_light = "#FF8533"
        self.black = "#000000"
        self.dark_gray = "#333333"
        self.light_gray = "#555555"
        self.transparent_gray = "#44444466"  # Cinza com transparência
        
        # Caminhos de recursos
        self.resource_path = self._get_resource_path("resources")
        
        # Carregar ícones
        self.icons = self._load_icons()
        
        # Configurações de cores customizadas
        self._set_appearance()
        
        # Para controlar as transições de página
        self.current_view = None
        self.is_transitioning = False
        
        # Cria a interface principal
        self._create_widgets()
        
        # Carregar dados iniciais
        self.reload_data()
    
    def _get_resource_path(self, relative_path):
        """Retorna o caminho absoluto para os recursos"""
        base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
        resource_path = os.path.join(base_path, relative_path)
        
        # Cria o diretório de recursos se não existir
        if not os.path.exists(resource_path):
            os.makedirs(resource_path)
            
        return resource_path
    
    def _load_icons(self):
        """Carrega os ícones para a aplicação"""
        # Como não temos os arquivos físicos, retornamos um dicionário vazio
        return {}
    
    def _set_appearance(self):
        """Configurações visuais personalizadas"""
        ctk.set_widget_scaling(1.0)  # Escala dos widgets
        
        # Configurar o estilo da tabela para combinar com o tema
        style = tk.ttk.Style()
        style.theme_use("clam")  # Usar o tema clam que é mais personalizável
        
        # Configuração do Treeview (tabela)
        style.configure("Treeview", 
                        background=self.dark_gray,
                        foreground="white",
                        fieldbackground=self.dark_gray,
                        rowheight=25)
        
        # Configuração do cabeçalho da tabela
        style.configure("Treeview.Heading", 
                        background=self.orange,
                        foreground="white",
                        font=('Arial', 10, 'bold'))
        
        # Configuração para quando um item é selecionado
        style.map('Treeview', 
                  background=[('selected', self.orange)],
                  foreground=[('selected', 'white')])
        
    def _create_widgets(self):
        """Cria todos os widgets da aplicação"""
        # Layout principal dividido em duas partes
        self.grid_columnconfigure(0, weight=0)  # Menu lateral
        self.grid_columnconfigure(1, weight=1)  # Área principal
        self.grid_rowconfigure(0, weight=1)
        
        # Menu lateral
        self._create_sidebar()
        
        # Área de conteúdo principal (inicialmente com a lista de corridas em cards)
        self.content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.content_frame.grid(row=0, column=1, padx=20, pady=20, sticky="nsew")
        
        # Mostrar a visão de cards por padrão (substituindo a visão de tabela)
        self.show_list_view_cards()
    
    def _create_sidebar(self):
        """Cria o menu lateral com design moderno"""
        sidebar = ctk.CTkFrame(self, width=220, corner_radius=15)
        sidebar.grid(row=0, column=0, padx=15, pady=15, sticky="nsew")
        sidebar.grid_rowconfigure(10, weight=1)  # Espaçamento flexível na parte inferior
        
        # Logotipo com efeito de sombra
        logo_frame = ctk.CTkFrame(sidebar, fg_color="transparent")
        logo_frame.grid(row=0, column=0, padx=20, pady=(30, 10))
        
        # Logo principal
        logo_label = ctk.CTkLabel(
            logo_frame, 
            text="LazzFit", 
            font=ctk.CTkFont(family="Arial", size=28, weight="bold"),
            text_color=self.orange
        )
        logo_label.pack(pady=5)
        
        # Subtítulo com estilo moderno
        subtitle_label = ctk.CTkLabel(
            sidebar, 
            text="Gerenciador de Treinos",
            font=ctk.CTkFont(size=14, slant="italic"),
            text_color="#cccccc"  # Cor mais clara para contraste
        )
        subtitle_label.grid(row=1, column=0, padx=20, pady=(0, 30))
        
        # Separador visual
        separator = ctk.CTkFrame(sidebar, height=2, fg_color=self.orange_light)
        separator.grid(row=2, column=0, sticky="ew", padx=15, pady=10)
        
        # Botão Dashboard
        self.dashboard_btn = ctk.CTkButton(
            sidebar, 
            text="  📊  Dashboard", 
            anchor="w",
            fg_color="transparent",
            text_color="white",
            hover_color=self.orange_light,
            corner_radius=8,
            height=40,
            command=self.show_dashboard
        )
        self.dashboard_btn.grid(row=3, column=0, padx=10, pady=(15, 5), sticky="ew")
        
        # Botão Listar Corridas
        self.list_runs_btn = ctk.CTkButton(
            sidebar, 
            text="  📋  Listar Corridas", 
            anchor="w",
            fg_color="transparent", 
            text_color="white",
            hover_color=self.orange_light,
            corner_radius=8,
            height=40,
            command=self.show_list_view_cards
        )
        self.list_runs_btn.grid(row=4, column=0, padx=10, pady=5, sticky="ew")
        
        # Botão Nova Corrida
        self.new_run_btn = ctk.CTkButton(
            sidebar, 
            text="  ➕  Nova Corrida", 
            anchor="w",
            fg_color="transparent", 
            text_color="white",
            hover_color=self.orange_light,
            corner_radius=8,
            height=40,
            command=self.show_add_run
        )
        self.new_run_btn.grid(row=5, column=0, padx=10, pady=5, sticky="ew")
        
        # Botão Estatísticas
        self.stats_btn = ctk.CTkButton(
            sidebar, 
            text="  📈  Estatísticas", 
            anchor="w",
            fg_color="transparent", 
            text_color="white",
            hover_color=self.orange_light,
            corner_radius=8,
            height=40,
            command=self.show_statistics
        )
        self.stats_btn.grid(row=6, column=0, padx=10, pady=5, sticky="ew")
        
        # Outro separador
        separator2 = ctk.CTkFrame(sidebar, height=2, fg_color=self.orange_light)
        separator2.grid(row=7, column=0, sticky="ew", padx=15, pady=10)
        
        # Versão do aplicativo
        version_label = ctk.CTkLabel(
            sidebar, 
            text="v1.0.0",
            font=ctk.CTkFont(size=12),
            text_color="#888888"
        )
        version_label.grid(row=9, column=0, padx=20, pady=(0, 15))
    
    def reload_data(self):
        """Carrega os dados mais recentes do banco de dados"""
        if self.current_view == "list":
            if hasattr(self, 'cards_container') and self.cards_container.winfo_exists():
                self.load_run_data_as_cards()
        elif hasattr(self, 'tree') and self.tree.winfo_exists():
            self.load_run_data()
    
    def clear_content(self):
        """Limpa a área de conteúdo com efeito de transição"""
        # Se estiver em transição, espera
        if self.is_transitioning:
            return
            
        self.is_transitioning = True
            
        # Fade out dos widgets atuais
        for widget in self.content_frame.winfo_children():
            widget.destroy()
            
        self.is_transitioning = False
    
    def show_dashboard(self):
        """Exibe o dashboard principal com design modernizado"""
        self.clear_content()
        self.current_view = "dashboard"
        
        # Título animado
        header_frame = AnimatedFrame(self.content_frame, fg_color="transparent", direction="down")
        header_frame.pack(fill="x", pady=(0, 20))
        
        title = AnimatedLabel(
            header_frame, 
            text="Dashboard", 
            font=ctk.CTkFont(size=26, weight="bold"),
            delay=100
        )
        title.pack(side="left", pady=(0, 0), anchor="w")
        
        # Data atual
        current_date = datetime.now().strftime("%d/%m/%Y")
        date_label = AnimatedLabel(
            header_frame, 
            text=f"Hoje: {current_date}", 
            font=ctk.CTkFont(size=14),
            text_color="#888888",
            delay=300
        )
        date_label.pack(side="right", pady=(0, 0), anchor="e")
        
        # Frame para as estatísticas resumidas - com animação
        stats_frame = AnimatedFrame(
            self.content_frame, 
            direction="right",
            animation_speed=8,
            corner_radius=15
        )
        stats_frame.pack(fill="x", pady=10, padx=10)
        
        # Configurar o grid para os cards
        stats_frame.columnconfigure(0, weight=1)
        stats_frame.columnconfigure(1, weight=1)
        stats_frame.columnconfigure(2, weight=1)
        stats_frame.columnconfigure(3, weight=1)
        
        # Obter estatísticas
        runs = self.db.get_all_runs()
        total_runs = len(runs)
        total_distance = sum(run[2] for run in runs) if runs else 0
        total_time = sum(run[3] for run in runs) if runs else 0
        avg_pace = "0:00"
        
        if total_distance > 0:
            pace_seconds = (total_time * 60) / total_distance
            minutes = int(pace_seconds // 60)
            seconds = int(pace_seconds % 60)
            avg_pace = f"{minutes}:{seconds:02d}"
        
        # Cards estatísticos modernizados
        # Card 1 - Total de Corridas - com sombra e borda arredondada
        card1 = ctk.CTkFrame(stats_frame, corner_radius=15, border_width=1, border_color=self.orange_light)
        card1.grid(row=0, column=0, padx=10, pady=10, sticky="ew", ipady=5)
        
        icon1 = ctk.CTkLabel(card1, text="🏃", font=ctk.CTkFont(size=24))
        icon1.pack(pady=(15, 5))
        
        ctk.CTkLabel(card1, text="Total de Corridas", font=ctk.CTkFont(size=14)).pack(pady=(5, 5))
        
        value1 = ctk.CTkLabel(
            card1, 
            text=str(total_runs), 
            font=ctk.CTkFont(size=28, weight="bold"), 
            text_color=self.orange
        )
        value1.pack(pady=(0, 15))
        
        # Card 2 - Distância Total
        card2 = ctk.CTkFrame(stats_frame, corner_radius=15, border_width=1, border_color=self.orange_light)
        card2.grid(row=0, column=1, padx=10, pady=10, sticky="ew", ipady=5)
        
        icon2 = ctk.CTkLabel(card2, text="📏", font=ctk.CTkFont(size=24))
        icon2.pack(pady=(15, 5))
        
        ctk.CTkLabel(card2, text="Distância Total (km)", font=ctk.CTkFont(size=14)).pack(pady=(5, 5))
        
        value2 = ctk.CTkLabel(
            card2, 
            text=f"{total_distance:.2f}", 
            font=ctk.CTkFont(size=28, weight="bold"), 
            text_color=self.orange
        )
        value2.pack(pady=(0, 15))
        
        # Card 3 - Tempo Total
        card3 = ctk.CTkFrame(stats_frame, corner_radius=15, border_width=1, border_color=self.orange_light)
        card3.grid(row=0, column=2, padx=10, pady=10, sticky="ew", ipady=5)
        
        icon3 = ctk.CTkLabel(card3, text="⏱️", font=ctk.CTkFont(size=24))
        icon3.pack(pady=(15, 5))
        
        ctk.CTkLabel(card3, text="Tempo Total", font=ctk.CTkFont(size=14)).pack(pady=(5, 5))
        
        hours = total_time // 60
        minutes = total_time % 60
        
        value3 = ctk.CTkLabel(
            card3, 
            text=f"{hours}h {minutes}m", 
            font=ctk.CTkFont(size=28, weight="bold"), 
            text_color=self.orange
        )
        value3.pack(pady=(0, 15))
        
        # Card 4 - Ritmo Médio
        card4 = ctk.CTkFrame(stats_frame, corner_radius=15, border_width=1, border_color=self.orange_light)
        card4.grid(row=0, column=3, padx=10, pady=10, sticky="ew", ipady=5)
        
        icon4 = ctk.CTkLabel(card4, text="⚡", font=ctk.CTkFont(size=24))
        icon4.pack(pady=(15, 5))
        
        ctk.CTkLabel(card4, text="Ritmo Médio (min/km)", font=ctk.CTkFont(size=14)).pack(pady=(5, 5))
        
        value4 = ctk.CTkLabel(
            card4, 
            text=avg_pace, 
            font=ctk.CTkFont(size=28, weight="bold"), 
            text_color=self.orange
        )
        value4.pack(pady=(0, 15))
        
        # Adicionar gráfico de treinos recentes se houver dados
        if runs:
            chart_frame = AnimatedFrame(
                self.content_frame, 
                corner_radius=15, 
                direction="up",
                animation_speed=10,
                animation_distance=50
            )
            chart_frame.pack(fill="both", expand=True, padx=10, pady=10)
            
            # Título do gráfico
            ctk.CTkLabel(chart_frame, text="Últimos Treinos", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=(15, 10))
            
            # Gráfico com estilo moderno
            fig, ax = plt.subplots(figsize=(8, 4.5), facecolor="#2B2B2B")
            ax.set_facecolor("#333333")
            
            # Limitar para os últimos 10 treinos
            recent_runs = runs[:10]
            recent_runs.reverse()  # Ordem cronológica
            
            dates = [run[1] for run in recent_runs]
            distances = [run[2] for run in recent_runs]
            
            # Gráfico de barras com estilo moderno
            bars = ax.bar(dates, distances, color=self.orange, alpha=0.85, width=0.6)
            
            # Adicionar valor em cima de cada barra
            for bar in bars:
                height = bar.get_height()
                ax.text(
                    bar.get_x() + bar.get_width()/2.,
                    height + 0.1, 
                    f"{height:.1f}km",
                    ha='center', 
                    va='bottom', 
                    color="white",
                    fontsize=9
                )
            
            # Personalização do gráfico
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['bottom'].set_color('#555555')
            ax.spines['left'].set_color('#555555')
            ax.tick_params(colors='white', which='both')
            
            ax.set_xlabel('Data', color='white', fontsize=11)
            ax.set_ylabel('Distância (km)', color='white', fontsize=11)
            ax.set_title('Distância por Treino', color='white', fontsize=14, fontweight='bold', pad=15)
            ax.tick_params(axis='x', rotation=45)
            ax.grid(color='#444444', linestyle='--', linewidth=0.5, alpha=0.7)
            
            fig.tight_layout()
            
            # Incorporar o gráfico ao CTkFrame
            canvas = FigureCanvasTkAgg(fig, chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True, padx=15, pady=(5, 15))
            
            # Adicionar botão para ver todas as estatísticas
            btn_frame = ctk.CTkFrame(chart_frame, fg_color="transparent")
            btn_frame.pack(fill="x", padx=15, pady=(0, 15))
            
            all_stats_btn = ctk.CTkButton(
                btn_frame,
                text="Ver Todas as Estatísticas",
                font=ctk.CTkFont(size=12),
                height=32,
                fg_color=self.orange,
                hover_color=self.orange_light,
                corner_radius=8,
                command=self.show_statistics
            )
            all_stats_btn.pack(side="right")
    
    def show_list_view(self):
        """Exibe a lista de treinos com design modernizado"""
        self.clear_content()
        
        # Configuração do layout
        self.content_frame.grid_columnconfigure(0, weight=1)
        self.content_frame.grid_rowconfigure(1, weight=1)
        
        # Frame de título com ações
        header_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        header_frame.grid_columnconfigure(1, weight=1)  # Espaço flexível entre título e botões
        
        # Título
        title = ctk.CTkLabel(header_frame, text="Seus Treinos", font=ctk.CTkFont(size=26, weight="bold"))
        title.grid(row=0, column=0, sticky="w")
        
        # Botões de ação global
        export_btn = ctk.CTkButton(
            header_frame,
            text="Exportar CSV",
            font=ctk.CTkFont(size=12),
            fg_color=self.orange,
            hover_color="#FF8533",
            height=32,
            width=120,
            corner_radius=8,
            command=self.export_selected_runs
        )
        export_btn.grid(row=0, column=2, padx=5)
        
        # Frame para a tabela
        table_frame = ctk.CTkFrame(self.content_frame, corner_radius=15)
        table_frame.grid(row=1, column=0, sticky="nsew", padx=5, pady=5)
        
        # Criar a tabela com Treeview do tkinter
        columns = ('id', 'data', 'distancia', 'duracao', 'ritmo', 'bpm_med', 'bpm_max', 'elevacao', 'calorias', 'tipo', 'notas')
        self.tree = tk.ttk.Treeview(table_frame, columns=columns, show='headings', selectmode="extended")
        
        # Definir as colunas
        self.tree.heading('id', text='ID')
        self.tree.heading('data', text='Data')
        self.tree.heading('distancia', text='Distância (km)')
        self.tree.heading('duracao', text='Duração (min)')
        self.tree.heading('ritmo', text='Ritmo (min/km)')
        self.tree.heading('bpm_med', text='BPM Méd')
        self.tree.heading('bpm_max', text='BPM Máx')
        self.tree.heading('elevacao', text='Elevação (m)')
        self.tree.heading('calorias', text='Calorias')
        self.tree.heading('tipo', text='Tipo')
        self.tree.heading('notas', text='Notas')
        
        # Ajustar larguras das colunas
        self.tree.column('id', width=40, minwidth=40)
        self.tree.column('data', width=90, minwidth=90)
        self.tree.column('distancia', width=90, minwidth=90)
        self.tree.column('duracao', width=90, minwidth=90)
        self.tree.column('ritmo', width=90, minwidth=90)
        self.tree.column('bpm_med', width=80, minwidth=80)
        self.tree.column('bpm_max', width=80, minwidth=80)
        self.tree.column('elevacao', width=90, minwidth=90)
        self.tree.column('calorias', width=80, minwidth=80)
        self.tree.column('tipo', width=120, minwidth=120)
        self.tree.column('notas', width=150, minwidth=150)
        
        # Adicionar scrollbars
        y_scrollbar = tk.ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        x_scrollbar = tk.ttk.Scrollbar(table_frame, orient=tk.HORIZONTAL, command=self.tree.xview)
        self.tree.configure(yscroll=y_scrollbar.set, xscroll=x_scrollbar.set)
        
        y_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        x_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
        self.tree.pack(expand=True, fill=tk.BOTH, padx=10, pady=10)
        
        # Adicionar botões de ação
        action_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        action_frame.grid(row=2, column=0, sticky="ew", pady=15)
        
        # Modernizando os botões
        edit_btn = ctk.CTkButton(
            action_frame, 
            text="Editar Selecionado", 
            fg_color=self.orange, 
            hover_color="#FF8533",
            font=ctk.CTkFont(size=13),
            height=35,
            width=150,
            corner_radius=8,
            command=self.edit_selected
        )
        edit_btn.pack(side="left", padx=5)
        
        delete_btn = ctk.CTkButton(
            action_frame, 
            text="Excluir Selecionado", 
            fg_color="#D32F2F", 
            hover_color="#FF5252",
            font=ctk.CTkFont(size=13),
            height=35,
            width=150,
            corner_radius=8,
            command=self.delete_selected
        )
        delete_btn.pack(side="left", padx=5)
        
        # Carregar dados
        self.load_run_data()

    def load_run_data(self):
        """Carrega os dados dos treinos na tabela com tratamento seguro para campos que podem não existir"""
        # Limpa a tabela
        for item in self.tree.get_children():
            self.tree.delete(item)
            
        # Obtém e insere os dados
        runs = self.db.get_all_runs()
        for run in runs:
            # Função auxiliar para acessar índice com segurança
            def safe_get(lst, idx, default="-"):
                try:
                    val = lst[idx]
                    return val if val is not None else default
                except IndexError:
                    return default
            
            # Inserir todos os campos na tabela com tratamento de índice seguro
            self.tree.insert('', tk.END, values=(
                safe_get(run, 0),                # ID
                safe_get(run, 1),                # Data
                f"{float(safe_get(run, 2, 0)):.2f}",  # Distância (km)
                safe_get(run, 3),                # Duração (min)
                safe_get(run, 4),                # Ritmo (min/km)
                safe_get(run, 5),                # BPM Médio
                safe_get(run, 6),                # BPM Máximo
                safe_get(run, 7),                # Elevação (m)
                safe_get(run, 8),                # Calorias
                safe_get(run, 9, "Corrida"),     # Tipo de treino
                # Notas com truncamento se muito longas
                (safe_get(run, 10, "")[:25] + "...") if safe_get(run, 10, "") and len(safe_get(run, 10, "")) > 25 else safe_get(run, 10, "")
            ))
    
    def show_add_run(self, run_to_edit=None):
        """Exibe formulário para adicionar ou editar um treino"""
        self.clear_content()
        
        # Verifica se é para adicionar ou editar
        is_editing = run_to_edit is not None
        title_text = "Editar Treino" if is_editing else "Adicionar Novo Treino"
        
        # Frame de título
        header_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header_frame.pack(fill="x", pady=(0, 20))
        
        # Título
        title = ctk.CTkLabel(
            header_frame, 
            text=title_text, 
            font=ctk.CTkFont(size=24, weight="bold")
        )
        title.pack(side="left", anchor="w")
        
        # Frame de formulário com scroll
        form_container = ctk.CTkScrollableFrame(self.content_frame, corner_radius=15)
        form_container.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Formulário
        form_frame = ctk.CTkFrame(form_container, fg_color="transparent")
        form_frame.pack(fill="x", padx=10, pady=10)
        
        # Grid layout para o formulário
        form_frame.columnconfigure(0, weight=0)  # Rótulos
        form_frame.columnconfigure(1, weight=1)  # Campos de entrada
        form_frame.columnconfigure(2, weight=0)  # Rótulos da segunda coluna
        form_frame.columnconfigure(3, weight=1)  # Campos da segunda coluna
        
        # Primeira coluna de campos
        # Data
        ctk.CTkLabel(form_frame, text="Data:", font=ctk.CTkFont(weight="bold")).grid(row=0, column=0, padx=(10, 5), pady=15, sticky="e")
        
        # Usar DateEntry do tkcalendar para seleção de data
        date_var = tk.StringVar()
        self.date_entry = DateEntry(form_frame, width=12, background=self.orange, 
                               foreground='white', borderwidth=2, textvariable=date_var,
                               date_pattern='yyyy-mm-dd')
        self.date_entry.grid(row=0, column=1, padx=(5, 20), pady=15, sticky="w")
        
        # Preenche a data atual ou do treino a ser editado
        if is_editing:
            self.date_entry.set_date(run_to_edit[1])
        else:
            # Usar data atual para novos registros
            self.date_entry.set_date(datetime.now().strftime("%Y-%m-%d"))
        
        # Tipo de treino
        ctk.CTkLabel(form_frame, text="Tipo:", font=ctk.CTkFont(weight="bold")).grid(row=0, column=2, padx=(10, 5), pady=15, sticky="e")
        
        # Combobox para tipos de treino
        workout_types = self.db.get_workout_types()
        self.workout_type_var = tk.StringVar()
        self.workout_type_combo = ctk.CTkComboBox(
            form_frame, 
            values=workout_types,
            variable=self.workout_type_var,
            width=180
        )
        self.workout_type_combo.grid(row=0, column=3, padx=(5, 10), pady=15, sticky="w")
        
        # Distância
        ctk.CTkLabel(form_frame, text="Distância (km):", font=ctk.CTkFont(weight="bold")).grid(row=1, column=0, padx=(10, 5), pady=15, sticky="e")
        self.distance_entry = ctk.CTkEntry(form_frame, placeholder_text="Ex: 5.2")
        self.distance_entry.grid(row=1, column=1, padx=(5, 20), pady=15, sticky="ew")
        
        # Duração
        ctk.CTkLabel(form_frame, text="Duração (min):", font=ctk.CTkFont(weight="bold")).grid(row=1, column=2, padx=(10, 5), pady=15, sticky="e")
        self.duration_entry = ctk.CTkEntry(form_frame, placeholder_text="Ex: 30")
        self.duration_entry.grid(row=1, column=3, padx=(5, 10), pady=15, sticky="ew")
        
        # BPM Médio
        ctk.CTkLabel(form_frame, text="BPM Médio:", font=ctk.CTkFont(weight="bold")).grid(row=2, column=0, padx=(10, 5), pady=15, sticky="e")
        self.avg_bpm_entry = ctk.CTkEntry(form_frame, placeholder_text="Ex: 145")
        self.avg_bpm_entry.grid(row=2, column=1, padx=(5, 20), pady=15, sticky="ew")
        
        # BPM Máximo
        ctk.CTkLabel(form_frame, text="BPM Máximo:", font=ctk.CTkFont(weight="bold")).grid(row=2, column=2, padx=(10, 5), pady=15, sticky="e")
        self.max_bpm_entry = ctk.CTkEntry(form_frame, placeholder_text="Ex: 165")
        self.max_bpm_entry.grid(row=2, column=3, padx=(5, 10), pady=15, sticky="ew")
        
        # Ganho de Elevação
        ctk.CTkLabel(form_frame, text="Elevação (m):", font=ctk.CTkFont(weight="bold")).grid(row=3, column=0, padx=(10, 5), pady=15, sticky="e")
        self.elevation_entry = ctk.CTkEntry(form_frame, placeholder_text="Ex: 120")
        self.elevation_entry.grid(row=3, column=1, padx=(5, 20), pady=15, sticky="ew")
        
        # Calorias
        ctk.CTkLabel(form_frame, text="Calorias:", font=ctk.CTkFont(weight="bold")).grid(row=3, column=2, padx=(10, 5), pady=15, sticky="e")
        self.calories_entry = ctk.CTkEntry(form_frame, placeholder_text="Ex: 350")
        self.calories_entry.grid(row=3, column=3, padx=(5, 10), pady=15, sticky="ew")
        
        # Notas - usando toda a largura para este campo
        ctk.CTkLabel(form_frame, text="Notas:", font=ctk.CTkFont(weight="bold")).grid(row=4, column=0, padx=(10, 5), pady=15, sticky="ne")
        self.notes_entry = ctk.CTkTextbox(form_frame, height=100)
        self.notes_entry.grid(row=4, column=1, columnspan=3, padx=(5, 10), pady=15, sticky="ew")
        
        # Função auxiliar para acessar índice com segurança
        def safe_get(lst, idx, default=None):
            try:
                val = lst[idx]
                return val if val is not None else default
            except IndexError:
                return default
                
        # Preencher com os dados existentes se estiver editando
        if is_editing:
            # Campos obrigatórios
            self.distance_entry.insert(0, str(run_to_edit[2]))
            self.duration_entry.insert(0, str(run_to_edit[3]))
            
            # Campos novos com tratamento seguro
            avg_bpm = safe_get(run_to_edit, 5)
            if avg_bpm:
                self.avg_bpm_entry.insert(0, str(avg_bpm))
                
            max_bpm = safe_get(run_to_edit, 6)
            if max_bpm:
                self.max_bpm_entry.insert(0, str(max_bpm))
                
            elevation = safe_get(run_to_edit, 7)
            if elevation:
                self.elevation_entry.insert(0, str(elevation))
                
            calories = safe_get(run_to_edit, 8)
            if calories:
                self.calories_entry.insert(0, str(calories))
            
            workout_type = safe_get(run_to_edit, 9)
            if workout_type:
                self.workout_type_var.set(workout_type)
            else:
                self.workout_type_var.set("Corrida de Rua")  # Padrão
            
            # Notas
            notes = safe_get(run_to_edit, 10)
            if notes:
                self.notes_entry.insert("1.0", notes)
            
            # ID oculto para saber qual registro estamos editando
            self.edit_id = run_to_edit[0]
        else:
            # Para novo treino, definir o tipo padrão
            self.workout_type_var.set("Corrida de Rua")
        
        # Botões
        button_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        button_frame.pack(fill="x", padx=10, pady=(20, 10))
        
        # Botão para cancelar
        cancel_btn = ctk.CTkButton(
            button_frame, 
            text="Cancelar", 
            fg_color="#D32F2F", 
            hover_color="#FF5252",
            command=self.show_list_view
        )
        cancel_btn.pack(side="left", padx=5)
        
        # Botão para salvar
        save_text = "Atualizar" if is_editing else "Salvar"
        save_btn = ctk.CTkButton(
            button_frame, 
            text=save_text, 
            fg_color=self.orange, 
            hover_color="#FF8533",
            command=lambda: self.save_run(is_editing)
        )
        save_btn.pack(side="left", padx=5)
    
    def save_run(self, is_editing=False):
        """Salva ou atualiza um registro de treino"""
        try:
            # Coletar dados do formulário
            date = self.date_entry.get_date()
            distance = float(self.distance_entry.get().replace(',', '.'))
            duration = int(self.duration_entry.get())
            workout_type = self.workout_type_var.get()
            
            # Campos opcionais (podem estar vazios)
            avg_bpm = self.avg_bpm_entry.get().strip()
            avg_bpm = int(avg_bpm) if avg_bpm else None
            
            max_bpm = self.max_bpm_entry.get().strip()
            max_bpm = int(max_bpm) if max_bpm else None
            
            elevation = self.elevation_entry.get().strip()
            elevation = int(elevation) if elevation else None
            
            calories = self.calories_entry.get().strip()
            calories = int(calories) if calories else 0
            
            notes = self.notes_entry.get("1.0", "end-1c")
            
            if is_editing:
                # Atualizar registro existente
                self.db.update_run(self.edit_id, date, distance, duration, avg_bpm, max_bpm, elevation, calories, workout_type, notes)
                messagebox.showinfo("Sucesso", "Treino atualizado com sucesso!")
            else:
                # Adicionar novo registro
                self.db.add_run(date, distance, duration, avg_bpm, max_bpm, elevation, calories, workout_type, notes)
                messagebox.showinfo("Sucesso", "Novo treino adicionado com sucesso!")
            
            # Voltar para a lista
            self.show_list_view()
            
        except ValueError as e:
            messagebox.showerror("Erro de formato", "Verifique se os campos numéricos estão preenchidos corretamente.")
        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao salvar o treino: {str(e)}")
    
    def edit_selected(self):
        """Edita o treino selecionado na tabela"""
        selected_item = self.tree.selection()
        if not selected_item:
            messagebox.showwarning("Aviso", "Por favor, selecione um treino para editar.")
            return
            
        # Obter o ID do item selecionado
        run_id = self.tree.item(selected_item[0], "values")[0]
        run_data = self.db.get_run(int(run_id))
        
        if run_data:
            self.show_add_run(run_data)
        else:
            messagebox.showerror("Erro", "Não foi possível encontrar o treino selecionado.")
    
    def delete_selected(self):
        """Exclui o(s) treino(s) selecionado(s)"""
        selected_items = self.tree.selection()
        if not selected_items:
            messagebox.showwarning("Aviso", "Por favor, selecione pelo menos um treino para excluir.")
            return
        
        # Confirmar exclusão
        if len(selected_items) == 1:
            msg = "Tem certeza que deseja excluir este treino?"
        else:
            msg = f"Tem certeza que deseja excluir estes {len(selected_items)} treinos?"
        
        if messagebox.askyesno("Confirmar Exclusão", msg):
            for item in selected_items:
                # Obter o ID do item selecionado
                run_id = self.tree.item(item, "values")[0]
                self.db.delete_run(int(run_id))
            
            # Mensagem de sucesso
            if len(selected_items) == 1:
                messagebox.showinfo("Sucesso", "Treino excluído com sucesso!")
            else:
                messagebox.showinfo("Sucesso", f"{len(selected_items)} treinos excluídos com sucesso!")
                
            # Recarregar a tabela
            self.load_run_data()
    
    def export_selected_runs(self):
        """Exporta os treinos selecionados para um arquivo CSV"""
        selected_items = self.tree.selection()
        
        if not selected_items:
            # Se nada for selecionado, exporta todos
            if messagebox.askyesno("Exportar Todos", "Nenhum treino selecionado. Deseja exportar todos os treinos?"):
                export_all = True
                run_ids = None
            else:
                return
        else:
            export_all = False
            run_ids = [int(self.tree.item(item, "values")[0]) for item in selected_items]
        
        # Pedir ao usuário onde salvar o arquivo
        file_path = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV Files", "*.csv"), ("All Files", "*.*")],
            title="Salvar Como"
        )
        
        if not file_path:  # Se o usuário cancelou a seleção do arquivo
            return
            
        # Exportar os dados
        if self.db.export_runs_to_csv(file_path, run_ids):
            if export_all:
                messagebox.showinfo("Sucesso", f"Todos os treinos foram exportados para:\n{file_path}")
            else:
                messagebox.showinfo("Sucesso", f"{len(selected_items)} treino(s) exportado(s) para:\n{file_path}")
        else:
            messagebox.showerror("Erro", "Não foi possível exportar os dados.")
    
    def show_statistics(self):
        """Exibe estatísticas dos treinos com design modernizado e animações"""
        self.clear_content()
        self.current_view = "stats"
        
        # Título com animação
        header_frame = AnimatedFrame(self.content_frame, fg_color="transparent", direction="down")
        header_frame.pack(fill="x", pady=(0, 20))
        
        title = AnimatedLabel(
            header_frame, 
            text="Estatísticas Detalhadas", 
            font=ctk.CTkFont(size=26, weight="bold"),
            delay=100
        )
        title.pack(side="left", pady=(0, 0), anchor="w")
        
        # Frame para os gráficos - com animação
        charts_frame = AnimatedFrame(
            self.content_frame, 
            corner_radius=15,
            direction="right",
            animation_speed=8
        )
        charts_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Buscar todos os treinos
        runs = self.db.get_all_runs()
        
        if not runs:
            no_data = ctk.CTkLabel(
                charts_frame, 
                text="Sem dados suficientes para gerar estatísticas.\nAdicione alguns treinos primeiro.", 
                font=ctk.CTkFont(size=16)
            )
            no_data.pack(pady=50)
            
            # Botão para adicionar treino
            add_btn = ctk.CTkButton(
                charts_frame,
                text="Adicionar Primeiro Treino",
                fg_color=self.orange,
                hover_color=self.orange_light,
                command=self.show_add_run
            )
            add_btn.pack(pady=10)
            return
        
        # Extrair dados para os gráficos
        dates = [run[1] for run in runs]
        distances = [run[2] for run in runs]
        durations = [run[3] for run in runs]
        avg_bpms = [run[5] for run in runs if run[5]]  # BPM médio (pode ser None)
        elevations = [run[7] for run in runs if run[7]]  # Elevação (pode ser None)
        
        # Sistema de abas para os gráficos
        tabview = ctk.CTkTabview(charts_frame, corner_radius=15)
        tabview.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Adicionar as abas
        tab1 = tabview.add("Distância & Duração")
        tab2 = tabview.add("Ritmo & Cardio")
        tab3 = tabview.add("Resumo")
        
        # Tab 1: Distância e Duração
        # -----------------------------
        fig1, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5), facecolor="#2B2B2B")
        ax1.set_facecolor("#333333")
        ax2.set_facecolor("#333333")
        
        # Gráfico 1: Distância por treino (barras)
        bars = ax1.bar(range(len(dates)), distances, color=self.orange)
        ax1.set_title('Distância por Treino', color='white')
        ax1.set_xlabel('Treino', color='white')
        ax1.set_ylabel('Distância (km)', color='white')
        ax1.tick_params(colors='white')
        
        # Adicionar linha de tendência
        if len(distances) > 2:
            x = range(len(distances))
            z = np.polyfit(x, distances, 1)
            p = np.poly1d(z)
            ax1.plot(x, p(x), "r--", color="#FFaa44", linewidth=2, alpha=0.7)
        
        # Gráfico 2: Duração por treino (linha)
        ax2.plot(range(len(dates)), durations, color=self.orange, marker='o')
        ax2.set_title('Duração por Treino', color='white')
        ax2.set_xlabel('Treino', color='white')
        ax2.set_ylabel('Duração (min)', color='white')
        ax2.tick_params(colors='white')
        
        # Remover bordas desnecessárias e adicionar grid
        for ax in [ax1, ax2]:
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['bottom'].set_color('#555555')
            ax.spines['left'].set_color('#555555')
            ax.grid(color='#444444', linestyle='--', linewidth=0.5, alpha=0.7)
        
        fig1.tight_layout()
        
        # Incorporar o gráfico à tab
        canvas1 = FigureCanvasTkAgg(fig1, tab1)
        canvas1.draw()
        canvas1.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
        
        # Tab 2: Ritmo e Cardio
        # ----------------------
        fig2, (ax3, ax4) = plt.subplots(1, 2, figsize=(10, 5), facecolor="#2B2B2B")
        ax3.set_facecolor("#333333")
        ax4.set_facecolor("#333333")
        
        # Ritmo médio ao longo do tempo
        paces = []
        for run in runs:
            pace_str = run[4]  # No formato "mm:ss"
            minutes, seconds = map(int, pace_str.split(':'))
            pace_min = minutes + seconds/60
            paces.append(pace_min)
        
        # Gráfico 3: Evolução do Ritmo
        ax3.plot(range(len(dates)), paces, color=self.orange, marker='o')
        ax3.set_title('Evolução do Ritmo', color='white')
        ax3.set_xlabel('Treino', color='white')
        ax3.set_ylabel('Ritmo (min/km)', color='white')
        ax3.invert_yaxis()  # Ritmo menor é melhor
        ax3.tick_params(colors='white')
        ax3.grid(color='#444444', linestyle='--', linewidth=0.5, alpha=0.7)
        
        # Gráfico 4: BPM ou Elevação
        if avg_bpms:
            ax4.plot(range(len(avg_bpms)), avg_bpms, color='#FF9966', marker='s', linestyle='-')
            ax4.set_title('BPM Médio por Treino', color='white')
            ax4.set_xlabel('Treino', color='white')
            ax4.set_ylabel('BPM', color='white')
            ax4.grid(color='#444444', linestyle='--', linewidth=0.5, alpha=0.7)
        elif elevations:
            ax4.bar(range(len(elevations)), elevations, color='#FF9966')
            ax4.set_title('Elevação por Treino', color='white')
            ax4.set_xlabel('Treino', color='white')
            ax4.set_ylabel('Elevação (m)', color='white')
            ax4.grid(color='#444444', linestyle='--', linewidth=0.5, alpha=0.7)
        else:
            ax4.text(0.5, 0.5, 'Sem dados de BPM ou Elevação', 
                    horizontalalignment='center',
                    verticalalignment='center',
                    transform=ax4.transAxes,
                    color='white')
        
        ax4.tick_params(colors='white')
        
        # Remover bordas desnecessárias
        for ax in [ax3, ax4]:
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['bottom'].set_color('#555555')
            ax.spines['left'].set_color('#555555')
            
        fig2.tight_layout()
        
        # Incorporar o segundo conjunto de gráficos
        canvas2 = FigureCanvasTkAgg(fig2, tab2)
        canvas2.draw()
        canvas2.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
        
        # Tab 3: Resumo
        # --------------
        summary_frame = ctk.CTkFrame(tab3, fg_color="transparent")
        summary_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Adicionar uma visão resumida dos dados em forma de texto
        stats_text = (
            f"Total de treinos: {len(runs)}\n"
            f"Distância total: {sum(distances):.2f} km\n"
            f"Distância média: {sum(distances)/len(runs):.2f} km\n"
            f"Tempo total: {sum(durations) // 60}h {sum(durations) % 60}min\n"
            f"Duração média: {sum(durations)/len(runs):.1f} min\n"
            f"Ritmo médio: {avg_pace}\n"
        )
        
        if avg_bpms:
            stats_text += f"BPM médio: {sum(avg_bpms)/len(avg_bpms):.1f}\n"
        
        if elevations:
            stats_text += f"Ganho de elevação total: {sum(elevations)} m\n"
        
        # Dividir em duas colunas
        left_frame = ctk.CTkFrame(summary_frame, fg_color="transparent")
        left_frame.pack(side="left", fill="both", expand=True, padx=10)
        
        right_frame = ctk.CTkFrame(summary_frame, fg_color="transparent")
        right_frame.pack(side="right", fill="both", expand=True, padx=10)
        
        # Resumo de estatísticas
        stats_title = ctk.CTkLabel(
            left_frame, 
            text="Resumo de Estatísticas",
            font=ctk.CTkFont(size=18, weight="bold")
        )
        stats_title.pack(anchor="w", pady=(0, 10))
        
        stats_box = ctk.CTkTextbox(left_frame, height=200, width=300)
        stats_box.pack(fill="x", pady=5)
        stats_box.insert("1.0", stats_text)
        stats_box.configure(state="disabled")
        
        # Botão para exportar estatísticas
        export_btn = ctk.CTkButton(
            left_frame,
            text="Exportar Estatísticas",
            fg_color=self.orange,
            hover_color=self.orange_light,
            command=self.export_runs_to_excel
        )
        export_btn.pack(anchor="w", pady=10)
        
        # Evolução mensal
        monthly_title = ctk.CTkLabel(
            right_frame, 
            text="Evolução Mensal",
            font=ctk.CTkFont(size=18, weight="bold")
        )
        monthly_title.pack(anchor="w", pady=(0, 10))
        
        # Aqui você pode adicionar um gráfico adicional para evolução mensal
        # ou outro tipo de visualização de dados
        
        # Adicionar botão para retornar à visão de treinos
        return_btn = ctk.CTkButton(
            self.content_frame,
            text="Voltar para Lista de Treinos",
            fg_color=self.orange,
            hover_color=self.orange_light,
            command=self.show_list_view_cards
        )
        return_btn.pack(pady=20)
    
    def show_list_view_cards(self):
        """Exibe a lista de treinos com cards interativos modernos"""
        self.clear_content()
        self.current_view = "list"
        
        # Configuração do layout
        self.content_frame.grid_columnconfigure(0, weight=1)
        self.content_frame.grid_rowconfigure(1, weight=1)
        
        # Frame de título com ações
        header_frame = AnimatedFrame(self.content_frame, fg_color="transparent", direction="down")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        header_frame.grid_columnconfigure(1, weight=1)  # Espaço flexível entre título e botões
        
        # Título
        title = AnimatedLabel(
            header_frame, 
            text="Seus Treinos", 
            font=ctk.CTkFont(size=26, weight="bold"),
            delay=100
        )
        title.grid(row=0, column=0, sticky="w")
        
        # Botão de exportar
        export_btn = ctk.CTkButton(
            header_frame,
            text="Exportar Excel",
            font=ctk.CTkFont(size=12),
            fg_color=self.orange,
            hover_color="#FF8533",
            height=32,
            corner_radius=8,
            command=self.export_runs_to_excel
        )
        export_btn.grid(row=0, column=2, padx=5)
        
        # Botão para adicionar novo treino
        add_btn = ctk.CTkButton(
            header_frame,
            text="Novo Treino",
            font=ctk.CTkFont(size=12),
            fg_color=self.orange,
            hover_color="#FF8533",
            height=32,
            corner_radius=8,
            command=self.show_add_run
        )
        add_btn.grid(row=0, column=3, padx=5)
        
        # Container com scroll para os cards
        self.cards_container = ctk.CTkScrollableFrame(self.content_frame, corner_radius=15)
        self.cards_container.grid(row=1, column=0, sticky="nsew", padx=5, pady=5)
        
        # Carregar dados
        self.load_run_data_as_cards()
    
    def load_run_data_as_cards(self):
        """Carrega os dados dos treinos como cards interativos"""
        # Limpa o container
        for widget in self.cards_container.winfo_children():
            widget.destroy()
            
        # Obtém os dados
        runs = self.db.get_all_runs()
        
        if not runs:
            # Mensagem quando não há treinos cadastrados
            no_data = ctk.CTkLabel(
                self.cards_container, 
                text="Nenhum treino registrado. Clique em 'Novo Treino' para começar!",
                font=ctk.CTkFont(size=14)
            )
            no_data.pack(pady=50)
            return
            
        # Criar um card para cada treino
        for i, run in enumerate(runs):
            # Cores para alternar os cards
            colors = {
                "primary": self.orange,
                "secondary": self.orange_light,
                "text": "white"
            }
            
            # Criar o card com um pequeno atraso para animação
            card = RunCard(
                self.cards_container,
                run_data=run,
                on_edit=self.edit_selected_card,
                on_delete=self.delete_selected_card,
                colors=colors
            )
            card.pack(fill="x", padx=10, pady=5, ipady=5)
            
            # Simular o efeito de animação sequencial
            card.after(i * 50, lambda c=card: c.tkraise())
    
    def edit_selected_card(self, run_id):
        """Edita o treino representado pelo card"""
        run_data = self.db.get_run(run_id)
        
        if run_data:
            self.show_add_run(run_data)
        else:
            messagebox.showerror("Erro", "Não foi possível encontrar o treino selecionado.")
    
    def delete_selected_card(self, run_id):
        """Exclui o treino representado pelo card"""
        if messagebox.askyesno("Confirmar Exclusão", "Tem certeza que deseja excluir este treino?"):
            self.db.delete_run(run_id)
            messagebox.showinfo("Sucesso", "Treino excluído com sucesso!")
            self.load_run_data_as_cards()  # Recarrega os cards
    
    def export_runs_to_excel(self):
        """Exporta os treinos para arquivo Excel"""
        # Verificar se o módulo Excel está disponível
        if not hasattr(self.db, 'EXCEL_AVAILABLE') or not self.db.EXCEL_AVAILABLE:
            messagebox.showerror(
                "Erro - Módulo não encontrado",
                "O módulo 'openpyxl' não está instalado.\n\n"
                "Para habilitar a exportação para Excel, instale o módulo com o comando:\n\n"
                "pip install openpyxl\n\n"
                "Ou instale todas as dependências com:\n\n"
                "pip install -r requirements.txt"
            )
            return
            
        # Pedir ao usuário onde salvar o arquivo
        file_path = filedialog.asksaveasfilename(
            defaultextension=".xlsx",
            filetypes=[("Excel Files", "*.xlsx"), ("Excel Files (Legacy)", "*.xls"), ("All Files", "*.*")],
            title="Salvar Como"
        )
        
        if not file_path:  # Se o usuário cancelou a seleção do arquivo
            return
        
        # Mostrar um indicador de progresso
        progress_window = ctk.CTkToplevel(self)
        progress_window.title("Exportando")
        progress_window.geometry("300x100")
        progress_window.resizable(False, False)
        progress_window.transient(self)  # Ficar sempre à frente da janela principal
        
        progress_window.grid_columnconfigure(0, weight=1)
        
        ctk.CTkLabel(progress_window, text="Exportando dados para Excel...", 
                    font=ctk.CTkFont(size=14)).grid(row=0, column=0, padx=20, pady=(15, 5))
        
        progress_bar = ctk.CTkProgressBar(progress_window, width=250)
        progress_bar.grid(row=1, column=0, padx=20, pady=5)
        progress_bar.set(0.5)  # Valor indeterminado
        
        progress_window.update()
        
        # Exportar os dados em uma thread separada para não congelar a interface
        def export_thread():
            success = self.db.export_runs_to_xlsx(file_path)
            progress_window.destroy()
            
            if success:
                messagebox.showinfo("Sucesso", f"Todos os treinos foram exportados para:\n{file_path}")
            else:
                messagebox.showerror("Erro", "Não foi possível exportar os dados.")
        
        threading.Thread(target=export_thread).start()
