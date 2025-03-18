/**
 * Implementa a seleção de dias de treino
 * Este arquivo é uma extensão do módulo trainingPlans
 */

// Etapa 2: Seleção de dias de treino
trainingPlans._renderTrainingDaysStep = function(container) {
    const daysOfWeek = [
        { id: 1, name: 'Segunda-feira', shortName: 'Seg' },
        { id: 2, name: 'Terça-feira', shortName: 'Ter' },
        { id: 3, name: 'Quarta-feira', shortName: 'Qua' },
        { id: 4, name: 'Quinta-feira', shortName: 'Qui' },
        { id: 5, name: 'Sexta-feira', shortName: 'Sex' },
        { id: 6, name: 'Sábado', shortName: 'Sáb' },
        { id: 7, name: 'Domingo', shortName: 'Dom' }
    ];
    
    container.innerHTML = `
        <div class="plan-step-content">
            <h3>Selecionar Dias de Treino</h3>
            <p class="step-description">Escolha os dias da semana em que você pretende treinar.</p>
            
            <div class="days-selection-container">
                ${daysOfWeek.map(day => `
                    <div class="day-option ${this.currentPlan.trainingDays[day.id] ? 'selected' : ''}" data-day="${day.id}">
                        <div class="day-check">
                            <span class="material-icons-round">${this.currentPlan.trainingDays[day.id] ? 'check_circle' : 'radio_button_unchecked'}</span>
                        </div>
                        <div class="day-label">
                            <div class="day-name">${day.name}</div>
                            <div class="day-status">${this.currentPlan.trainingDays[day.id] ? 'Treino' : 'Descanso'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="selected-summary">
                <p><span id="selected-days-count">0</span> dias de treino selecionados</p>
                <p class="warning ${Object.values(this.currentPlan.trainingDays).filter(Boolean).length === 0 ? 'visible' : ''}">
                    <span class="material-icons-round">warning</span>
                    Por favor, selecione pelo menos um dia de treino
                </p>
            </div>
        </div>
        
        <div class="step-actions">
            <button class="btn" id="prev-step-btn">Voltar</button>
            <button class="btn primary" id="next-step-btn">Próximo</button>
        </div>
    `;
    
    // Atualizar contador de dias selecionados
    this._updateSelectedDaysCount();
    
    // Configurar event listeners
    document.querySelectorAll('.day-option').forEach(dayOption => {
        dayOption.addEventListener('click', () => {
            const dayId = parseInt(dayOption.dataset.day);
            this.currentPlan.trainingDays[dayId] = !this.currentPlan.trainingDays[dayId];
            
            if (this.currentPlan.trainingDays[dayId]) {
                dayOption.classList.add('selected');
                dayOption.querySelector('.material-icons-round').textContent = 'check_circle';
                dayOption.querySelector('.day-status').textContent = 'Treino';
            } else {
                dayOption.classList.remove('selected');
                dayOption.querySelector('.material-icons-round').textContent = 'radio_button_unchecked';
                dayOption.querySelector('.day-status').textContent = 'Descanso';
            }
            
            this._updateSelectedDaysCount();
        });
    });
    
    document.getElementById('prev-step-btn').addEventListener('click', () => {
        this.currentStep = 0;
        this._renderCreatePlanStep();
    });
    
    document.getElementById('next-step-btn').addEventListener('click', () => {
        // Verificar se pelo menos um dia foi selecionado
        if (!this._validateTrainingDaysStep()) return;
        
        // Gerar sessões com base nos dias selecionados
        this._generateTrainingSessions();
        
        // Ir para próxima etapa
        this.currentStep = 2;
        this._renderCreatePlanStep();
    });
};

// Atualiza o contador de dias de treino selecionados
trainingPlans._updateSelectedDaysCount = function() {
    const selectedCount = Object.values(this.currentPlan.trainingDays).filter(Boolean).length;
    document.getElementById('selected-days-count').textContent = selectedCount;
    
    // Mostrar/ocultar aviso
    const warning = document.querySelector('.warning');
    if (warning) {
        if (selectedCount === 0) {
            warning.classList.add('visible');
        } else {
            warning.classList.remove('visible');
        }
    }
};

// Valida a etapa de seleção de dias
trainingPlans._validateTrainingDaysStep = function() {
    const selectedCount = Object.values(this.currentPlan.trainingDays).filter(Boolean).length;
    
    if (selectedCount === 0) {
        document.querySelector('.warning').classList.add('visible');
        app.showNotification('Por favor, selecione pelo menos um dia de treino', 'warning');
        return false;
    }
    
    return true;
};

// Gera sessões de treino com base nos dias selecionados
trainingPlans._generateTrainingSessions = function() {
    // Limpar sessões anteriores
    this.currentPlan.sessions = [];
    
    // Gerar sessões para cada semana
    for (let week = 1; week <= this.currentPlan.duration_weeks; week++) {
        // Para cada dia da semana
        for (let day = 1; day <= 7; day++) {
            // Se este é um dia de treino
            if (this.currentPlan.trainingDays[day]) {
                // Criar uma sessão padrão para este dia
                const session = {
                    id: `week${week}-day${day}`,
                    week: week,
                    day: day,
                    workoutType: this._getDefaultWorkoutType(day),
                    distance: this._getDefaultDistance(day),
                    duration: this._getDefaultDuration(day),
                    intensity: this._getDefaultIntensity(day),
                    description: ''
                };
                
                this.currentPlan.sessions.push(session);
            }
        }
    }
};

// Funções auxiliares para definir valores padrão por dia
trainingPlans._getDefaultWorkoutType = function(day) {
    switch (day) {
        case 1: return 'Corrida Leve';
        case 3: return 'Intervalado';
        case 5: return 'Tempo';
        case 6: return 'Corrida Longa';
        default: return 'Corrida Regular';
    }
};

trainingPlans._getDefaultDistance = function(day) {
    const level = this.currentPlan.level;
    const baseDistance = level === 'Iniciante' ? 3 : 
                       level === 'Intermediário' ? 5 : 7;
    
    switch (day) {
        case 1: return baseDistance;
        case 3: return baseDistance * 1.2;
        case 5: return baseDistance * 1.1;
        case 6: return baseDistance * 2;
        default: return baseDistance;
    }
};

trainingPlans._getDefaultDuration = function(day) {
    const level = this.currentPlan.level;
    const baseDuration = level === 'Iniciante' ? 20 : 
                        level === 'Intermediário' ? 30 : 40;
    
    switch (day) {
        case 1: return baseDuration;
        case 3: return baseDuration * 1.5;
        case 5: return baseDuration * 1.2;
        case 6: return baseDuration * 2;
        default: return baseDuration;
    }
};

trainingPlans._getDefaultIntensity = function(day) {
    switch (day) {
        case 1: return 'Leve';
        case 3: return 'Alta';
        case 5: return 'Moderada';
        case 6: return 'Moderada';
        default: return 'Leve';
    }
};
