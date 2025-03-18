/**
 * App UI Module
 * Contains UI-related methods for the App class
 */

// Extend App prototype with UI methods
(function(App) {
    if (!App) {
        console.error("AppClass não encontrada. O módulo app-core.js deve ser carregado primeiro.");
        return;
    }
    
    /**
     * Show loading indicator
     */
    App.prototype.showLoading = function() {
        // Check if there's already a loading overlay
        let overlay = document.querySelector('.loading-overlay');
        
        if (!overlay) {
            // Create overlay
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            
            // Add spinner
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            overlay.appendChild(spinner);
            
            // Add loading text
            const text = document.createElement('p');
            text.textContent = 'Carregando...';
            overlay.appendChild(text);
            
            // Add to document
            document.body.appendChild(overlay);
        }
    };
    
    /**
     * Hide loading indicator
     */
    App.prototype.hideLoading = function() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.add('animate-fade-out');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    };
    
    /**
     * Show notification
     * @param {string} message - Message to show
     * @param {string} type - Type of notification (success, error, info)
     * @param {string} [id] - Optional ID for the notification
     */
    App.prototype.showNotification = function(message, type = 'info', id = null) {
        const container = document.querySelector('.notifications-container');
        
        if (!container) {
            const newContainer = document.createElement('div');
            newContainer.className = 'notifications-container';
            document.body.appendChild(newContainer);
            return this.showNotification(message, type, id);
        }
        
        // Check if there's already a notification with the same ID
        if (id) {
            const existingNotif = container.querySelector(`[data-id="${id}"]`);
            if (existingNotif) {
                existingNotif.remove();
            }
        }
        
        // Criar notificação manualmente se components não estiver disponível
        let notification;
        if (window.components && typeof components.createNotification === 'function') {
            notification = components.createNotification(message, type, id);
        } else {
            notification = document.createElement('div');
            notification.className = `notification ${type} animate-fade-in`;
            if (id) notification.dataset.id = id;
            notification.innerHTML = `
                <span class="material-icons-round">${type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info'}</span>
                <span>${message}</span>
                <span class="material-icons-round close-btn">close</span>
            `;
            
            const closeBtn = notification.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
        
        container.appendChild(notification);
        return notification;
    };
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    App.prototype.showError = function(message) {
        this.showNotification(message, 'error');
    };
    
    /**
     * Show empty state for a specific view
     * @param {string} viewName - Name of the view
     */
    App.prototype.showEmptyState = function(viewName) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        switch (viewName) {
            case 'runs':
                emptyState.innerHTML = `
                    <span class="material-icons-round">directions_run</span>
                    <p>Você ainda não tem nenhum treino registrado.</p>
                    <button class="btn primary" id="add-first-run-btn">Adicionar Primeiro Treino</button>
                `;
                
                this.viewContainer.appendChild(emptyState);
                
                document.getElementById('add-first-run-btn').addEventListener('click', () => {
                    this.navigate('add-run');
                });
                break;
                
            case 'statistics':
                emptyState.innerHTML = `
                    <span class="material-icons-round">bar_chart</span>
                    <p>Não há dados suficientes para gerar estatísticas.</p>
                    <p>Registre alguns treinos para ver suas estatísticas aqui.</p>
                    <button class="btn primary" id="add-run-for-stats-btn">Adicionar Treino</button>
                `;
                
                this.viewContainer.appendChild(emptyState);
                
                document.getElementById('add-run-for-stats-btn').addEventListener('click', () => {
                    this.navigate('add-run');
                });
                break;
                
            default:
                emptyState.innerHTML = `
                    <span class="material-icons-round">search_off</span>
                    <p>Não há dados para mostrar.</p>
                `;
                this.viewContainer.appendChild(emptyState);
        }
    };

})(window.AppClass);
