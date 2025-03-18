/**
 * Implementa a edição de detalhes de treino
 * Este arquivo é uma extensão do módulo trainingPlans
 */

// Etapa 3: Detalhes dos treinos
trainingPlans._renderTrainingDetailsStep = function(container) {
    container.innerHTML = `
        <div class="plan-step-content">
            <h3>Detalhes dos Treinos</h3>
            <p class="step-description">Configure os treinos para cada dia selecionado.</p>
            
            <div class="week-selector">
                <button id="prev-week" class="btn"><span class="material-icons-round">chevron_left</span></button>
                <div id="current-week-display">Semana 1 de ${this.currentPlan.duration_weeks}</div>
                <button id="next-week" class="btn"><span class="material-icons-round">chevron_right</span></button>
            </div>
            
            <div id="training-schedule" class="training-schedule">
                <!-- Weekly schedule will be rendered here -->
            </div>
        </div>
        
        <div class="step-actions">
            <button class="btn" id="prev-step-btn">Voltar</button>
            <button class="btn primary" id="next-step-btn">Revisar Plano</button>
        </div>
    `;
    
    // Inicializar com semana 1
    this._renderWeekSchedule(1);
    
    // Configurar event listeners
    document.getElementById('prev-week').addEventListener('click', () => {
        const currentWeek = parseInt(document.getElementById('current-week-display').textContent.match(/\d+/)[0]);
        if (currentWeek > 1) {
            this._renderWeekSchedule(currentWeek - 1);
        }
    });
    
    document.getElementById('next-week').addEventListener('click', () => {
        const currentWeek = parseInt(document.getElementById('current-week-display').textContent.match(/\d+/)[0]);
        if (currentWeek < this.currentPlan.duration_weeks) {
            this._renderWeekSchedule(currentWeek + 1);
        }
    });
    
    document.getElementById('prev-step-btn').addEventListener('click', () => {
        this.currentStep = 1;
        this._renderCreatePlanStep();
    });
    
    document.getElementById('next-step-btn').addEventListener('click', () => {
        this.currentStep = 3;
        this._renderCreatePlanStep();
    });
};

// Renderiza o cronograma da semana
trainingPlans._renderWeekSchedule = function(weekNumber) {
    // Atualizar display da semana
    document.getElementById('current-week-display').textContent = `Semana ${weekNumber} de ${this.currentPlan.duration_weeks}`;
    
    // Habilitar/desabilitar botões de navegação
    document.getElementById('prev-week').disabled = weekNumber === 1;
    document.getElementById('next-week').disabled = weekNumber === this.currentPlan.duration_weeks;
    
    const daysOfWeek = [
        { id: 1, name: 'Segunda-feira', shortName: 'Seg' },
        { id: 2, name: 'Terça-feira', shortName: 'Ter' },
        { id: 3, name: 'Quarta-feira', shortName: 'Qua' },
        { id: 4, name: 'Quinta-feira', shortName: 'Qui' },
        { id: 5, name: 'Sexta-feira', shortName: 'Sex' },
        { id: 6, name: 'Sábado', shortName: 'Sáb' },
        { id: 7, name: 'Domingo', shortName: 'Dom' }
    ];
    
    const scheduleContainer = document.getElementById('training-schedule');
    scheduleContainer.innerHTML = '';
    
    // Criar um card para cada dia da semana
    daysOfWeek.forEach(dayInfo => {
        const day = dayInfo.id;
        const isTrainingDay = this.currentPlan.trainingDays[day];
        
        // Encontrar a sessão para este dia e semana
        const session = this.currentPlan.sessions.find(s => s.week === weekNumber && s.day === day);
        
        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${isTrainingDay ? 'training-day' : 'rest-day'}`;
        
        if (isTrainingDay && session) {
            dayCard.innerHTML = `
                <div class="day-header">
                    <h4>${dayInfo.name}</h4>
                </div>
                <div class="session-details">
                    <div class="session-type">${session.workoutType}</div>
                    <div class="session-stats">
                        <div class="stat">
                            <span class="material-icons-round">straighten</span>
                            <span>${session.distance} km</span>
                        </div>
                        <div class="stat">
                            <span class="material-icons-round">timer</span>
                            <span>${session.duration} min</span>
                        </div>
                    </div>
                    <div class="session-intensity ${session.intensity.toLowerCase()}">${session.intensity}</div>
                    <div class="session-description">${session.description || 'Sem descrição adicional'}</div>
                </div>
                <div class="day-actions">
                    <button class="btn edit-session-btn" data-week="${weekNumber}" data-day="${day}">
                        <span class="material-icons-round">edit</span>
                        Editar
                    </button>
                </div>
            `;
            
            // Adicionar event listener para edição da sessão
            dayCard.querySelector('.edit-session-btn').addEventListener('click', () => {
                this._showEditSessionDialog(weekNumber, day, session);
            });
        } else {
            dayCard.innerHTML = `
                <div class="day-header">
                    <h4>${dayInfo.name}</h4>
                </div>
                <div class="rest-indicator">
                    <span class="material-icons-round">hotel</span>
                    <span>Descanso</span>
                </div>
            `;
        }
        
        scheduleContainer.appendChild(dayCard);
    });
};

// Mostra diálogo para edição de uma sessão de treino
trainingPlans._showEditSessionDialog = function(week, day, session) {
    const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const dayName = dayNames[day - 1];
    
    const dialogContent = document.createElement('div');
    dialogContent.className = 'edit-session-dialog';
    dialogContent.innerHTML = `
        <h3>Editar Treino - ${dayName}</h3>
        <form id="edit-session-form">
            <div class="form-group">
                <label for="session-type">Tipo de Treino</label>
                <select id="session-type">
                    <option value="Corrida Leve" ${session.workoutType === 'Corrida Leve' ? 'selected' : ''}>Corrida Leve</option>
                    <option value="Corrida Regular" ${session.workoutType === 'Corrida Regular' ? 'selected' : ''}>Corrida Regular</option>
                    <option value="Corrida Longa" ${session.workoutType === 'Corrida Longa' ? 'selected' : ''}>Corrida Longa</option>
                    <option value="Intervalado" ${session.workoutType === 'Intervalado' ? 'selected' : ''}>Intervalado</option>
                    <option value="Tempo" ${session.workoutType === 'Tempo' ? 'selected' : ''}>Tempo</option>
                    <option value="Fartlek" ${session.workoutType === 'Fartlek' ? 'selected' : ''}>Fartlek</option>
                    <option value="Recuperação" ${session.workoutType === 'Recuperação' ? 'selected' : ''}>Recuperação</option>
                    <option value="Outro" ${session.workoutType === 'Outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="session-distance">Distância (km)</label>
                    <input type="number" id="session-distance" value="${session.distance}" min="0" step="0.1">
                </div>
                
                <div class="form-group">
                    <label for="session-duration">Duração (min)</label>
                    <input type="number" id="session-duration" value="${session.duration}" min="0">
                </div>
            </div>
            
            <div class="form-group">
                <label for="session-intensity">Intensidade</label>
                <select id="session-intensity">
                    <option value="Leve" ${session.intensity === 'Leve' ? 'selected' : ''}>Leve</option>
                    <option value="Moderada" ${session.intensity === 'Moderada' ? 'selected' : ''}>Moderada</option>
                    <option value="Alta" ${session.intensity === 'Alta' ? 'selected' : ''}>Alta</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="session-description">Descrição/Notas</label>
                <textarea id="session-description" rows="3">${session.description || ''}</textarea>
            </div>
        </form>
    `;
    
    // Mostrar diálogo
    const dialog = components.showDialog(
        `Editar Treino - Semana ${week}`,
        dialogContent,
        [
            { text: 'Cancelar', primary: false },
            { 
                text: 'Salvar', 
                primary: true,
                onClick: () => {
                    // Atualizar dados da sessão
                    session.workoutType = document.getElementById('session-type').value;
                    session.distance = parseFloat(document.getElementById('session-distance').value);
                    session.duration = parseInt(document.getElementById('session-duration').value);
                    session.intensity = document.getElementById('session-intensity').value;
                    session.description = document.getElementById('session-description').value;
                    
                    // Atualizar a visualização
                    this._renderWeekSchedule(week);
                    
                    // Mostrar notificação
                    app.showNotification('Sessão de treino atualizada', 'success');
                }
            }
        ]
    );
};
