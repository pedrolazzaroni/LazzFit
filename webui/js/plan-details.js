/**
 * Implementa a edição de detalhes de treino
 * Este arquivo é uma extensão do módulo trainingPlans
 */

// Etapa 3: Detalhes dos treinos
trainingPlans._renderTrainingDetailsStep = function(container) {
    container.innerHTML = `
        <div class="plan-step-content">
            <h3>Configuração das Sessões de Treino</h3>
            <p class="step-description">Configure o tipo e os detalhes de cada sessão de treino semanal.</p>
            
            <form id="training-sessions-form" class="plan-form">
                <div class="week-selector">
                    <button type="button" id="prev-week-btn" class="week-nav-btn">
                        <span class="material-icons-round">chevron_left</span>
                    </button>
                    <span id="current-week-display">Semana 1 de ${this.currentPlan.duration_weeks}</span>
                    <button type="button" id="next-week-btn" class="week-nav-btn">
                        <span class="material-icons-round">chevron_right</span>
                    </button>
                </div>
                
                <div class="sessions-container">
                    ${this._createSessionsConfig()}
                </div>
                
                <div class="form-info">
                    <p>Configure os detalhes de cada sessão de treino. As configurações serão aplicadas a todas as semanas do plano.</p>
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
    
    // Configurar navegação de semanas (para referência visual apenas)
    let currentWeek = 1;
    const currentWeekDisplay = document.getElementById('current-week-display');
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    
    if (prevWeekBtn && nextWeekBtn && currentWeekDisplay) {
        prevWeekBtn.disabled = currentWeek <= 1;
        nextWeekBtn.disabled = currentWeek >= this.currentPlan.duration_weeks;
        
        prevWeekBtn.addEventListener('click', () => {
            if (currentWeek > 1) {
                currentWeek--;
                currentWeekDisplay.textContent = `Semana ${currentWeek} de ${this.currentPlan.duration_weeks}`;
                prevWeekBtn.disabled = currentWeek <= 1;
                nextWeekBtn.disabled = false;
            }
        });
        
        nextWeekBtn.addEventListener('click', () => {
            if (currentWeek < this.currentPlan.duration_weeks) {
                currentWeek++;
                currentWeekDisplay.textContent = `Semana ${currentWeek} de ${this.currentPlan.duration_weeks}`;
                nextWeekBtn.disabled = currentWeek >= this.currentPlan.duration_weeks;
                prevWeekBtn.disabled = false;
            }
        });
    }
};

// Cria a configuração das sessões com base nos dias selecionados
trainingPlans._createSessionsConfig = function() {
    const dayNames = [
        "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", 
        "Sexta-feira", "Sábado", "Domingo"
    ];
    
    let html = '';
    
    // Para cada dia da semana
    for (let i = 1; i <= 7; i++) {
        // Verificar se o dia está selecionado para treino
        const isActiveDay = this.currentPlan.trainingDays[i] || false;
        
        // Sempre renderizar o dia, mas com estilo diferente se não for dia de treino
        const sessionClass = isActiveDay ? 'session-config active-session' : 'session-config inactive-session';
        const sessionStatus = isActiveDay ? 'Dia de treino' : 'Dia de descanso';
        
        // Buscar dados existentes desta sessão, se houver
        const sessionData = this.currentPlan.sessions.find(s => s.day === i) || {
            workoutType: isActiveDay ? "Corrida Leve" : "Descanso",
            distance: isActiveDay ? 5 : 0,
            duration: isActiveDay ? 30 : 0,
            intensity: isActiveDay ? "Baixa" : "Nenhuma",
            paceTarget: "",
            hrZone: "",
            details: ""
        };
        
        html += `
            <div class="${sessionClass}" data-day="${i}">
                <div class="session-header">
                    <h4>${dayNames[i-1]}</h4>
                    <div class="session-status">${sessionStatus}</div>
                </div>
                
                ${isActiveDay ? `
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
                ` : `<div class="rest-day-message">
                    <span class="material-icons-round">hotel</span>
                    <p>Descanso</p>
                    <button type="button" class="btn small enable-training-day" data-day="${i}">Ativar como dia de treino</button>
                </div>`}
            </div>
        `;
    }
    
    return html || `<div class="no-sessions-message">
        <span class="material-icons-round">info</span>
        <p>Nenhum dia de treino selecionado. Volte à etapa anterior para selecionar dias de treino.</p>
    </div>`;
};

// Inicializa campos especiais do formulário de sessões
trainingPlans._initSessionsFields = function() {
    // Adicionar listeners para os campos de sessão
    document.querySelectorAll('.session-config').forEach(session => {
        // Adicionar botões para ativar dias inativos
        const enableBtn = session.querySelector('.enable-training-day');
        if (enableBtn) {
            enableBtn.addEventListener('click', () => {
                const day = parseInt(enableBtn.dataset.day);
                if (!isNaN(day)) {
                    // Atualizar estado do dia de treino
                    this.currentPlan.trainingDays[day] = true;
                    
                    // Recriar a interface para refletir as mudanças
                    const container = document.querySelector('#training-sessions-form .sessions-container');
                    if (container) {
                        container.innerHTML = this._createSessionsConfig();
                        this._initSessionsFields(); // Reinicializar eventos
                    }
                }
            });
        }
    });
    
    console.log("Sessões de treino inicializadas: " + document.querySelectorAll('.session-config.active-session').length);
};

// Valida as sessões de treino
trainingPlans._validateSessionsStep = function() {
    // Verificar dados básicos de cada sessão
    const sessions = document.querySelectorAll('.session-config.active-session');
    let isValid = true;
    
    sessions.forEach(session => {
        const workoutType = session.querySelector('.workout-type');
        const distance = session.querySelector('.workout-distance');
        const duration = session.querySelector('.workout-duration');
        
        if (!workoutType || !workoutType.value) {
            app.showNotification("Selecione um tipo de treino para todas as sessões", "error");
            isValid = false;
            return;
        }
        
        if (distance && (isNaN(parseFloat(distance.value)) || parseFloat(distance.value) < 0)) {
            app.showNotification("Informe uma distância válida para todas as sessões", "error");
            isValid = false;
            return;
        }
        
        if (duration && (isNaN(parseInt(duration.value)) || parseInt(duration.value) < 0)) {
            app.showNotification("Informe uma duração válida para todas as sessões", "error");
            isValid = false;
            return;
        }
    });
    
    return isValid;
};

// Salva os dados das sessões
trainingPlans._saveSessionsStep = function() {
    const activeSessions = document.querySelectorAll('.session-config.active-session');
    
    // Limpar sessões anteriores e adicionar as atualizadas
    this.currentPlan.sessions = [];
    
    // Processar sessões ativas
    activeSessions.forEach(session => {
        const dayIndex = parseInt(session.dataset.day);
        if (isNaN(dayIndex)) return;
        
        // Obter elementos do formulário para esta sessão
        const workoutType = session.querySelector('.workout-type');
        const distance = session.querySelector('.workout-distance');
        const duration = session.querySelector('.workout-duration');
        const intensity = session.querySelector('.workout-intensity');
        const paceTarget = session.querySelector('.workout-pace');
        const hrZone = session.querySelector('.workout-hr-zone');
        const details = session.querySelector('.workout-details');
        
        // Criar objeto de sessão com os dados do formulário
        this.currentPlan.sessions.push({
            day: dayIndex,
            active: true,
            workoutType: workoutType ? workoutType.value : "Corrida Leve",
            distance: distance ? parseFloat(distance.value) || 0 : 0,
            duration: duration ? parseInt(duration.value) || 0 : 0,
            intensity: intensity ? intensity.value : "Baixa",
            paceTarget: paceTarget ? paceTarget.value : "",
            hrZone: hrZone ? hrZone.value : "",
            details: details ? details.value : ""
        });
    });
    
    // Adicionar dias inativos como sessões de descanso
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
    
    console.log("Sessões salvas:", this.currentPlan.sessions);
};
``` 
