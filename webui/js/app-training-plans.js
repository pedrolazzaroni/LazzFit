/**
 * App Training Plans Module
 * Contains training plans-related methods for the App class
 */

// Extend App prototype with training plans-related methods
(function(App) {
    /**
     * Show the training plans view
     */
    App.prototype.showTrainingPlans = function() {
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
            
            // Verificar explicitamente se o módulo e a API estão disponíveis
            if (typeof window.trainingPlans === 'undefined') {
                console.error("❌ Módulo trainingPlans não encontrado");
                this._loadTrainingPlansModule();
                this.showNotification("Carregando módulos de planos de treino...", "info");
                return;
            }
            
            if (!window.pywebview || !window.pywebview.api) {
                console.error("❌ API PyWebView não disponível");
                this.showNotification("API não disponível. Verifique a conexão com o backend.", "error");
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
            this.showNotification("Ocorreu um erro inesperado ao exibir planos de treino. Consulte o console para mais detalhes.", "error");
        }
    };

    /**
     * Show the create plan view
     */
    App.prototype.showCreatePlan = function() {
        console.log("🔄 Mostrando tela de criação de plano");
        
        try {
            // Verificar se o módulo e a função existem
            if (typeof window.trainingPlans === 'undefined' || typeof trainingPlans.showCreatePlanView !== 'function') {
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
    };

    /**
     * Show the view plan details
     * @param {Object} params - Parameters including the plan ID
     */
    App.prototype.showViewPlan = function(params) {
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
    };

    /**
     * Show the edit plan view
     * @param {Object} params - Parameters including the plan ID
     */
    App.prototype.showEditPlan = function(params) {
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
    };

    /**
     * Helper method to dynamically load training plans module if not found
     * @private
     */
    App.prototype._loadTrainingPlansModule = function() {
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
    };
})(window.AppClass);
