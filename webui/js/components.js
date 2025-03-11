/**
 * UI Components Module
 * Provides factory methods for creating dynamic UI components
 */
class UIComponents {
    /**
     * Create a run card element
     * @param {Object} run - Run data object
     * @param {Function} onEdit - Edit callback
     * @param {Function} onDelete - Delete callback
     * @returns {HTMLElement} The card element
     */
    createRunCard(run, onEdit, onDelete) {
        // Clone the template
        const template = document.getElementById('run-card-template');
        const card = document.importNode(template.content, true).querySelector('.run-card');
        
        // Fill data
        card.dataset.id = run.id;
        
        // Date and workout type
        card.querySelector('.date-value').textContent = run.date;
        card.querySelector('.workout-type').textContent = run.workout_type || 'Corrida';
        
        // Stats
        card.querySelector('.distance').textContent = run.distance.toFixed(2);
        
        const duration = parseInt(run.duration);
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        const durationText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;
        card.querySelector('.duration').textContent = durationText;
        
        card.querySelector('.pace').textContent = run.avg_pace;
        
        // Health stats (bpm, calories, elevation)
        const healthStats = card.querySelector('.health-stats');
        
        if (run.avg_bpm) {
            const bpmStat = document.createElement('div');
            bpmStat.className = 'stat';
            bpmStat.innerHTML = `<span class="material-icons-round">favorite</span> ${run.avg_bpm} BPM`;
            if (run.max_bpm) {
                bpmStat.innerHTML += ` (máx: ${run.max_bpm})`;
            }
            healthStats.appendChild(bpmStat);
        }
        
        if (run.calories) {
            const calStat = document.createElement('div');
            calStat.className = 'stat';
            calStat.innerHTML = `<span class="material-icons-round">local_fire_department</span> ${run.calories} kcal`;
            healthStats.appendChild(calStat);
        }
        
        if (run.elevation_gain) {
            const elevStat = document.createElement('div');
            elevStat.className = 'stat';
            elevStat.innerHTML = `<span class="material-icons-round">terrain</span> ${run.elevation_gain} m`;
            healthStats.appendChild(elevStat);
        }
        
        // Notes in expanded area
        const expandedArea = card.querySelector('.card-expanded');
        if (run.notes && run.notes.trim() !== '') {
            const notesSection = document.createElement('div');
            notesSection.classList.add('notes-section');
            
            const notesTitle = document.createElement('h4');
            notesTitle.textContent = 'Notas:';
            notesSection.appendChild(notesTitle);
            
            const notesContent = document.createElement('p');
            notesContent.textContent = run.notes;
            notesSection.appendChild(notesContent);
            
            expandedArea.appendChild(notesSection);
        } else {
            const noNotes = document.createElement('p');
            noNotes.className = 'no-notes';
            noNotes.textContent = 'Nenhuma nota para este treino.';
            expandedArea.appendChild(noNotes);
        }
        
        // Event handlers
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (onEdit) onEdit(run.id);
        });
        
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (onDelete) onDelete(run.id);
        });
        
        const expandBtn = card.querySelector('.expand-btn');
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCardExpansion(card, expandBtn);
        });
        
        return card;
    }
    
    /**
     * Toggle the expansion state of a run card
     * @param {HTMLElement} card - The card element
     * @param {HTMLElement} button - The expand/collapse button
     */
    toggleCardExpansion(card, button) {
        const expanded = card.querySelector('.card-expanded');
        const isExpanded = expanded.style.display === 'block';
        
        if (isExpanded) {
            expanded.style.display = 'none';
            button.querySelector('.material-icons-round').textContent = 'expand_more';
        } else {
            expanded.style.display = 'block';
            button.querySelector('.material-icons-round').textContent = 'expand_less';
        }
    }
    
    /**
     * Create a notification element
     * @param {string} message - The notification message
     * @param {string} type - Notification type (success, error, info)
     * @returns {HTMLElement} The notification element
     */
    createNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} animate-fade-in`;
        
        const icon = document.createElement('span');
        icon.className = 'material-icons-round';
        
        switch (type) {
            case 'success':
                icon.textContent = 'check_circle';
                break;
            case 'error':
                icon.textContent = 'error';
                break;
            case 'warning':
                icon.textContent = 'warning';
                break;
            default:
                icon.textContent = 'info';
        }
        
        notification.appendChild(icon);
        
        const messageEl = document.createElement('span');
        messageEl.textContent = message;
        notification.appendChild(messageEl);
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'material-icons-round close-btn';
        closeBtn.textContent = 'close';
        closeBtn.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        notification.appendChild(closeBtn);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
        return notification;
    }
    
    /**
     * Show a modal dialog
     * @param {string} title - Dialog title
     * @param {string|HTMLElement} content - Dialog content
     * @param {Array} actions - Button configurations
     */
    showDialog(title, content, actions = []) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay animate-fade-in';
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog animate-slide-up';
        
        const dialogHeader = document.createElement('div');
        dialogHeader.className = 'dialog-header';
        
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        dialogHeader.appendChild(titleEl);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '<span class="material-icons-round">close</span>';
        closeBtn.addEventListener('click', () => {
            this.closeDialog(overlay);
        });
        dialogHeader.appendChild(closeBtn);
        
        dialog.appendChild(dialogHeader);
        
        const dialogContent = document.createElement('div');
        dialogContent.className = 'dialog-content';
        if (typeof content === 'string') {
            dialogContent.textContent = content;
        } else {
            dialogContent.appendChild(content);
        }
        dialog.appendChild(dialogContent);
        
        if (actions.length > 0) {
            const dialogActions = document.createElement('div');
            dialogActions.className = 'dialog-actions';
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.text;
                button.className = `btn ${action.primary ? 'primary' : ''}`;
                button.addEventListener('click', () => {
                    if (action.onClick) {
                        action.onClick();
                    }
                    this.closeDialog(overlay);
                });
                dialogActions.appendChild(button);
            });
            
            dialog.appendChild(dialogActions);
        }
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        return {
            overlay,
            dialog,
            close: () => this.closeDialog(overlay)
        };
    }
    
    /**
     * Close a dialog
     * @param {HTMLElement} overlay - The dialog overlay
     */
    closeDialog(overlay) {
        const dialog = overlay.querySelector('.dialog');
        dialog.classList.remove('animate-slide-up');
        dialog.classList.add('animate-slide-down');
        overlay.classList.remove('animate-fade-in');
        overlay.classList.add('animate-fade-out');
        
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Confirm callback
     * @param {Function} onCancel - Cancel callback
     */
    showConfirmation(title, message, onConfirm, onCancel) {
        return this.showDialog(
            title,
            message,
            [
                {
                    text: 'Cancelar',
                    primary: false,
                    onClick: onCancel
                },
                {
                    text: 'Confirmar',
                    primary: true,
                    onClick: onConfirm
                }
            ]
        );
    }
    
    /**
     * Create a loading spinner
     * @returns {HTMLElement} The spinner element
     */
    createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        return spinner;
    }

    /**
     * Apply auto-formatting to input fields
     * @param {HTMLElement} distanceField - Distance input element
     * @param {HTMLElement} durationField - Duration input element
     */
    applyInputFormatting(distanceField, durationField) {
        // Distance formatting (XX.XX)
        distanceField.addEventListener('input', (e) => {
            let value = e.target.value;
            
            // Remove caracteres não numéricos exceto ponto
            value = value.replace(/[^\d.]/g, '');
            
            // Permitir apenas um ponto decimal
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Garantir sempre duas casas decimais
            if (parts.length === 2) {
                parts[1] = parts[1].slice(0, 2); // Limitar a 2 casas decimais
                value = parts.join('.');
            }
            
            e.target.value = value;
            
            // Adicionar formatação visual 
            if (value.length > 0) {
                // Remover a formatação existente se houver
                const formGroup = distanceField.closest('.form-group');
                let formattedDisplay = formGroup.querySelector('.formatted-display');
                if (!formattedDisplay) {
                    formattedDisplay = document.createElement('div');
                    formattedDisplay.className = 'formatted-display';
                    formattedDisplay.style.cssText = 'font-size: 12px; color: #FF8533; margin-top: 5px;';
                    formGroup.appendChild(formattedDisplay);
                }
                
                // Formatar para XX.XX
                let formattedValue = formatters.formatDistance(value || 0);
                formattedDisplay.textContent = `Valor formatado: ${formattedValue} km`;
            }
        });
        
        // Duration formatting with HH:MM:SS or MM:SS
        durationField.addEventListener('input', (e) => {
            let value = e.target.value;
            
            // Allow only digits and colons
            value = value.replace(/[^\d:]/g, '');
            
            // Apply HH:MM:SS or MM:SS formatting logic
            const digitParts = value.replace(/:/g, '').split('');
            let formattedTime = '';
            
            if (digitParts.length <= 2) {
                // SS format - just show seconds
                formattedTime = digitParts.join('').padStart(2, '0');
            } else if (digitParts.length <= 4) {
                // MM:SS format
                const minutes = digitParts.slice(0, -2).join('').padStart(2, '0');
                const seconds = digitParts.slice(-2).join('').padStart(2, '0');
                formattedTime = `${minutes}:${seconds}`;
            } else {
                // HH:MM:SS format
                const length = digitParts.length;
                const seconds = digitParts.slice(-2).join('').padStart(2, '0');
                const minutes = digitParts.slice(-4, -2).join('').padStart(2, '0');
                const hours = digitParts.slice(0, -4).join('').padStart(2, '0');
                formattedTime = `${hours}:${minutes}:${seconds}`;
            }
            
            // Force limited length for the entered value
            if (digitParts.length > 6) {
                // Limit to 6 digits (2 for hour, 2 for min, 2 for sec)
                formattedTime = formattedTime.slice(-8);
            }
            
            // Show the formatting hint
            const formGroup = durationField.closest('.form-group');
            let formattedDisplay = formGroup.querySelector('.formatted-display');
            
            if (!formattedDisplay) {
                formattedDisplay = document.createElement('div');
                formattedDisplay.className = 'formatted-display';
                formattedDisplay.style.cssText = 'font-size: 12px; color: #FF8533; margin-top: 5px;';
                formGroup.appendChild(formattedDisplay);
            }
            
            // Convert to seconds for internal use
            const totalSeconds = formatters.parseTimeToSeconds(formattedTime);
            
            // Convert to minutes for database storage
            const totalMinutes = formatters.secondsToMinutes(totalSeconds);
            
            // Show human-readable format
            const readableFormat = formatters.formatMinutes(totalMinutes);
            
            formattedDisplay.innerHTML = `Formato: <b>${formattedTime}</b> (${readableFormat})`;
            
            // Store minutes value for database
            durationField.dataset.minutes = totalMinutes.toString();
            
            // Update the input value to show formatted time
            e.target.value = formattedTime;
        });
        
        // Remove spinner buttons from number inputs and add special handlers
        [distanceField, durationField].forEach(field => {
            field.addEventListener('wheel', (e) => e.preventDefault());
            
            field.addEventListener('keydown', (e) => {
                // Allow: navigation, backspace, delete, tab, escape, enter
                if ([46, 8, 9, 27, 13, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)) {
                    return;
                }
                
                if (field === durationField) {
                    // For duration, allow numbers and colon
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                        (e.keyCode < 96 || e.keyCode > 105) && 
                        e.keyCode !== 186 && e.keyCode !== 59) { // Allow colon
                        e.preventDefault();
                    }
                } else {
                    // For distance, allow numbers and period
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                        (e.keyCode < 96 || e.keyCode > 105) && 
                        e.keyCode !== 190 && e.keyCode !== 110) { // Allow period
                        e.preventDefault();
                    }
                }
            });
        });
    }
}

// Create and export a singleton instance
const components = new UIComponents();
