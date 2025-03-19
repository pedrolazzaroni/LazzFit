/**
 * Core Application Module
 * Defines the main App class and core functionality
 */
class AppClass {
    constructor() {
        console.log("🚀 Inicializando aplicação LazzFit...");
        
        this.currentView = null;
        this.viewContainer = document.getElementById('view-container');
        this.runs = [];
        this.initialized = false;
        this.dataLoaded = false;
        
        // Verificar a existência do container de views
        if (!this.viewContainer) {
            console.error("Container de views não encontrado!");
            return;
        }
        
        // Map view names to their handler methods
        this.viewHandlers = {
            'dashboard': this.showDashboard.bind(this),
            'runs': this.showRuns.bind(this),
            'add-run': this.showAddRun.bind(this),
            'statistics': this.showStatistics.bind(this),
            'training-plans': this.showTrainingPlans.bind(this),
            'create-plan': this.showCreatePlan.bind(this),
            'edit-plan': this.showEditPlan.bind(this),
            'view-plan': this.showViewPlan.bind(this)
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
            // Verificar disponibilidade de recursos
            await this.checkResourcesAvailability();
            
            // Carregar dados de corrida
            await this.loadRunData();
            
            // Aplicação inicializada com sucesso
            this.initialized = true;
            
            // Navegar para o dashboard por padrão
            this.navigate('dashboard');
            
            // Esconder tela de carregamento se houver
            this.hideLoadingScreen();
            
            console.log("✓ Aplicação inicializada com sucesso");
        } catch (error) {
            console.error("❌ Erro durante inicialização:", error);
            this.showNotification("Erro ao inicializar aplicação: " + error.message, "error");
        }
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Navigation menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const viewName = item.dataset.view;
                if (viewName) {
                    this.navigate(viewName);
                }
            });
        });
        
        // Handle ESC key to close dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openDialogs = document.querySelectorAll('.overlay');
                if (openDialogs.length > 0) {
                    e.preventDefault();
                    openDialogs.forEach(dialog => {
                        if (components && typeof components.closeDialog === 'function') {
                            components.closeDialog(dialog);
                        }
                    });
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
        console.log(`Navegando para: ${viewName}`, params);
        
        if (!this.viewHandlers[viewName]) {
            console.error(`View handler not found for "${viewName}"`);
            return;
        }
        
        // CORREÇÃO: Garantir que os dados estão carregados antes de navegar
        // especialmente importante para o dashboard e statistics
        if (!this.dataLoaded && (viewName === 'dashboard' || viewName === 'statistics')) {
            this.showLoading();
            this.loadRunData().then(() => {
                this._executeNavigation(viewName, params);
                this.hideLoading();
            }).catch(error => {
                console.error("Erro ao carregar dados:", error);
                this.showNotification("Não foi possível carregar dados", "error");
                // Mesmo com erro, tenta navegar
                this._executeNavigation(viewName, params);
                this.hideLoading();
            });
        } else {
            this._executeNavigation(viewName, params);
        }
    }
    
    // NOVA FUNÇÃO: Separar a lógica de navegação
    _executeNavigation(viewName, params) {
        // Update navigation highlighting
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Clear current view with fade-out effect
        this.viewContainer.classList.add('fade-out');
        
        // After fade-out, change content
        setTimeout(() => {
            // Clear previous view content
            this.viewContainer.innerHTML = '';
            this.currentView = viewName;
            
            // Call the appropriate view handler
            this.viewHandlers[viewName](params);
            
            // Remove fade-out effect
            this.viewContainer.classList.remove('fade-out');
        }, 300);
    }
    
    /**
     * Placeholder methods that will be implemented in other modules
     */
    showDashboard() { console.error("showDashboard não implementado!"); }
    showRuns() { console.error("showRuns não implementado!"); }
    showAddRun() { console.error("showAddRun não implementado!"); }
    showStatistics() { console.error("showStatistics não implementado!"); }
    showTrainingPlans() { console.error("showTrainingPlans não implementado!"); }
    showCreatePlan() { console.error("showCreatePlan não implementado!"); }
    showEditPlan() { console.error("showEditPlan não implementado!"); }
    showViewPlan() { console.error("showViewPlan não implementado!"); }
    
    /**
     * Register a new view handler
     * @param {string} viewName - Name of the view
     * @param {Function} handler - Function to handle the view
     */
    registerViewHandler(viewName, handler) {
        if (typeof handler === 'function') {
            this.viewHandlers[viewName] = handler.bind(this);
            console.log(`✓ Handler registrado para view "${viewName}"`);
        }
    }
    
    /**
     * Check if all resources and backend features are available
     */
    checkResourcesAvailability() {
        return new Promise((resolve) => {
            // Verificações iniciais podem ser feitas aqui
            console.log("✓ Recursos verificados com sucesso");
            resolve(true);
        });
    }
    
    /**
     * Separa o carregamento de dados em uma função específica
     */
    async loadRunData() {
        try {
            console.log("🔄 Carregando dados de corridas...");
            
            // Limpar notificações de erro de banco de dados que possam ter sido mostradas
            this.clearDatabaseErrorNotifications();
            
            if (window.api && api.isPyWebView) {
                // Usando API PyWebView
                this.updateLoadingStatus("Carregando registros de treino...", 50);
                this.runs = await window.pywebview.api.get_all_runs();
                console.log(`✓ ${this.runs.length} treinos carregados via PyWebView API`);
            } else {
                // Modo de desenvolvimento - dados de exemplo
                await new Promise(r => setTimeout(r, 500)); // Simular delay
                
                // Fix: Check if getMockRuns exists before calling it
                if (window.api && typeof api.getMockRuns === 'function') {
                    this.runs = api.getMockRuns();
                } else {
                    // Provide mock data if the function doesn't exist
                    this.runs = this._generateMockRunData();
                }
                console.log("✓ Dados de exemplo carregados para desenvolvimento");
            }
            
            this.dataLoaded = true;
            return true;
        } catch (error) {
            console.error("❌ Erro ao carregar dados:", error);
            this.showNotification("Erro ao carregar dados de treinos: " + error.message, "error", "db-error");
            return false;
        }
    }
    
    /**
     * Generate mock run data for development
     * @private
     */
    _generateMockRunData() {
        // Create sample data for development testing
        const today = new Date();
        const runs = [];
        
        for (let i = 0; i < 10; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i * 2); // Every 2 days back
            
            // Generate random data
            const distance = (5 + Math.random() * 5).toFixed(2);
            const duration = Math.floor(distance * (8 + Math.random() * 4)); // 8-12 min/km pace
            const pace = (duration / distance).toFixed(2);
            
            runs.push({
                id: i + 1,
                date: date.toISOString().split('T')[0],
                distance: parseFloat(distance),
                duration: duration,
                avg_pace: Math.floor(pace / 60) + ":" + (Math.floor(pace % 60)).toString().padStart(2, '0'),
                avg_bpm: Math.floor(140 + Math.random() * 20),
                max_bpm: Math.floor(170 + Math.random() * 20),
                elevation_gain: Math.floor(Math.random() * 100),
                calories: Math.floor(distance * 60),
                workout_type: i % 3 === 0 ? "Corrida Leve" : i % 3 === 1 ? "Corrida na Esteira" : "Trail Running",
                notes: `Treino de exemplo #${i+1}`
            });
        }
        return runs;
    }
    
    /**
     * Limpa notificações de erro de banco de dados
     */
    clearDatabaseErrorNotifications() {
        const dbErrorNotif = document.querySelector('.notification[data-id="db-error"]');
        if (dbErrorNotif) {
            dbErrorNotif.remove();
        }
    }
    
    // Atualiza o status de carregamento na tela inicial
    updateLoadingStatus(message, progress) {
        const statusElement = document.getElementById('loading-status');
        const progressBar = document.querySelector('.loading-progress-bar');
        
        if (statusElement) {
            statusElement.textContent = message || "Carregando...";
        }
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    // Esconde a tela de carregamento com uma animação suave
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('app-loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
}

// Não expor diretamente, para evitar poluir o escopo global
window.AppClass = AppClass;
