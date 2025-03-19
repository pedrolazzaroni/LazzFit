/**
 * Implementa a revisão final do plano de treino
 * Este arquivo é uma extensão do módulo trainingPlans
 */

// Etapa 4: Revisão final do plano
trainingPlans._renderPlanReviewStep = function(container) {
    const dayNames = [
        "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", 
        "Sexta-feira", "Sábado", "Domingo"
    ];
    
    // Calcular totais do plano
    const totalDistance = this.currentPlan.sessions
        .filter(s => s.active || this.currentPlan.trainingDays[s.day])
        .reduce((total, session) => total + (parseFloat(session.distance) || 0), 0);
    
    const totalDuration = this.currentPlan.sessions
        .filter(s => s.active || this.currentPlan.trainingDays[s.day])
        .reduce((total, session) => total + (parseInt(session.duration) || 0), 0);
    
    const totalHours = Math.floor(totalDuration / 60);
    const totalMinutes = totalDuration % 60;
    
    // Criar HTML para cada sessão ativa
    let sessionsHTML = '';
    
    for (let i = 1; i <= 7; i++) {
        const isTrainingDay = this.currentPlan.trainingDays[i];
        if (!isTrainingDay) continue;
        
        const session = this.currentPlan.sessions.find(s => s.day === i);
        if (!session) continue;
        
        sessionsHTML += `
            <div class="review-session">
                <div class="day-column">
                    <span>${dayNames[i-1].substring(0, 3)}</span>
                </div>
                <div class="session-details">
                    <div class="session-main-info">
                        <div class="workout-type">${session.workoutType || "Corrida"}</div>
                        <div class="workout-metrics">${session.distance || 0} km | ${session.duration || 0} min</div>
                    </div>
                    <div class="session-secondary-info">
                        <div>Intensidade: ${session.intensity || "N/A"}</div>
                        ${session.paceTarget ? `<div>Ritmo: ${session.paceTarget}</div>` : ''}
                        ${session.hrZone ? `<div>Zona FC: ${session.hrZone}</div>` : ''}
                    </div>
                    ${session.details ? `
                        <div class="session-notes">${session.details}</div>
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
    try {
        // Mostrar indicador de carregamento
        const saveBtn = document.getElementById('finish-btn');
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
            return false;
        }
        
        return success;
    } catch (error) {
        console.error("Erro ao finalizar plano:", error);
        app.showNotification("Ocorreu um erro ao salvar o plano de treino.", "error");
        
        // Restaurar botão em caso de erro
        const saveBtn = document.getElementById('finish-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = this.currentPlan.isEditing ? 'Atualizar Plano' : 'Finalizar Plano';
        }
        
        return false;
    }
};
