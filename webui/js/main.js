/**
 * Main Application Module
 * Handles UI interactions and coordinates between views
 */
class App {
    constructor() {
        this.currentView = null;
        this.viewContainer = document.getElementById('view-container');
        this.runs = [];
        this.initialized = false;
        
        // Map view names to their handler methods
        this.viewHandlers = {
            'dashboard': this.showDashboard.bind(this),
            'runs': this.showRuns.bind(this),
            'add-run': this.showAddRun.bind(this),
            'statistics': this.showStatistics.bind(this)
        };
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the app
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Show loading state
            this.showLoading();
            
            // Verifica conexão com o banco de dados
            const dbConnected = await api.checkDatabaseConnection();
            
            if (!dbConnected) {
                this.showNotification(
                    "Não foi possível conectar ao banco de dados. Algumas funcionalidades podem não estar disponíveis.",
                    "warning",
                    "database-warning"
                );
            }
            
            // Fetch initial data
            this.runs = await api.getAllRuns();
            
            // Show dashboard as default view
            this.navigate('dashboard');
            
            // Check resources availability
            this.checkResourcesAvailability();
            
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Falha ao inicializar o aplicativo. Por favor, recarregue a página.');
        } finally {
            this.hideLoading();
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
        
        // If no data, show empty state
        if (this.runs.length === 0) {
            const emptyState = runsContainer.querySelector('.empty-state');
            emptyState.style.display = 'flex';
            document.getElementById('add-first-run').addEventListener('click', () => {
                this.navigate('add-run');
            });
            return;
        }
        
        // Hide empty state if it exists
        const emptyState = runsContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
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
            if (success) {
                this.showNotification('Dados exportados com sucesso para Excel!', 'success');
            } else {
                this.showNotification('Falha ao exportar dados.', 'error');
            }
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
            if (success) {
                this.showNotification('Dados exportados com sucesso para CSV!', 'success');
            } else {
                this.showNotification('Falha ao exportar dados.', 'error');
            }
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
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    window.app = app; // Make it accessible to pywebview
    app.init();
});
