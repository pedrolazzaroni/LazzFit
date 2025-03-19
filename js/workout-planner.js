// LazzFit Workout Planner JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab panes
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Show selected tab pane
            const tabId = `${this.dataset.tab}-tab`;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Quick Workout Form
    const quickWorkoutForm = document.getElementById('quick-workout-form');
    if (quickWorkoutForm) {
        // Calculate pace and calories as user inputs data
        const distanceInput = document.getElementById('workout-distance');
        const hoursInput = document.getElementById('workout-hours');
        const minutesInput = document.getElementById('workout-minutes');
        const secondsInput = document.getElementById('workout-seconds');
        
        const calculateStats = () => {
            const distance = parseFloat(distanceInput.value) || 0;
            const hours = parseInt(hoursInput.value) || 0;
            const minutes = parseInt(minutesInput.value) || 0;
            const seconds = parseInt(secondsInput.value) || 0;
            
            // Calculate only if we have distance and some time
            if (distance > 0 && (hours > 0 || minutes > 0 || seconds > 0)) {
                // Calculate total seconds
                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                
                // Calculate pace (minutes per km)
                const paceSeconds = totalSeconds / distance;
                const paceMinutes = Math.floor(paceSeconds / 60);
                const paceRemainingSeconds = Math.round(paceSeconds % 60);
                const formattedPace = `${paceMinutes}:${paceRemainingSeconds.toString().padStart(2, '0')}/km`;
                
                // Calculate calories (rough estimate based on MET values)
                // MET value for running varies by pace, using a simplified calculation here
                const weight = 70; // Default weight in kg if not available
                const caloriesPerHour = distance * weight * 1.036;  // simplified calculation
                const hours = totalSeconds / 3600;
                const calories = Math.round(caloriesPerHour * hours);
                
                // Update display
                document.getElementById('avg-pace').textContent = formattedPace;
                document.getElementById('calories').textContent = `${calories} kcal`;
            } else {
                // Reset if not enough data
                document.getElementById('avg-pace').textContent = '--:--/km';
                document.getElementById('calories').textContent = '-- kcal';
            }
        };
        
        // Update calculations when inputs change
        [distanceInput, hoursInput, minutesInput, secondsInput].forEach(input => {
            input.addEventListener('input', calculateStats);
        });
        
        // Form submission
        quickWorkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(quickWorkoutForm);
            
            // Create workout data object
            const workoutData = {
                date: formData.get('workout_date'),
                type: formData.get('workout_type'),
                distance: formData.get('distance'),
                duration: `${formData.get('hours')}:${formData.get('minutes')}:${formData.get('seconds')}`,
                feeling: formData.get('feeling'),
                notes: formData.get('notes')
            };
            
            // Validate data
            if (!validateWorkoutData(workoutData)) {
                return;
            }
            
            // Submit data via AJAX
            fetch('../api/save_workout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workoutData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showNotification('Treino salvo com sucesso!', 'success');
                    
                    // Reset form or redirect
                    setTimeout(() => {
                        window.location.href = '../dashboard.php';
                    }, 1500);
                } else {
                    // Show error message
                    showNotification(data.message || 'Erro ao salvar treino', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Ocorreu um erro ao salvar o treino. Por favor, tente novamente.', 'error');
            });
        });
    }
    
    // Planned Workout Form
    const plannedWorkoutForm = document.getElementById('planned-workout-form');
    if (plannedWorkoutForm) {
        // Goal type switching
        const goalSelect = document.getElementById('planned-goal');
        const goalInputs = document.querySelectorAll('.goal-input');
        
        goalSelect.addEventListener('change', function() {
            // Hide all goal inputs
            goalInputs.forEach(input => input.style.display = 'none');
            
            // Show selected goal input
            const selectedGoal = this.value;
            document.getElementById(`goal-${selectedGoal}`).style.display = 'block';
        });
        
        // Form submission
        plannedWorkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(plannedWorkoutForm);
            const goalType = formData.get('workout_goal');
            
            // Create workout plan data object
            const workoutPlan = {
                date: formData.get('workout_date'),
                time: formData.get('workout_time'),
                type: formData.get('workout_type'),
                goal_type: goalType,
                notes: formData.get('notes')
            };
            
            // Add goal-specific data
            if (goalType === 'distance') {
                workoutPlan.distance = formData.get('distance');
            } else if (goalType === 'time') {
                workoutPlan.duration = `${formData.get('hours')}:${formData.get('minutes')}:${formData.get('seconds')}`;
            } else if (goalType === 'pace') {
                workoutPlan.pace = `${formData.get('pace_min')}:${formData.get('pace_sec')}`;
            }
            
            // Validate data
            if (!validatePlannedWorkout(workoutPlan)) {
                return;
            }
            
            // Submit data via AJAX
            fetch('../api/plan_workout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workoutPlan)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showNotification('Treino agendado com sucesso!', 'success');
                    
                    // Reset form or redirect
                    setTimeout(() => {
                        window.location.href = 'plans.php';
                    }, 1500);
                } else {
                    // Show error message
                    showNotification(data.message || 'Erro ao agendar treino', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Ocorreu um erro ao agendar o treino. Por favor, tente novamente.', 'error');
            });
        });
    }
    
    // View Plan buttons
    const viewPlanButtons = document.querySelectorAll('.view-plan-btn');
    if (viewPlanButtons.length > 0) {
        viewPlanButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planId = this.dataset.planId;
                
                // Create and show plan details modal
                showPlanDetailsModal(planId);
            });
        });
    }
    
    // Start Plan buttons
    const startPlanButtons = document.querySelectorAll('.start-plan-btn');
    if (startPlanButtons.length > 0) {
        startPlanButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planId = this.dataset.planId;
                
                // Create and show start plan confirmation modal
                showStartPlanModal(planId);
            });
        });
    }
    
    // Register new workout button
    const newWorkoutBtn = document.querySelector('.new-workout-btn');
    if (newWorkoutBtn) {
        newWorkoutBtn.addEventListener('click', function() {
            // Scroll to quick workout form
            document.querySelector('.planner-tabs [data-tab="quick"]').click();
            document.getElementById('quick-tab').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Validation Functions
    function validateWorkoutData(data) {
        // Check if distance is valid
        if (isNaN(parseFloat(data.distance)) || parseFloat(data.distance) <= 0) {
            showNotification('Por favor, informe uma distância válida', 'error');
            return false;
        }
        
        // Check if duration is valid (not all zeros)
        const durationParts = data.duration.split(':').map(Number);
        if (durationParts.every(part => part === 0)) {
            showNotification('Por favor, informe uma duração válida', 'error');
            return false;
        }
        
        // Check if feeling is selected
        if (!data.feeling) {
            showNotification('Por favor, selecione como você se sentiu', 'error');
            return false;
        }
        
        return true;
    }
    
    function validatePlannedWorkout(data) {
        // Check date and time
        if (!data.date || !data.time) {
            showNotification('Por favor, informe data e horário', 'error');
            return false;
        }
        
        // Check goal specific data
        if (data.goal_type === 'distance' && (isNaN(parseFloat(data.distance)) || parseFloat(data.distance) <= 0)) {
            showNotification('Por favor, informe uma distância válida', 'error');
            return false;
        }
        
        if (data.goal_type === 'time') {
            const durationParts = data.duration.split(':').map(Number);
            if (durationParts.every(part => part === 0)) {
                showNotification('Por favor, informe uma duração válida', 'error');
                return false;
            }
        }
        
        return true;
    }
    
    // Modal Functions
    function showPlanDetailsModal(planId) {
        // Fetch plan details
        fetch(`../api/get_plan_details.php?plan_id=${planId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Create modal with plan details
                createPlanDetailsModal(data.plan);
            } else {
                showNotification('Erro ao carregar detalhes do plano', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Ocorreu um erro ao carregar os detalhes do plano', 'error');
        });
    }
    
    function createPlanDetailsModal(plan) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal plan-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${plan.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="plan-description">
                        <h3>Sobre este plano</h3>
                        <p>${plan.description}</p>
                    </div>
                    <div class="plan-meta">
                        <div class="meta-item">
                            <span class="meta-label">Nível:</span>
                            <span class="meta-value ${plan.difficulty_level.toLowerCase()}">${plan.difficulty_level}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Duração:</span>
                            <span class="meta-value">${plan.duration_weeks} semanas</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Objetivo:</span>
                            <span class="meta-value">${plan.goal}</span>
                        </div>
                    </div>
                    <div class="plan-structure">
                        <h3>Estrutura do Plano</h3>
                        <p>Este plano inclui uma combinação equilibrada de corridas leves, treinos de ritmo, intervalados e corridas longas para preparar você para ${plan.goal}.</p>
                        
                        <h4>Exemplo de Semana:</h4>
                        <div class="week-sample">
                            <div class="day-item">
                                <span class="day-name">Segunda</span>
                                <span class="day-workout">Corrida leve - 5km</span>
                            </div>
                            <div class="day-item">
                                <span class="day-name">Terça</span>
                                <span class="day-workout">Descanso</span>
                            </div>
                            <div class="day-item">
                                <span class="day-name">Quarta</span>
                                <span class="day-workout">Intervalado - 6x400m</span>
                            </div>
                            <div class="day-item">
                                <span class="day-name">Quinta</span>
                                <span class="day-workout">Corrida leve - 5km</span>
                            </div>
                            <div class="day-item">
                                <span class="day-name">Sexta</span>
                                <span class="day-workout">Descanso</span>
                            </div>
                            <div class="day-item">
                                <span class="day-name">Sábado</span>
                                <span class="day-workout">Corrida de ritmo - 3km</span>
                            </div>
                            <div class="day-item">
                                <span class="day-name">Domingo</span>
                                <span class="day-workout">Corrida longa - 10km</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cta cta--secondary" id="close-plan-details">Fechar</button>
                    <button class="cta cta--primary" id="start-plan-from-details" data-plan-id="${plan.plan_id}">Iniciar Plano</button>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add modal style
        addModalStyle();
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => closeModal(modal));
        
        // Close button in footer
        const closeFooterBtn = modal.querySelector('#close-plan-details');
        closeFooterBtn.addEventListener('click', () => closeModal(modal));
        
        // Start plan button
        const startBtn = modal.querySelector('#start-plan-from-details');
        startBtn.addEventListener('click', function() {
            closeModal(modal);
            showStartPlanModal(this.dataset.planId);
        });
        
        // Close when clicking outside modal content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    }
    
    function showStartPlanModal(planId) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal start-plan-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Iniciar Plano de Treino</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Você está prestes a iniciar um novo plano de treino. Escolha a data de início:</p>
                    <form id="start-plan-form">
                        <div class="form-group">
                            <label for="start-date">Data de início</label>
                            <input type="date" id="start-date" name="start_date" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label for="plan-notes">Observações (opcional)</label>
                            <textarea id="plan-notes" name="notes" rows="3" placeholder="Adicione observações ou objetivos pessoais..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="cta cta--secondary" id="cancel-start-plan">Cancelar</button>
                    <button class="cta cta--primary" id="confirm-start-plan" data-plan-id="${planId}">Confirmar</button>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add modal style if not already added
        addModalStyle();
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => closeModal(modal));
        
        // Cancel button
        const cancelBtn = modal.querySelector('#cancel-start-plan');
        cancelBtn.addEventListener('click', () => closeModal(modal));
        
        // Confirm button
        const confirmBtn = modal.querySelector('#confirm-start-plan');
        confirmBtn.addEventListener('click', function() {
            const startDate = document.getElementById('start-date').value;
            const notes = document.getElementById('plan-notes').value;
            
            if (!startDate) {
                showNotification('Por favor, selecione uma data de início', 'error');
                return;
            }
            
            // Start plan via AJAX
            fetch('../api/start_plan.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: this.dataset.planId,
                    start_date: startDate,
                    notes: notes
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showNotification('Plano iniciado com sucesso!', 'success');
                    
                    // Close modal
                    closeModal(modal);
                    
                    // Redirect to plans page
                    setTimeout(() => {
                        window.location.href = 'plans.php';
                    }, 1500);
                } else {
                    // Show error message
                    showNotification(data.message || 'Erro ao iniciar plano', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Ocorreu um erro ao iniciar o plano. Por favor, tente novamente.', 'error');
            });
        });
        
        // Close when clicking outside modal content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300); // Wait for animation to finish
    }
    
    function addModalStyle() {
        // Check if style is already added
        if (document.getElementById('modal-styles')) {
            return;
        }
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-content {
                background-color: #fff;
                border-radius: var(--border-radius);
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }
            
            .modal.active .modal-content {
                transform: translateY(0);
            }
            
            .modal-header {
                padding: 15px 20px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 1.3rem;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--gray-color);
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                padding: 15px 20px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            /* Plan details specific styles */
            .plan-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin: 20px 0;
            }
            
            .meta-item {
                background-color: #f5f5f5;
                padding: 10px 15px;
                border-radius: var(--border-radius);
            }
            
            .meta-label {
                font-size: 0.85rem;
                color: var(--gray-color);
                display: block;
            }
            
            .meta-value {
                font-weight: 600;
                color: var(--dark-color);
            }
            
            .meta-value.iniciante {
                color: #34C759;
            }
            
            .meta-value.intermediário {
                color: #FF9500;
            }
            
            .meta-value.avançado {
                color: #FF3B30;
            }
            
            .week-sample {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            
            .day-item {
                background-color: #f5f5f5;
                padding: 12px;
                border-radius: var(--border-radius);
            }
            
            .day-name {
                font-weight: 600;
                display: block;
                margin-bottom: 5px;
            }
            
            .day-workout {
                font-size: 0.9rem;
                color: var(--gray-color);
            }
        `;
        
        // Add style to document
        document.head.appendChild(style);
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('planner-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'planner-notification';
            document.body.appendChild(notification);
            
            // Add style
            const style = document.createElement('style');
            style.textContent = `
                #planner-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: var(--border-radius);
                    color: white;
                    font-weight: 500;
                    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
                    z-index: 1001;
                    transform: translateY(100%);
                    opacity: 0;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                
                #planner-notification.success {
                    background-color: #34C759;
                }
                
                #planner-notification.error {
                    background-color: #FF3B30;
                }
                
                #planner-notification.info {
                    background-color: #0A84FF;
                }
                
                #planner-notification.active {
                    transform: translateY(0);
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set notification content and type
        notification.textContent = message;
        notification.className = type;
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
});
