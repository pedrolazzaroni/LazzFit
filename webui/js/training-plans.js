/**
 * Training Plans Module
 * Gerencia a criação e visualização de planos de treino
 */
const trainingPlans = {
    plans: [],
    currentStep: 0,
    currentPlan: null,
    
    // Verificação de inicialização para depuração
    initialized: true,
    
    /**
     * Inicialização do módulo - chamado automaticamente
     */
    init: function() {
        console.log("🔄 Inicializando módulo de planos de treino...");
        return this.initialized;
    },
    
    /**
     * Inicializa a visualização de planos de treino
     */
    initTrainingPlansView: async function() {
        console.log("Inicializando visualização de planos de treino");
        
        try {
            // Buscar todos os planos existentes
            app.showLoading();
            
            let plansData = [];
            
            // Verificação robusta da API
            if (window.pywebview && window.pywebview.api) {
                console.log("Buscando planos via API PyWebView");
                try {
                    plansData = await window.pywebview.api.get_all_training_plans();
                    console.log(`Recebidos ${plansData.length} planos de treino`);
                } catch (apiError) {
                    console.error("Erro ao buscar planos via API:", apiError);
                    throw new Error("Falha na comunicação com a API");
                }
            } else {
                console.error("API PyWebView não disponível");
                throw new Error("API de backend não disponível");
            }
            
            this.plans = plansData || [];
            this.renderTrainingPlans();
        } catch (error) {
            console.error("Erro ao carregar planos de treino:", error);
            app.showNotification("Não foi possível carregar os planos de treino: " + (error.message || "Erro desconhecido"), "error");
            // Garantir que temos um array vazio se houver erro
            this.plans = [];
            this.renderTrainingPlans();
        } finally {
            app.hideLoading();
        }
    },
    
    /**
     * Renderiza a lista de planos de treino
     */
    renderTrainingPlans: function() {
        const container = document.getElementById('training-plans-container');
        if (!container) return;
        
        // Configurar cabeçalho e botões de ação
        this._setupPlanListHeader();
        
        // Limpar container
        container.innerHTML = '';
        
        // Verificar se há planos
        if (!this.plans || this.plans.length === 0) {
            this._renderEmptyState(container);
            return;
        }
        
        // Renderizar cada plano
        this.plans.forEach(plan => {
            const planCard = this._createPlanCard(plan);
            container.appendChild(planCard);
        });
    },
    
    /**
     * Configurar cabeçalho da página de planos
     */
    _setupPlanListHeader: function() {
        const header = document.querySelector('.training-plans-view .section-header');
        if (header) {
            header.innerHTML = `
                <h2>Seus Planos de Treino</h2>
                <div class="action-buttons">
                    <button id="create-plan-btn" class="btn primary">
                        <span class="material-icons-round">add</span>
                        Novo Plano
                    </button>
                </div>
            `;
            
            document.getElementById('create-plan-btn').addEventListener('click', () => {
                app.navigate('create-plan');
            });
        }
    },
    
    /**
     * Renderiza estado vazio (sem planos)
     */
    _renderEmptyState: function(container) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round">calendar_month</span>
                <p>Você ainda não tem nenhum plano de treino.</p>
                <p>Crie um plano para organizar seus treinos semanais.</p>
                <button id="create-first-plan-btn" class="btn primary">Criar Primeiro Plano</button>
            </div>
        `;
        
        document.getElementById('create-first-plan-btn').addEventListener('click', () => {
            app.navigate('create-plan');
        });
    },
    
    /**
     * Cria um card para um plano de treino
     */
    _createPlanCard: function(plan) {
        const card = document.createElement('div');
        card.className = 'plan-card';
        card.dataset.id = plan.id;
        
        card.innerHTML = `
            <div class="plan-header">
                <h3>${plan.name}</h3>
                <span class="plan-level ${plan.level.toLowerCase()}">${plan.level}</span>
            </div>
            <div class="plan-details">
                <div class="plan-stat">
                    <span class="material-icons-round">event</span>
                    <span>${plan.duration_weeks} semanas</span>
                </div>
                <div class="plan-stat">
                    <span class="material-icons-round">flag</span>
                    <span>${plan.goal || "Sem objetivo definido"}</span>
                </div>
            </div>
            <div class="plan-actions">
                <button class="btn view-btn">Ver Plano</button>
                <button class="btn edit-btn">Editar</button>
                <button class="btn delete-btn">Excluir</button>
            </div>
        `;
        
        // Adicionar event listeners
        card.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevenir propagação do evento
            app.navigate('view-plan', { planId: plan.id });
        });
        
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevenir propagação do evento
            app.navigate('edit-plan', { planId: plan.id });
        });
        
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevenir propagação do evento
            this.confirmDeletePlan(plan.id);
        });
        
        return card;
    },
    
    /**
     * Confirmar exclusão de plano de treino
     * @param {number} planId - ID do plano a ser excluído
     */
    confirmDeletePlan: function(planId) {
        components.showConfirmation(
            'Confirmar exclusão',
            'Tem certeza que deseja excluir este plano de treino? Esta ação não pode ser desfeita.',
            () => this.deletePlan(planId),
            () => {}
        );
    },

    /**
     * Excluir plano de treino
     * @param {number} planId - ID do plano a ser excluído
     */
    deletePlan: async function(planId) {
        try {
            // Mostrar loading
            app.showLoading();
            
            let success = false;
            
            if (api.isPyWebView) {
                success = await window.pywebview.api.delete_training_plan(planId);
            } else {
                // Simulação para desenvolvimento
                console.log("Simulando exclusão do plano:", planId);
                await new Promise(r => setTimeout(r, 800));
                this.plans = this.plans.filter(plan => plan.id !== planId);
                success = true;
            }
            
            if (success) {
                app.showNotification("Plano de treino excluído com sucesso", "success");
                // Recarregar lista de planos
                if (api.isPyWebView) {
                    this.plans = await window.pywebview.api.get_all_training_plans();
                }
                this.renderTrainingPlans();
            } else {
                app.showNotification("Erro ao excluir plano de treino", "error");
            }
        } catch (error) {
            console.error("Erro ao excluir plano:", error);
            app.showNotification("Ocorreu um erro ao excluir o plano", "error");
        } finally {
            app.hideLoading();
        }
    },

    /**
     * Dados de exemplo para desenvolvimento
     */
    _getMockPlans: function() {
        return [
            {
                id: 1,
                name: "Plano para 5K",
                goal: "Completar 5K em menos de 30 minutos",
                duration_weeks: 4,
                level: "Iniciante",
                created_at: "2023-05-01 10:00:00",
                updated_at: "2023-05-15 14:30:00"
            },
            {
                id: 2,
                name: "Preparação para 10K",
                goal: "Melhorar ritmo em corridas de 10K",
                duration_weeks: 8,
                level: "Intermediário",
                created_at: "2023-06-01 09:15:00",
                updated_at: "2023-06-10 16:45:00"
            }
        ];
    },
    
    /**
     * Exibe a tela de criação de plano
     */
    showCreatePlanView: function() {
        console.log("Iniciando criação de plano de treino");
        
        try {
            // Reiniciar estado
            this.currentStep = 0;
            this.currentPlan = {
                name: '',
                goal: '',
                duration_weeks: 4,
                level: 'Iniciante',
                notes: '',
                trainingDays: {
                    1: false, // Segunda
                    2: false, // Terça
                    3: false, // Quarta
                    4: false, // Quinta
                    5: false, // Sexta
                    6: false, // Sábado
                    7: false  // Domingo
                },
                sessions: []
            };
            
            // Garantir que o container esteja vazio antes de preparar a visualização
            app.viewContainer.innerHTML = '';
            
            // Carregar template e preparar visualização
            this._prepareCreatePlanView();
            
            // Renderizar o primeiro passo
            if (typeof this._renderCreatePlanStep === 'function') {
                this._renderCreatePlanStep();
            } else {
                console.error("❌ Função _renderCreatePlanStep não encontrada!");
                app.showNotification("Erro interno: função de renderização não encontrada", "error");
                app.navigate('training-plans');
            }
        } catch (error) {
            console.error("❌ Erro ao preparar criação de plano:", error);
            app.showNotification("Erro ao iniciar tela de criação de plano", "error");
            app.navigate('training-plans');
        }
    },
    
    /**
     * Prepara a visualização de criação de plano
     */
    _prepareCreatePlanView: function() {
        const template = document.getElementById('edit-training-plan-template');
        if (!template) {
            console.error("Template de edição de plano não encontrado!");
            return;
        }
        
        const view = document.importNode(template.content, true);
        
        // Garantir que apenas conteúdo novo seja exibido
        app.viewContainer.innerHTML = '';
        app.viewContainer.appendChild(view);
        
        // Configurar cabeçalho
        const header = document.querySelector('.edit-plan-view .section-header');
        if (header) {
            header.innerHTML = `
                <h2>Criar Novo Plano de Treino</h2>
                <div class="action-buttons">
                    <button id="back-btn" class="btn">
                        <span class="material-icons-round">arrow_back</span>
                        Voltar
                    </button>
                </div>
            `;
            
            document.getElementById('back-btn').addEventListener('click', () => {
                app.navigate('training-plans');
            });
        }
        
        // Remover qualquer conteúdo antigo que possa estar presente
        const oldForm = document.querySelector('.edit-plan-view .plan-form:not(.plan-steps-container)');
        if (oldForm) {
            oldForm.remove();
        }
    }
};

// Auto-inicialização com verificação
try {
    if (trainingPlans.init()) {
        console.log("✓ Módulo trainingPlans carregado e inicializado com sucesso");
        // Expor globalmente para debugging
        window.trainingPlans = trainingPlans;
    } else {
        console.error("❌ Falha na inicialização do módulo trainingPlans");
    }
} catch (error) {
    console.error("❌ Erro durante inicialização do módulo trainingPlans:", error);
}

// Verificação de inicialização para debug
console.log("✓ Módulo trainingPlans carregado");
