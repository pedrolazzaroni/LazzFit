/**
 * Implementa as etapas do processo de criação de plano
 * Este arquivo é uma extensão do módulo trainingPlans
 */

// Renderiza a etapa atual da criação de plano
trainingPlans._renderCreatePlanStep = function() {
    const container = document.querySelector('.edit-plan-view');
    if (!container) return;
    
    // Criar ou obter container de etapas
    let stepContainer = container.querySelector('.plan-steps-container');
    if (!stepContainer) {
        stepContainer = document.createElement('div');
        stepContainer.className = 'plan-steps-container';
        container.appendChild(stepContainer);
    }
    
    // Criar indicador de progresso
    this._createProgressIndicator(container);
    
    // Limpar container de etapas
    stepContainer.innerHTML = '';
    
    // Renderizar conteúdo da etapa atual
    switch (this.currentStep) {
        case 0:
            this._renderPlanInfoStep(stepContainer);
            break;
        case 1:
            this._renderTrainingDaysStep(stepContainer);
            break;
        case 2:
            this._renderTrainingDetailsStep(stepContainer);
            break;
        case 3:
            this._renderPlanReviewStep(stepContainer);
            break;
    }
};

// Cria indicador de progresso para as etapas
trainingPlans._createProgressIndicator = function(container) {
    let progressContainer = container.querySelector('.progress-indicator');
    
    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.className = 'progress-indicator';
        
        const steps = [
            { icon: 'description', label: 'Informações' },
            { icon: 'date_range', label: 'Dias de Treino' },
            { icon: 'fitness_center', label: 'Detalhes' },
            { icon: 'check_circle', label: 'Revisão' }
        ];
        
        const stepsHTML = steps.map((step, index) => `
            <div class="progress-step ${index === this.currentStep ? 'active' : ''}">
                <div class="step-icon">
                    <span class="material-icons-round">${step.icon}</span>
                </div>
                <div class="step-label">${step.label}</div>
            </div>
        `).join('');
        
        progressContainer.innerHTML = stepsHTML;
        container.insertBefore(progressContainer, container.querySelector('.plan-steps-container'));
    } else {
        // Atualizar etapa ativa
        const steps = progressContainer.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            if (index === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
};

// Etapa 1: Informações básicas do plano
trainingPlans._renderPlanInfoStep = function(container) {
    container.innerHTML = `
        <div class="plan-step-content">
            <h3>Informações Básicas do Plano</h3>
            <p class="step-description">Defina o nome e as características gerais do seu plano de treino.</p>
            
            <form id="plan-info-form" class="plan-form">
                <div class="form-group">
                    <label for="plan-name">Nome do Plano*</label>
                    <input type="text" id="plan-name" value="${this.currentPlan.name}" placeholder="ex: Preparação para 10K" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="plan-duration">Duração (semanas)*</label>
                        <select id="plan-duration">
                            ${[1, 2, 4, 6, 8, 10, 12, 16, 20].map(weeks => 
                                `<option value="${weeks}" ${this.currentPlan.duration_weeks === weeks ? 'selected' : ''}>${weeks} semanas</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="plan-level">Nível do Atleta*</label>
                        <select id="plan-level">
                            ${['Iniciante', 'Intermediário', 'Avançado'].map(level => 
                                `<option value="${level}" ${this.currentPlan.level === level ? 'selected' : ''}>${level}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="plan-goal">Objetivo do Plano</label>
                    <input type="text" id="plan-goal" value="${this.currentPlan.goal}" placeholder="ex: Melhorar resistência para corrida de 10K">
                </div>
                
                <div class="form-group">
                    <label for="plan-notes">Notas Adicionais</label>
                    <textarea id="plan-notes" rows="3" placeholder="Observações e instruções gerais">${this.currentPlan.notes}</textarea>
                </div>
            </form>
        </div>
        
        <div class="step-actions">
            <button class="btn" id="cancel-create-btn">Cancelar</button>
            <button class="btn primary" id="next-step-btn">Próximo</button>
        </div>
    `;
    
    // Configurar event listeners
    document.getElementById('cancel-create-btn').addEventListener('click', () => {
        app.navigate('training-plans');
    });
    
    document.getElementById('next-step-btn').addEventListener('click', () => {
        if (!this._validatePlanInfoStep()) return;
        
        // Salvar dados do formulário
        this._savePlanInfoStep();
        
        // Ir para próxima etapa
        this.currentStep = 1;
        this._renderCreatePlanStep();
    });
};

// Valida os campos da etapa de informações do plano
trainingPlans._validatePlanInfoStep = function() {
    const nameField = document.getElementById('plan-name');
    
    if (!nameField.value.trim()) {
        app.showNotification('Por favor, insira um nome para o plano de treino', 'error');
        nameField.focus();
        return false;
    }
    
    return true;
};

// Salva os dados da etapa de informações do plano
trainingPlans._savePlanInfoStep = function() {
    this.currentPlan.name = document.getElementById('plan-name').value;
    this.currentPlan.duration_weeks = parseInt(document.getElementById('plan-duration').value);
    this.currentPlan.level = document.getElementById('plan-level').value;
    this.currentPlan.goal = document.getElementById('plan-goal').value;
    this.currentPlan.notes = document.getElementById('plan-notes').value;
};
