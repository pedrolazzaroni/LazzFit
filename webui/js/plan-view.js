/**
 * Implementa a visualização de planos de treino
 * Este arquivo é uma extensão do módulo trainingPlans
 */

// Função para visualizar plano de treino
trainingPlans.showViewPlanView = async function(planId) {
    console.log("Visualizando plano:", planId);
    
    try {
        // Mostrar loading
        app.showLoading();
        
        // Buscar dados do plano
        let planData = null;
        
        // Verificação mais robusta da API PyWebView
        if (window.pywebview && window.pywebview.api) {
            try {
                console.log("Buscando plano via API PyWebView");
                planData = await window.pywebview.api.get_training_plan(planId);
                
                if (!planData) {
                    throw new Error("Plano não encontrado na base de dados");
                }
                
                console.log("Dados do plano recebidos com sucesso");
            } catch (apiError) {
                console.error("Erro na API ao buscar plano:", apiError);
                throw new Error("Falha na comunicação com a API: " + (apiError.message || "Erro desconhecido"));
            }
        } else {
            console.error("API PyWebView não disponível");
            throw new Error("API de backend não disponível");
        }
        
        // Renderizar visualização do plano
        this._renderPlanView(planData);
    } catch (error) {
        console.error("Erro ao visualizar plano:", error);
        app.showNotification("Não foi possível carregar o plano de treino: " + (error.message || "Erro desconhecido"), "error");
        app.navigate('training-plans');
    } finally {
        app.hideLoading();
    }
};

// Função para gerar semanas de exemplo para desenvolvimento
trainingPlans._generateMockWeeks = function(duration_weeks) {
    const weeks = [];
    
    for (let week = 1; week <= duration_weeks; week++) {
        const sessions = [];
        
        // Adicionar sessões para cada dia
        for (let day = 1; day <= 7; day++) {
            // Simular apenas alguns dias com treino
            if ([1, 3, 5, 6].includes(day)) {
                sessions.push({
                    id: `week${week}-day${day}`,
                    day_of_week: day,
                    workout_type: this._getDefaultWorkoutType ? 
                        this._getDefaultWorkoutType(day) : "Corrida Regular",
                    distance: this._getDefaultDistance ? 
                        this._getDefaultDistance(day) : 5.0,
                    duration: this._getDefaultDuration ? 
                        this._getDefaultDuration(day) : 30,
                    intensity: this._getDefaultIntensity ? 
                        this._getDefaultIntensity(day) : "Moderada",
                    pace_target: "5:30",
                    hr_zone: "Zona 2-3",
                    details: "Descrição de exemplo para esta sessão de treino."
                });
            }
        }
        
        weeks.push({
            id: week,
            week_number: week,
            focus: `Semana ${week} - ${week % 4 === 0 ? "Recuperação" : "Desenvolvimento"}`,
            total_distance: 30 + week * 2,
            notes: `Notas da semana ${week}. Foco em ${week % 2 === 0 ? "velocidade" : "resistência"}.`,
            sessions: sessions
        });
    }
    
    return weeks;
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
    const intensity = (session.intensity || "").toLowerCase();
    return `
        <div class="training-session" data-intensity="${intensity}">
            <div class="session-type">${session.workout_type || "Treino"}</div>
            <div class="session-details">
                <p>${session.distance || 0} km | ${session.duration || 0} min</p>
                <p>Intensidade: ${session.intensity || "N/A"}</p>
                ${session.pace_target ? `<p>Ritmo: ${session.pace_target} min/km</p>` : ''}
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
    try {
        // Mostrar carregamento
        const exportBtn = document.getElementById('export-plan-excel-btn');
        const originalBtnText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<div class="loading-spinner"></div> Exportando...';
        exportBtn.disabled = true;
        
        let result = false;
        
        if (api && api.isPyWebView) {
            // Exportar via API
            result = await window.pywebview.api.export_training_plan_to_xlsx(plan.id);
        } else {
            // Simulação para desenvolvimento
            console.log("Simulando exportação do plano para Excel:", plan);
            await new Promise(r => setTimeout(r, 1500));
            result = { success: true, path: "C:/Exemplo/plano_treino.xlsx" };
        }
        
        // Restaurar botão
        exportBtn.innerHTML = originalBtnText;
        exportBtn.disabled = false;
        
        // Mostrar resultado
        if (result && result.success) {
            app.showNotification(`Plano exportado com sucesso! Salvo em: ${result.path}`, "success");
        } else {
            throw new Error("Falha na exportação");
        }
    } catch (error) {
        console.error("Erro ao exportar plano:", error);
        app.showNotification("Não foi possível exportar o plano para Excel.", "error");
        
        // Restaurar botão em caso de erro
        const exportBtn = document.getElementById('export-plan-excel-btn');
        if (exportBtn) {
            exportBtn.innerHTML = '<span class="material-icons-round">file_download</span> Exportar para Excel';
            exportBtn.disabled = false;
        }
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
