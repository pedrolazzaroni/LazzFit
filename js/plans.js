// LazzFit Plans JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Abrir modal para explorar planos
    const explorePlansBtn = document.getElementById('explore-plans-btn');
    const explorePlansModal = document.getElementById('explore-plans-modal');
    if (explorePlansBtn && explorePlansModal) {
        explorePlansBtn.addEventListener('click', function() {
            explorePlansModal.classList.add('show');
        });
    }
    
    // Gatilhos alternativos para explorar planos
    const explorePlansTriggers = document.querySelectorAll('.explore-plans-trigger');
    if (explorePlansTriggers.length && explorePlansModal) {
        explorePlansTriggers.forEach(trigger => {
            trigger.addEventListener('click', function() {
                explorePlansModal.classList.add('show');
            });
        });
    }
    
    // Fechar modais
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
        });
    });
    
    // Fechar modal ao clicar fora
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Filtrar planos disponíveis
    const filterLevel = document.getElementById('filter-level');
    const filterGoal = document.getElementById('filter-goal');
    
    if (filterLevel && filterGoal) {
        const filterPlans = function() {
            const levelFilter = filterLevel.value;
            const goalFilter = filterGoal.value;
            
            const planCards = document.querySelectorAll('.explore-plan-card');
            planCards.forEach(card => {
                const level = card.dataset.level;
                const goal = card.dataset.goal;
                
                let showCard = true;
                
                if (levelFilter && level !== levelFilter) {
                    showCard = false;
                }
                
                if (goalFilter && goal !== goalFilter) {
                    showCard = false;
                }
                
                card.style.display = showCard ? 'block' : 'none';
            });
        };
        
        filterLevel.addEventListener('change', filterPlans);
        filterGoal.addEventListener('change', filterPlans);
    }
    
    // Ver detalhes do plano
    const viewPlanDetailsBtns = document.querySelectorAll('.view-plan-details');
    if (viewPlanDetailsBtns.length) {
        viewPlanDetailsBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.dataset.planId;
                getPlanDetails(planId);
            });
        });
    }
    
    // Botões para iniciar planos
    const startPlanBtns = document.querySelectorAll('.start-plan');
    if (startPlanBtns.length) {
        startPlanBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.dataset.planId;
                
                // Obter detalhes do plano e mostrar modal de confirmação
                fetch(`../api/get_plan_details.php?plan_id=${planId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showStartPlanModal(data.plan);
                        } else {
                            showToast('error', 'Erro ao carregar plano', data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showToast('error', 'Erro de comunicação', 'Não foi possível obter os detalhes do plano.');
                    });
            });
        });
    }
    
    // Botões de opções para plano ativo
    const planOptionsBtns = document.querySelectorAll('.plan-options-btn');
    const planOptionsModal = document.getElementById('plan-options-modal');
    
    if (planOptionsBtns.length && planOptionsModal) {
        planOptionsBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.dataset.planId;
                
                // Atualizar botões de ação para usar o ID correto
                document.querySelector('.view-plan-btn').dataset.planId = planId;
                document.querySelector('.edit-plan-btn').dataset.planId = planId;
                document.querySelector('.pause-plan-btn').dataset.planId = planId;
                document.querySelector('.complete-plan-btn').dataset.planId = planId;
                document.querySelector('.abandon-plan-btn').dataset.planId = planId;
                
                planOptionsModal.classList.add('show');
            });
        });
    }
    
    // Abas de histórico de planos
    const historyTabs = document.querySelectorAll('.history-tab');
    if (historyTabs.length) {
        historyTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remover classe ativa de todas as abas
                historyTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Esconder todos os painéis e mostrar o painel correspondente
                const tabType = this.dataset.tab;
                document.querySelectorAll('.history-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                document.getElementById(`${tabType}-plans`).classList.add('active');
            });
        });
    }
    
    // Reiniciar plano
    const restartPlanBtns = document.querySelectorAll('.restart-plan');
    if (restartPlanBtns.length) {
        restartPlanBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.dataset.planId;
                
                fetch(`../api/get_plan_details.php?plan_id=${planId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showStartPlanModal(data.plan);
                        } else {
                            showToast('error', 'Erro ao carregar plano', data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showToast('error', 'Erro de comunicação', 'Não foi possível obter os detalhes do plano.');
                    });
            });
        });
    }
    
    // Funções auxiliares
    function getPlanDetails(planId) {
        fetch(`../api/get_plan_details.php?plan_id=${planId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showPlanDetailsModal(data.plan);
                } else {
                    showToast('error', 'Erro ao carregar plano', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('error', 'Erro de comunicação', 'Não foi possível obter os detalhes do plano.');
            });
    }
    
    function showPlanDetailsModal(plan) {
        const detailsModal = document.createElement('div');
        detailsModal.className = 'modal plan-details-modal';
        detailsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${plan.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="plan-info">
                        <h3>Sobre este plano</h3>
                        <p>${plan.description}</p>
                        
                        <div class="plan-meta">
                            <div class="meta-item">
                                <span class="meta-label">Nível</span>
                                <span class="meta-value ${plan.difficulty_level.toLowerCase()}">${plan.difficulty_level}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Duração</span>
                                <span class="meta-value">${plan.duration_weeks} semanas</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Objetivo</span>
                                <span class="meta-value">${plan.goal}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="plan-schedule">
                        <h3>Estrutura do Plano</h3>
                        <p>Este plano inclui uma combinação de treinos elaborados para ajudá-lo a atingir o objetivo de ${plan.goal}.</p>
                        
                        <h4>Exemplo de Semana:</h4>
                        <div class="week-example">
                            <div class="day-card">
                                <div class="day-header">Segunda</div>
                                <div class="day-workout">Corrida leve - 5km</div>
                            </div>
                            <div class="day-card">
                                <div class="day-header">Terça</div>
                                <div class="day-workout">Descanso</div>
                            </div>
                            <div class="day-card">
                                <div class="day-header">Quarta</div>
                                <div class="day-workout">Intervalos - 6x400m</div>
                            </div>
                            <div class="day-card">
                                <div class="day-header">Quinta</div>
                                <div class="day-workout">Corrida moderada - 6km</div>
                            </div>
                            <div class="day-card">
                                <div class="day-header">Sexta</div>
                                <div class="day-workout">Descanso</div>
                            </div>
                            <div class="day-card">
                                <div class="day-header">Sábado</div>
                                <div class="day-workout">Ritmo - 3km</div>
                            </div>
                            <div class="day-card">
                                <div class="day-header">Domingo</div>
                                <div class="day-workout">Corrida longa - 10km</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cta cta--secondary close-details-btn">Fechar</button>
                    <button class="cta cta--primary start-plan-from-details" data-plan-id="${plan.plan_id}">Iniciar Plano</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(detailsModal);
        
        // Mostrar modal
        setTimeout(() => {
            detailsModal.classList.add('show');
        }, 10);
        
        // Fechar quando clicar no X
        detailsModal.querySelector('.close-modal').addEventListener('click', function() {
            detailsModal.classList.remove('show');
            setTimeout(() => detailsModal.remove(), 300);
        });
        
        // Fechar quando clicar no botão de fechar
        detailsModal.querySelector('.close-details-btn').addEventListener('click', function() {
            detailsModal.classList.remove('show');
            setTimeout(() => detailsModal.remove(), 300);
        });
        
        // Iniciar plano
        detailsModal.querySelector('.start-plan-from-details').addEventListener('click', function() {
            detailsModal.classList.remove('show');
            setTimeout(() => detailsModal.remove(), 300);
            
            showStartPlanModal(plan);
        });
        
        // Fechar ao clicar fora do conteúdo
        detailsModal.addEventListener('click', function(e) {
            if (e.target === this) {
                detailsModal.classList.remove('show');
                setTimeout(() => detailsModal.remove(), 300);
            }
        });
    }
    
    function showStartPlanModal(plan) {
        const startModal = document.createElement('div');
        startModal.className = 'modal start-plan-modal';
        startModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Iniciar Plano: ${plan.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="plan-summary">
                        <div class="summary-item">
                            <span class="summary-label">Nível:</span>
                            <span class="summary-value ${plan.difficulty_level.toLowerCase()}">${plan.difficulty_level}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Duração:</span>
                            <span class="summary-value">${plan.duration_weeks} semanas</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Objetivo:</span>
                            <span class="summary-value">${plan.goal}</span>
                        </div>
                    </div>
                    
                    <p>Ao iniciar este plano, qualquer plano ativo será automaticamente encerrado. Escolha a data de início para este plano:</p>
                    
                    <form id="start-plan-form">
                        <div class="form-floating">
                            <input type="date" class="form-control" id="start-date" name="start_date" value="${new Date().toISOString().split('T')[0]}" required>
                            <label for="start-date">Data de início</label>
                        </div>
                        
                        <div class="form-floating">
                            <textarea class="form-control" id="plan-notes" name="notes" rows="3" placeholder="Adicione observações ou objetivos pessoais..."></textarea>
                            <label for="plan-notes">Observações (opcional)</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="cta cta--secondary cancel-plan-btn">Cancelar</button>
                    <button class="cta cta--primary confirm-plan-btn" data-plan-id="${plan.plan_id}">Confirmar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(startModal);
        
        // Mostrar modal
        setTimeout(() => {
            startModal.classList.add('show');
        }, 10);
        
        // Fechar quando clicar no X
        startModal.querySelector('.close-modal').addEventListener('click', function() {
            startModal.classList.remove('show');
            setTimeout(() => startModal.remove(), 300);
        });
        
        // Fechar quando clicar em cancelar
        startModal.querySelector('.cancel-plan-btn').addEventListener('click', function() {
            startModal.classList.remove('show');
            setTimeout(() => startModal.remove(), 300);
        });
        
        // Iniciar plano
        startModal.querySelector('.confirm-plan-btn').addEventListener('click', function() {
            const planId = this.dataset.planId;
            const startDate = document.getElementById('start-date').value;
            const notes = document.getElementById('plan-notes').value;
            
            // Validar data
            if (!startDate) {
                showToast('error', 'Data inválida', 'Por favor, selecione uma data de início válida.');
                return;
            }
            
            // Mostrar loading no botão
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
            
            // Enviar requisição para iniciar plano
            fetch('../api/start_plan.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    plan_id: planId,
                    start_date: startDate,
                    notes: notes
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('success', 'Plano iniciado!', 'Seu plano de treino foi iniciado com sucesso.');
                    
                    // Fechar modal
                    startModal.classList.remove('show');
                    setTimeout(() => startModal.remove(), 300);
                    
                    // Recarregar a página após um breve atraso
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showToast('error', 'Erro ao iniciar plano', data.message);
                    this.disabled = false;
                    this.innerHTML = 'Confirmar';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('error', 'Erro de comunicação', 'Não foi possível iniciar o plano.');
                this.disabled = false;
                this.innerHTML = 'Confirmar';
            });
        });
        
        // Fechar ao clicar fora do conteúdo
        startModal.addEventListener('click', function(e) {
            if (e.target === this) {
                startModal.classList.remove('show');
                setTimeout(() => startModal.remove(), 300);
            }
        });
    }
    
    // Sistema de notificações toast
    function showToast(type, title, message) {
        const toastContainer = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-exclamation' : 'fa-info'}"></i>
            </div>
            <div class="toast-content">
                <h4 class="toast-title">${title}</h4>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close">&times;</button>
            <div class="toast-progress"></div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Mostrar toast com pequeno delay para animação
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Fechar toast ao clicar no X
        toast.querySelector('.toast-close').addEventListener('click', function() {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
    
    // Adicionar handlers para ações de plano
    if (planOptionsModal) {
        // Ver plano
        planOptionsModal.querySelector('.view-plan-btn').addEventListener('click', function() {
            const planId = this.dataset.planId;
            planOptionsModal.classList.remove('show');
            getPlanDetails(planId);
        });
        
        // Editar plano - redirecionar para página de edição
        planOptionsModal.querySelector('.edit-plan-btn').addEventListener('click', function() {
            const planId = this.dataset.planId;
            window.location.href = `edit-plan.php?id=${planId}`;
        });
        
        // Pausar plano
        planOptionsModal.querySelector('.pause-plan-btn').addEventListener('click', function() {
            const planId = this.dataset.planId;
            planOptionsModal.classList.remove('show');
            
            // Mostrar confirmação
            if (confirm('Tem certeza que deseja pausar este plano?')) {
                updatePlanStatus(planId, 'pause');
            }
        });
        
        // Completar plano
        planOptionsModal.querySelector('.complete-plan-btn').addEventListener('click', function() {
            const planId = this.dataset.planId;
            planOptionsModal.classList.remove('show');
            
            // Mostrar confirmação
            if (confirm('Tem certeza que deseja marcar este plano como concluído?')) {
                updatePlanStatus(planId, 'complete');
            }
        });
        
        // Abandonar plano
        planOptionsModal.querySelector('.abandon-plan-btn').addEventListener('click', function() {
            const planId = this.dataset.planId;
            planOptionsModal.classList.remove('show');
            
            // Mostrar confirmação
            if (confirm('Tem certeza que deseja abandonar este plano?')) {
                updatePlanStatus(planId, 'abandon');
            }
        });
    }
    
    function updatePlanStatus(planId, action) {
        fetch('../api/update_plan_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plan_id: planId,
                action: action
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let actionText = '';
                switch (action) {
                    case 'pause': actionText = 'pausado'; break;
                    case 'complete': actionText = 'concluído'; break;
                    case 'abandon': actionText = 'abandonado'; break;
                }
                
                showToast('success', 'Ação realizada', `Plano ${actionText} com sucesso.`);
                
                // Recarregar a página após um breve atraso
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast('error', 'Erro', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('error', 'Erro de comunicação', 'Não foi possível processar sua solicitação.');
        });
    }
});
