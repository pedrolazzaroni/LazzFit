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

})(window.AppClass);
