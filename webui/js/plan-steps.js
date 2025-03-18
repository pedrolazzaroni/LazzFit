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
        container.insertBefore(progressContainer, container.querySelector('.plan-steps-container') || container.firstChild);
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

// Etapa 2: Seleção de dias de treino
trainingPlans._renderTrainingDaysStep = function(container) {
    container.innerHTML = `
        <div class="plan-step-content">
            <h3>Dias de Treino</h3>
            <p class="step-description">Selecione os dias da semana em que você pretende treinar.</p>
            
            <form id="training-days-form" class="plan-form">
                <div class="week-days-selector">
                    ${this._createTrainingDaysSelector()}
                </div>
                <div class="form-info">
                    <p>É recomendado incluir dias de descanso na sua rotina de treinos para recuperação muscular.</p>
                </div>
            </form>
        </div>
        
        <div class="step-actions">
            <button class="btn" id="prev-step-btn">Voltar</button>
            <button class="btn primary" id="next-step-btn">Próximo</button>
        </div>
    `;
    
    // Configurar event listeners
    document.getElementById('prev-step-btn').addEventListener('click', () => {
        this.previousStep();
    });
    
    document.getElementById('next-step-btn').addEventListener('click', () => {
        if (!this._validateTrainingDaysStep()) return;
        
        // Salvar dados do formulário
        this._saveTrainingDaysStep();
        
        // Ir para próxima etapa
        this.currentStep = 2;
        this._renderCreatePlanStep();
    });
};

// Cria o seletor de dias de treino com melhor tratamento de dados
trainingPlans._createTrainingDaysSelector = function() {
    const dayNames = [
        "Segunda", "Terça", "Quarta", "Quinta", 
        "Sexta", "Sábado", "Domingo"
    ];
    
    let html = '';
    
    dayNames.forEach((day, index) => {
        const dayNum = index + 1;
        // Garantir que estamos tratando os valores como booleanos
        const isChecked = this.currentPlan.trainingDays[dayNum] === true ? 'checked' : '';
        
        html += `
            <div class="day-selector">
                <input type="checkbox" id="day-${dayNum}" data-day="${dayNum}" ${isChecked}>
                <label for="day-${dayNum}">
                    <span class="day-name">${day}</span>
                    <span class="day-abbr">${day.substring(0, 3)}</span>
                </label>
            </div>
        `;
    });
    
    return html;
};

// Valida a etapa de seleção de dias
trainingPlans._validateTrainingDaysStep = function() {
    // Verificar se pelo menos um dia foi selecionado
    const checkboxes = document.querySelectorAll('.day-selector input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        app.showNotification('Selecione pelo menos um dia de treino', 'error');
        return false;
    }
    
    return true;
};

// Salva os dados da etapa de seleção de dias
trainingPlans._saveTrainingDaysStep = function() {
    const checkboxes = document.querySelectorAll('.day-selector input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        const day = parseInt(checkbox.dataset.day);
        this.currentPlan.trainingDays[day] = checkbox.checked;
    });
};

// Etapa 3: Configuração detalhada de sessões de treino com melhor interface
trainingPlans._renderTrainingDetailsStep = function(container) {
    container.innerHTML = `
        <div class="plan-step-content">
            <h3>Configuração das Sessões de Treino</h3>
            <p class="step-description">Configure o tipo e os detalhes de cada sessão de treino semanal.</p>
            
            <form id="training-sessions-form" class="plan-form">
                <div class="sessions-container">
                    ${this._createSessionsConfig()}
                </div>
            </form>
        </div>
        
        <div class="step-actions">
            <button class="btn" id="prev-step-btn">Voltar</button>
            <button class="btn primary" id="next-step-btn">Próximo</button>
        </div>
    `;
    
    // Configurar event listeners
    document.getElementById('prev-step-btn').addEventListener('click', () => {
        this.previousStep();
    });
    
    document.getElementById('next-step-btn').addEventListener('click', () => {
        if (!this._validateSessionsStep()) return;
        
        // Salvar dados do formulário
        this._saveSessionsStep();
        
        // Ir para próxima etapa
        this.currentStep = 3;
        this._renderCreatePlanStep();
    });
    
    // Inicializar campos de sessão
    this._initSessionsFields();
};

// Cria a configuração das sessões com base nos dias selecionados
trainingPlans._createSessionsConfig = function() {
    const dayNames = [
        "Segunda", "Terça", "Quarta", "Quinta", 
        "Sexta", "Sábado", "Domingo"
    ];
    
    let html = '';
    
    // Para cada dia da semana
    for (let i = 1; i <= 7; i++) {
        // Verificar se o dia está selecionado para treino
        const isActiveDay = this.currentPlan.trainingDays[i] || false;
        
        // Se não for dia de treino, continuar para o próximo
        if (!isActiveDay) continue;
        
        // Buscar dados existentes desta sessão, se houver
        const sessionData = this.currentPlan.sessions.find(s => s.day === i) || {
            workoutType: "Corrida Leve",
            distance: 5,
            duration: 30,
            intensity: "Baixa",
            paceTarget: "",
            hrZone: "",
            details: ""
        };
        
        html += `
            <div class="session-config" data-day="${i}">
                <div class="session-header">
                    <h4>${dayNames[i-1]}</h4>
                </div>
                <div class="session-fields">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="workout-type-${i}">Tipo de Treino</label>
                            <select id="workout-type-${i}" class="workout-type">
                                <option value="Corrida Leve" ${sessionData.workoutType === "Corrida Leve" ? "selected" : ""}>Corrida Leve</option>
                                <option value="Treino de Ritmo" ${sessionData.workoutType === "Treino de Ritmo" ? "selected" : ""}>Treino de Ritmo</option>
                                <option value="Intervalado" ${sessionData.workoutType === "Intervalado" ? "selected" : ""}>Intervalado</option>
                                <option value="Long Run" ${sessionData.workoutType === "Long Run" ? "selected" : ""}>Long Run</option>
                                <option value="Recuperação" ${sessionData.workoutType === "Recuperação" ? "selected" : ""}>Recuperação</option>
                                <option value="Fartlek" ${sessionData.workoutType === "Fartlek" ? "selected" : ""}>Fartlek</option>
                                <option value="Cross Training" ${sessionData.workoutType === "Cross Training" ? "selected" : ""}>Cross Training</option>
                                <option value="Outro" ${sessionData.workoutType === "Outro" ? "selected" : ""}>Outro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="workout-intensity-${i}">Intensidade</label>
                            <select id="workout-intensity-${i}" class="workout-intensity">
                                <option value="Muito Baixa" ${sessionData.intensity === "Muito Baixa" ? "selected" : ""}>Muito Baixa</option>
                                <option value="Baixa" ${sessionData.intensity === "Baixa" ? "selected" : ""}>Baixa</option>
                                <option value="Média" ${sessionData.intensity === "Média" ? "selected" : ""}>Média</option>
                                <option value="Alta" ${sessionData.intensity === "Alta" ? "selected" : ""}>Alta</option>
                                <option value="Muito Alta" ${sessionData.intensity === "Muito Alta" ? "selected" : ""}>Muito Alta</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="workout-distance-${i}">Distância (km)</label>
                            <input type="number" id="workout-distance-${i}" class="workout-distance" value="${sessionData.distance}" min="0" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="workout-duration-${i}">Duração (min)</label>
                            <input type="number" id="workout-duration-${i}" class="workout-duration" value="${sessionData.duration}" min="0">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="workout-pace-${i}">Ritmo Alvo</label>
                            <input type="text" id="workout-pace-${i}" class="workout-pace" value="${sessionData.paceTarget}" placeholder="ex: 5:30/km">
                        </div>
                        <div class="form-group">
                            <label for="workout-hr-${i}">Zona de FC</label>
                            <input type="text" id="workout-hr-${i}" class="workout-hr-zone" value="${sessionData.hrZone}" placeholder="ex: Z2, 140-150 BPM">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="workout-details-${i}">Detalhes</label>
                        <textarea id="workout-details-${i}" class="workout-details" rows="2" placeholder="Instruções específicas para este treino">${sessionData.details}</textarea>
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;
};

// Inicializa campos especiais do formulário de sessões
trainingPlans._initSessionsFields = function() {
    // Esta função pode ser usada para inicializar datepickers, máscaras de input, etc.
    // Poderia ser implementada no futuro se necessário
};

// Valida as sessões de treino
trainingPlans._validateSessionsStep = function() {
    // Verificar dados básicos de cada sessão
    const sessions = document.querySelectorAll('.session-config');
    let isValid = true;
    
    sessions.forEach(session => {
        const workoutType = session.querySelector('.workout-type').value;
        const distance = parseFloat(session.querySelector('.workout-distance').value);
        const duration = parseInt(session.querySelector('.workout-duration').value);
        
        if (!workoutType) {
            app.showNotification("Selecione um tipo de treino para todas as sessões", "error");
            isValid = false;
            return;
        }
        
        if (isNaN(distance) || distance < 0) {
            app.showNotification("Informe uma distância válida para todas as sessões", "error");
            isValid = false;
            return;
        }
        
        if (isNaN(duration) || duration < 0) {
            app.showNotification("Informe uma duração válida para todas as sessões", "error");
            isValid = false;
            return;
        }
    });
    
    return isValid;
};

// Salva os dados das sessões
trainingPlans._saveSessionsStep = function() {
    const sessions = document.querySelectorAll('.session-config');
    
    // Limpar sessões anteriores e adicionar as atualizadas
    this.currentPlan.sessions = [];
    
    sessions.forEach(session => {
        const dayIndex = parseInt(session.dataset.day);
        if (isNaN(dayIndex)) return;
        
        this.currentPlan.sessions.push({
            day: dayIndex,
            active: true,
            workoutType: session.querySelector('.workout-type').value,
            distance: parseFloat(session.querySelector('.workout-distance').value) || 0,
            duration: parseInt(session.querySelector('.workout-duration').value) || 0,
            intensity: session.querySelector('.workout-intensity').value,
            paceTarget: session.querySelector('.workout-pace').value,
            hrZone: session.querySelector('.workout-hr-zone').value,
            details: session.querySelector('.workout-details').value
        });
    });
    
    // Adicionar dias inativos como sessões vazias
    for (let i = 1; i <= 7; i++) {
        if (!this.currentPlan.trainingDays[i]) {
            this.currentPlan.sessions.push({
                day: i,
                active: false,
                workoutType: "Descanso",
                distance: 0,
                duration: 0,
                intensity: "Nenhuma",
                paceTarget: "",
                hrZone: "",
                details: ""
            });
        }
    }
};

// Etapa 4: Revisão e finalização do plano com layout melhorado
trainingPlans._renderPlanReviewStep = function(container) {
    const dayNames = [
        "Segunda", "Terça", "Quarta", "Quinta", 
        "Sexta", "Sábado", "Domingo"
    ];
    
    // Calcular totais do plano
    const totalDistance = this.currentPlan.sessions
        .filter(s => s.active)
        .reduce((total, session) => total + (parseFloat(session.distance) || 0), 0);
    
    const totalDuration = this.currentPlan.sessions
        .filter(s => s.active)
        .reduce((total, session) => total + (parseInt(session.duration) || 0), 0);
    
    const totalHours = Math.floor(totalDuration / 60);
    const totalMinutes = totalDuration % 60;
    
    // Criar HTML para cada sessão ativa
    let sessionsHTML = '';
    
    for (let i = 1; i <= 7; i++) {
        // Encontrar a sessão para este dia
        const session = this.currentPlan.sessions.find(s => s.day === i);
        if (!session || !this.currentPlan.trainingDays[i]) continue;
        
        sessionsHTML += `
            <div class="review-session">
                <div class="day-column">
                    <span class="day-name">${dayNames[i-1]}</span>
                </div>
                <div class="session-details">
                    <div class="session-main-info">
                        <span class="workout-type">${session.workoutType}</span>
                        <span class="workout-metrics">${parseFloat(session.distance).toFixed(1)} km • ${session.duration} min • ${session.intensity}</span>
                    </div>
                    ${session.paceTarget || session.hrZone ? `
                        <div class="session-secondary-info">
                            ${session.paceTarget ? `<span class="pace">Ritmo: ${session.paceTarget}</span>` : ''}
                            ${session.hrZone ? `<span class="hr-zone">FC: ${session.hrZone}</span>` : ''}
                        </div>
                    ` : ''}
                    ${session.details ? `
                        <div class="session-notes">
                            <span>${session.details}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="plan-step-content">
            <h3>Revisão do Plano</h3>
            <p class="step-description">Revise os detalhes do seu plano de treino antes de finalizar.</p>
            
            <div class="plan-review">
                <div class="plan-summary">
                    <h4>${this.currentPlan.name}</h4>
                    <div class="plan-meta">
                        <div class="meta-item">
                            <span class="meta-label">Duração:</span>
                            <span class="meta-value">${this.currentPlan.duration_weeks} semanas</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Nível:</span>
                            <span class="meta-value">${this.currentPlan.level}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Objetivo:</span>
                            <span class="meta-value">${this.currentPlan.goal || "Não especificado"}</span>
                        </div>
                    </div>
                    
                    <div class="plan-weekly-stats">
                        <div class="weekly-stat">
                            <span class="stat-value">${totalDistance.toFixed(1)} km</span>
                            <span class="stat-label">Distância Semanal</span>
                        </div>
                        <div class="weekly-stat">
                            <span class="stat-value">${totalHours}h ${totalMinutes}min</span>
                            <span class="stat-label">Tempo Total Semanal</span>
                        </div>
                        <div class="weekly-stat">
                            <span class="stat-value">${Object.values(this.currentPlan.trainingDays).filter(Boolean).length}</span>
                            <span class="stat-label">Dias de Treino</span>
                        </div>
                    </div>
                </div>
                
                <div class="weekly-schedule">
                    <h4>Programação Semanal</h4>
                    <div class="sessions-list">
                        ${sessionsHTML || '<p>Nenhuma sessão de treino configurada.</p>'}
                    </div>
                </div>
                
                ${this.currentPlan.notes ? `
                    <div class="plan-notes">
                        <h4>Notas</h4>
                        <p>${this.currentPlan.notes}</p>
                    </div>
                ` : ''}
            </div>
        </div>
        
        <div class="step-actions">
            <button class="btn" id="prev-step-btn">Voltar</button>
            <button class="btn primary" id="finish-btn">
                ${this.currentPlan.isEditing ? 'Atualizar Plano' : 'Finalizar Plano'}
            </button>
        </div>
    `;
    
    // Configurar event listeners
    document.getElementById('prev-step-btn').addEventListener('click', () => {
        this.previousStep();
    });
    
    document.getElementById('finish-btn').addEventListener('click', () => {
        this.finishPlanCreation();
    });
};
