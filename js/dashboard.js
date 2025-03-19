// LazzFit Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('#sidebar-toggle');
    const sidebarClose = document.querySelector('#sidebar-close');
    const sidebar = document.querySelector('.dashboard-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            document.body.classList.add('sidebar-open');
        });
    }
    
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        });
    }
    
    // Click outside to close sidebar on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            sidebar && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(event.target) && 
            event.target !== sidebarToggle) {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });
    
    // Progress Chart
    const progressChartEl = document.querySelector('#progressChart');
    
    if (progressChartEl) {
        const ctx = progressChartEl.getContext('2d');
        
        // Sample data
        const chartData = {
            labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
            datasets: [
                {
                    label: 'Distância (km)',
                    data: [8, 0, 5, 6, 0, 4, 12],
                    backgroundColor: 'rgba(255, 140, 0, 0.2)',
                    borderColor: '#FF8C00',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        };
        
        const myChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 140, 0, 0.3)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 10,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });
        
        // Chart period toggle
        const chartOptions = document.querySelectorAll('.chart-option');
        if (chartOptions) {
            chartOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove active class from all options
                    chartOptions.forEach(opt => opt.classList.remove('active'));
                    
                    // Add active class to clicked option
                    this.classList.add('active');
                    
                    // Get the selected period
                    const period = this.dataset.period;
                    
                    // Update chart data based on period
                    let newLabels = [];
                    let newData = [];
                    
                    if (period === 'week') {
                        newLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
                        newData = [8, 0, 5, 6, 0, 4, 12];
                    } else if (period === 'month') {
                        newLabels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
                        newData = [25, 32, 28, 35];
                    } else if (period === 'year') {
                        newLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
                        newData = [90, 85, 110, 125, 140, 130, 145, 150, 120];
                    }
                    
                    // Update chart
                    myChart.data.labels = newLabels;
                    myChart.data.datasets[0].data = newData;
                    myChart.update();
                });
            });
        }
    }
    
    // Notifications toggle
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        // Create notifications dropdown
        const notificationsDropdown = document.createElement('div');
        notificationsDropdown.className = 'notifications-dropdown';
        notificationsDropdown.innerHTML = `
            <div class="notifications-header">
                <h3>Notificações</h3>
                <button class="mark-as-read">Marcar como lidas</button>
            </div>
            <div class="notifications-list">
                <div class="notification-item unread">
                    <div class="notification-icon"><i class="fas fa-calendar-check"></i></div>
                    <div class="notification-content">
                        <p>Seu treino de hoje está programado para às 18:00</p>
                        <span class="notification-time">Há 1 hora</span>
                    </div>
                </div>
                <div class="notification-item unread">
                    <div class="notification-icon"><i class="fas fa-comment"></i></div>
                    <div class="notification-content">
                        <p>Carlos comentou no seu treino de 5K</p>
                        <span class="notification-time">Há 2 horas</span>
                    </div>
                </div>
                <div class="notification-item unread">
                    <div class="notification-icon"><i class="fas fa-medal"></i></div>
                    <div class="notification-content">
                        <p>Você ganhou uma medalha por completar 10 treinos!</p>
                        <span class="notification-time">Há 1 dia</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon"><i class="fas fa-thumbs-up"></i></div>
                    <div class="notification-content">
                        <p>Ana curtiu seu treino de 10K</p>
                        <span class="notification-time">Há 2 dias</span>
                    </div>
                </div>
            </div>
            <div class="notifications-footer">
                <a href="notifications.html">Ver todas</a>
            </div>
        `;
        
        // Add notifications CSS
        const notificationsStyle = document.createElement('style');
        notificationsStyle.textContent = `
            .notifications-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                width: 320px;
                background: white;
                border-radius: var(--border-radius);
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                z-index: 100;
                overflow: hidden;
                display: none;
            }
            .notifications-dropdown.active {
                display: block;
                animation: fadeIn 0.3s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .notifications-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid rgba(0,0,0,0.05);
            }
            .notifications-header h3 {
                margin: 0;
                font-size: 1rem;
            }
            .mark-as-read {
                background: none;
                border: none;
                color: var(--primary-color);
                font-size: 0.8rem;
                cursor: pointer;
                font-weight: 500;
            }
            .notifications-list {
                max-height: 320px;
                overflow-y: auto;
            }
            .notification-item {
                display: flex;
                padding: 15px;
                border-bottom: 1px solid rgba(0,0,0,0.05);
                transition: all 0.2s ease;
            }
            .notification-item:hover {
                background-color: rgba(0,0,0,0.02);
            }
            .notification-item.unread {
                background-color: rgba(255,140,0,0.05);
            }
            .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255,140,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                color: var(--primary-color);
            }
            .notification-content {
                flex: 1;
            }
            .notification-content p {
                margin: 0 0 5px;
                font-size: 0.9rem;
            }
            .notification-time {
                font-size: 0.8rem;
                color: var(--gray-color);
            }
            .notifications-footer {
                padding: 15px;
                text-align: center;
                border-top: 1px solid rgba(0,0,0,0.05);
            }
            .notifications-footer a {
                color: var(--primary-color);
                font-size: 0.9rem;
                font-weight: 500;
            }
        `;
        document.head.appendChild(notificationsStyle);
        
        // Append to notifications container
        const notificationsContainer = document.querySelector('.notifications');
        notificationsContainer.appendChild(notificationsDropdown);
        
        // Toggle dropdown
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('active');
        });
        
        // Close dropdown on click outside
        document.addEventListener('click', function(e) {
            if (!notificationsDropdown.contains(e.target) && e.target !== notificationBtn) {
                notificationsDropdown.classList.remove('active');
            }
        });
        
        // Mark all as read functionality
        const markAsReadBtn = notificationsDropdown.querySelector('.mark-as-read');
        markAsReadBtn.addEventListener('click', function() {
            const unreadItems = notificationsDropdown.querySelectorAll('.notification-item.unread');
            unreadItems.forEach(item => item.classList.remove('unread'));
            
            // Update badge
            const badge = document.querySelector('.notification-badge');
            badge.style.display = 'none';
        });
    }
    
    // Schedule day hover effect
    const scheduleDays = document.querySelectorAll('.schedule-day');
    scheduleDays.forEach(day => {
        day.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active') && !this.classList.contains('completed')) {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1)';
            }
        });
        
        day.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active') && !this.classList.contains('completed')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            }
        });
    });
    
    // Community activity like functionality
    const likeButtons = document.querySelectorAll('.activity-actions button:first-child');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle liked state
            const isLiked = this.classList.toggle('liked');
            
            // Get current count
            let likeText = this.textContent.trim();
            let count = parseInt(likeText.match(/\d+/)[0]);
            
            // Update count based on liked state
            count = isLiked ? count + 1 : count - 1;
            
            // Update button text
            this.innerHTML = `<i class="fas fa-thumbs-up"></i> ${count}`;
            
            // Style for liked state
            if (isLiked) {
                this.style.color = '#FF8C00';
            } else {
                this.style.color = 'var(--gray-color)';
            }
            
            // In a real app, you would send this update to the server
        });
    });
    
    // Initialize workout form (to be added to the completeWorkout modal)
    function initWorkoutForm() {
        const workoutModal = document.createElement('div');
        workoutModal.className = 'workout-modal';
        workoutModal.innerHTML = `
            <div class="workout-modal-content">
                <div class="workout-modal-header">
                    <h2>Registrar Treino</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="workout-form">
                    <div class="form-group">
                        <label for="workout-date">Data</label>
                        <input type="date" id="workout-date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="workout-distance">Distância (km)</label>
                        <input type="number" id="workout-distance" name="distance" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="workout-duration">Duração</label>
                        <div class="duration-inputs">
                            <input type="number" id="workout-hours" name="hours" placeholder="hh" min="0" required>
                            <span>:</span>
                            <input type="number" id="workout-minutes" name="minutes" placeholder="mm" min="0" max="59" required>
                            <span>:</span>
                            <input type="number" id="workout-seconds" name="seconds" placeholder="ss" min="0" max="59" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Como você se sentiu?</label>
                        <div class="feeling-selector">
                            <label class="feeling-option">
                                <input type="radio" name="feeling" value="good" required>
                                <span class="feeling-icon good"><i class="fas fa-smile"></i></span>
                                <span>Bem</span>
                            </label>
                            <label class="feeling-option">
                                <input type="radio" name="feeling" value="average" required>
                                <span class="feeling-icon average"><i class="fas fa-meh"></i></span>
                                <span>Normal</span>
                            </label>
                            <label class="feeling-option">
                                <input type="radio" name="feeling" value="bad" required>
                                <span class="feeling-icon bad"><i class="fas fa-frown"></i></span>
                                <span>Cansado</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="workout-notes">Notas</label>
                        <textarea id="workout-notes" name="notes" rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="cta cta--primary">Salvar Treino</button>
                    </div>
                </form>
            </div>
        `;
        
        // Add workout modal CSS
        const workoutModalStyle = document.createElement('style');
        workoutModalStyle.textContent = `
            .workout-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            .workout-modal.active {
                opacity: 1;
                visibility: visible;
            }
            .workout-modal-content {
                background: white;
                width: 90%;
                max-width: 500px;
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: 0 5px 30px rgba(0,0,0,0.2);
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }
            .workout-modal.active .workout-modal-content {
                transform: translateY(0);
            }
            .workout-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(0,0,0,0.05);
            }
            .workout-modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--gray-color);
            }
            #workout-form {
                padding: 20px;
            }
            .duration-inputs {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .duration-inputs input {
                width: 60px;
                text-align: center;
            }
            .feeling-selector {
                display: flex;
                justify-content: space-between;
                margin-top: 10px;
            }
            .feeling-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                cursor: pointer;
            }
            .feeling-option input {
                position: absolute;
                opacity: 0;
            }
            .feeling-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                transition: all 0.2s ease;
                font-size: 24px;
            }
            .feeling-icon.good {
                color: #34C759;
            }
            .feeling-icon.average {
                color: #FF9500;
            }
            .feeling-icon.bad {
                color: #FF3B30;
            }
            .feeling-option input:checked + .feeling-icon.good {
                background-color: rgba(52, 199, 89, 0.1);
                border: 2px solid #34C759;
            }
            .feeling-option input:checked + .feeling-icon.average {
                background-color: rgba(255, 149, 0, 0.1);
                border: 2px solid #FF9500;
            }
            .feeling-option input:checked + .feeling-icon.bad {
                background-color: rgba(255, 59, 48, 0.1);
                border: 2px solid #FF3B30;
            }
            .form-actions {
                text-align: right;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(workoutModalStyle);
        
        // Append modal to body
        document.body.appendChild(workoutModal);
        
        // Show modal functionality
        const completeWorkoutBtn = document.querySelector('.welcome-actions .cta');
        if (completeWorkoutBtn) {
            completeWorkoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                workoutModal.classList.add('active');
                
                // Set today's date as default
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('workout-date').value = today;
            });
        }
        
        // Close modal on X click
        const closeModalBtn = workoutModal.querySelector('.close-modal');
        closeModalBtn.addEventListener('click', function() {
            workoutModal.classList.remove('active');
        });
        
        // Close modal when clicking outside
        workoutModal.addEventListener('click', function(e) {
            if (e.target === workoutModal) {
                workoutModal.classList.remove('active');
            }
        });
        
        // Form submission
        const workoutForm = document.getElementById('workout-form');
        workoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(workoutForm);
            const workoutData = {
                date: formData.get('date'),
                distance: formData.get('distance'),
                duration: `${formData.get('hours')}:${formData.get('minutes')}:${formData.get('seconds')}`,
                feeling: formData.get('feeling'),
                notes: formData.get('notes')
            };
            
            // Here you would normally send this data to a server
            console.log('Workout data:', workoutData);
            
            // For demo purposes, add the workout to the table
            addWorkoutToTable(workoutData);
            
            // Close the modal
            workoutModal.classList.remove('active');
            
            // Show success message
            showNotification('Treino salvo com sucesso!', 'success');
        });
    }
    
    // Initialize the workout form
    initWorkoutForm();
    
    // Function to add workout to table
    function addWorkoutToTable(workout) {
        const tableBody = document.querySelector('.runs-table tbody');
        if (tableBody) {
            // Format the date
            const dateObj = new Date(workout.date);
            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
            
            // Calculate pace
            const durationParts = workout.duration.split(':').map(Number);
            const totalMinutes = durationParts[0] * 60 + durationParts[1] + durationParts[2] / 60;
            const paceMinutes = Math.floor(totalMinutes / workout.distance);
            const paceSeconds = Math.round(((totalMinutes / workout.distance) - paceMinutes) * 60);
            const formattedPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}/km`;
            
            // Create feeling icon based on selection
            let feelingIcon;
            if (workout.feeling === 'good') {
                feelingIcon = '<div class="feeling good"><i class="fas fa-smile"></i></div>';
            } else if (workout.feeling === 'average') {
                feelingIcon = '<div class="feeling average"><i class="fas fa-meh"></i></div>';
            } else {
                feelingIcon = '<div class="feeling bad"><i class="fas fa-frown"></i></div>';
            }
            
            // Create new row
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${formattedDate}</td>
                <td>${workout.distance} km</td>
                <td>${workout.duration.substring(0, 5)}</td>
                <td>${formattedPace}</td>
                <td>${feelingIcon}</td>
            `;
            
            // Add row to table at the top
            tableBody.insertBefore(newRow, tableBody.firstChild);
        }
    }
    
    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-message">${message}</div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add notification CSS
        const notificationStyle = document.createElement('style');
        notificationStyle.textContent = `
            .dashboard-notification {
                position: fixed;
                bottom: 30px;
                right: 30px;
                padding: 15px 20px;
                border-radius: var(--border-radius);
                background: white;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                z-index: 2000;
                animation: slideIn 0.3s ease;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .dashboard-notification.info {
                border-left: 4px solid #0A84FF;
            }
            .dashboard-notification.success {
                border-left: 4px solid #34C759;
            }
            .dashboard-notification.warning {
                border-left: 4px solid #FF9500;
            }
            .dashboard-notification.error {
                border-left: 4px solid #FF3B30;
            }
            .notification-message {
                font-size: 0.9rem;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: var(--gray-color);
            }
        `;
        document.head.appendChild(notificationStyle);
        
        // Add to body
        document.body.appendChild(notification);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
});
