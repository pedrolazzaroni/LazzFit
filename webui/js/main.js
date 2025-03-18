/**
 * Main Application Module
 * Handles UI interactions and coordinates between views
 */
class App {
    constructor() {
        console.log("🚀 Inicializando aplicação LazzFit...");
        
        this.currentView = null;
        this.viewContainer = document.getElementById('view-container');
        this.runs = [];
        this.initialized = false;
        this.dataLoaded = false;  // Novo flag para controlar carregamento de dados
        
        // Verificar a existência do container de views
        if (!this.viewContainer) {
            console.error("❌ ERRO CRÍTICO: View container não encontrado!");
            return;
        }
        
        // Map view names to their handler methods
        this.viewHandlers = {
            'dashboard': this.showDashboard.bind(this),
            'runs': this.showRuns.bind(this),
            'add-run': this.showAddRun.bind(this),
            'statistics': this.showStatistics.bind(this),
            'training-plans': this.showTrainingPlans.bind(this),  // ✓ Adicionado diretamente aqui
            'create-plan': this.showCreatePlan.bind(this),        // ✓ Adicionado diretamente aqui
            'edit-plan': this.showEditPlan.bind(this),           // ✓ Adicionado diretamente aqui
            'view-plan': this.showViewPlan.bind(this)            // ✓ Adicionado diretamente aqui
        };
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log("✓ App construído com sucesso");
    }
    
    /**
     * Initialize the app
     */
    async init() {
        if (this.initialized) return;
        
        console.log("🔄 Inicializando app...");
        
        try {
            // Gerenciar tela de carregamento
            this.updateLoadingStatus("Verificando recursos...", 10);
            
            // Verificar existência de templates críticos
            const criticalTemplates = [
                'dashboard-template', 'runs-template', 'add-run-template', 
                'statistics-template', 'training-plans-template'
            ];
            
            for (const templateId of criticalTemplates) {
                const template = document.getElementById(templateId);
                if (!template) {
                    console.error(`❌ Template crítico não encontrado: ${templateId}`);
                    this.showError(`Erro crítico: Template não encontrado (${templateId}). A aplicação pode não funcionar corretamente.`);
                }
            }
            
            this.updateLoadingStatus("Verificando banco de dados...", 25);
            
            // Verifica conexão com o banco de dados
            console.log("🔍 Verificando banco de dados...");
            const dbConnected = await api.checkDatabaseConnection();
            
            if (!dbConnected) {
                this.updateLoadingStatus("Erro ao conectar ao banco de dados", 30);
                this.showNotification(
                    "Não foi possível conectar ao banco de dados. Algumas funcionalidades podem não estar disponíveis.",
                    "warning",
                    "database-warning"
                );
            }
            
            this.updateLoadingStatus("Carregando dados dos treinos...", 50);
            
            // CORREÇÃO: Aguardar explicitamente o carregamento dos dados
            console.log("🔄 Carregando dados dos treinos...");
            await this.loadRunData();
            
            this.updateLoadingStatus("Carregando planos de treino...", 80);
            
            // Pré-carregar planos de treino para melhor performance
            if (typeof trainingPlans !== 'undefined' && trainingPlans) {
                await trainingPlans.initTrainingPlansView();
            }
            
            this.updateLoadingStatus("Finalizando...", 95);
            
            // Show dashboard as default view
            this.navigate('dashboard');
            
            // Check resources availability
            this.checkResourcesAvailability();
            
            this.initialized = true;
            console.log("✅ App inicializado com sucesso");
            
            // Esconder a tela de carregamento após conclusão
            this.hideLoadingScreen();
        } catch (error) {
            console.error('❌ Falha ao inicializar app:', error);
            this.updateLoadingStatus("Erro ao inicializar aplicativo", 100);
            this.showError('Falha ao inicializar o aplicativo. Por favor, recarregue a página.');
            
            // Mesmo com erro, esconder a tela de carregamento após alguns segundos
            setTimeout(() => this.hideLoadingScreen(), 3000);
        }
    }
    
    // NOVA FUNÇÃO: Separar o carregamento de dados em uma função específica
    async loadRunData() {
        try {
            console.log("📊 Buscando treinos no banco de dados...");
            // Garantir que a API está inicializada
            if (!api.initialized) {
                console.log("⏳ Aguardando inicialização da API...");
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (api.initialized) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    
                    // Timeout após 5 segundos
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        console.warn("⚠️ Timeout ao aguardar API");
                        resolve();
                    }, 5000);
                });
            }
            
            const runsData = await api.getAllRuns();
            console.log(`✅ ${runsData.length} treinos carregados com sucesso`);
            
            // Atualizar a lista de treinos
            this.runs = runsData;
            this.dataLoaded = true;
            
            return runsData;
        } catch (error) {
            console.error("❌ Erro ao carregar dados dos treinos:", error);
            this.showNotification("Erro ao carregar treinos. Por favor, tente novamente mais tarde.", "error");
            this.runs = [];
            return [];
        }
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Navigation menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.navigate(view);
            });
        });
        
        // Handle ESC key to close dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const overlay = document.querySelector('.overlay');
                if (overlay) {
                    components.closeDialog(overlay);
                }
            }
        });
    }
    
    /**
     * Navigate to a different view
     * @param {string} viewName - Name of the view to show
     * @param {Object} params - Optional parameters for the view
     */
    navigate(viewName, params = {}) {
        if (!this.viewHandlers[viewName]) {
            console.error(`View "${viewName}" not found`);
            return;
        }
        
        // CORREÇÃO: Garantir que os dados estão carregados antes de navegar
        // especialmente importante para o dashboard
        if (!this.dataLoaded && viewName === 'dashboard') {
            console.log("🔄 Dados não carregados, tentando carregar primeiro...");
            this.showLoading();
            
            this.loadRunData().then(() => {
                this.hideLoading();
                this._executeNavigation(viewName, params);
            }).catch(error => {
                console.error("Erro ao carregar dados:", error);
                this.hideLoading();
                this._executeNavigation(viewName, params);
            });
        } else {
            this._executeNavigation(viewName, params);
        }
    }
    
    // NOVA FUNÇÃO: Separar a lógica de navegação
    _executeNavigation(viewName, params) {
        // Update navigation highlighting
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            }
        });
        
        // Clear current view with fade-out effect
        this.viewContainer.classList.add('fade-out');
        
        // After fade-out, change content
        setTimeout(() => {
            // Clear container
            this.viewContainer.innerHTML = '';
            
            // Update current view
            this.currentView = viewName;
            
            // Show the new view
            this.viewHandlers[viewName](params);
            
            // Fade-in effect
            this.viewContainer.classList.remove('fade-out');
            this.viewContainer.classList.add('fade-in');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                this.viewContainer.classList.remove('fade-in');
            }, 500);
        }, 300);
    }
    
    /**
     * Show the dashboard view
     */
    showDashboard() {
        // Clone the template
        const template = document.getElementById('dashboard-template');
        const dashboardView = document.importNode(template.content, true);
        
        // Insert into the DOM
        this.viewContainer.appendChild(dashboardView);
        
        // Set current date
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR');
        
        // If no data, show empty state
        if (this.runs.length === 0) {
            this.showEmptyState('dashboard');
            return;
        }
        
        // Calculate statistics
        const totalRuns = this.runs.length;
        const totalDistance = this.runs.reduce((sum, run) => sum + parseFloat(run.distance), 0);
        const totalDuration = this.runs.reduce((sum, run) => sum + parseInt(run.duration), 0);
        
        // Calculate average pace
        let avgPace = '0:00';
        if (totalDistance > 0) {
            const paceSeconds = (totalDuration * 60) / totalDistance;
            const minutes = Math.floor(paceSeconds / 60);
            const seconds = Math.floor(paceSeconds % 60);
            avgPace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update stats cards
        document.getElementById('total-runs').textContent = totalRuns;
        document.getElementById('total-distance').textContent = `${totalDistance.toFixed(2)} km`;
        
        // Format total time
        const totalHours = Math.floor(totalDuration / 60);
        const totalMinutes = totalDuration % 60;
        document.getElementById('total-time').textContent = `${totalHours}h ${totalMinutes}m`;
        
        document.getElementById('avg-pace').textContent = `${avgPace} min/km`;
        
        // Create chart after a short delay to ensure the container is ready
        setTimeout(() => {
            charts.createRecentRunsChart('recent-runs-chart', this.runs);
        }, 100);
    }
    
    /**
     * Show the runs list view
     */
    showRuns() {
        // Clone the template
        const template = document.getElementById('runs-template');
        const runsView = document.importNode(template.content, true);
        
        // Insert into the DOM
        this.viewContainer.appendChild(runsView);
        
        // CORREÇÃO: Se não tiver dados carregados, tenta carregar novamente
        if (!this.dataLoaded || this.runs.length === 0) {
            console.log("🔄 Recarregando dados na view de treinos...");
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = '<div class="loading-spinner"></div><p>Carregando treinos...</p>';
            
            const runsContainer = document.getElementById('runs-container');
            runsContainer.innerHTML = '';
            runsContainer.appendChild(loadingIndicator);
            
            this.loadRunData().then(() => {
                // Remover indicador e continuar com a renderização
                loadingIndicator.remove();
                this._renderRunsView();
            }).catch(() => {
                // Em caso de erro, mostrar estado vazio
                loadingIndicator.remove();
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <span class="material-icons-round">error_outline</span>
                    <p>Não foi possível carregar os treinos. Por favor, tente novamente.</p>
                    <button id="retry-load-btn" class="btn primary">Tentar Novamente</button>
                `;
                runsContainer.appendChild(emptyState);
                
                document.getElementById('retry-load-btn').addEventListener('click', () => {
                    this.navigate('runs');
                });
            });
        } else {
            this._renderRunsView();
        }
    }
    
    // NOVA FUNÇÃO: Separar a lógica de renderização das corridas
    _renderRunsView() {
        // Create selection toolbar
        const selectionToolbar = document.createElement('div');
        selectionToolbar.className = 'selection-toolbar';
        selectionToolbar.innerHTML = `
            <div class="left">
                <span class="selected-count">0 itens selecionados</span>
                <button class="action-btn" id="select-all-btn">
                    <span class="material-icons-round">select_all</span>
                    Selecionar Todos
                </button>
            </div>
            <div class="right">
                <button class="action-btn" id="export-selected-btn">
                    <span class="material-icons-round">file_download</span>
                    Exportar Selecionados
                </button>
                <button class="action-btn" id="clear-selection-btn">
                    <span class="material-icons-round">clear</span>
                    Limpar Seleção
                </button>
            </div>
        `;
        
        // Insert toolbar before the runs container
        const runsSection = this.viewContainer.querySelector('.runs-view');
        runsSection.insertBefore(selectionToolbar, document.getElementById('runs-container'));
        
        // Set up action buttons
        document.getElementById('export-csv-btn').addEventListener('click', () => this.exportToCSV());
        document.getElementById('export-excel-btn').addEventListener('click', () => this.exportToExcel());
        document.getElementById('export-selected-btn').addEventListener('click', () => this.exportSelectedRuns());
        document.getElementById('add-run-btn').addEventListener('click', () => this.navigate('add-run'));
        document.getElementById('select-all-btn').addEventListener('click', () => this.toggleSelectAllRuns());
        document.getElementById('clear-selection-btn').addEventListener('click', () => this.clearRunSelection());
        
        const runsContainer = document.getElementById('runs-container');
        runsContainer.innerHTML = ''; // Limpar conteúdo anterior
        
        // If no data, show empty state
        if (this.runs.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <span class="material-icons-round">directions_run</span>
                <p>Nenhum treino registrado ainda.</p>
                <button id="add-first-run" class="btn primary">Adicionar Primeiro Treino</button>
            `;
            runsContainer.appendChild(emptyState);
            document.getElementById('add-first-run').addEventListener('click', () => {
                this.navigate('add-run');
            });
            return;
        }
        
        // Create run cards
        this.runs.forEach(run => {
            const card = components.createRunCard(
                run,
                this.editRun.bind(this),
                this.confirmDeleteRun.bind(this)
            );
            
            // Make cards selectable with click
            card.addEventListener('click', (e) => {
                // If click was on action buttons, don't toggle selection
                if (e.target.closest('.card-actions')) return;
                
                this.toggleRunCardSelection(card);
            });
            
            runsContainer.appendChild(card);
        });
        
        // Add selected runs counter
        this.selectedRunsCount = 0;
    }
    
    /**
     * Toggle selection state of a run card
     * @param {HTMLElement} card - The run card element
     */
    toggleRunCardSelection(card) {
        const isSelected = card.classList.toggle('selected');
        const runId = parseInt(card.dataset.id);
        
        if (isSelected) {
            this.selectedRunsCount++;
        } else {
            this.selectedRunsCount--;
        }
        
        // Update selection toolbar visibility
        const toolbar = this.viewContainer.querySelector('.selection-toolbar');
        if (this.selectedRunsCount > 0) {
            toolbar.classList.add('active');
            toolbar.querySelector('.selected-count').textContent = 
                `${this.selectedRunsCount} item${this.selectedRunsCount !== 1 ? 's' : ''} selecionado${this.selectedRunsCount !== 1 ? 's' : ''}`;
        } else {
            toolbar.classList.remove('active');
        }
    }
    
    /**
     * Toggle selection for all run cards
     */
    toggleSelectAllRuns() {
        const allCards = this.viewContainer.querySelectorAll('.run-card');
        const allSelected = this.selectedRunsCount === allCards.length;
        
        // If all are selected, deselect all. Otherwise, select all.
        allCards.forEach(card => {
            const isCurrentlySelected = card.classList.contains('selected');
            
            if (allSelected) {
                // Deselect if already selected
                if (isCurrentlySelected) {
                    card.classList.remove('selected');
                    this.selectedRunsCount--;
                }
            } else {
                // Select if not already selected
                if (!isCurrentlySelected) {
                    card.classList.add('selected');
                    this.selectedRunsCount++;
                }
            }
        });
        
        // Update toolbar
        const toolbar = this.viewContainer.querySelector('.selection-toolbar');
        if (this.selectedRunsCount > 0) {
            toolbar.classList.add('active');
            toolbar.querySelector('.selected-count').textContent = 
                `${this.selectedRunsCount} item${this.selectedRunsCount !== 1 ? 's' : ''} selecionado${this.selectedRunsCount !== 1 ? 's' : ''}`;
        } else {
            toolbar.classList.remove('active');
        }
    }
    
    /**
     * Clear selection of all run cards
     */
    clearRunSelection() {
        const allCards = this.viewContainer.querySelectorAll('.run-card.selected');
        allCards.forEach(card => card.classList.remove('selected'));
        this.selectedRunsCount = 0;
        
        // Hide toolbar
        const toolbar = this.viewContainer.querySelector('.selection-toolbar');
        toolbar.classList.remove('active');
    }
    
    /**
     * Export selected runs
     */
    async exportSelectedRuns() {
        const selectedCards = this.viewContainer.querySelectorAll('.run-card.selected');
        
        if (selectedCards.length === 0) {
            this.showNotification('Nenhum treino selecionado para exportação', 'warning');
            return;
        }
        
        const selectedIds = Array.from(selectedCards).map(card => parseInt(card.dataset.id));
        
        // Create export options dialog
        const dialogContent = document.createElement('div');
        dialogContent.innerHTML = `
            <p>Escolha o formato de exportação para ${selectedCards.length} treino(s) selecionado(s):</p>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button id="excel-export-option" class="btn primary">
                    <span class="material-icons-round">table_view</span>
                    Excel (.xlsx)
                </button>
                <button id="csv-export-option" class="btn">
                    <span class="material-icons-round">description</span>
                    CSV (.csv)
                </button>
            </div>
        `;
        
        const dialog = components.showDialog(
            'Exportar Treinos',
            dialogContent,
            []
        );
        
        // Add event listeners for export buttons
        dialogContent.querySelector('#excel-export-option').addEventListener('click', async () => {
            dialog.close();
            this.showNotification('Exportando treinos selecionados para Excel...', 'info');
            const success = await api.exportSelectedRunsToExcel(selectedIds);
            if (success) {
                this.showNotification(`${selectedCards.length} treino(s) exportado(s) com sucesso!`, 'success');
            } else {
                this.showNotification('Falha ao exportar treinos.', 'error');
            }
        });
        
        dialogContent.querySelector('#csv-export-option').addEventListener('click', async () => {
            dialog.close();
            this.showNotification('Exportando treinos selecionados para CSV...', 'info');
            const success = await api.exportSelectedRunsToCSV(selectedIds);
            if (success) {
                this.showNotification(`${selectedCards.length} treino(s) exportado(s) com sucesso!`, 'success');
            } else {
                this.showNotification('Falha ao exportar treinos.', 'error');
            }
        });
    }
    
    /**
     * Show the add/edit run form
     * @param {Object} params - Optional parameters like run ID when editing
     */
    async showAddRun(params = {}) {
        const isEditing = params.runId !== undefined;
        let runData = null;
        
        // Clone the template
        const template = document.getElementById('add-run-template');
        const formView = document.importNode(template.content, true);
        
        // Insert into the DOM
        this.viewContainer.appendChild(formView);
        
        // Set form title
        const formTitle = document.getElementById('form-title');
        formTitle.textContent = isEditing ? 'Editar Treino' : 'Novo Treino';
        
        // Get form elements
        const form = document.getElementById('run-form');
        const runIdField = document.getElementById('run-id');
        const dateField = document.getElementById('run-date');
        const workoutTypeField = document.getElementById('workout-type');
        const distanceField = document.getElementById('run-distance');
        const durationField = document.getElementById('run-duration');
        const avgBpmField = document.getElementById('avg-bpm');
        const maxBpmField = document.getElementById('max-bpm');
        const elevationField = document.getElementById('elevation-gain');
        const caloriesField = document.getElementById('calories');
        const notesField = document.getElementById('notes');
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
        
        // Apply input formatting with our improved formatter
        components.applyInputFormatting(distanceField, durationField);
        
        // Load workout types
        const workoutTypes = await api.getWorkoutTypes();
        workoutTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            workoutTypeField.appendChild(option);
        });
        
        // Set default workout type
        workoutTypeField.value = workoutTypes[0] || 'Corrida de Rua';
        
        // If editing, fetch and fill run data
        if (isEditing) {
            // Show loading state
            const saveBtn = document.getElementById('save-btn');
            const originalBtnText = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="loading-spinner"></div>';
            
            // Fetch run data
            try {
                runData = await api.getRun(params.runId);
                
                if (runData) {
                    // Fill form fields
                    runIdField.value = runData.id;
                    dateField.value = runData.date;
                    workoutTypeField.value = runData.workout_type || workoutTypes[0];
                    
                    // Formatar a distância e a duração manualmente para acionar o evento de formatação
                    distanceField.value = runData.distance;
                    distanceField.dispatchEvent(new Event('input'));
                    
                    durationField.value = runData.duration;
                    durationField.dataset.minutes = runData.duration;
                    durationField.dispatchEvent(new Event('input'));
                    
                    if (runData.avg_bpm) avgBpmField.value = runData.avg_bpm;
                    if (runData.max_bpm) maxBpmField.value = runData.max_bpm;
                    if (runData.elevation_gain) elevationField.value = runData.elevation_gain;
                    if (runData.calories) caloriesField.value = runData.calories;
                    if (runData.notes) notesField.value = runData.notes;
                }
            } catch (error) {
                console.error('Failed to fetch run data:', error);
                this.showNotification('Falha ao carregar dados do treino', 'error');
            } finally {
                // Restore save button
                saveBtn.disabled = false;
                saveBtn.textContent = isEditing ? 'Atualizar' : originalBtnText;
            }
        }
        
        // Set up form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveRun(isEditing);
        });
        
        // Set up cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.navigate('runs');
        });
    }
    
    /**
     * Save or update a run record
     * @param {boolean} isEditing - Whether we're editing an existing run
     */
    async saveRun(isEditing) {
        // Get form elements
        const form = document.getElementById('run-form');
        const runIdField = document.getElementById('run-id');
        const dateField = document.getElementById('run-date');
        const workoutTypeField = document.getElementById('workout-type');
        const distanceField = document.getElementById('run-distance');
        const durationField = document.getElementById('run-duration');
        const avgBpmField = document.getElementById('avg-bpm');
        const maxBpmField = document.getElementById('max-bpm');
        const elevationField = document.getElementById('elevation-gain');
        const caloriesField = document.getElementById('calories');
        const notesField = document.getElementById('notes');
        const saveBtn = document.getElementById('save-btn');
        
        // Validate required fields
        if (!dateField.value || !distanceField.value || !durationField.value) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        // Show loading state
        const originalBtnText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="loading-spinner"></div>';
        
        // Prepare run data
        const runData = {
            date: dateField.value,
            distance: parseFloat(distanceField.value),
            // Use o valor em minutos do dataset se disponível, caso contrário, use o valor do campo
            duration: durationField.dataset.minutes ? parseInt(durationField.dataset.minutes) : parseInt(durationField.value),
            workout_type: workoutTypeField.value,
            avg_bpm: avgBpmField.value ? parseInt(avgBpmField.value) : null,
            max_bpm: maxBpmField.value ? parseInt(maxBpmField.value) : null,
            elevation_gain: elevationField.value ? parseInt(elevationField.value) : null,
            calories: caloriesField.value ? parseInt(caloriesField.value) : null,
            notes: notesField.value
        };
        
        try {
            if (isEditing) {
                const runId = parseInt(runIdField.value);
                await api.updateRun(runId, runData);
                this.showNotification('Treino atualizado com sucesso!', 'success');
            } else {
                await api.addRun(runData);
                this.showNotification('Novo treino adicionado com sucesso!', 'success');
            }
            
            // Refresh data and navigate to runs view
            this.runs = await api.getAllRuns();
            this.navigate('runs');
        } catch (error) {
            console.error('Error saving run:', error);
            this.showNotification('Erro ao salvar o treino. Tente novamente.', 'error');
            
            // Restore save button
            saveBtn.disabled = false;
            saveBtn.textContent = isEditing ? 'Atualizar' : originalBtnText;
        }
    }
    
    /**
     * Show the statistics view
     */
    showStatistics() {
        // Clone the template
        const template = document.getElementById('statistics-template');
        const statsView = document.importNode(template.content, true);
        
        // Insert into the DOM
        this.viewContainer.appendChild(statsView);
        
        // If no data, show empty state
        if (this.runs.length === 0) {
            const tabContent = document.querySelector('.tab-content');
            tabContent.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-round">insert_chart</span>
                    <p>Sem dados suficientes para gerar estatísticas.</p>
                    <button id="add-first-run-stats" class="btn primary">Adicionar Primeiro Treino</button>
                </div>
            `;
            document.getElementById('add-first-run-stats').addEventListener('click', () => {
                this.navigate('add-run');
            });
            return;
        }
        
        // Set up tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and panes
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding pane
                tab.classList.add('active');
                const tabName = tab.dataset.tab;
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
        
        // Create charts after a short delay
        setTimeout(() => {
            // Distance & Duration tab
            charts.createDistanceChart('distance-chart', this.runs);
            charts.createDurationChart('duration-chart', this.runs);
            
            // Pace & Cardio tab
            charts.createPaceChart('pace-chart', this.runs);
            charts.createCardioChart('cardio-chart', this.runs);
            
            // Summary tab
            this.populateStatsSummary();
            charts.createMonthlyChart('monthly-chart', this.runs);
            
            // Set up export button
            document.getElementById('export-stats-btn').addEventListener('click', () => {
                this.exportToExcel();
            });
        }, 100);
        
        // Fix for Pace & Cardio tab
        setTimeout(() => {
            // Get all tabs
            const tabs = document.querySelectorAll('.tab');
            
            // Set up resize handler for better chart responsiveness
            const resizeHandler = () => {
                const activeTab = document.querySelector('.tab.active');
                if (activeTab && activeTab.dataset.tab === 'pace-cardio') {
                    // Redraw charts when pace-cardio tab is active and window resizes
                    if (charts.charts.pace) charts.charts.pace.destroy();
                    if (charts.charts.cardio) charts.charts.cardio.destroy();
                    
                    charts.createPaceChart('pace-chart', this.runs);
                    charts.createCardioChart('cardio-chart', this.runs);
                }
            };
            
            window.addEventListener('resize', resizeHandler);
            
            // Add click handler to redraw charts when tab is activated
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs and panes
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding pane
                    tab.classList.add('active');
                    const tabName = tab.dataset.tab;
                    document.getElementById(`${tabName}-tab`).classList.add('active');
                    
                    if (tab.dataset.tab === 'pace-cardio') {
                        // Re-render charts with a small delay to ensure container sizes are set
                        setTimeout(() => {
                            try {
                                if (charts.charts.pace) charts.charts.pace.destroy();
                                if (charts.charts.cardio) charts.charts.cardio.destroy();
                                
                                charts.createPaceChart('pace-chart', this.runs);
                                charts.createCardioChart('cardio-chart', this.runs);
                            } catch (error) {
                                console.error('Error re-rendering pace charts:', error);
                            }
                        }, 100);
                    }
                });
            });
        }, 100);
    }
    
    /**
     * Populate statistics summary text
     */
    populateStatsSummary() {
        // Calculate statistics
        const totalRuns = this.runs.length;
        const totalDistance = this.runs.reduce((sum, run) => sum + parseFloat(run.distance), 0);
        const totalDuration = this.runs.reduce((sum, run) => sum + parseInt(run.duration), 0);
        
        // Calculate average pace
        let avgPace = '0:00';
        if (totalDistance > 0) {
            const paceSeconds = (totalDuration * 60) / totalDistance;
            const minutes = Math.floor(paceSeconds / 60);
            const seconds = Math.floor(paceSeconds % 60);
            avgPace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Format duration
        const totalHours = Math.floor(totalDuration / 60);
        const totalMinutes = totalDuration % 60;
        
        // Get BPM and elevation data if available
        const avgBpms = this.runs.map(run => run.avg_bpm).filter(v => v !== null && v !== undefined);
        const elevations = this.runs.map(run => run.elevation_gain).filter(v => v !== null && v !== undefined);
        
        // Build summary text
        let summaryText = [
            `Total de treinos: ${totalRuns}`,
            `Distância total: ${totalDistance.toFixed(2)} km`,
            `Distância média: ${(totalDistance / totalRuns).toFixed(2)} km`,
            `Tempo total: ${totalHours}h ${totalMinutes}min`,
            `Duração média: ${(totalDuration / totalRuns).toFixed(1)} min`,
            `Ritmo médio: ${avgPace} min/km`
        ];
        
        if (avgBpms.length > 0) {
            const avgBpm = avgBpms.reduce((sum, bpm) => sum + bpm, 0) / avgBpms.length;
            summaryText.push(`BPM médio: ${avgBpm.toFixed(1)}`);
        }
        
        if (elevations.length > 0) {
            const totalElevation = elevations.reduce((sum, elev) => sum + elev, 0);
            summaryText.push(`Ganho de elevação total: ${totalElevation} m`);
        }
        
        // Update the summary text element
        document.getElementById('stats-summary').textContent = summaryText.join('\n');
    }
    
    /**
     * Export data to Excel
     */
    async exportToExcel() {
        try {
            this.showNotification('Preparando exportação...', 'info');
            const success = await api.exportToExcel();
            if (!success) {
                this.showNotification('Falha ao exportar dados.', 'error');
            }
            // Remoção da notificação duplicada de sucesso - o backend já mostra uma com o nome do arquivo
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Erro ao exportar dados.', 'error');
        }
    }
    
    /**
     * Export data to CSV
     */
    async exportToCSV() {
        try {
            this.showNotification('Preparando exportação...', 'info');
            const success = await api.exportToCSV();
            if (!success) {
                this.showNotification('Falha ao exportar dados.', 'error');
            }
            // Remoção da notificação duplicada de sucesso - o backend já mostra uma com o nome do arquivo
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Erro ao exportar dados.', 'error');
        }
    }
    
    /**
     * Initiate run editing
     * @param {number} runId - ID of run to edit
     */
    editRun(runId) {
        this.navigate('add-run', { runId });
    }
    
    /**
     * Show confirmation dialog before deleting a run
     * @param {number} runId - ID of run to delete
     */
    confirmDeleteRun(runId) {
        components.showConfirmation(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este treino?',
            () => this.deleteRun(runId),
            () => {} // Do nothing on cancel
        );
    }
    
    /**
     * Delete a run
     * @param {number} runId - ID of run to delete
     */
    async deleteRun(runId) {
        try {
            this.showNotification('Excluindo treino...', 'info');
            const success = await api.deleteRun(runId);
            if (success) {
                this.showNotification('Treino excluído com sucesso!', 'success');
                
                // Refresh data
                this.runs = await api.getAllRuns();
                
                // Reload current view
                this.navigate(this.currentView);
            } else {
                this.showNotification('Falha ao excluir treino.', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Erro ao excluir treino.', 'error');
        }
    }
    
    /**
     * Show empty state for a specific view
     * @param {string} viewName - Name of the view
     */
    showEmptyState(viewName) {
        const container = this.viewContainer.querySelector(`.${viewName}-view`);
        if (!container) return;
        
        // Clear container content
        container.innerHTML = '';
        
        // Create empty state content
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        let icon, message, btnText;
        
        switch (viewName) {
            case 'dashboard':
                icon = 'dashboard';
                message = 'Dashboard vazio. Adicione seu primeiro treino para ver estatísticas.';
                btnText = 'Adicionar Primeiro Treino';
                break;
            case 'runs':
                icon = 'directions_run';
                message = 'Nenhum treino registrado ainda.';
                btnText = 'Adicionar Primeiro Treino';
                break;
            case 'statistics':
                icon = 'insert_chart';
                message = 'Sem dados suficientes para gerar estatísticas.';
                btnText = 'Adicionar Primeiro Treino';
                break;
            case 'training-plans':
                icon = 'calendar_month';
                message = 'Nenhum plano de treino criado ainda.';
                btnText = 'Criar Primeiro Plano';
                break;
            default:
                icon = 'info';
                message = 'Nenhum dado disponível.';
                btnText = 'Adicionar Dados';
        }
        
        emptyState.innerHTML = `
            <span class="material-icons-round">${icon}</span>
            <p>${message}</p>
            <button class="btn primary add-first-run">${btnText}</button>
        `;
        
        container.appendChild(emptyState);
        
        // Add event listener to button
        container.querySelector('.add-first-run').addEventListener('click', () => {
            this.navigate('add-run');
        });
    }
    
    /**
     * Show loading indicator
     */
    showLoading() {
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div><p>Carregando...</p>';
        
        document.body.appendChild(overlay);
    }
    
    /**
     * Hide loading indicator
     */
    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            // Add fade-out effect
            overlay.classList.add('fade-out');
            
            // Remove after animation
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }
    
    /**
     * Show notification
     * @param {string} message - Message to show
     * @param {string} type - Type of notification (success, error, info)
     * @param {string} [id] - Optional ID for the notification
     */
    showNotification(message, type = 'info', id = null) {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notifications-container');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        
        // Create and add notification
        const notification = components.createNotification(message, type, id);
        container.appendChild(notification);
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Check if all resources and backend features are available
     */
    checkResourcesAvailability() {
        // Verificar se estamos no ambiente PyWebView
        if (this.isPyWebView) {
            // Verificar disponibilidade de exportação para Excel
            try {
                const excelBtn = document.getElementById('export-excel-btn');
                if (excelBtn && !api.isPyWebView) {
                    excelBtn.title = "Exportação para Excel indisponível no ambiente de teste";
                    excelBtn.classList.add('disabled');
                }
            } catch (error) {
                console.warn('Error checking Excel availability:', error);
            }
        }
        
        // Verificar se as fontes e ícones carregaram
        document.fonts.ready.then(() => {
            const materialIconsLoaded = document.fonts.check('24px "Material Icons Round"');
            if (!materialIconsLoaded) {
                console.warn('Material Icons não carregados. Alguns ícones podem não aparecer corretamente.');
                this.showNotification(
                    'Alguns recursos visuais não foram carregados completamente. A aplicação pode não aparecer corretamente.',
                    'warning'
                );
            }
        });

        // Check for training plans feature availability
        try {
            if (api.isPyWebView && typeof window.pywebview.api.get_all_training_plans === 'function') {
                console.log("✅ Training plans feature available");
            } else {
                console.warn("⚠️ Training plans feature might not be available");
            }
        } catch (error) {
            console.warn('Error checking training plans availability:', error);
        }
    }

    /**
     * Limpa notificações de erro de banco de dados
     */
    clearDatabaseErrorNotifications() {
        const notifications = document.querySelectorAll('.notification[data-id="database-error"]');
        notifications.forEach(notification => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    /**
     * Show the edit plan view
     * @param {Object} params - Parameters including the plan ID
     */
    showEditPlan(params) {
        console.log("🔄 Tentando editar plano:", params);
        
        if (!params || !params.planId) {
            console.error("❌ ID do plano não fornecido para edição");
            this.showNotification("ID do plano não fornecido", "error");
            this.navigate('training-plans');
            return;
        }
        
        try {
            // Verificar se o módulo trainingPlans existe
            if (typeof trainingPlans === 'undefined' || !trainingPlans) {
                console.error("❌ Módulo trainingPlans não encontrado");
                this.showNotification("Módulo de planos de treino não disponível", "error");
                return;
            }
            
            // Verificar se a função de edição existe
            if (typeof trainingPlans.showEditPlanView !== 'function') {
                console.error("❌ Função showEditPlanView não encontrada");
                this.showNotification("Funcionalidade de edição de plano indisponível", "error");
                return;
            }
            
            // Verificar a disponibilidade da API
            if (!window.pywebview || !window.pywebview.api) {
                console.error("❌ API PyWebView não disponível");
                this.showNotification("API backend não disponível. Verifique a conexão.", "error");
                return;
            }
            
            // Chamar a função de edição de plano
            trainingPlans.showEditPlanView(parseInt(params.planId));
        } catch (error) {
            console.error("❌ Erro ao mostrar editor de plano:", error);
            this.showNotification("Erro ao carregar tela de edição do plano", "error");
            this.navigate('training-plans');
        }
    }
    
    /**
     * Show the view plan details
     * @param {Object} params - Parameters including the plan ID
     */
    showViewPlan(params) {
        console.log("🔄 Tentando visualizar plano:", params);
        
        if (!params || !params.planId) {
            console.error("❌ ID do plano não fornecido para visualização");
            this.showNotification("ID do plano não fornecido", "error");
            this.navigate('training-plans');
            return;
        }
        
        try {
            // Verificar se o módulo trainingPlans existe
            if (typeof trainingPlans === 'undefined' || !trainingPlans) {
                console.error("❌ Módulo trainingPlans não encontrado");
                this.showNotification("Módulo de planos de treino não disponível", "error");
                return;
            }
            
            // Verificar se a função de visualização existe
            if (typeof trainingPlans.showViewPlanView !== 'function') {
                console.error("❌ Função showViewPlanView não encontrada");
                this.showNotification("Funcionalidade de visualização de plano indisponível", "error");
                return;
            }
            
            // Verificar a disponibilidade da API
            if (!window.pywebview || !window.pywebview.api) {
                console.error("❌ API PyWebView não disponível");
                this.showNotification("API backend não disponível. Verifique a conexão.", "error");
                return;
            }
            
            // Chamar a função de visualização de plano
            trainingPlans.showViewPlanView(parseInt(params.planId));
        } catch (error) {
            console.error("❌ Erro ao mostrar detalhes do plano:", error);
            this.showNotification("Erro ao carregar detalhes do plano", "error");
            this.navigate('training-plans');
        }
    }
    
    /**
     * Show the training plans view
     */
    showTrainingPlans() {
        console.log("🔄 Iniciando visualização de planos de treino");
        
        try {
            // Clone the template
            const template = document.getElementById('training-plans-template');
            if (!template) {
                console.error("❌ Template de planos de treino não encontrado!");
                this.showNotification("Template de planos de treino não encontrado", "error");
                return;
            }
            
            const plansView = document.importNode(template.content, true);
            
            // Insert into the DOM
            this.viewContainer.innerHTML = '';  // Limpar qualquer conteúdo anterior
            this.viewContainer.appendChild(plansView);
            
            // Verificar explicitamente se o módulo foi carregado
            if (typeof window.trainingPlans === 'undefined') {
                console.error("❌ Módulo trainingPlans não encontrado");
                this._loadTrainingPlansModule();
                this.showNotification("Carregando módulos de planos de treino...", "info");
                return;
            }
            
            // Initialize training plans view
            if (typeof trainingPlans.initTrainingPlansView === 'function') {
                trainingPlans.initTrainingPlansView();
            } else {
                console.error("❌ Função initTrainingPlansView não encontrada");
                this.showNotification("Erro na inicialização dos planos de treino", "error");
            }
        } catch (error) {
            console.error("❌ Erro ao mostrar planos de treino:", error, error.stack);
            this.showNotification("Ocorreu um erro inesperado. Consulte o console para mais detalhes.", "error");
        }
    }
    
    /**
     * Show the create plan view
     */
    showCreatePlan() {
        console.log("🔄 Mostrando tela de criação de plano");
        
        try {
            // Verificar se o módulo e a função existem
            if (!window.trainingPlans || typeof trainingPlans.showCreatePlanView !== 'function') {
                console.error("❌ Módulo trainingPlans ou função showCreatePlanView não encontrada");
                this.showNotification("Funcionalidade de criação de plano indisponível", "error");
                this._loadTrainingPlansModule();
                return;
            }
            
            // Chamar a função de criação de plano
            trainingPlans.showCreatePlanView();
        } catch (error) {
            console.error("❌ Erro ao mostrar tela de criação de plano:", error);
            this.showNotification("Erro ao iniciar criação de plano", "error");
            this.navigate('training-plans');
        }
    }
    
    /**
     * Helper method to dynamically load training plans module if not found
     * @private
     */
    _loadTrainingPlansModule() {
        // Verificar se os scripts de plano de treino estão carregados
        const scripts = [
            './js/training-plans.js',
            './js/plan-days.js',
            './js/plan-steps.js',
            './js/plan-details.js',
            './js/plan-review.js',
            './js/plan-view.js'
        ];
        
        let scriptsLoaded = 0;
        
        // Tentar carregar todos os scripts
        scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                scriptsLoaded++;
                console.log(`✓ Script carregado: ${src}`);
                
                if (scriptsLoaded === scripts.length) {
                    console.log("✓ Todos os scripts carregados, tentando inicializar novamente");
                    this.showNotification("Módulos de planos de treino carregados. Tente novamente.", "info");
                    
                    // Tentar inicializar o módulo novamente após carregar todos os scripts
                    setTimeout(() => {
                        if (window.trainingPlans && typeof trainingPlans.init === 'function') {
                            trainingPlans.init();
                            this.showTrainingPlans();
                        }
                    }, 500);
                }
            };
            script.onerror = (e) => {
                console.error(`❌ Erro ao carregar script ${src}:`, e);
            };
            document.body.appendChild(script);
        });
    }
    
    /**
     * Register a new view handler
     * @param {string} viewName - Name of the view
     * @param {Function} handler - Function to handle the view
     */
    registerViewHandler(viewName, handler) {
        if (typeof handler === 'function') {
            this.viewHandlers[viewName] = handler;
        }
    }
    
    // Atualiza o status de carregamento na tela inicial
    updateLoadingStatus(message, progress) {
        const statusElement = document.querySelector('.loading-status');
        const progressBar = document.getElementById('loading-progress-bar');
        
        if (statusElement) {
            statusElement.textContent = message;
        }
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    // Esconde a tela de carregamento com uma animação suave
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('app-loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = "0";
            setTimeout(() => {
                loadingScreen.style.display = "none";
            }, 500);
        }
    }
}

/**
 * Main Application Module
 * Handles startup and global initialization
 */

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("🌐 DOM carregado, inicializando aplicação...");
    
    try {
        // Criar a instância do app e torná-la global
        window.app = new AppClass();
        
        // Configurar manipuladores de erro não tratados
        window.addEventListener('error', (event) => {
            console.error("❌ Erro global não tratado:", event.error);
            if (app && typeof app.showNotification === 'function') {
                app.showNotification("Ocorreu um erro inesperado. Consulte o console para mais detalhes.", "error");
            }
        });
        
        // Aguardar API inicializada
        console.log("🔍 Verificando status da API...");
        const waitForAPI = () => {
            if (window.api) {
                console.log("✓ API detectada, inicializando aplicação");
                app.init();
            } else {
                console.log("⏳ Aguardando API...");
                setTimeout(waitForAPI, 100);
            }
        };
        
        waitForAPI();
    } catch (error) {
        console.error("❌ Erro crítico durante inicialização:", error);
        alert("Erro fatal: " + error.message);
    }
});

// Verifica se a página está carregando corretamente
window.addEventListener('load', () => {
    console.log("🏁 Página totalmente carregada");
    
    // Backup para garantir que o módulo trainingPlans está disponível
    if (typeof trainingPlans === 'undefined') {
        console.warn("⚠️ Módulo trainingPlans não detectado no carregamento completo");
        
        // Tenta carregar o módulo training-plans.js dinamicamente
        const script = document.createElement('script');
        script.src = './js/training-plans.js';
        script.onload = () => {
            console.log("✓ Módulo trainingPlans carregado dinamicamente");
            if (trainingPlans && app.initialized && window.app.currentView === 'training-plans') {
                app.navigate('training-plans');
            }
        };
        document.body.appendChild(script);
    }
});

// Configurar botão de saída
document.addEventListener('DOMContentLoaded', function() {
    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', async () => {
            try {
                // Mostrar confirmação antes de sair
                components.showConfirmation(
                    'Sair do aplicativo',
                    'Tem certeza que deseja sair do aplicativo?',
                    async function() {
                        try {
                            if (window.pywebview && window.pywebview.api) {
                                await window.pywebview.api.quit_app();
                            } else {
                                console.log('Saindo do aplicativo (simulação)');
                                window.close();
                            }
                        } catch (error) {
                            console.error('Erro ao fechar aplicativo:', error);
                            app.showNotification('Não foi possível fechar o aplicativo', 'error');
                        }
                    },
                    function() {
                        // Cancelado, não fazer nada
                    }
                );
            } catch (error) {
                console.error('Erro ao exibir diálogo de confirmação:', error);
            }
        });
    }
});