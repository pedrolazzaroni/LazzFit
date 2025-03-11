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

class LazzFitApp(ctk.CTk):
    def __init__(self, db_manager):
        super().__init__()
        
        self.db = db_manager
        self.title("LazzFit - Gerenciador de Treinos de Corrida")
        self.geometry("900x600")
        self.resizable(True, True)
        
        # Cores - definição explícita das cores laranja e preto
        self.orange = "#FF6700"
        self.black = "#000000"
        self.dark_gray = "#333333"
        self.light_gray = "#555555"
        
        # Configurações de cores customizadas
        self._set_appearance()
        
        # Cria a interface principal
        self._create_widgets()
        
        # Carregar dados iniciais
        self.reload_data()
    
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
        
        # Área de conteúdo principal (inicialmente com a lista de corridas)
        self.content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.content_frame.grid(row=0, column=1, padx=20, pady=20, sticky="nsew")
        
        # Mostrar a visão de lista por padrão
        self.show_list_view()
        
    def _create_sidebar(self):
        """Cria o menu lateral"""
        sidebar = ctk.CTkFrame(self, width=200, corner_radius=10)
        sidebar.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        sidebar.grid_rowconfigure(7, weight=1)  # Espaçamento flexível na parte inferior
        
        # Logotipo
        logo_label = ctk.CTkLabel(sidebar, text="LazzFit", font=ctk.CTkFont(family="Arial", size=24, weight="bold"))
        logo_label.grid(row=0, column=0, padx=20, pady=(20, 10))
        
        # Subtítulo
        subtitle_label = ctk.CTkLabel(sidebar, text="Gerenciador de Corridas", font=ctk.CTkFont(size=12))
        subtitle_label.grid(row=1, column=0, padx=20, pady=(0, 20))
        
        # Botão Dashboard
        self.dashboard_btn = ctk.CTkButton(
            sidebar, text="Dashboard", 
            fg_color=self.orange, hover_color="#FF8533",
            command=self.show_dashboard
        )
        self.dashboard_btn.grid(row=2, column=0, padx=20, pady=10, sticky="ew")
        
        # Botão Listar Corridas
        self.list_runs_btn = ctk.CTkButton(
            sidebar, text="Listar Corridas", 
            fg_color=self.orange, hover_color="#FF8533",
            command=self.show_list_view
        )
        self.list_runs_btn.grid(row=3, column=0, padx=20, pady=10, sticky="ew")
        
        # Botão Nova Corrida
        self.new_run_btn = ctk.CTkButton(
            sidebar, text="Nova Corrida", 
            fg_color=self.orange, hover_color="#FF8533",
            command=self.show_add_run
        )
        self.new_run_btn.grid(row=4, column=0, padx=20, pady=10, sticky="ew")
        
        # Botão Estatísticas
        self.stats_btn = ctk.CTkButton(
            sidebar, text="Estatísticas", 
            fg_color=self.orange, hover_color="#FF8533",
            command=self.show_statistics
        )
        self.stats_btn.grid(row=5, column=0, padx=20, pady=10, sticky="ew")
    
    def reload_data(self):
        """Carrega os dados mais recentes do banco de dados"""
        # Este método será chamado quando precisarmos atualizar os dados exibidos
        # Dependendo da visualização atual, podemos chamar diferentes métodos de carregamento
        if hasattr(self, 'tree') and self.tree.winfo_exists():
            self.load_run_data()
    
    def clear_content(self):
        """Limpa a área de conteúdo"""
        for widget in self.content_frame.winfo_children():
            widget.destroy()
    
    def show_dashboard(self):
        """Exibe o dashboard principal"""
        self.clear_content()
        
        # Título
        title = ctk.CTkLabel(self.content_frame, text="Dashboard", font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=(0, 20), anchor="w")
        
        # Frame para as estatísticas resumidas
        stats_frame = ctk.CTkFrame(self.content_frame)
        stats_frame.pack(fill="x", pady=10, padx=10)
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
        
        # Mostrando estatísticas em cards
        # Card 1 - Total de Corridas
        card1 = ctk.CTkFrame(stats_frame)
        card1.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        
        ctk.CTkLabel(card1, text="Total de Corridas", font=ctk.CTkFont(size=14)).pack(pady=(10, 5))
        ctk.CTkLabel(card1, text=str(total_runs), font=ctk.CTkFont(size=24, weight="bold"), text_color=self.orange).pack(pady=(0, 10))
        
        # Card 2 - Distância Total
        card2 = ctk.CTkFrame(stats_frame)
        card2.grid(row=0, column=1, padx=10, pady=10, sticky="ew")
        
        ctk.CTkLabel(card2, text="Distância Total (km)", font=ctk.CTkFont(size=14)).pack(pady=(10, 5))
        ctk.CTkLabel(card2, text=f"{total_distance:.2f}", font=ctk.CTkFont(size=24, weight="bold"), text_color=self.orange).pack(pady=(0, 10))
        
        # Card 3 - Tempo Total
        card3 = ctk.CTkFrame(stats_frame)
        card3.grid(row=0, column=2, padx=10, pady=10, sticky="ew")
        
        hours = total_time // 60
        minutes = total_time % 60
        
        ctk.CTkLabel(card3, text="Tempo Total", font=ctk.CTkFont(size=14)).pack(pady=(10, 5))
        ctk.CTkLabel(card3, text=f"{hours}h {minutes}m", font=ctk.CTkFont(size=24, weight="bold"), text_color=self.orange).pack(pady=(0, 10))
        
        # Card 4 - Ritmo Médio
        card4 = ctk.CTkFrame(stats_frame)
        card4.grid(row=0, column=3, padx=10, pady=10, sticky="ew")
        
        ctk.CTkLabel(card4, text="Ritmo Médio (min/km)", font=ctk.CTkFont(size=14)).pack(pady=(10, 5))
        ctk.CTkLabel(card4, text=avg_pace, font=ctk.CTkFont(size=24, weight="bold"), text_color=self.orange).pack(pady=(0, 10))
        
        # Adicionar gráfico de treinos recentes se houver dados
        if runs:
            chart_frame = ctk.CTkFrame(self.content_frame)
            chart_frame.pack(fill="both", expand=True, padx=10, pady=10)
            
            # Título do gráfico
            ctk.CTkLabel(chart_frame, text="Últimos Treinos", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=(10, 5))
            
            fig, ax = plt.subplots(figsize=(7, 4))
            
            # Limitar para os últimos 10 treinos
            recent_runs = runs[:10]
            recent_runs.reverse()  # Ordem cronológica
            
            dates = [run[1] for run in recent_runs]
            distances = [run[2] for run in recent_runs]
            
            # Gráfico de barras
            bars = ax.bar(dates, distances, color=self.orange)
            ax.set_xlabel('Data')
            ax.set_ylabel('Distância (km)')
            ax.set_title('Distância por Treino')
            ax.tick_params(axis='x', rotation=45)
            fig.tight_layout()
            
            # Incorporar o gráfico ao CTkFrame
            canvas = FigureCanvasTkAgg(fig, chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True)
    
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
        """Exibe estatísticas dos treinos com design modernizado"""
        self.clear_content()
        
        # Título
        header_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header_frame.pack(fill="x", pady=(0, 20))
        
        title = ctk.CTkLabel(
            header_frame, 
            text="Estatísticas", 
            font=ctk.CTkFont(size=26, weight="bold")
        )
        title.pack(side="left", pady=(0, 0), anchor="w")
        
        # Frame para os gráficos
        charts_frame = ctk.CTkFrame(self.content_frame, corner_radius=15)
        charts_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Buscar todos os treinos
        runs = self.db.get_all_runs()
        
        if not runs:
            ctk.CTkLabel(charts_frame, text="Sem dados suficientes para gerar estatísticas.", 
                         font=ctk.CTkFont(size=16)).pack(pady=50)
            return
        
        # Extrair dados para os gráficos
        dates = [run[1] for run in runs]
        distances = [run[2] for run in runs]
        durations = [run[3] for run in runs]
        avg_bpms = [run[5] for run in runs if run[5]]  # BPM médio (pode ser None)
        elevations = [run[7] for run in runs if run[7]]  # Elevação (pode ser None)
        
        # Criar figura com dois subplots em fundo escuro
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5), facecolor="#2B2B2B")
        ax1.set_facecolor("#333333")
        ax2.set_facecolor("#333333")
        
        # Gráfico 1: Distância por treino
        bars = ax1.bar(range(len(dates)), distances, color=self.orange)
        ax1.set_title('Distância por Treino', color='white')
        ax1.set_xlabel('Treino', color='white')
        ax1.set_ylabel('Distância (km)', color='white')
        ax1.tick_params(colors='white')
        
        # Gráfico 2: Duração por treino
        ax2.plot(range(len(dates)), durations, color=self.orange, marker='o')
        ax2.set_title('Duração por Treino', color='white')
        ax2.set_xlabel('Treino', color='white')
        ax2.set_ylabel('Duração (min)', color='white')
        ax2.tick_params(colors='white')
        
        # Remover bordas desnecessárias
        for ax in [ax1, ax2]:
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['bottom'].set_color('#555555')
            ax.spines['left'].set_color('#555555')
        
        fig.tight_layout()
        
        # Incorporar o gráfico ao CTkFrame
        canvas = FigureCanvasTkAgg(fig, charts_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
        
        # Mais gráficos de estatísticas
        charts_frame2 = ctk.CTkFrame(self.content_frame, corner_radius=15)
        charts_frame2.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Criar figura para o segundo conjunto de gráficos
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
        
        ax3.plot(range(len(dates)), paces, color=self.orange, marker='o')
        ax3.set_title('Evolução do Ritmo', color='white')
        ax3.set_xlabel('Treino', color='white')
        ax3.set_ylabel('Ritmo (min/km)', color='white')
        ax3.invert_yaxis()  # Ritmo menor é melhor
        ax3.tick_params(colors='white')
        
        # Gráfico para BPM ou Elevação
        if avg_bpms:
            ax4.plot(range(len(avg_bpms)), avg_bpms, color='#FF9966', marker='s', linestyle='-')
            ax4.set_title('BPM Médio por Treino', color='white')
            ax4.set_xlabel('Treino', color='white')
            ax4.set_ylabel('BPM', color='white')
        elif elevations:
            ax4.bar(range(len(elevations)), elevations, color='#FF9966')
            ax4.set_title('Elevação por Treino', color='white')
            ax4.set_xlabel('Treino', color='white')
            ax4.set_ylabel('Elevação (m)', color='white')
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
        canvas2 = FigureCanvasTkAgg(fig2, charts_frame2)
        canvas2.draw()
        canvas2.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
