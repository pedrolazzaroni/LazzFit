import customtkinter as ctk
from tkinter import messagebox
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib
matplotlib.use("TkAgg")

from database import get_user_runs, get_user_stats
from themes import LAZZFIT_COLORS, FONTS

class Dashboard(ctk.CTkFrame):
    def __init__(self, master, user, show_add_run, show_statistics, show_settings, logout):
        super().__init__(master, corner_radius=0)
        
        self.master = master
        self.user = user
        self.show_add_run = show_add_run
        self.show_statistics = show_statistics
        self.show_settings = show_settings
        self.logout = logout
        
        # Configuração do grid
        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=3)
        self.grid_rowconfigure(0, weight=1)
        
        # Adiciona os componentes principais
        self.create_sidebar()
        self.create_main_content()
        
        # Carrega os dados iniciais
        self.refresh_data()
        
    def create_sidebar(self):
        """Cria o menu lateral"""
        sidebar = ctk.CTkFrame(self, corner_radius=0, fg_color=LAZZFIT_COLORS["black_primary"])
        sidebar.grid(row=0, column=0, sticky="nsew")
        sidebar.grid_rowconfigure(6, weight=1)  # Espaço flexível
        
        # Logo / título
        logo_label = ctk.CTkLabel(
            sidebar,
            text="LazzFit",
            font=ctk.CTkFont(family="Roboto", size=28, weight="bold"),
            text_color=LAZZFIT_COLORS["orange_primary"],
        )
        logo_label.grid(row=0, column=0, padx=20, pady=(20, 10), sticky="w")
        
        # Informações do usuário
        user_frame = ctk.CTkFrame(sidebar, fg_color="transparent")
        user_frame.grid(row=1, column=0, padx=10, pady=(0, 20), sticky="ew")
        
        user_icon = ctk.CTkLabel(
            user_frame,
            text="👤",  # Emoji como placeholder para o ícone
            font=ctk.CTkFont(size=20),
            text_color=LAZZFIT_COLORS["white"]
        )
        user_icon.grid(row=0, column=0, padx=(10, 5), pady=5)
        
        user_name = ctk.CTkLabel(
            user_frame,
            text=self.user['username'],
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=LAZZFIT_COLORS["white"]
        )
        user_name.grid(row=0, column=1, padx=5, pady=5, sticky="w")
        
        # Separador
        separator = ctk.CTkFrame(sidebar, height=1, fg_color=LAZZFIT_COLORS["gray_dark"])
        separator.grid(row=2, column=0, padx=10, pady=5, sticky="ew")
        
        # Botões de menu
        btn_padding = 10
        
        dashboard_btn = ctk.CTkButton(
            sidebar,
            text="Dashboard",
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color=LAZZFIT_COLORS["orange_dark"],  # Botão selecionado
            hover_color=LAZZFIT_COLORS["orange_primary"],
            text_color=LAZZFIT_COLORS["white"],
            anchor="w",
            height=40,
            command=lambda: None  # Já estamos no dashboard
        )
        dashboard_btn.grid(row=3, column=0, padx=btn_padding, pady=(btn_padding, 0), sticky="ew")
        
        add_run_btn = ctk.CTkButton(
            sidebar,
            text="Adicionar Corrida",
            font=ctk.CTkFont(size=14),
            fg_color="transparent",
            hover_color=LAZZFIT_COLORS["black_light"],
            text_color=LAZZFIT_COLORS["white"],
            anchor="w",
            height=40,
            command=self.show_add_run
        )
        add_run_btn.grid(row=4, column=0, padx=btn_padding, pady=(btn_padding, 0), sticky="ew")
        
        stats_btn = ctk.CTkButton(
            sidebar,
            text="Estatísticas",
            font=ctk.CTkFont(size=14),
            fg_color="transparent",
            hover_color=LAZZFIT_COLORS["black_light"],
            text_color=LAZZFIT_COLORS["white"],
            anchor="w",
            height=40,
            command=self.show_statistics
        )
        stats_btn.grid(row=5, column=0, padx=btn_padding, pady=(btn_padding, 0), sticky="ew")
        
        # Espaço flexível
        
        # Botões inferiores
        settings_btn = ctk.CTkButton(
            sidebar,
            text="Configurações",
            font=ctk.CTkFont(size=14),
            fg_color="transparent",
            hover_color=LAZZFIT_COLORS["black_light"],
            text_color=LAZZFIT_COLORS["gray_medium"],
            anchor="w",
            height=40,
            command=self.show_settings
        )
        settings_btn.grid(row=7, column=0, padx=btn_padding, pady=(0, btn_padding), sticky="ew")
        
        logout_btn = ctk.CTkButton(
            sidebar,
            text="Sair",
            font=ctk.CTkFont(size=14),
            fg_color="transparent",
            hover_color=LAZZFIT_COLORS["black_light"],
            text_color=LAZZFIT_COLORS["gray_medium"],
            anchor="w",
            height=40,
            command=self.logout
        )
        logout_btn.grid(row=8, column=0, padx=btn_padding, pady=(0, 20), sticky="ew")
    
    def create_main_content(self):
        """Cria o conteúdo principal do dashboard"""
        main_frame = ctk.CTkFrame(self, corner_radius=0)
        main_frame.grid(row=0, column=1, sticky="nsew")
        main_frame.grid_columnconfigure(0, weight=1)
        main_frame.grid_rowconfigure(2, weight=1)
        
        # Cabeçalho
        header = ctk.CTkFrame(main_frame, fg_color="transparent")
        header.grid(row=0, column=0, padx=20, pady=20, sticky="ew")
        header.grid_columnconfigure(1, weight=1)
        
        title = ctk.CTkLabel(
            header,
            text="Dashboard",
            font=ctk.CTkFont(family="Roboto", size=24, weight="bold"),
        )
        title.grid(row=0, column=0, sticky="w")
        
        # Data atual
        current_date = datetime.now().strftime("%d/%m/%Y")
        date_label = ctk.CTkLabel(
            header,
            text=f"Hoje: {current_date}",
            font=ctk.CTkFont(size=14),
            text_color=LAZZFIT_COLORS["gray_medium"],
        )
        date_label.grid(row=0, column=1, sticky="e")
        
        # Cards de estatísticas
        self.stats_frame = ctk.CTkFrame(main_frame)
        self.stats_frame.grid(row=1, column=0, padx=20, pady=(0, 20), sticky="ew")
        self.stats_frame.grid_columnconfigure((0, 1, 2, 3), weight=1, uniform="stats")
        
        # Placeholders para os cards que serão preenchidos no refresh_data
        self.stats_cards = []
        
        # Seção de atividades recentes e gráfico
        content_frame = ctk.CTkFrame(main_frame)
        content_frame.grid(row=2, column=0, padx=20, pady=(0, 20), sticky="nsew")
        content_frame.grid_columnconfigure((0, 1), weight=1, uniform="content")
        content_frame.grid_rowconfigure(0, weight=1)
        
        # Atividades recentes
        self.activities_frame = ctk.CTkFrame(content_frame)
        self.activities_frame.grid(row=0, column=0, padx=(0, 10), pady=0, sticky="nsew")
        self.activities_frame.grid_columnconfigure(0, weight=1)
        self.activities_frame.grid_rowconfigure(1, weight=1)
        
        activities_title = ctk.CTkLabel(
            self.activities_frame,
            text="Atividades Recentes",
            font=ctk.CTkFont(size=16, weight="bold"),
        )
        activities_title.grid(row=0, column=0, padx=20, pady=(20, 10), sticky="w")
        
        # Frame para a lista de atividades
        self.activities_list = ctk.CTkScrollableFrame(self.activities_frame)
        self.activities_list.grid(row=1, column=0, padx=20, pady=(0, 20), sticky="nsew")
        self.activities_list.grid_columnconfigure(0, weight=1)
        
        # Gráfico
        self.chart_frame = ctk.CTkFrame(content_frame)
        self.chart_frame.grid(row=0, column=1, padx=(10, 0), pady=0, sticky="nsew")
        self.chart_frame.grid_columnconfigure(0, weight=1)
        self.chart_frame.grid_rowconfigure(1, weight=1)
        
        chart_title = ctk.CTkLabel(
            self.chart_frame,
            text="Progresso Semanal",
            font=ctk.CTkFont(size=16, weight="bold"),
        )
        chart_title.grid(row=0, column=0, padx=20, pady=(20, 10), sticky="w")
        
        # Frame para o gráfico
        self.chart_container = ctk.CTkFrame(self.chart_frame, fg_color="transparent")
        self.chart_container.grid(row=1, column=0, padx=20, pady=(0, 20), sticky="nsew")
        
    def refresh_data(self):
        """Atualiza os dados exibidos no dashboard"""
        # Obter estatísticas do usuário
        stats = get_user_stats(self.user['id'])
        
        # Limpar cards antigos
        for card in self.stats_cards:
            card.destroy()
        self.stats_cards = []
        
        # Criar novos cards
        self.create_stat_card(0, "Total de Corridas", f"{stats['total_runs']}", "🏃")
        
        # Formatar distância total
        if stats['total_distance'] >= 100:
            distance_text = f"{stats['total_distance']:.0f} km"
        else:
            distance_text = f"{stats['total_distance']:.1f} km"
        self.create_stat_card(1, "Distância Total", distance_text, "📏")
        
        # Formatar tempo total
        total_hours = stats['total_duration'] // 3600
        total_minutes = (stats['total_duration'] % 3600) // 60
        if total_hours > 0:
            time_text = f"{total_hours}h {total_minutes}m"
        else:
            time_text = f"{total_minutes}m"
        self.create_stat_card(2, "Tempo Total", time_text, "⏱️")
        
        # Formatar calorias
        calories_text = f"{stats['total_calories']:,}".replace(",", ".")
        self.create_stat_card(3, "Calorias Queimadas", calories_text, "🔥")
        
        # Atualizar lista de atividades
        self.update_activities_list()
        
        # Atualizar gráfico
        self.update_chart()
        
    def create_stat_card(self, col, title, value, icon):
        """Cria um card de estatística"""
        card = ctk.CTkFrame(self.stats_frame)
        card.grid(row=0, column=col, padx=10, pady=10, sticky="nsew")
        card.grid_columnconfigure(1, weight=1)
        
        # Ícone
        icon_label = ctk.CTkLabel(
            card,
            text=icon,
            font=ctk.CTkFont(size=28),
            text_color=LAZZFIT_COLORS["orange_primary"],
        )
        icon_label.grid(row=0, column=0, rowspan=2, padx=(15, 10), pady=15)
        
        # Título
        title_label = ctk.CTkLabel(
            card,
            text=title,
            font=ctk.CTkFont(size=12),
            text_color=LAZZFIT_COLORS["gray_medium"],
        )
        title_label.grid(row=0, column=1, padx=(0, 15), pady=(15, 0), sticky="sw")
        
        # Valor
        value_label = ctk.CTkLabel(
            card,
            text=value,
            font=ctk.CTkFont(size=22, weight="bold"),
        )
        value_label.grid(row=1, column=1, padx=(0, 15), pady=(0, 15), sticky="nw")
        
        self.stats_cards.append(card)
        
    def update_activities_list(self):
        """Atualiza a lista de atividades recentes"""
        # Limpar lista
        for widget in self.activities_list.winfo_children():
            widget.destroy()
            
        # Obter corridas recentes
        runs = get_user_runs(self.user['id'], limit=5)
        
        if not runs:
            no_data = ctk.CTkLabel(
                self.activities_list,
                text="Nenhuma atividade registrada.",
                font=ctk.CTkFont(size=14),
                text_color=LAZZFIT_COLORS["gray_medium"],
            )
            no_data.grid(row=0, column=0, padx=10, pady=30)
            
            add_btn = ctk.CTkButton(
                self.activities_list,
                text="Registrar primeira corrida",
                font=ctk.CTkFont(size=14),
                fg_color=LAZZFIT_COLORS["orange_primary"],
                hover_color=LAZZFIT_COLORS["orange_dark"],
                command=self.show_add_run
            )
            add_btn.grid(row=1, column=0, padx=10, pady=(0, 20))
            return
        
        # Adicionar atividades à lista
        for i, run in enumerate(runs):
            self.create_activity_item(i, run)
    
    def create_activity_item(self, row, run):
        """Cria um item de atividade na lista"""
        frame = ctk.CTkFrame(self.activities_list, fg_color="transparent")
        frame.grid(row=row, column=0, padx=5, pady=5, sticky="ew")
        frame.grid_columnconfigure(1, weight=1)
        
        # Conversão da data para formato mais amigável
        date_obj = datetime.strptime(run['date'], '%Y-%m-%d')
        formatted_date = date_obj.strftime('%d/%m/%Y')
        
        # Formatação da duração
        hours = run['duration'] // 3600
        minutes = (run['duration'] % 3600) // 60
        seconds = run['duration'] % 60
        
        if hours > 0:
            duration_text = f"{hours}h {minutes:02d}m {seconds:02d}s"
        else:
            duration_text = f"{minutes:02d}m {seconds:02d}s"
            
        # Formatação do ritmo
        pace_min = int(run['pace'])
        pace_sec = int((run['pace'] - pace_min) * 60)
        pace_text = f"{pace_min}:{pace_sec:02d} min/km"
        
        # Ícone
        icon_label = ctk.CTkLabel(
            frame,
            text="🏃",
            font=ctk.CTkFont(size=24),
            text_color=LAZZFIT_COLORS["orange_primary"],
        )
        icon_label.grid(row=0, column=0, rowspan=2, padx=(5, 10), pady=10)
        
        # Data e distância
        title_label = ctk.CTkLabel(
            frame,
            text=f"Corrida • {formatted_date}",
            font=ctk.CTkFont(size=14, weight="bold"),
        )
        title_label.grid(row=0, column=1, padx=5, pady=(10, 0), sticky="sw")
        
        # Detalhes
        details_label = ctk.CTkLabel(
            frame,
            text=f"{run['distance']:.2f} km • {duration_text} • Ritmo {pace_text}",
            font=ctk.CTkFont(size=12),
            text_color=LAZZFIT_COLORS["gray_medium"],
        )
        details_label.grid(row=1, column=1, padx=5, pady=(0, 10), sticky="nw")
        
        # Separador
        if row < 4:  # Não adiciona separador após o último item
            separator = ctk.CTkFrame(self.activities_list, height=1, fg_color=LAZZFIT_COLORS["gray_dark"])
            separator.grid(row=row+0.5, column=0, padx=10, pady=0, sticky="ew")
        
    def update_chart(self):
        """Atualiza o gráfico de progresso semanal"""
        # Limpar gráfico anterior
        for widget in self.chart_container.winfo_children():
            widget.destroy()
            
        # Obter as datas da semana atual
        today = datetime.now()
        start_of_week = today - timedelta(days=today.weekday())
        dates = [(start_of_week + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
        
        # Obter corridas da semana
        conn = sqlite3.connect('lazzfit.db')
        cursor = conn.cursor()
        
        # Preparar dados para o gráfico
        days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        distances = [0] * 7
        
        for i, date in enumerate(dates):
            cursor.execute(
                "SELECT SUM(distance) FROM runs WHERE user_id = ? AND date = ?", 
                (self.user['id'], date)
            )
            result = cursor.fetchone()[0]
            if result:
                distances[i] = round(result, 2)
        
        conn.close()
        
        # Criar figura matplotlib
        fig, ax = plt.subplots(figsize=(6, 4), dpi=100)
        
        # Cor de fundo e grid
        fig.patch.set_facecolor('#2B2B2B')
        ax.set_facecolor('#2B2B2B')
        ax.grid(color='#444444', linestyle='-', linewidth=0.5, alpha=0.7)
        
        # Cores para texto
        text_color = '#CCCCCC'
        
        # Barras
        bars = ax.bar(days, distances, color=LAZZFIT_COLORS["orange_primary"], 
                     edgecolor=LAZZFIT_COLORS["orange_dark"], linewidth=1)
        
        # Destaca o dia atual
        current_day = today.weekday()
        if current_day < 7:  # Para garantir que estamos dentro da semana
            bars[current_day].set_color(LAZZFIT_COLORS["orange_light"])
            bars[current_day].set_edgecolor(LAZZFIT_COLORS["orange_primary"])
            
        # Adicionar valores no topo das barras
        for bar in bars:
            height = bar.get_height()
            if height > 0:
                ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                        f'{height:.1f}',
                        ha='center', va='bottom', color=text_color)
        
        # Configurações de eixos e título
        ax.set_ylabel('Distância (km)', color=text_color)
        ax.set_title('Distância percorrida na semana atual', color=text_color, pad=10)
        
        # Cor para os eixos
        ax.spines['bottom'].set_color('#444444')
        ax.spines['top'].set_color('#444444')
        ax.spines['left'].set_color('#444444')
        ax.spines['right'].set_color('#444444')
        
        # Cor para os ticks
        ax.tick_params(axis='x', colors=text_color)
        ax.tick_params(axis='y', colors=text_color)
        
        # Ajuste espaçamento
        plt.tight_layout()
        
        # Incorporar o gráfico no frame
        canvas = FigureCanvasTkAgg(fig, master=self.chart_container)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)
