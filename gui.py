import customtkinter as ctk
from tkinter import messagebox
import tkinter as tk
from datetime import datetime
from tkcalendar import DateEntry
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

class LazzFitApp(ctk.CTk):
    def __init__(self, db_manager):
        super().__init__()
        
        self.db = db_manager
        self.title("LazzFit - Gerenciador de Treinos de Corrida")
        self.geometry("900x600")
        self.resizable(True, True)
        
        # Cores
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
        """Exibe a lista de treinos"""
        self.clear_content()
        
        # Configuração do layout
        self.content_frame.grid_columnconfigure(0, weight=1)
        self.content_frame.grid_rowconfigure(1, weight=1)
        
        # Título
        title = ctk.CTkLabel(self.content_frame, text="Seus Treinos", font=ctk.CTkFont(size=24, weight="bold"))
        title.grid(row=0, column=0, sticky="w", pady=(0, 20))
        
        # Frame para a tabela
        table_frame = ctk.CTkFrame(self.content_frame)
        table_frame.grid(row=1, column=0, sticky="nsew")
        
        # Criar a tabela com Treeview do tkinter
        columns = ('id', 'data', 'distancia', 'duracao', 'ritmo', 'calorias', 'notas')
        self.tree = tk.ttk.Treeview(table_frame, columns=columns, show='headings')
        
        # Definir as colunas
        self.tree.heading('id', text='ID')
        self.tree.heading('data', text='Data')
        self.tree.heading('distancia', text='Distância (km)')
        self.tree.heading('duracao', text='Duração (min)')
        self.tree.heading('ritmo', text='Ritmo (min/km)')
        self.tree.heading('calorias', text='Calorias')
        self.tree.heading('notas', text='Notas')
        
        # Ajustar larguras das colunas
        self.tree.column('id', width=50)
        self.tree.column('data', width=100)
        self.tree.column('distancia', width=100)
        self.tree.column('duracao', width=100)
        self.tree.column('ritmo', width=100)
        self.tree.column('calorias', width=100)
        self.tree.column('notas', width=200)
        
        # Adicionar scrollbar
        scrollbar = tk.ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscroll=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.tree.pack(expand=True, fill=tk.BOTH, padx=10, pady=10)
        
        # Adicionar botões de ação
        action_frame = ctk.CTkFrame(self.content_frame)
        action_frame.grid(row=2, column=0, sticky="ew", pady=10)
        
        edit_btn = ctk.CTkButton(
            action_frame, text="Editar", fg_color=self.orange, hover_color="#FF8533",
            command=self.edit_selected
        )
        edit_btn.pack(side="left", padx=5)
        
        delete_btn = ctk.CTkButton(
            action_frame, text="Excluir", fg_color="#D32F2F", hover_color="#FF5252",
            command=self.delete_selected
        )
        delete_btn.pack(side="left", padx=5)
        
        # Carregar dados
        self.load_run_data()
        
    def load_run_data(self):
        """Carrega os dados dos treinos na tabela"""
        # Limpa a tabela
        for item in self.tree.get_children():
            self.tree.delete(item)
            
        # Obtém e insere os dados
        runs = self.db.get_all_runs()
        for run in runs:
            self.tree.insert('', tk.END, values=run)
    
    def show_add_run(self, run_to_edit=None):
        """Exibe formulário para adicionar ou editar um treino"""
        self.clear_content()
        
        # Verifica se é para adicionar ou editar
        is_editing = run_to_edit is not None
        title_text = "Editar Treino" if is_editing else "Adicionar Novo Treino"
        
        # Título
        title = ctk.CTkLabel(self.content_frame, text=title_text, font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=(0, 20), anchor="w")
        
        # Formulário
        form_frame = ctk.CTkFrame(self.content_frame)
        form_frame.pack(fill="x", padx=10, pady=10)
        
        # Grid layout para o formulário
        form_frame.columnconfigure(0, weight=0)  # Rótulos
        form_frame.columnconfigure(1, weight=1)  # Campos de entrada
        
        # Data
        ctk.CTkLabel(form_frame, text="Data:").grid(row=0, column=0, padx=10, pady=10, sticky="e")
        
        # Usar DateEntry do tkcalendar para seleção de data
        date_var = tk.StringVar()
        self.date_entry = DateEntry(form_frame, width=12, background=self.orange, 
                               foreground='white', borderwidth=2, textvariable=date_var,
                               date_pattern='yyyy-mm-dd')
        self.date_entry.grid(row=0, column=1, padx=10, pady=10, sticky="w")
        
        if is_editing:
            self.date_entry.set_date(run_to_edit[1])
        else:
            # Usar data atual para novos registros
            self.date_entry.set_date(datetime.now().strftime("%Y-%m-%d"))
        
        # Distância
        ctk.CTkLabel(form_frame, text="Distância (km):").grid(row=1, column=0, padx=10, pady=10, sticky="e")
        self.distance_entry = ctk.CTkEntry(form_frame)
        self.distance_entry.grid(row=1, column=1, padx=10, pady=10, sticky="ew")
        
        # Duração
        ctk.CTkLabel(form_frame, text="Duração (min):").grid(row=2, column=0, padx=10, pady=10, sticky="e")
        self.duration_entry = ctk.CTkEntry(form_frame)
        self.duration_entry.grid(row=2, column=1, padx=10, pady=10, sticky="ew")
        
        # Calorias
        ctk.CTkLabel(form_frame, text="Calorias:").grid(row=3, column=0, padx=10, pady=10, sticky="e")
        self.calories_entry = ctk.CTkEntry(form_frame)
        self.calories_entry.grid(row=3, column=1, padx=10, pady=10, sticky="ew")
        
        # Notas
        ctk.CTkLabel(form_frame, text="Notas:").grid(row=4, column=0, padx=10, pady=10, sticky="ne")
        self.notes_entry = ctk.CTkTextbox(form_frame, height=100)
        self.notes_entry.grid(row=4, column=1, padx=10, pady=10, sticky="ew")
        
        # Preencher com os dados existentes se estiver editando
        if is_editing:
            self.distance_entry.insert(0, str(run_to_edit[2]))
            self.duration_entry.insert(0, str(run_to_edit[3]))
            self.calories_entry.insert(0, str(run_to_edit[5]))
            self.notes_entry.insert("1.0", run_to_edit[6] if run_to_edit[6] else "")
            
            # ID oculto para saber qual registro estamos editando
            self.edit_id = run_to_edit[0]
        
        # Botões
        button_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        button_frame.pack(fill="x", padx=10, pady=(20, 10))
        
        # Botão para cancelar
        cancel_btn = ctk.CTkButton(
            button_frame, text="Cancelar", 
            fg_color="#D32F2F", hover_color="#FF5252",
            command=self.show_list_view
        )
        cancel_btn.pack(side="left", padx=5)
        
        # Botão para salvar
        save_text = "Atualizar" if is_editing else "Salvar"
        save_btn = ctk.CTkButton(
            button_frame, text=save_text, 
            fg_color=self.orange, hover_color="#FF8533",
            command=lambda: self.save_run(is_editing)
        )
        save_btn.pack(side="left", padx=5)
    
    def save_run(self, is_editing=False):
        """Salva ou atualiza um registro de treino"""
        try:
            # Coletar dados do formulário
            date = self.date_entry.get_date()
            distance = float(self.distance_entry.get())
            duration = int(self.duration_entry.get())
            calories = int(self.calories_entry.get())
            notes = self.notes_entry.get("1.0", "end-1c")
            
            if is_editing:
                # Atualizar registro existente
                self.db.update_run(self.edit_id, date, distance, duration, calories, notes)
                messagebox.showinfo("Sucesso", "Treino atualizado com sucesso!")
            else:
                # Adicionar novo registro
                self.db.add_run(date, distance, duration, calories, notes)
                messagebox.showinfo("Sucesso", "Novo treino adicionado com sucesso!")
            
            # Voltar para a lista
            self.show_list_view()
            
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
        """Exclui o treino selecionado"""
        selected_item = self.tree.selection()
        if not selected_item:
            messagebox.showwarning("Aviso", "Por favor, selecione um treino para excluir.")
            return
            
        if messagebox.askyesno("Confirmar", "Tem certeza que deseja excluir este treino?"):
            # Obter o ID do item selecionado
            run_id = self.tree.item(selected_item[0], "values")[0]
            self.db.delete_run(int(run_id))
            messagebox.showinfo("Sucesso", "Treino excluído com sucesso!")
            self.load_run_data()  # Recarregar a tabela
    
    def show_statistics(self):
        """Exibe estatísticas dos treinos"""
        self.clear_content()
        
        # Título
        title = ctk.CTkLabel(self.content_frame, text="Estatísticas", font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=(0, 20), anchor="w")
        
        # Frame para os gráficos
        charts_frame = ctk.CTkFrame(self.content_frame)
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
        
        # Criar figura com dois subplots
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
        
        # Gráfico 1: Distância por treino
        ax1.bar(range(len(dates)), distances, color=self.orange)
        ax1.set_title('Distância por Treino')
        ax1.set_xlabel('Treino')
        ax1.set_ylabel('Distância (km)')
        
        # Gráfico 2: Duração por treino
        ax2.plot(range(len(dates)), durations, color=self.orange, marker='o')
        ax2.set_title('Duração por Treino')
        ax2.set_xlabel('Treino')
        ax2.set_ylabel('Duração (min)')
        
        fig.tight_layout()
        
        # Incorporar o gráfico ao CTkFrame
        canvas = FigureCanvasTkAgg(fig, charts_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
        
        # Segundo conjunto de gráficos
        fig2, ax3 = plt.subplots(figsize=(10, 5))
        
        # Ritmo médio ao longo do tempo
        paces = []
        for run in runs:
            pace_str = run[4]  # No formato "mm:ss"
            minutes, seconds = map(int, pace_str.split(':'))
            pace_min = minutes + seconds/60
            paces.append(pace_min)
        
        ax3.plot(range(len(dates)), paces, color=self.orange, marker='o')
        ax3.set_title('Evolução do Ritmo')
        ax3.set_xlabel('Treino')
        ax3.set_ylabel('Ritmo (min/km)')
        ax3.invert_yaxis()  # Ritmo menor é melhor
        
        fig2.tight_layout()
        
        # Incorporar o segundo gráfico
        canvas2 = FigureCanvasTkAgg(fig2, charts_frame)
        canvas2.draw()
        canvas2.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
