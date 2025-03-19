/**
 * Implementa a visualização de planos de treino
 * Este arquivo é uma extensão do módulo trainingPlans
 */

// Função para visualizar plano de treino
trainingPlans.showViewPlanView = async function(planId) {
    console.log("Carregando plano de treino:", planId);
    
    try {
        if (!window.pywebview || !window.pywebview.api) {
            app.showNotification("API backend não disponível", "error");
            app.navigate('training-plans');
            return;
        }
        
        app.showLoading();
        
        // Carregar o plano do banco de dados
        const plan = await window.pywebview.api.get_training_plan(planId);
        
        if (!plan) {
            app.showNotification("Plano não encontrado", "error");
            app.navigate('training-plans');
            return;
        }
        
        console.log("Plano carregado:", plan);
        
        this._renderPlanView(plan);
        
    } catch (error) {
        console.error("Erro ao carregar plano:", error);
        app.showNotification("Erro ao carregar plano", "error");
        app.navigate('training-plans');
    } finally {
        app.hideLoading();
    }
};

// Renderizar visualização de plano
trainingPlans._renderPlanView = function(plan) {
    // Verificação de segurança para dados do plano
    if (!plan || typeof plan !== 'object') {
        console.error("Dados do plano inválidos:", plan);
        app.showNotification("Dados do plano inválidos ou corrompidos", "error");
        app.navigate('training-plans');
        return;
    }
    
    // Limpar o container antes de adicionar o novo conteúdo
    app.viewContainer.innerHTML = '';
    
    // Preparar o conteúdo da view
    const viewHTML = `
        <div class="plan-view">
            <div class="section-header">
                <h2>${plan.name || "Plano de Treino"}</h2>
                <div class="action-buttons">
                    <button id="back-to-plans-btn" class="btn">
                        <span class="material-icons-round">arrow_back</span>
                        Voltar
                    </button>
                </div>
            </div>
            
            <div class="plan-view-actions">
                <button id="export-plan-excel-btn" class="btn export-plan-btn">
                    <span class="material-icons-round">file_download</span>
                    Exportar para Excel
                </button>
                <button id="edit-plan-btn" class="btn primary">
                    <span class="material-icons-round">edit</span>
                    Editar Plano
                </button>
            </div>
            
            <div class="plan-details">
                <div class="plan-stat">
                    <span class="material-icons-round">fitness_center</span>
                    <span>Nível: ${plan.level || "Não especificado"}</span>
                </div>
                <div class="plan-stat">
                    <span class="material-icons-round">event</span>
                    <span>Duração: ${plan.duration_weeks || "?"} semanas</span>
                </div>
                <div class="plan-stat">
                    <span class="material-icons-round">flag</span>
                    <span>Objetivo: ${plan.goal || "Não especificado"}</span>
                </div>
                <div class="plan-stat">
                    <span class="material-icons-round">update</span>
                    <span>Atualizado: ${this._formatDate(plan.updated_at)}</span>
                </div>
            </div>
            
            <div class="summary-section">
                <h4>Notas do Plano</h4>
                <p>${plan.notes || "Não há notas para este plano."}</p>
            </div>
            
            <div class="training-weeks-container">
                <h3>Agenda de Treinos</h3>
                <div class="accordion">
                    ${this._renderWeeksAccordion(plan.weeks || [])}
                </div>
            </div>
        </div>
    `;
    
    // Inserir no DOM
    app.viewContainer.innerHTML = viewHTML;
    
    // Configurar event listeners
    document.getElementById('back-to-plans-btn').addEventListener('click', () => {
        app.navigate('training-plans');
    });
    
    document.getElementById('edit-plan-btn').addEventListener('click', () => {
        app.navigate('edit-plan', { planId: plan.id });
    });
    
    document.getElementById('export-plan-excel-btn').addEventListener('click', () => {
        this._exportPlanToExcel(plan);
    });
    
    // Configurar comportamento do acordeão
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Fechar todos os itens ativos
            document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                activeItem.classList.remove('active');
            });
            
            // Se o item clicado não estava ativo, ativá-lo
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // Abrir primeira semana por padrão
    const firstAccordionItem = document.querySelector('.accordion-item');
    if (firstAccordionItem) {
        firstAccordionItem.classList.add('active');
    }
};

// Renderizar acordeão para semanas de treino
trainingPlans._renderWeeksAccordion = function(weeks) {
    if (!weeks || weeks.length === 0) {
        return `<div class="empty-state">Não há semanas de treino definidas neste plano.</div>`;
    }
    
    return weeks.map(week => `
        <div class="accordion-item">
            <div class="accordion-header">
                <div class="accordion-title">
                    <span class="week-number">Semana ${week.week_number || "?"}</span>
                    <span class="week-focus">${week.focus || ""}</span>
                </div>
                <div class="accordion-summary">
                    <span class="week-distance">${week.total_distance || 0} km</span>
                    <button class="accordion-toggle">
                        <span class="material-icons-round">expand_more</span>
                    </button>
                </div>
            </div>
            <div class="accordion-content">
                <div class="week-training-grid">
                    ${this._renderWeekDays(week.sessions || [])}
                </div>
                <div class="week-notes">
                    <h4>Notas da Semana</h4>
                    <p class="week-notes-content">${week.notes || "Não há notas para esta semana."}</p>
                </div>
            </div>
        </div>
    `).join('');
};

// Renderizar dias da semana
trainingPlans._renderWeekDays = function(sessions) {
    const daysOfWeek = [
        { id: 1, name: 'Segunda' },
        { id: 2, name: 'Terça' },
        { id: 3, name: 'Quarta' },
        { id: 4, name: 'Quinta' },
        { id: 5, name: 'Sexta' },
        { id: 6, name: 'Sábado' },
        { id: 7, name: 'Domingo' }
    ];
    
    return daysOfWeek.map(day => {
        // Encontrar sessão para este dia
        const session = sessions.find(s => s.day_of_week === day.id);
        
        return `
            <div class="day-column">
                <div class="day-header">${day.name}</div>
                ${session ? this._renderTrainingSession(session) : this._renderRestDay()}
            </div>
        `;
    }).join('');
};

// Renderizar sessão de treino
trainingPlans._renderTrainingSession = function(session) {
    // Se o tipo de treino for descanso, mostrar como dia de descanso
    if (!session.workout_type || session.workout_type === "Descanso") {
        return this._renderRestDay();
    }
    
    const intensity = (session.intensity || "").toLowerCase();
    return `
        <div class="training-session" data-intensity="${intensity}">
            <div class="session-type">${session.workout_type || "Treino"}</div>
            <div class="session-details">
                <p>${session.distance || 0} km | ${session.duration || 0} min</p>
                <p>Intensidade: ${session.intensity || "N/A"}</p>
                ${session.pace_target ? `<p>Ritmo: ${session.pace_target}</p>` : ''}
                ${session.hr_zone ? `<p>Zona FC: ${session.hr_zone}</p>` : ''}
            </div>
            ${session.details ? `<div class="session-description">${session.details}</div>` : ''}
        </div>
    `;
};

// Renderizar dia de descanso
trainingPlans._renderRestDay = function() {
    return `
        <div class="training-session rest">
            <div class="session-type">Descanso</div>
            <div class="rest-indicator">
                <span class="material-icons-round">hotel</span>
            </div>
        </div>
    `;
};

// Exportar plano para Excel
trainingPlans._exportPlanToExcel = async function(plan) {
    if (!plan || !plan.id) {
        app.showNotification("Dados do plano inválidos para exportação", "error");
        return;
    }
    
    try {
        app.showLoading();
        if (!window.pywebview || !window.pywebview.api) {
            app.showNotification("API backend não disponível", "error");
            return;
        }
        
        const result = await window.pywebview.api.export_training_plan_to_xlsx(plan.id);
        
        if (result && result.success) {
            app.showNotification(`Plano exportado para: ${result.path}`, "success");
        } else {
            app.showNotification(`Falha na exportação: ${result?.error || 'Erro desconhecido'}`, "error");
        }
    } catch (error) {
        console.error("Erro ao exportar plano:", error);
        app.showNotification("Erro ao exportar plano", "error");
    } finally {
        app.hideLoading();
    }
};

// Formatar data
trainingPlans._formatDate = function(dateString) {
    if (!dateString) return "Não disponível";
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Se não for data válida
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return dateString;
    }
};

// Função para editar plano de treino
trainingPlans.showEditPlanView = async function(planId) {
    try {
        console.log("Redirecionando para a implementação principal de edição de plano:", planId);
        
        // Redirecionamento para a implementação principal em training-plans.js
        if (typeof this.editPlanImplementation === 'function') {
            await this.editPlanImplementation(planId);
        } else {
            // Manter compatibilidade com a implementação anterior
            app.navigate('edit-plan', { planId });
        }
    } catch (error) {
        console.error("Erro ao redirecionar para edição do plano:", error);
        app.showNotification("Erro ao iniciar edição do plano", "error");
        app.navigate('training-plans');
    }
};
