/**
 * App Initialization Module
 * Responsible for creating the App instance and handling startup
 */

// Create the App instance
function initializeApp() {
    try {
        console.log("🚀 Criando instância do App...");
        window.app = new App();
        
        // Wait for API to be available
        waitForAPI();
    } catch (error) {
        console.error("❌ Erro crítico durante inicialização:", error);
        showFatalError("Não foi possível inicializar a aplicação");
    }
}

// Wait for API to be available before initializing the app
function waitForAPI() {
    if (window.api) {
        console.log("✓ API detectada, inicializando aplicação");
        app.init();
    } else {
        console.log("⏳ Aguardando API...");
        setTimeout(waitForAPI, 100);
    }
}

// Display fatal error message when app cannot be initialized
function showFatalError(message) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.background = 'rgba(0,0,0,0.9)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.padding = '20px';
    container.style.zIndex = '9999';
    container.style.color = 'white';
    
    container.innerHTML = `
        <span style="font-size: 64px; color: #ff3333; margin-bottom: 20px;">⚠️</span>
        <h1 style="margin-bottom: 20px; text-align: center;">Erro Fatal</h1>
        <p style="margin-bottom: 30px; text-align: center;">${message}</p>
        <p style="text-align: center;">Por favor, reinicie o aplicativo.</p>
    `;
    
    document.body.appendChild(container);
}

// Register global error handler
function setupErrorHandler() {
    window.addEventListener('error', (event) => {
        console.error("❌ Erro não tratado:", event.error);
        
        if (app && typeof app.showNotification === 'function') {
            app.showNotification(
                "Ocorreu um erro inesperado. Detalhes foram registrados no console.",
                "error"
            );
        }
    });
}

// Update the HTML to load the modular files in the correct order

// Você precisa atualizar seu HTML para carregar estes arquivos na ordem correta:
// 1. app-core.js
// 2. app-ui.js  
// 3. app-runs.js
// 4. app-training-plans.js
// 5. app-init.js
// 6. main.js (simplificado)
