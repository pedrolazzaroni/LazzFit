/**
 * Training Plans Module
 * Handles all functionality related to training plans
 */
class TrainingPlansManager {
    constructor() {
        this.plans = [];
        this.currentPlan = null;
        this.initialized = false;
        
        // Templates
        this.planCardTemplate = document.getElementById('plan-card-template');
        this.weekAccordionTemplate = document.getElementById('week-accordion-template');
        this.editSessionTemplate = document.getElementById('edit-session-template');
    }
    
    /**
     * Initialize the training plans manager
     */
    async init() {
        if (this.initialized) return;
        
        try {
            await this.loadPlans();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize training plans:', error);
        }
    }
    
    /**
     * Load all training plans from the backend
     */
    async loadPlans() {
        try {
            this.plans = await window.pywebview.api.get_all_training_plans();
            return this.plans;
        } catch (error) {
            console.error('Failed to load training plans:', error);
            return [];
        }
    }
    
    /**
     * Initialize the training plans view
     */
    async initTrainingPlansView() {
        const container = document.getElementById('training-plans-container');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Load plans if not loaded yet
        if (!this.initialized) {
            await this.init();
        } else {
            // Refresh plans
            await this.loadPlans();
        }
        
        // Check if there are any plans
        if (this.plans.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <span class="material-icons-round">calendar_month</span>
                <p>Nenhum plano de treino criado ainda. Crie seu primeiro plano personalizado!</p>
                <button id="add-first-plan" class="btn primary">Criar Plano de Treino</button>
            `;
            container.appendChild(emptyState);
            
            document.getElementById('add-first-plan').addEventListener('click', () => {
                window.app.navigate('create-plan');
            });
            return;
        }
        
        // Render the plans
        this.plans.forEach(plan => {
            const card = this.createPlanCard(plan);
            container.appendChild(card);
        });
    }
    
    /**
     * Create a plan card element
     * @param {Object} plan - The plan data
     * @returns {HTMLElement} The card element
     */
    createPlanCard(plan) {
        const template = this.planCardTemplate;
        const card = document.importNode(template.content, true).querySelector('.plan-card');
        
        card.dataset.id = plan.id;
        card.querySelector('.plan-name').textContent = plan.name;
        card.querySelector('.plan-level').textContent = plan.level;
        
        // Stats
        card.querySelector('.plan-stats .stat-value:first-child').textContent = `${plan.duration_weeks} semanas`;
        
        // Format the date
        const updatedDate = new Date(plan.updated_at);
        const formattedDate = updatedDate.toLocaleDateString('pt-BR');
        card.querySelector('.plan-stats .stat-value:last-child').textContent = `Atualizado: ${formattedDate}`;
        
        // Goal
        card.querySelector('.plan-goal').textContent = plan.goal ? `Objetivo: ${plan.goal}` : 'Sem objetivo definido';
        
        // Set up event listeners
        card.querySelector('.view-plan-btn').addEventListener('click', () => {
            this.viewPlan(plan.id);
        });
        
        card.querySelector('.edit-plan-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editPlan(plan.id);
        });
        
        card.querySelector('.delete-plan-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDeletePlan(plan.id, plan.name);
        });
        
        return card;
    }
    
    /**
     * Show the create plan view
     */
    showCreatePlanView() {
        const container = document.getElementById('view-container');
        
        // Clone the template
        const template = document.getElementById('edit-training-plan-template');
        const formView = document.importNode(template.content, true);
        
        // Clear container and append the form view
        container.innerHTML = '';
        container.appendChild(formView);
        
        // Set up form elements
        document.getElementById('plan-form-title').textContent = 'Novo Plano de Treino';
        
        // Set up form submission
        const form = document.getElementById('training-plan-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.savePlan();
        });
        
        // Set up cancel button
        document.getElementById('cancel-plan-btn').addEventListener('click', () => {
            window.app.navigate('training-plans');
        });
        
        // Set up back button
        document.getElementById('back-to-plans-btn').addEventListener('click', () => {
            window.app.navigate('training-plans');
        });
    }
    
    /**
     * Show the edit plan view
     * @param {number} planId - ID of the plan to edit
     */
    async editPlan(planId) {
        const container = document.getElementById('view-container');
        
        // Show loading state
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando plano...</p>
            </div>
        `;
        
        try {
            // Get plan data
            const plan = await window.pywebview.api.get_training_plan(planId);
            
            if (!plan) {
                window.app.showNotification('Plano não encontrado', 'error');
                window.app.navigate('training-plans');
                return;
            }
            
            // Store current plan
            this.currentPlan = plan;
            
            // Clone the template
            const template = document.getElementById('edit-training-plan-template');
            const formView = document.importNode(template.content, true);
            
            // Clear container and append the form view
            container.innerHTML = '';
            container.appendChild(formView);
            
            // Set up form elements
            document.getElementById('plan-form-title').textContent = 'Editar Plano de Treino';
            document.getElementById('plan-id').value = plan.id;
            document.getElementById('plan-name').value = plan.name;
            document.getElementById('plan-goal').value = plan.goal || '';
            document.getElementById('plan-duration').value = plan.duration_weeks;
            document.getElementById('plan-level').value = plan.level;
            document.getElementById('plan-notes').value = plan.notes || '';
            
            // Set up form submission
            const form = document.getElementById('training-plan-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.savePlan(true);
            });
            
            // Set up cancel button
            document.getElementById('cancel-plan-btn').addEventListener('click', () => {
                window.app.navigate('training-plans');
            });
            
            // Set up back button
            document.getElementById('back-to-plans-btn').addEventListener('click', () => {
                window.app.navigate('training-plans');
            });
        } catch (error) {
            console.error('Failed to load plan for editing:', error);
            window.app.showNotification('Erro ao carregar plano', 'error');
            window.app.navigate('training-plans');
        }
    }
    
    /**
     * Save a new or existing plan
     * @param {boolean} isEditing - Whether we're editing an existing plan
     */
    async savePlan(isEditing = false) {
        // Get form data
        const planId = document.getElementById('plan-id').value;
        const name = document.getElementById('plan-name').value;
        const goal = document.getElementById('plan-goal').value;
        const duration_weeks = parseInt(document.getElementById('plan-duration').value);
        const level = document.getElementById('plan-level').value;
        const notes = document.getElementById('plan-notes').value;
        
        // Validate
        if (!name) {
            window.app.showNotification('Nome do plano é obrigatório', 'error');
            return;
        }
        
        if (duration_weeks < 1 || duration_weeks > 52) {
            window.app.showNotification('Duração deve estar entre 1 e 52 semanas', 'error');
            return;
        }
        
        // Create plan data object
        const planData = {
            name,
            goal,
            duration_weeks,
            level,
            notes
        };
        
        try {
            window.app.showNotification('Salvando plano...', 'info');
            
            let result;
            
            if (isEditing) {
                result = await window.pywebview.api.update_training_plan(parseInt(planId), planData);
            } else {
                result = await window.pywebview.api.create_training_plan(planData);
            }
            
            if (result) {
                window.app.showNotification(
                    isEditing ? 'Plano atualizado com sucesso!' : 'Novo plano criado com sucesso!',
                    'success'
                );
                
                // Reload plans and navigate to plans list or plan details
                await this.loadPlans();
                
                if (isEditing) {
                    this.viewPlan(parseInt(planId));
                } else {
                    window.app.navigate('training-plans');
                }
            } else {
                window.app.showNotification(
                    `Erro ao ${isEditing ? 'atualizar' : 'criar'} plano`,
                    'error'
                );
            }
        } catch (error) {
            console.error('Error saving plan:', error);
            window.app.showNotification(`Erro ao ${isEditing ? 'atualizar' : 'criar'} plano`, 'error');
        }
    }
    
    /**
     * Show the plan details view
     * @param {number} planId - ID of the plan to view
     */
    async viewPlan(planId) {
        const container = document.getElementById('view-container');
        
        // Show loading state
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando plano...</p>
            </div>
        `;
        
        try {
            // Get plan data
            const plan = await window.pywebview.api.get_training_plan(planId);
            
            if (!plan) {
                window.app.showNotification('Plano não encontrado', 'error');
                window.app.navigate('training-plans');
                return;
            }
            
            // Store current plan
            this.currentPlan = plan;
            
            // Clone the template
            const template = document.getElementById('view-training-plan-template');
            const planView = document.importNode(template.content, true);
            
            // Clear container and append the plan view
            container.innerHTML = '';
            container.appendChild(planView);
            
            // Fill plan details
            document.getElementById('plan-title').textContent = plan.name;
            document.getElementById('plan-level-display').querySelector('.meta-text').textContent = plan.level;
            document.getElementById('plan-duration-display').querySelector('.meta-text').textContent = `${plan.duration_weeks} semanas`;
            document.getElementById('plan-goal-display').textContent = plan.goal || 'Sem objetivo definido';
            document.getElementById('plan-notes-display').textContent = plan.notes || 'Sem notas adicionais';
            
            // Set up back button
            document.getElementById('back-from-plan-btn').addEventListener('click', () => {
                window.app.navigate('training-plans');
            });
            
            // Set up edit button
            document.getElementById('edit-plan-btn').addEventListener('click', () => {
                this.editPlan(planId);
            });
            
            // Set up export button
            document.getElementById('export-plan-btn').addEventListener('click', () => {
                this.exportPlan(planId);
            });
            
            // Render weeks
            this.renderPlanWeeks(plan);
        } catch (error) {
            console.error('Failed to load plan details:', error);
            window.app.showNotification('Erro ao carregar detalhes do plano', 'error');
            window.app.navigate('training-plans');
        }
    }
    
    /**
     * Render the weeks accordion in the plan details view
     * @param {Object} plan - The plan data
     */
    renderPlanWeeks(plan) {
        const weeksContainer = document.getElementById('weeks-accordion');
        weeksContainer.innerHTML = '';
        
        // Sort weeks by number
        const sortedWeeks = [...plan.weeks].sort((a, b) => a.week_number - b.week_number);
        
        // Create accordion items for each week
        sortedWeeks.forEach(week => {
            const weekItem = this.createWeekAccordionItem(week);
            weeksContainer.appendChild(weekItem);
        });
        
        // Set up accordion functionality
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const content = item.querySelector('.accordion-content');
                const isActive = item.classList.contains('active');
                
                // Close all items
                document.querySelectorAll('.accordion-item').forEach(i => {
                    i.classList.remove('active');
                });
                
                // Open clicked item if it was closed
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Create an accordion item for a week
     * @param {Object} week - The week data
     * @returns {HTMLElement} The accordion item
     */
    createWeekAccordionItem(week) {
        const template = this.weekAccordionTemplate;
        const accordionItem = document.importNode(template.content, true).querySelector('.accordion-item');
        
        // Set week data
        accordionItem.dataset.id = week.id;
        accordionItem.querySelector('.week-number').textContent = `Semana ${week.week_number}`;
        accordionItem.querySelector('.week-focus').textContent = week.focus;
        accordionItem.querySelector('.week-distance').textContent = `${week.total_distance} km`;
        
        // Create the training grid
        const gridContainer = accordionItem.querySelector('.week-training-grid');
        if (!gridContainer) return accordionItem;
        
        gridContainer.innerHTML = '';
        
        // Day names
        const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        // Sort sessions by day
        const sortedSessions = [...week.sessions].sort((a, b) => a.day_of_week - b.day_of_week);
        
        // Create columns for each day
        for (let i = 1; i <= 7; i++) {
            const session = sortedSessions.find(s => s.day_of_week === i) || null;
            const dayColumn = this.createDayColumn(dayNames[i-1], session);
            gridContainer.appendChild(dayColumn);
        }
        
        // Set week notes
        accordionItem.querySelector('.week-notes-content').textContent = week.notes || 'Sem notas para esta semana.';
        
        // Set up edit button
        accordionItem.querySelector('.edit-week-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editWeek(week.id);
        });
        
        return accordionItem;
    }
    
    /**
     * Create a day column for the training grid
     * @param {string} dayName - The name of the day
     * @param {Object} session - The session data
     * @returns {HTMLElement} The day column
     */
    createDayColumn(dayName, session) {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        // Day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = dayName;
        dayColumn.appendChild(dayHeader);
        
        // Training session
        const trainingSession = document.createElement('div');
        trainingSession.className = 'training-session';
        
        if (session) {
            trainingSession.dataset.id = session.id;
            
            // Session type
            const sessionType = document.createElement('div');
            sessionType.className = 'session-type';
            sessionType.textContent = session.workout_type;
            trainingSession.appendChild(sessionType);
            
            // Session details
            const sessionDetails = document.createElement('div');
            sessionDetails.className = 'session-details';
            
            // Add distance if available
            if (session.distance > 0) {
                const distanceText = document.createElement('p');
                distanceText.textContent = `${session.distance} km`;
                sessionDetails.appendChild(distanceText);
            }
            
            // Add duration if available
            if (session.duration > 0) {
                const durationText = document.createElement('p');
                durationText.textContent = `${session.duration} min`;
                sessionDetails.appendChild(distanceText);
            }
            
            // Add intensity
            const intensityText = document.createElement('p');
            intensityText.textContent = `Intensidade: ${session.intensity}`;
            sessionDetails.appendChild(intensityText);
            
            // Add pace target if available
            if (session.pace_target) {
                const paceText = document.createElement('p');
                paceText.textContent = `Ritmo: ${session.pace_target}`;
                sessionDetails.appendChild(paceText);
            }
            
            trainingSession.appendChild(sessionDetails);
            
            // Set up edit handler
            trainingSession.addEventListener('click', () => {
                this.editSession(session.id);
            });
        } else {
            // Empty session
            const emptyText = document.createElement('div');
            emptyText.className = 'session-type';
            emptyText.textContent = 'Sem treino';
            trainingSession.appendChild(emptyText);
        }
        
        dayColumn.appendChild(trainingSession);
        return dayColumn;
    }
    
    /**
     * Show the session edit dialog
     * @param {number} sessionId - ID of the session to edit
     */
    editSession(sessionId) {
        if (!this.currentPlan) return;
        
        // Find session in current plan
        let targetSession = null;
        let parentWeek = null;
        
        for (const week of this.currentPlan.weeks) {
            for (const session of week.sessions) {
                if (session.id === sessionId) {
                    targetSession = session;
                    parentWeek = week;
                    break;
                }
            }
            if (targetSession) break;
        }
        
        if (!targetSession) return;
        
        // Get day name
        const dayNames = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const dayName = dayNames[targetSession.day_of_week];
        
        // Clone session edit template
        const template = this.editSessionTemplate;
        const formContent = document.importNode(template.content, true);
        
        // Fill form with session data
        formContent.querySelector('#session-type').value = targetSession.workout_type;
        formContent.querySelector('#session-distance').value = targetSession.distance;
        formContent.querySelector('#session-duration').value = targetSession.duration;
        formContent.querySelector('#session-intensity').value = targetSession.intensity;
        formContent.querySelector('#session-pace').value = targetSession.pace_target || '';
        formContent.querySelector('#session-hr').value = targetSession.hr_zone || '';
        formContent.querySelector('#session-details').value = targetSession.details || '';
        
        // Show dialog
        components.showDialog(
            `Editar Sessão - ${dayName}`,
            formContent,
            [
                {
                    text: 'Cancelar',
                    primary: false
                },
                {
                    text: 'Salvar',
                    primary: true,
                    onClick: async () => {
                        // Get form data
                        const workoutType = document.getElementById('session-type').value;
                        const distance = parseFloat(document.getElementById('session-distance').value) || 0;
                        const duration = parseInt(document.getElementById('session-duration').value) || 0;
                        const intensity = document.getElementById('session-intensity').value;
                        const paceTarget = document.getElementById('session-pace').value;
                        const hrZone = document.getElementById('session-hr').value;
                        const details = document.getElementById('session-details').value;
                        
                        // Create session data
                        const sessionData = {
                            workout_type: workoutType,
                            distance,
                            duration,
                            intensity,
                            pace_target: paceTarget,
                            hr_zone: hrZone,
                            details
                        };
                        
                        try {
                            // Update session
                            const success = await window.pywebview.api.update_training_session(sessionId, sessionData);
                            
                            if (success) {
                                window.app.showNotification('Sessão atualizada com sucesso!', 'success');
                                // Reload plan to get updated data
                                this.viewPlan(this.currentPlan.id);
                            } else {
                                window.app.showNotification('Falha ao atualizar sessão', 'error');
                            }
                        } catch (error) {
                            console.error('Failed to update session:', error);
                            window.app.showNotification('Erro ao atualizar sessão', 'error');
                        }
                    }
                }
            ]
        );
    }
    
    /**
     * Show the week edit dialog
     * @param {number} weekId - ID of the week to edit
     */
    editWeek(weekId) {
        if (!this.currentPlan) return;
        
        // Find week in current plan
        const targetWeek = this.currentPlan.weeks.find(w => w.id === weekId);
        if (!targetWeek) return;
        
        // Create form content
        const formContent = document.createElement('div');
        formContent.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="week-focus">Foco da Semana</label>
                    <input type="text" id="week-focus" value="${targetWeek.focus || ''}">
                </div>
                <div class="form-group">
                    <label for="week-distance">Distância Total (km)</label>
                    <input type="number" id="week-distance" value="${targetWeek.total_distance || 0}" min="0" step="0.01">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label for="week-notes">Notas</label>
                    <textarea id="week-notes" rows="3">${targetWeek.notes || ''}</textarea>
                </div>
            </div>
        `;
        
        // Show dialog
        components.showDialog(
            `Editar Semana ${targetWeek.week_number}`,
            formContent,
            [
                {
                    text: 'Cancelar',
                    primary: false
                },
                {
                    text: 'Salvar',
                    primary: true,
                    onClick: async () => {
                        // Get form data
                        const focus = document.getElementById('week-focus').value;
                        const totalDistance = parseFloat(document.getElementById('week-distance').value) || 0;
                        const notes = document.getElementById('week-notes').value;
                        
                        // Create week data
                        const weekData = {
                            focus,
                            total_distance: totalDistance,
                            notes
                        };
                        
                        try {
                            // Update week
                            const success = await window.pywebview.api.update_training_week(weekId, weekData);
                            
                            if (success) {
                                window.app.showNotification('Semana atualizada com sucesso!', 'success');
                                // Reload plan to get updated data
                                this.viewPlan(this.currentPlan.id);
                            } else {
                                window.app.showNotification('Falha ao atualizar semana', 'error');
                            }
                        } catch (error) {
                            console.error('Failed to update week:', error);
                            window.app.showNotification('Erro ao atualizar semana', 'error');
                        }
                    }
                }
            ]
        );
    }
    
    /**
     * Export a plan to Excel
     * @param {number} planId - ID of the plan to export
     */
    async exportPlan(planId) {
        try {
            window.app.showNotification('Exportando plano de treino...', 'info');
            
            const success = await window.pywebview.api.export_training_plan_to_excel(planId);
            
            if (!success) {
                window.app.showNotification('Falha ao exportar plano de treino', 'error');
            }
            // A notificação de sucesso é mostrada pelo backend
        } catch (error) {
            console.error('Failed to export plan:', error);
            window.app.showNotification('Erro ao exportar plano de treino', 'error');
        }
    }
    
    /**
     * Show confirmation dialog for deleting a plan
     * @param {number} planId - ID of the plan to delete
     * @param {string} planName - Name of the plan for confirmation message
     */
    confirmDeletePlan(planId, planName) {
        components.showConfirmation(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o plano de treino "${planName}"? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    window.app.showNotification('Excluindo plano...', 'info');
                    
                    const success = await window.pywebview.api.delete_training_plan(planId);
                    
                    if (success) {
                        window.app.showNotification('Plano excluído com sucesso!', 'success');
                        
                        // Reload plans and update view
                        await this.loadPlans();
                        window.app.navigate('training-plans');
                    } else {
                        window.app.showNotification('Falha ao excluir plano', 'error');
                    }
                } catch (error) {
                    console.error('Failed to delete plan:', error);
                    window.app.showNotification('Erro ao excluir plano', 'error');
                }
            },
            () => {} // Do nothing on cancel
        );
    }
}

// Export singleton instance
const trainingPlans = new TrainingPlansManager();
