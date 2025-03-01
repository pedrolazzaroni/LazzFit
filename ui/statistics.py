import customtkinter as ctk
from tkinter import messagebox
import sqlite3
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib
matplotlib.use("TkAgg")
import calendar

from database import get_user_stats, get_monthly_distance, get_user_runs
from themes import LAZZFIT_COLORS, FONTS

class StatisticsScreen(ctk.CTkFrame):
    def __init__(self, master, user, back_callback):
        super().__init__(master, corner_radius=0)
        self.master = master
        self.user = user
        self.back_callback = back_callback
        self.year = datetime.now().year
        
        # Configuração do grid
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Componentes
        self.create_header()
        self.create_content()
        
        # Carregar estatísticas
        self.load_statistics()
        
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
            text="Estatísticas",
            font=ctk.CTkFont(family="Roboto", size=24, weight="bold"),
        )
        title.grid(row=0, column=1, padx=20, sticky="w")
        
    def create_content(self):
        """Cria o conteúdo principal da tela"""
        # Container principal
        self.content_frame = ctk.CTkFrame(self)
        self.content_frame.grid(row=1, column=0, padx=20, pady=(0, 20), sticky="nsew")
        self.content_frame.grid_rowconfigure(3, weight=1)
        self.content_frame.grid_columnconfigure(0, weight=1)
        
        # Frame para seletores
        selector_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        selector_frame.grid(row=0, column=0, padx=20, pady=20, sticky="ew")
        
        # Seletor de ano
        year_label = ctk.CTkLabel(selector_frame, text="Ano:")
        year_label.grid(row=0, column=0, padx=(0, 10), pady=10)
        
        current_year = datetime.now().year
        years = [str(year) for year in range(current_year-5, current_year+1)]
        
        self.year_var = ctk.StringVar(value=str(current_year))
        year_combo = ctk.CTkComboBox(
            selector_frame,
            values=years,
            variable=self.year_var,
            width=100,
            command=self.change_year
        )
        year_combo.grid(row=0, column=1, padx=10, pady=10)
        
        # Resumo geral
        summary_label = ctk.CTkLabel(
            self.content_frame, 
            text="Resumo Geral",
            font=ctk.CTkFont(size=18, weight="bold"),
        )
        summary_label.grid(row=1, column=0, padx=20, pady=10, sticky="w")
        
        # Frame para o resumo de estatísticas
        self.stats_frame = ctk.CTkFrame(self.content_frame)
        self.stats_frame.grid(row=2, column=0, padx=20, pady=(0, 20), sticky="ew")
        self.stats_frame.grid_columnconfigure((0, 1, 2, 3), weight=1, uniform="stats")
        
        # Frame para os gráficos
        charts_label = ctk.CTkLabel(
            self.content_frame, 
            text="Gráficos de Progresso",
            font=ctk.CTkFont(size=18, weight="bold"),
        )
        charts_label.grid(row=3, column=0, padx=20, pady=10, sticky="w")
        
        charts_container = ctk.CTkFrame(self.content_frame)
        charts_container.grid(row=4, column=0, padx=20, pady=(0, 20), sticky="nsew")
        charts_container.grid_columnconfigure((0, 1), weight=1, uniform="charts")
        charts_container.grid_rowconfigure(0, weight=1)
        
        # Container para cada gráfico
        self.monthly_chart_frame = ctk.CTkFrame(charts_container)
        self.monthly_chart_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        self.monthly_chart_frame.grid_columnconfigure(0, weight=1)
        self.monthly_chart_frame.grid_rowconfigure(1, weight=1)
        
        monthly_title = ctk.CTkLabel(
            self.monthly_chart_frame, 
            text=f"Distância Mensal - {self.year}",
            font=ctk.CTkFont(size=16, weight="bold"),
        )
        monthly_title.grid(row=0, column=0, padx=20, pady=10, sticky="w")
        
        self.monthly_chart_container = ctk.CTkFrame(self.monthly_chart_frame, fg_color="transparent")
        self.monthly_chart_container.grid(row=1, column=0, padx=10, pady=10, sticky="nsew")
        
        # Gráfico de ritmo médio
        self.pace_chart_frame = ctk.CTkFrame(charts_container)
        self.pace_chart_frame.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")
        self.pace_chart_frame.grid_columnconfigure(0, weight=1)
        self.pace_chart_frame.grid_rowconfigure(1, weight=1)
        
        pace_title = ctk.CTkLabel(
            self.pace_chart_frame, 
            text="Evolução do Ritmo",
            font=ctk.CTkFont(size=16, weight="bold"),
        )
        pace_title.grid(row=0, column=0, padx=20, pady=10, sticky="w")
        
        self.pace_chart_container = ctk.CTkFrame(self.pace_chart_frame, fg_color="transparent")
        self.pace_chart_container.grid(row=1, column=0, padx=10, pady=10, sticky="nsew")
        
    def load_statistics(self):
        """Carrega e exibe as estatísticas do usuário"""
        # Obter estatísticas do usuário
        stats = get_user_stats(self.user['id'])
        
        # Limpar estatísticas anteriores
        for widget in self.stats_frame.winfo_children():
            widget.destroy()
        
        # Criar cards de estatísticas
        self.create_stat_card(0, "Total de Corridas", f"{stats['total_runs']}", "🏃")
        
        # Formatar distância total
        if stats['total_distance'] >= 100:
            distance_text = f"{stats['total_distance']:.0f} km"
        else:
            distance_text = f"{stats['total_distance']:.1f} km"
        self.create_stat_card(1, "Distância Total", distance_text, "📏")
        
        # Formatar ritmo mais rápido
        if stats['fastest_pace'] > 0:
            pace_min = int(stats['fastest_pace'])
            pace_sec = int((stats['fastest_pace'] - pace_min) * 60)
            pace_text = f"{pace_min}:{pace_sec:02d} min/km"
        else:
            pace_text = "N/A"
        self.create_stat_card(2, "Ritmo mais rápido", pace_text, "⚡")
        
        # Formatar corrida mais longa
        longest_run_text = f"{stats['longest_run']:.2f} km"
        self.create_stat_card(3, "Corrida mais longa", longest_run_text, "🏆")
        
        # Atualizar gráficos
        self.update_monthly_chart()
        self.update_pace_chart()
        
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
        
    def update_monthly_chart(self):
        """Atualiza o gráfico de distância mensal"""
        # Limpar gráfico anterior
        for widget in self.monthly_chart_container.winfo_children():
            widget.destroy()
            
        # Obter dados mensais
        distances = get_monthly_distance(self.user['id'], self.year)
        
        # Criar figura matplotlib
        fig, ax = plt.subplots(figsize=(6, 4), dpi=100)
        
        # Cor de fundo e grid
        fig.patch.set_facecolor('#2B2B2B')
        ax.set_facecolor('#2B2B2B')
        ax.grid(color='#444444', linestyle='-', linewidth=0.5, alpha=0.7)
        
        # Cores para texto
        text_color = '#CCCCCC'
        
        # Meses abreviados
        months = [calendar.month_abbr[i] for i in range(1, 13)]
        
        # Barras
        bars = ax.bar(months, distances, color=LAZZFIT_COLORS["orange_primary"], 
                      edgecolor=LAZZFIT_COLORS["orange_dark"], linewidth=1)
        
        # Adicionar valores no topo das barras
        for bar in bars:
            height = bar.get_height()
            if height > 0:
                ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                        f'{height:.1f}',
                        ha='center', va='bottom', color=text_color,
                        fontsize=8)
        
        # Configurações de eixos e título
        ax.set_ylabel('Distância (km)', color=text_color)
        ax.set_title(f'Distância por mês em {self.year}', color=text_color, pad=10)
        
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
        canvas = FigureCanvasTkAgg(fig, master=self.monthly_chart_container)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)
        
    def update_pace_chart(self):
        """Atualiza o gráfico de evolução do ritmo"""
        # Limpar gráfico anterior
        for widget in self.pace_chart_container.winfo_children():
            widget.destroy()
            
        # Obter dados de corridas recentes (até 10)
        runs = get_user_runs(self.user['id'], limit=10)
        
        # Se não houver corridas suficientes, exibe mensagem
        if len(runs) < 2:
            no_data = ctk.CTkLabel(
                self.pace_chart_container,
                text="Dados insuficientes para gerar o gráfico de ritmo.\nRegistre mais corridas para visualizar.",
                font=ctk.CTkFont(size=14),
                text_color=LAZZFIT_COLORS["gray_medium"],
            )
            no_data.pack(expand=True, pady=50)
            return
            
        # Preparar dados para o gráfico
        dates = []
        paces = []
        
        # Inverter para ordem cronológica
        for run in reversed(runs):
            # Formatar data
            date_obj = datetime.strptime(run['date'], '%Y-%m-%d')
            dates.append(date_obj.strftime('%d/%m'))
            
            # Formatar ritmo
            paces.append(run['pace'])
        
        # Criar figura matplotlib
        fig, ax = plt.subplots(figsize=(6, 4), dpi=100)
        
        # Cor de fundo e grid
        fig.patch.set_facecolor('#2B2B2B')
        ax.set_facecolor('#2B2B2B')
        ax.grid(color='#444444', linestyle='-', linewidth=0.5, alpha=0.7)
        
        # Cores para texto
        text_color = '#CCCCCC'
        
        # Linha
        ax.plot(dates, paces, marker='o', linestyle='-', color=LAZZFIT_COLORS["orange_primary"], 
                linewidth=2, markersize=6)
        
        # Configurações de eixos
        ax.set_ylabel('Ritmo (min/km)', color=text_color)
        ax.set_title('Evolução do Ritmo', color=text_color, pad=10)
        
        # Inverte o eixo Y (menor ritmo = melhor desempenho)
        ax.invert_yaxis()
        
        # Formatar valores no eixo Y como minutos:segundos
        import matplotlib.ticker as ticker
        def pace_format(x, pos):
            mins = int(x)
            secs = int((x - mins) * 60)
            return f'{mins}:{secs:02d}'
            
        ax.yaxis.set_major_formatter(ticker.FuncFormatter(pace_format))
        
        # Cor para os eixos
        ax.spines['bottom'].set_color('#444444')
        ax.spines['top'].set_color('#444444')
        ax.spines['left'].set_color('#444444')
        ax.spines['right'].set_color('#444444')
        
        # Cor para os ticks
        ax.tick_params(axis='x', colors=text_color, rotation=45)
        ax.tick_params(axis='y', colors=text_color)
        
        # Ajuste espaçamento
        plt.tight_layout()
        
        # Incorporar o gráfico no frame
        canvas = FigureCanvasTkAgg(fig, master=self.pace_chart_container)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)
        
    def change_year(self, value):
        """Atualiza os gráficos quando o ano é alterado"""
        self.year = int(value)
        self.update_monthly_chart()
