/**
 * Implementa a revisão final do plano de treino
 * Este arquivo é uma extensão do módulo trainingPlans
 */

// Etapa 4: Revisão final do plano
trainingPlans._renderPlanReviewStep = function(container) {
    container.innerHTML = `
        <div class="plan-step-content">
            <h3>Revisar Plano de Treino</h3>
            <p class="step-description">Verifique os detalhes do seu plano antes de salvar.</p>
            
            <div class="plan-summary">
                <div class="summary-section">
                    <h4>Informações Gerais</h4>
                    <div class="summary-item">
                        <span class="label">Nome do Plano:</span>
                        <span class="value">${this.currentPlan.name}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Objetivo:</span>
                        <span class="value">${this.currentPlan.goal || 'Não definido'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Duração:</span>
                        <span class="value">${this.currentPlan.duration_weeks} semanas</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Nível:</span>
                        <span class="value">${this.currentPlan.level}</span>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h4>Dias de Treino Selecionados</h4>
                    <div class="days-overview">
                        ${this._renderTrainingDaysOverview()}
                    </div>
                </div>
                
                <div class="summary-section">
                    <h4>Visualização do Calendário</h4>
                    <div id="calendar-view" class="calendar-view">
                        <!-- Calendar will be rendered here -->
                    </div>
                </div>
            </div>
        </div>
        
        <div class="step-actions">
            <button class="btn" id="prev-step-btn">Voltar</button>
            <button class="btn primary" id="save-plan-btn">Salvar Plano</button>
        </div>
    `;
    
    // Renderizar calendário
    this._renderCalendarPreview();
    
    // Configurar event listeners
    document.getElementById('prev-step-btn').addEventListener('click', () => {
        this.previousStep();
    });
    
    document.getElementById('save-plan-btn').addEventListener('click', () => {
        this.finishPlanCreation();
    });
};

// Renderiza visão geral dos dias de treino selecionados
trainingPlans._renderTrainingDaysOverview = function() {
    const daysOfWeek = [
        { id: 1, name: 'Segunda', shortName: 'S' },
        { id: 2, name: 'Terça', shortName: 'T' },
        { id: 3, name: 'Quarta', shortName: 'Q' },
        { id: 4, name: 'Quinta', shortName: 'Q' },
        { id: 5, name: 'Sexta', shortName: 'S' },
        { id: 6, name: 'Sábado', shortName: 'S' },
        { id: 7, name: 'Domingo', shortName: 'D' }
    ];
    
    return daysOfWeek.map(day => `
        <div class="day-circle ${this.currentPlan.trainingDays[day.id] ? 'training-day' : 'rest-day'}" 
             title="${day.name} - ${this.currentPlan.trainingDays[day.id] ? 'Treino' : 'Descanso'}">
            ${day.shortName}
        </div>
    `).join('');
};

// Renderiza visualização de calendário do plano
trainingPlans._renderCalendarPreview = function() {
    const calendarView = document.getElementById('calendar-view');
    if (!calendarView) return;
    
    // Limpar calendário
    calendarView.innerHTML = '';
    
    // Construir visualização de semanas
    for (let week = 1; week <= this.currentPlan.duration_weeks; week++) {
        const weekRow = document.createElement('div');
        weekRow.className = 'calendar-week';
        
        // Adicionar número da semana
        const weekNumber = document.createElement('div');
        weekNumber.className = 'week-number';
        weekNumber.textContent = `Semana ${week}`;
        weekRow.appendChild(weekNumber);
        
        // Adicionar dias da semana
        const weekDays = document.createElement('div');
        weekDays.className = 'week-days';
        
        for (let day = 1; day <= 7; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            
            // Verificar se é um dia de treino
            if (this.currentPlan.trainingDays[day]) {
                const session = this.currentPlan.sessions.find(s => s.week === week && s.day === day);
                
                if (session) {
                    dayDiv.classList.add('training-day');
                    dayDiv.dataset.intensity = session.intensity.toLowerCase();
                    
                    // Tooltip com detalhes do treino
                    dayDiv.setAttribute('title', `${session.workoutType}: ${session.distance}km, ${session.duration}min`);
                    
                    // Conteúdo do dia
                    dayDiv.innerHTML = `
                        <div class="day-number">${day}</div>
                        <div class="session-type">${session.workoutType}</div>
                        <div class="session-meta">${session.distance}km</div>
                    `;
                }
            } else {
                dayDiv.classList.add('rest-day');
                dayDiv.innerHTML = `<div class="day-number">${day}</div>`;
            }
            
            weekDays.appendChild(dayDiv);
        }
        
        weekRow.appendChild(weekDays);
        calendarView.appendChild(weekRow);
    }
};

// Salva o plano de treino
trainingPlans._savePlan = async function() {
    try {
        // Mostrar indicador de carregamento
        const saveBtn = document.getElementById('save-plan-btn');
        if (!saveBtn) return false;
        
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="loading-spinner"></div> Salvando...';
        
        // Usar implementação unificada de savePlan do módulo principal
        const success = await this.savePlan();
        
        if (!success) {
            // Restaurar botão em caso de erro
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
        
        return success;
    } catch (error) {
        console.error("Erro ao salvar plano:", error);
        app.showNotification("Ocorreu um erro ao salvar o plano de treino.", "error");
        
        // Restaurar botão em caso de erro
        const saveBtn = document.getElementById('save-plan-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = this.currentPlan.isEditing ? 'Atualizar Plano' : 'Finalizar Plano';
        }
        
        return false;
    }
};

// Garantindo que finishPlanCreation também use a implementação unificada
trainingPlans.finishPlanCreation = async function() {
    // Validar e coletar dados do último passo
    if (!this._validateCurrentStep()) {
        return false;
    }
    
    // Coletar dados do formulário atual
    this._collectFormData();
    
    // Usar o método _savePlan que agora redireciona para o savePlan unificado
    return await this._savePlan();
};
