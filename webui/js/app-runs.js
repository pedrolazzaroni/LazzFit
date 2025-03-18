/**
 * App Runs Module
 * Contains runs-related methods for the App class
 */

// Extend App prototype with runs-related methods
(function(App) {
    if (!App) {
        console.error("AppClass não encontrada. O módulo app-core.js deve ser carregado primeiro.");
        return;
    }
    
    /**
     * Show the dashboard view
     */
    App.prototype.showDashboard = function() {
        console.log("Mostrando dashboard");
        
        // Clone the template
        const template = document.getElementById('dashboard-template');
        if (!template) {
            console.error("Template de dashboard não encontrado!");
            this.viewContainer.innerHTML = '<div class="error-message">Template de dashboard não encontrado</div>';
            return;
        }
        
        const dashboardView = document.importNode(template.content, true);
        
        // Insert into the DOM
        this.viewContainer.appendChild(dashboardView);
        
        // Set current date
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = new Date().toLocaleDateString('pt-BR');
        }
        
        // If no data, show empty state
        if (!this.runs || this.runs.length === 0) {
            this.showEmptyState('runs');
            return;
        }
        
        try {
            // Calculate statistics
            const totalRuns = this.runs.length;
            const totalDistance = this.runs.reduce((sum, run) => sum + parseFloat(run.distance || 0), 0);
            const totalDuration = this.runs.reduce((sum, run) => sum + parseInt(run.duration || 0), 0);
            
            // Calculate average pace
            let avgPace = '0:00';
            if (totalDistance > 0) {
                const avgPaceSeconds = (totalDuration * 60) / totalDistance;
                const paceMinutes = Math.floor(avgPaceSeconds / 60);
                const paceSeconds = Math.floor(avgPaceSeconds % 60);
                avgPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
            }
            
            // Update stats cards
            const elements = {
                totalRuns: document.getElementById('total-runs'),
                totalDistance: document.getElementById('total-distance'),
                totalTime: document.getElementById('total-time'),
                avgPace: document.getElementById('avg-pace')
            };
            
            if (elements.totalRuns) elements.totalRuns.textContent = totalRuns;
            if (elements.totalDistance) elements.totalDistance.textContent = `${totalDistance.toFixed(2)} km`;
            
            // Format total time
            const totalHours = Math.floor(totalDuration / 60);
            const totalMinutes = totalDuration % 60;
            if (elements.totalTime) elements.totalTime.textContent = `${totalHours}h ${totalMinutes}m`;
            
            if (elements.avgPace) elements.avgPace.textContent = `${avgPace} min/km`;
            
            // Create chart after a short delay to ensure the container is ready
            setTimeout(() => {
                if (window.charts && typeof charts.createRecentRunsChart === 'function') {
                    // Verificar se o container existe
                    const chartContainer = document.getElementById('recent-runs-chart');
                    if (chartContainer) {
                        charts.createRecentRunsChart('recent-runs-chart', this.runs.slice(0, 7).reverse());
                    }
                }
            }, 100);
        } catch (error) {
            console.error("Erro ao renderizar dashboard:", error);
            this.showNotification("Erro ao carregar dados do dashboard", "error");
        }
    };

    /**
     * Show the runs list view
     */
    App.prototype.showRuns = function() {
        // Clone the template
        const template = document.getElementById('runs-template');
        const runsView = document.importNode(template.content, true);
        
        // Insert into the DOM
        this.viewContainer.appendChild(runsView);
        
        // CORREÇÃO: Se não tiver dados carregados, tenta carregar novamente
        if (!this.dataLoaded || this.runs.length === 0) {
            this.loadRunData().then(() => {
                if (this.runs.length === 0) {
                    this.showEmptyState('runs');
                } else {
                    this._renderRunsView();
                }
            }).catch(error => {
                console.error("Erro ao carregar corridas:", error);
                this.showError("Não foi possível carregar seus treinos");
            });
        } else {
            this._renderRunsView();
        }
    };

    /**
     * Render the runs view after data is loaded
     * @private
     */
    App.prototype._renderRunsView = function() {
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
            this.showEmptyState('runs');
            return;
        }
        
        // Create run cards
        this.runs.forEach(run => {
            const card = components.createRunCard(
                run, 
                (id) => this.editRun(id), 
                (id) => this.confirmDeleteRun(id)
            );
            
            // Add event listener for selection
            card.addEventListener('click', (e) => {
                // Only handle clicks on the card itself, not on buttons
                if (!e.target.closest('button')) {
                    this.toggleRunCardSelection(card);
                }
            });
            
            runsContainer.appendChild(card);
        });
        
        // Add selected runs counter
        this.selectedRunsCount = 0;
    };

    // Adicionar aqui todas as outras funções relacionadas a corridas
    // como toggleRunCardSelection, exportToCSV, etc.

    /**
     * Show the add/edit run form
     * @param {Object} params - Optional parameters like run ID when editing
     */
    App.prototype.showAddRun = async function(params = {}) {
        console.log("Mostrando formulário de adicionar/editar treino");
        const isEditing = params.runId !== undefined;
        let runData = null;
        
        try {
            // Clone the template
            const template = document.getElementById('add-run-template');
            if (!template) {
                throw new Error("Template de adicionar treino não encontrado");
            }
            
            const formView = document.importNode(template.content, true);
            
            // Insert into the DOM
            this.viewContainer.appendChild(formView);
            
            // Set form title
            const formTitle = document.getElementById('form-title');
            if (formTitle) {
                formTitle.textContent = isEditing ? 'Editar Treino' : 'Novo Treino';
            }
            
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
            
            if (!form || !dateField || !workoutTypeField || !distanceField || !durationField) {
                throw new Error("Elementos do formulário não encontrados");
            }
            
            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            dateField.value = today;
            
            // Apply input formatting with our improved formatter
            if (window.components && typeof components.applyInputFormatting === 'function') {
                components.applyInputFormatting(distanceField, durationField);
            }
            
            // Load workout types
            try {
                const workoutTypes = await api.getWorkoutTypes();
                workoutTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    workoutTypeField.appendChild(option);
                });
                
                // Set default workout type
                workoutTypeField.value = workoutTypes[0] || 'Corrida de Rua';
            } catch (error) {
                console.error("Erro ao carregar tipos de treino:", error);
                // Usar tipos padrão em caso de erro
                ['Corrida de Rua', 'Corrida na Esteira', 'Trail Running', 'Outro'].forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    workoutTypeField.appendChild(option);
                });
            }
            
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
                        workoutTypeField.value = runData.workout_type || workoutTypeField.value;
                        
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
                    if (saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.textContent = isEditing ? 'Atualizar' : originalBtnText;
                    }
                }
            }
            
            // Set up form submission
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveRun(isEditing);
            });
            
            // Set up cancel button
            const cancelBtn = document.getElementById('cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.navigate('runs');
                });
            }
        } catch (error) {
            console.error("Erro ao mostrar formulário de treino:", error);
            this.showNotification("Não foi possível carregar o formulário de treino", "error");
            this.navigate('runs');
        }
    };

    /**
     * Save or update a run record
     * @param {boolean} isEditing - Whether we're editing an existing run
     */
    App.prototype.saveRun = async function(isEditing) {
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
        
        // Verificações de segurança
        if (!form || !dateField || !distanceField || !durationField || !workoutTypeField) {
            this.showNotification("Erro ao salvar: elementos do formulário não encontrados", "error");
            return;
        }
        
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
            duration: durationField.dataset.minutes ? parseInt(durationField.dataset.minutes) : parseInt(durationField.value),
            workout_type: workoutTypeField.value,
            avg_bpm: avgBpmField && avgBpmField.value ? parseInt(avgBpmField.value) : null,
            max_bpm: maxBpmField && maxBpmField.value ? parseInt(maxBpmField.value) : null,
            elevation_gain: elevationField && elevationField.value ? parseInt(elevationField.value) : null,
            calories: caloriesField && caloriesField.value ? parseInt(caloriesField.value) : null,
            notes: notesField && notesField.value ? notesField.value : ""
        };
        
        try {
            let success = false;
            
            if (isEditing) {
                const runId = parseInt(runIdField.value);
                success = await api.updateRun(runId, runData);
                if (success) {
                    this.showNotification('Treino atualizado com sucesso!', 'success');
                } else {
                    throw new Error("Erro ao atualizar treino");
                }
            } else {
                success = await api.addRun(runData);
                if (success) {
                    this.showNotification('Novo treino adicionado com sucesso!', 'success');
                } else {
                    throw new Error("Erro ao adicionar treino");
                }
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
    };

    /**
     * Show the statistics view
     */
    App.prototype.showStatistics = function() {
        console.log("Mostrando estatísticas");
        
        try {
            // Clone the template
            const template = document.getElementById('statistics-template');
            if (!template) {
                throw new Error("Template de estatísticas não encontrado");
            }
            
            const statsView = document.importNode(template.content, true);
            
            // Insert into the DOM
            this.viewContainer.appendChild(statsView);
            
            // If no data, show empty state
            if (!this.runs || this.runs.length === 0) {
                this.showEmptyState('statistics');
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
                    const pane = document.getElementById(`${tabName}-tab`);
                    if (pane) {
                        pane.classList.add('active');
                    }
                });
            });
            
            // Create charts after a short delay
            setTimeout(() => {
                this._createStatisticsCharts();
            }, 100);
            
        } catch (error) {
            console.error("Erro ao mostrar estatísticas:", error);
            this.showNotification("Não foi possível carregar as estatísticas", "error");
            this.navigate('dashboard');
        }
    };

    /**
     * Create charts for statistics view
     * @private
     */
    App.prototype._createStatisticsCharts = function() {
        try {
            if (!window.charts) {
                console.error("Módulo charts não encontrado");
                this.showNotification("Módulo de gráficos não disponível", "error");
                return;
            }
            
            // Distance & Duration tab
            if (typeof charts.createDistanceChart === 'function') {
                charts.createDistanceChart('distance-chart', this.runs);
            }
            
            if (typeof charts.createDurationChart === 'function') {
                charts.createDurationChart('duration-chart', this.runs);
            }
            
            // Pace & Cardio tab
            if (typeof charts.createPaceChart === 'function') {
                charts.createPaceChart('pace-chart', this.runs);
            }
            
            if (typeof charts.createCardioChart === 'function') {
                charts.createCardioChart('cardio-chart', this.runs);
            }
            
            // Summary tab
            this._populateStatsSummary();
            
            if (typeof charts.createMonthlyChart === 'function') {
                charts.createMonthlyChart('monthly-chart', this.runs);
            }
            
            // Set up export button
            const exportBtn = document.getElementById('export-stats-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportToExcel();
                });
            }
        } catch (error) {
            console.error("Erro ao criar gráficos:", error);
            this.showNotification("Erro ao gerar gráficos estatísticos", "error");
        }
    };

    /**
     * Populate statistics summary text
     * @private
     */
    App.prototype._populateStatsSummary = function() {
        try {
            // Get summary container
            const summaryElement = document.getElementById('stats-summary');
            if (!summaryElement) return;
            
            // Calculate statistics
            const totalRuns = this.runs.length;
            const totalDistance = this.runs.reduce((sum, run) => sum + parseFloat(run.distance || 0), 0);
            const totalDuration = this.runs.reduce((sum, run) => sum + parseInt(run.duration || 0), 0);
            
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
            summaryElement.textContent = summaryText.join('\n');
        } catch (error) {
            console.error("Erro ao calcular resumo estatístico:", error);
        }
    };

    // Export methods
    App.prototype.exportToExcel = async function() {
        try {
            this.showNotification('Preparando exportação para Excel...', 'info');
            if (typeof api.exportToExcel === 'function') {
                const result = await api.exportToExcel();
                if (result && result.success) {
                    this.showNotification(`Exportado com sucesso para: ${result.path}`, 'success');
                } else {
                    this.showNotification('Falha ao exportar para Excel', 'error');
                }
            } else {
                this.showNotification('Função de exportação não disponível', 'error');
            }
        } catch (error) {
            console.error('Erro de exportação:', error);
            this.showNotification('Erro ao exportar para Excel', 'error');
        }
    };
    
    App.prototype.exportToCSV = async function() {
        try {
            this.showNotification('Preparando exportação para CSV...', 'info');
            if (typeof api.exportToCSV === 'function') {
                const result = await api.exportToCSV();
                if (result && result.success) {
                    this.showNotification(`Exportado com sucesso para: ${result.path}`, 'success');
                } else {
                    this.showNotification('Falha ao exportar para CSV', 'error');
                }
            } else {
                this.showNotification('Função de exportação não disponível', 'error');
            }
        } catch (error) {
            console.error('Erro de exportação:', error);
            this.showNotification('Erro ao exportar para CSV', 'error');
        }
    };
    
    App.prototype.toggleRunCardSelection = function(card) {
        if (!card) return;
        
        const isSelected = card.classList.toggle('selected');
        
        // Update selection counter
        if (!this.selectedRunsCount) this.selectedRunsCount = 0;
        
        if (isSelected) {
            this.selectedRunsCount++;
        } else {
            this.selectedRunsCount--;
        }
        
        // Update selection toolbar
        const toolbar = document.querySelector('.selection-toolbar');
        if (toolbar) {
            const counter = toolbar.querySelector('.selected-count');
            if (counter) {
                counter.textContent = `${this.selectedRunsCount} item${this.selectedRunsCount !== 1 ? 's' : ''} selecionado${this.selectedRunsCount !== 1 ? 's' : ''}`;
            }
            
            if (this.selectedRunsCount > 0) {
                toolbar.classList.add('active');
            } else {
                toolbar.classList.remove('active');
            }
        }
    };

})(window.AppClass);
