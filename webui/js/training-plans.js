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
        // Registrar a implementação para que plan-view.js possa acessá-la
        this.editPlanImplementation = this.showEditPlanView;
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
        console.warn("Mock data requested but mock generation has been removed");
        return [];
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
     * Exibe a tela de edição de plano
     * @param {number} planId - ID do plano a ser editado
     */
    showEditPlanView: async function(planId) {
        console.log("Iniciando edição do plano", planId);
        
        try {
            // Mostrar loading
            app.showLoading();
            
            // Buscar dados do plano
            let planData = null;
            
            if (api.isPyWebView) {
                try {
                    planData = await window.pywebview.api.get_training_plan(planId);
                    if (!planData) {
                        throw new Error("Plano não encontrado");
                    }
                } catch (error) {
                    console.error("Erro ao buscar plano:", error);
                    throw new Error("Não foi possível carregar os dados do plano");
                }
            } else {
                // Modo de desenvolvimento - usar dados simulados
                await new Promise(r => setTimeout(r, 800));
                const mockPlans = this._getMockPlans();
                planData = mockPlans.find(p => p.id === planId);
                
                if (!planData) {
                    throw new Error("Plano simulado não encontrado");
                }
                
                // Adicionar atributos simulados para desenvolvimento
                planData.weeks = [
                    {
                        id: 1,
                        week_number: 1,
                        focus: "Adaptação",
                        notes: "Semana inicial de adaptação",
                        sessions: Array(7).fill().map((_, i) => ({
                            id: i+1,
                            day_of_week: i+1,
                            workout_type: i % 2 === 0 ? "Corrida Leve" : "Descanso",
                            distance: i % 2 === 0 ? 5 : 0,
                            duration: i % 2 === 0 ? 30 : 0,
                            intensity: i % 2 === 0 ? "Baixa" : "Nenhuma",
                            pace_target: "",
                            hr_zone: "",
                            details: ""
                        }))
                    }
                ];
            }
            
            // Configurar o plano atual com os dados carregados
            this.currentPlan = {
                id: planData.id,
                name: planData.name,
                goal: planData.goal || '',
                duration_weeks: planData.duration_weeks || 4,
                level: planData.level || 'Iniciante',
                notes: planData.notes || '',
                trainingDays: {}, // Será preenchido a partir das sessions
                sessions: [],     // Será preenchido a partir dos dados carregados
                weeks: planData.weeks || [],
                isEditing: true
            };
            
            // Preencher os dias de treino com base nas sessões da primeira semana
            if (planData.weeks && planData.weeks.length > 0) {
                const firstWeek = planData.weeks[0];
                
                firstWeek.sessions.forEach(session => {
                    const day = session.day_of_week;
                    const isTrainingDay = session.workout_type !== "Descanso";
                    
                    // Definir dias de treino
                    this.currentPlan.trainingDays[day] = isTrainingDay;
                    
                    // Converter dados da sessão para o formato esperado pelo editor
                    if (isTrainingDay) {
                        this.currentPlan.sessions.push({
                            day: day,
                            active: true,
                            workoutType: session.workout_type,
                            distance: session.distance,
                            duration: session.duration,
                            intensity: session.intensity,
                            paceTarget: session.pace_target || '',
                            hrZone: session.hr_zone || '',
                            details: session.details || ''
                        });
                    }
                });
            }
            
            // Garantir que todos os dias da semana estejam representados no trainingDays
            for (let i = 1; i <= 7; i++) {
                if (this.currentPlan.trainingDays[i] === undefined) {
                    this.currentPlan.trainingDays[i] = false;
                }
            }
            
            // Preparar a visualização de edição
            this._prepareCreatePlanView();
            
            // Atualizar o título
            const header = document.querySelector('.edit-plan-view .section-header h2');
            if (header) {
                header.textContent = `Editar Plano: ${this.currentPlan.name}`;
            }
            
            // Renderizar o primeiro passo com os dados carregados
            if (typeof this._renderCreatePlanStep === 'function') {
                this.currentStep = 0;
                this._renderCreatePlanStep();
            } else {
                throw new Error("Função de renderização não encontrada");
            }
        } catch (error) {
            console.error("Erro ao carregar plano para edição:", error);
            app.showNotification(error.message || "Erro ao carregar plano para edição", "error");
            app.navigate('training-plans');
        } finally {
            app.hideLoading();
        }
    },
    
    /**
     * Avança para o próximo passo na criação/edição do plano
     * Coleta os dados do formulário atual antes de avançar
     */
    nextStep: function() {
        // Validar e coletar dados do passo atual
        if (!this._validateCurrentStep()) {
            return false;
        }
        
        // Coletar dados do formulário atual
        this._collectFormData();
        
        // Avançar para o próximo passo
        this.currentStep++;
        
        // Renderizar o próximo passo
        this._renderCreatePlanStep();
        return true;
    },
    
    /**
     * Retorna ao passo anterior na criação/edição do plano
     */
    previousStep: function() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this._renderCreatePlanStep();
        }
    },
    
    /**
     * Valida os dados do passo atual
     * @returns {boolean} - True se os dados são válidos, false caso contrário
     */
    _validateCurrentStep: function() {
        // Implementar validação específica para cada passo
        switch(this.currentStep) {
            case 0: // Informações básicas
                const nameField = document.getElementById('plan-name');
                if (!nameField || !nameField.value.trim()) {
                    app.showNotification("O nome do plano é obrigatório", "error");
                    if (nameField) nameField.focus();
                    return false;
                }
                
                const durationField = document.getElementById('plan-duration');
                if (durationField) {
                    const duration = parseInt(durationField.value);
                    if (isNaN(duration) || duration < 1 || duration > 52) {
                        app.showNotification("Duração do plano deve ser entre 1 e 52 semanas", "error");
                        durationField.focus();
                        return false;
                    }
                }
                break;
                
            case 1: // Dias de treino
                // Verificar se pelo menos um dia foi selecionado
                const selectedDays = Object.values(this.currentPlan.trainingDays).filter(Boolean).length;
                if (selectedDays === 0) {
                    app.showNotification("Selecione pelo menos um dia de treino", "error");
                    return false;
                }
                break;
                
            case 2: // Configuração das sessões
                // Verificar se todas as sessões têm pelo menos um tipo
                const hasInvalidSessions = this.currentPlan.sessions.some(
                    session => session.active && !session.workoutType
                );
                
                if (hasInvalidSessions) {
                    app.showNotification("Todas as sessões ativas precisam ter um tipo de treino", "error");
                    return false;
                }
                break;
        }
        
        return true;
    },
    
    /**
     * Coleta os dados do formulário atual
     */
    _collectFormData: function() {
        switch(this.currentStep) {
            case 0: // Informações básicas
                const nameField = document.getElementById('plan-name');
                const goalField = document.getElementById('plan-goal');
                const durationField = document.getElementById('plan-duration');
                const levelField = document.getElementById('plan-level');
                const notesField = document.getElementById('plan-notes');
                
                if (nameField) this.currentPlan.name = nameField.value.trim();
                if (goalField) this.currentPlan.goal = goalField.value.trim();
                if (durationField) this.currentPlan.duration_weeks = parseInt(durationField.value) || 4;
                if (levelField) this.currentPlan.level = levelField.value;
                if (notesField) this.currentPlan.notes = notesField.value.trim();
                break;
                
            case 1: // Dias de treino
                // Coletar dias selecionados
                const dayCheckboxes = document.querySelectorAll('.day-selector input[type="checkbox"]');
                dayCheckboxes.forEach(checkbox => {
                    const day = parseInt(checkbox.dataset.day);
                    if (!isNaN(day)) {
                        this.currentPlan.trainingDays[day] = checkbox.checked;
                    }
                });
                break;
                
            case 2: // Configuração das sessões
                // Coletar dados das sessões
                // Esta função depende da estrutura específica do seu form de sessões
                this._collectSessionsData();
                break;
        }
    },
    
    /**
     * Coleta os dados específicos das sessões de treino
     */
    _collectSessionsData: function() {
        // Se o currentPlan não tiver a propriedade sessions, inicializamos
        if (!this.currentPlan.sessions) this.currentPlan.sessions = [];
        
        // Para cada dia de treinamento, coletamos os dados do formulário
        const sessionForms = document.querySelectorAll('.session-config');
        
        sessionForms.forEach(form => {
            const dayIndex = parseInt(form.dataset.day);
            if (isNaN(dayIndex)) return;
            
            // Se não existe sessão para este dia, criamos uma
            let sessionIndex = this.currentPlan.sessions.findIndex(s => s.day === dayIndex);
            if (sessionIndex === -1) {
                this.currentPlan.sessions.push({
                    day: dayIndex,
                    active: this.currentPlan.trainingDays[dayIndex],
                    workoutType: '',
                    distance: 0,
                    duration: 0,
                    intensity: 'Baixa',
                    paceTarget: '',
                    hrZone: '',
                    details: ''
                });
                sessionIndex = this.currentPlan.sessions.length - 1;
            }
            
            // Verifica se o dia está ativo para treino
            const active = this.currentPlan.trainingDays[dayIndex];
            
            if (active) {
                // Coleta os dados do formulário
                const typeField = form.querySelector('.workout-type');
                const distanceField = form.querySelector('.workout-distance');
                const durationField = form.querySelector('.workout-duration');
                const intensityField = form.querySelector('.workout-intensity');
                const paceField = form.querySelector('.workout-pace');
                const hrZoneField = form.querySelector('.workout-hr-zone');
                const detailsField = form.querySelector('.workout-details');
                
                const session = this.currentPlan.sessions[sessionIndex];
                
                if (typeField) session.workoutType = typeField.value;
                if (distanceField) session.distance = parseFloat(distanceField.value) || 0;
                if (durationField) session.duration = parseInt(durationField.value) || 0;
                if (intensityField) session.intensity = intensityField.value;
                if (paceField) session.paceTarget = paceField.value;
                if (hrZoneField) session.hrZone = hrZoneField.value;
                if (detailsField) session.details = detailsField.value;
                
                // Atualiza no array
                this.currentPlan.sessions[sessionIndex] = session;
            }
        });
    },
    
    /**
     * Salva o plano atual no banco de dados
     */
    savePlan: async function() {
        console.log("Salvando plano...");
        
        // Validar plano antes de salvar
        if (!this._validatePlan()) {
            return false;
        }
        
        try {
            app.showLoading();
            
            // Preparar dados para envio
            const planData = this._preparePlanDataForSave();
            console.log("Dados do plano a serem salvos:", planData);
            
            let success = false;
            let planId = null;
            
            // Verificar se estamos editando ou criando
            const isEditing = this.currentPlan.id !== undefined;
            
            if (api.isPyWebView) {
                try {
                    if (isEditing) {
                        // Enviar plano completo para atualização
                        planId = await window.pywebview.api.update_training_plan_complete(
                            planData
                        );
                        
                        console.log("Resposta da API para atualização:", planId);
                        success = planId !== null && planId !== undefined;
                    } else {
                        // Criar novo plano
                        planId = await window.pywebview.api.create_training_plan_complete(
                            planData
                        );
                        
                        console.log("Resposta da API para criação:", planId);
                        success = planId !== null && planId !== undefined;
                    }
                } catch (apiError) {
                    console.error("Erro na API ao salvar plano:", apiError);
                    throw new Error("Falha na comunicação com a API");
                }
            } else {
                // Modo de desenvolvimento - simulação
                console.log("SIMULAÇÃO: Salvando plano:", planData);
                await new Promise(r => setTimeout(r, 1000));
                success = true;
                planId = this.currentPlan.id || 999;
            }
            
            if (success) {
                app.showNotification(
                    isEditing ? "Plano atualizado com sucesso!" : "Plano criado com sucesso!", 
                    "success"
                );
                
                // Navegar para a visualização do plano
                setTimeout(() => {
                    app.navigate('view-plan', { planId });
                }, 1000);
                
                return true;
            } else {
                throw new Error("Falha ao salvar o plano");
            }
        } catch (error) {
            console.error("Erro ao salvar plano:", error);
            app.showNotification("Erro ao salvar plano: " + (error.message || "Falha desconhecida"), "error");
            return false;
        } finally {
            app.hideLoading();
        }
    },
    
    /**
     * Valida o plano completo antes de salvar
     * @returns {boolean} - True se o plano é válido, false caso contrário
     */
    _validatePlan: function() {
        // Verificar dados básicos
        if (!this.currentPlan.name) {
            app.showNotification("O nome do plano é obrigatório", "error");
            return false;
        }
        
        if (!this.currentPlan.duration_weeks || this.currentPlan.duration_weeks < 1) {
            app.showNotification("A duração do plano é inválida", "error");
            return false;
        }
        
        // Verificar se há dias de treino selecionados
        const selectedDays = Object.values(this.currentPlan.trainingDays).filter(Boolean).length;
        if (selectedDays === 0) {
            app.showNotification("Selecione pelo menos um dia de treino", "error");
            return false;
        }
        
        // Verificar se todas as sessões de dias ativos têm tipo de treino
        if (this.currentPlan.sessions) {
            const activeSessions = this.currentPlan.sessions.filter(
                session => this.currentPlan.trainingDays[session.day]
            );
            
            const hasInvalidSessions = activeSessions.some(session => !session.workoutType);
            
            if (hasInvalidSessions) {
                app.showNotification("Todas as sessões ativas precisam ter um tipo de treino", "error");
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Prepara os dados do plano para salvar no banco
     * @returns {Object} - Dados formatados para salvar
     */
    _preparePlanDataForSave: function() {
        // Criar estrutura de dados compatível com o formato esperado pelo backend
        const planData = {
            name: this.currentPlan.name,
            goal: this.currentPlan.goal || "",
            duration_weeks: parseInt(this.currentPlan.duration_weeks),
            level: this.currentPlan.level || "Iniciante",
            notes: this.currentPlan.notes || "",
            trainingDays: {}
        };
        
        // Converter trainingDays para garantir formato correto
        for (const [day, isSelected] of Object.entries(this.currentPlan.trainingDays)) {
            planData.trainingDays[day] = Boolean(isSelected);
        }
        
        // Se estivermos editando, mantemos o ID
        if (this.currentPlan.id !== undefined) {
            planData.id = this.currentPlan.id;
        }
        
        // Preparar sessões para salvar
        planData.sessions = [];
        this.currentPlan.sessions.forEach(session => {
            const isTrainingDay = this.currentPlan.trainingDays[session.day];
            
            if (isTrainingDay) {
                planData.sessions.push({
                    day: session.day,
                    workout_type: session.workoutType || "Corrida Leve",
                    distance: parseFloat(session.distance) || 0,
                    duration: parseInt(session.duration) || 0,
                    intensity: session.intensity || "Baixa",
                    pace_target: session.paceTarget || "",
                    hr_zone: session.hrZone || "",
                    details: session.details || ""
                });
            } else {
                // Dias de descanso também são incluídos para consistência
                planData.sessions.push({
                    day: session.day,
                    workout_type: "Descanso",
                    distance: 0,
                    duration: 0,
                    intensity: "Nenhuma",
                    pace_target: "",
                    hr_zone: "",
                    details: ""
                });
            }
        });
        
        // Organizar semanas apenas se estivermos editando e houver dados existentes
        if (this.currentPlan.weeks && this.currentPlan.weeks.length > 0) {
            planData.weeks = [];
            
            // Copiar estrutura básica de semanas
            for (let i = 0; i < this.currentPlan.weeks.length; i++) {
                const originalWeek = this.currentPlan.weeks[i];
                
                const week = {
                    id: originalWeek.id,
                    week_number: originalWeek.week_number,
                    focus: originalWeek.focus || `Semana ${i+1}`,
                    notes: originalWeek.notes || "",
                    sessions: [],
                    total_distance: 0
                };
                
                // Para cada dia da semana, criar ou atualizar sessão
                for (let day = 1; day <= 7; day++) {
                    const isTrainingDay = planData.trainingDays[day];
                    const sessionTemplate = planData.sessions.find(s => s.day === day);
                    
                    // Encontrar sessão existente para este dia nesta semana
                    const existingSession = originalWeek.sessions.find(s => s.day_of_week === day);
                    
                    if (existingSession) {
                        // Atualizar sessão existente
                        const session = {
                            id: existingSession.id,
                            day_of_week: day,
                            week_id: week.id,
                            workout_type: isTrainingDay ? (sessionTemplate ? sessionTemplate.workout_type : "Corrida Leve") : "Descanso",
                            distance: isTrainingDay ? (sessionTemplate ? sessionTemplate.distance : 0) : 0,
                            duration: isTrainingDay ? (sessionTemplate ? sessionTemplate.duration : 0) : 0,
                            intensity: isTrainingDay ? (sessionTemplate ? sessionTemplate.intensity : "Baixa") : "Nenhuma",
                            pace_target: isTrainingDay ? (sessionTemplate ? sessionTemplate.pace_target : "") : "",
                            hr_zone: isTrainingDay ? (sessionTemplate ? sessionTemplate.hr_zone : "") : "",
                            details: isTrainingDay ? (sessionTemplate ? sessionTemplate.details : "") : ""
                        };
                        
                        week.sessions.push(session);
                        
                        // Acumular distância para o total semanal
                        if (isTrainingDay) {
                            week.total_distance += parseFloat(session.distance) || 0;
                        }
                    }
                }
                
                planData.weeks.push(week);
            }
        }
        
        return planData;
    },
    
    /**
     * Finaliza o processo de criação/edição e salva o plano
     */
    finishPlanCreation: async function() {
        // Validar e coletar dados do último passo
        if (!this._validateCurrentStep()) {
            return false;
        }
        
        // Coletar dados do formulário atual
        this._collectFormData();
        
        // Salvar o plano
        return await this.savePlan();
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
