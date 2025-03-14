// Script para gerenciar o comportamento dos inputs customizados

// Inicializa os inputs customizados quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Como o formulário é carregado dinamicamente, precisamos usar um MutationObserver
    // para detectar quando ele é adicionado ao DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (document.getElementById('run-distance')) {
                initializeCustomInputs();
                observer.disconnect();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

function initializeCustomInputs() {
    // Configura input de distância
    const distanceInput = document.getElementById('run-distance');
    if (distanceInput) {
        distanceInput.addEventListener('input', handleDistanceInput);
        distanceInput.addEventListener('blur', formatDistanceOnBlur);
    }

    // Configura input de duração
    const durationInput = document.getElementById('run-duration');
    if (durationInput) {
        durationInput.addEventListener('input', handleDurationInput);
        durationInput.addEventListener('blur', formatDurationOnBlur);
    }
    
    // Altera o comportamento padrão do formulário para processar os valores
    const runForm = document.getElementById('run-form');
    if (runForm) {
        runForm.addEventListener('submit', handleFormSubmit);
    }
}

// Gerencia o input de distância
function handleDistanceInput(e) {
    const input = e.target;
    const value = input.value;
    
    // Permite apenas dígitos e um ponto decimal com até 2 casas decimais
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
        // Valor válido, mantém
    } else {
        // Valor inválido, reverte para o último valor válido
        input.value = input.dataset.lastValidValue || '';
    }
    
    // Armazena o valor válido atual
    input.dataset.lastValidValue = input.value;
}

function formatDistanceOnBlur(e) {
    const input = e.target;
    const value = input.value.trim();
    
    if (value && !isNaN(parseFloat(value))) {
        // Formata o número com até 2 casas decimais
        const formattedValue = parseFloat(value).toFixed(2);
        input.value = formattedValue;
        input.dataset.numericValue = formattedValue;
    }
}

// Gerencia o input de duração
function handleDurationInput(e) {
    const input = e.target;
    const value = input.value;
    
    // Permite dígitos e dois pontos no formato correto MM:SS (aceita qualquer quantidade de minutos)
    if (value === '' || /^[0-9]+(:[0-9]{0,2})?$/.test(value)) {
        // Valor válido, mantém
        input.dataset.lastValidValue = value;
    } else {
        // Valor inválido, reverte para o último valor válido
        input.value = input.dataset.lastValidValue || '';
    }
}

function formatDurationOnBlur(e) {
    const input = e.target;
    const value = input.value.trim();
    
    if (value) {
        let minutes = 0;
        let seconds = 0;
        
        if (value.includes(':')) {
            const parts = value.split(':');
            minutes = parseInt(parts[0]) || 0;
            seconds = parseInt(parts[1]) || 0;
            
            // Ajusta se os segundos forem >= 60
            if (seconds >= 60) {
                minutes += Math.floor(seconds / 60);
                seconds = seconds % 60;
            }
        } else {
            // Se o usuário digitou apenas um número, assume que são minutos
            minutes = parseInt(value) || 0;
        }
        
        // Formata no padrão MM:SS
        input.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Armazena o valor em segundos como um atributo data para facilitar o acesso
        const totalSeconds = (minutes * 60 + seconds);
        input.dataset.valueInSeconds = totalSeconds.toString();
    }
}

// Função auxiliar para uso em outros scripts que precisem acessar o valor em segundos
function getDurationInSeconds() {
    const durationInput = document.getElementById('run-duration');
    if (durationInput && durationInput.dataset.valueInSeconds) {
        return parseInt(durationInput.dataset.valueInSeconds);
    }
    
    // Tenta calcular mesmo se não tiver o dataset
    if (durationInput && durationInput.value) {
        const value = durationInput.value;
        if (value.includes(':')) {
            const [minutes, seconds] = value.split(':').map(part => parseInt(part) || 0);
            return (minutes * 60) + seconds;
        } else {
            return (parseInt(value) || 0) * 60;
        }
    }
    
    return 0;
}

// Função auxiliar para acessar o valor da distância
function getDistanceValue() {
    const distanceInput = document.getElementById('run-distance');
    if (distanceInput && distanceInput.dataset.numericValue) {
        return parseFloat(distanceInput.dataset.numericValue);
    }
    
    // Tenta calcular mesmo se não tiver o dataset
    if (distanceInput && distanceInput.value) {
        return parseFloat(distanceInput.value) || 0;
    }
    
    return 0;
}

// Processa o envio do formulário para garantir que os valores corretos sejam enviados
function handleFormSubmit(e) {
    // Garante que os valores numéricos estejam disponíveis para processamento
    const distanceInput = document.getElementById('run-distance');
    const durationInput = document.getElementById('run-duration');
    
    if (distanceInput && !distanceInput.dataset.numericValue) {
        formatDistanceOnBlur({ target: distanceInput });
    }
    
    if (durationInput && !durationInput.dataset.valueInSeconds) {
        formatDurationOnBlur({ target: durationInput });
    }
}

// Expõe as funções auxiliares para outros scripts
window.getDurationInSeconds = getDurationInSeconds;
window.getDistanceValue = getDistanceValue;

// Remove qualquer elemento de depuração que possa estar mostrando valores formatados
function removeDebugElements() {
    // Remove elementos com classe específica que possa estar mostrando dados de depuração
    const debugElements = document.querySelectorAll('.debug-info, .value-display');
    debugElements.forEach(element => element.remove());
    
    // Limpa também qualquer texto de console que possa estar sendo usado para depuração
    console.clear();
}

// Executa a remoção de elementos de depuração quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', removeDebugElements);
