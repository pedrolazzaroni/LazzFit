/**
 * API Module para comunicação com o backend
 */
const api = {
    // Flag para detectar se estamos no ambiente PyWebView
    isPyWebView: false,
    initialized: false,
    initAttempts: 0,
    maxInitAttempts: 15,  // Aumentado para 15 tentativas
    lastFetchedRuns: null, // NOVA PROPRIEDADE: Armazena o último resultado de getAllRuns
    
    /**
     * Inicializa a API e verifica o ambiente
     */
    init: function() {
        // Se já inicializado, não faz nada
        if (this.initialized) return true;
        
        console.log("🔍 Inicializando API, tentativa " + (this.initAttempts + 1));
        
        // Limpar status anterior
        if (this.initAttempts === 0) {
            console.log("🧹 Primeiro início, limpando status anterior");
            localStorage.removeItem('pywebviewDetected');
        }
        
        // Verificação mais robusta e detalhada para detectar o ambiente PyWebView
        try {
            // Verificar se o PyWebView foi confirmado pelo servidor
            if (window._serverConfirmedAPI) {
                console.log("✅ API Python confirmada pelo servidor");
                this.isPyWebView = true;
                this.initialized = true;
                localStorage.setItem('pywebviewDetected', 'true');
                return true;
            }
            
            if (window.pywebview !== undefined) {
                console.log("🔍 PyWebView detectado no navegador");
                
                if (typeof window.pywebview.api === 'object') {
                    console.log("🔍 API Python disponível como objeto, testando...");
                    
                    // Método 1: Verificar se _pywebviewready foi disparado
                    if (document.body.classList.contains('pywebview-ready')) {
                        console.log("✅ Classe 'pywebview-ready' detectada no body");
                        this.isPyWebView = true;
                        this.initialized = true;
                        localStorage.setItem('pywebviewDetected', 'true');
                        return true;
                    }
                    
                    // Método 2: Tentar acessar um método para verificar se a API está realmente pronta
                    try {
                        // Acessar diretamente, sem Promise
                        if (typeof window.pywebview.api.get_workout_types === 'function') {
                            console.log("✅ API Python confirmada - método get_workout_types existe!");
                            this.isPyWebView = true;
                            this.initialized = true;
                            localStorage.setItem('pywebviewDetected', 'true');
                            return true;
                        }
                    } catch (e) {
                        console.warn("⚠️ Erro ao verificar API diretamente:", e);
                    }
                    
                    // Método 3: Tentar com Promise
                    setTimeout(() => {
                        console.log("🔍 Testando API via Promise...");
                        window.pywebview.api.get_workout_types()
                            .then((result) => {
                                console.log("✅ API Python confirmada via Promise!", result);
                                this.isPyWebView = true;
                                this.initialized = true;
                                localStorage.setItem('pywebviewDetected', 'true');
                            })
                            .catch(err => {
                                console.error("❌ Erro ao testar API Python via Promise:", err);
                                this.retryInit();
                            });
                    }, 100);
                    
                    // Indica sucesso provisório
                    return true;
                } else {
                    console.warn("⚠️ PyWebView detectado mas API não disponível ainda");
                    this.retryInit();
                    return false;
                }
            } else {
                console.warn("⚠️ PyWebView não detectado");
                
                // Verificar se foi detectado anteriormente
                if (localStorage.getItem('pywebviewDetected') === 'true') {
                    console.log("✅ PyWebView foi detectado anteriormente, assumindo que está disponível");
                    this.isPyWebView = true;
                    this.initialized = true;
                    return true;
                }
                
                this.retryInit();
                return false;
            }
        } catch (error) {
            console.error("❌ Erro ao inicializar API:", error);
            this.retryInit();
            return false;
        }
    },
    
    /**
     * Tenta iniciar novamente após uma falha
     */
    retryInit: function() {
        this.initAttempts++;
        
        if (this.initAttempts >= this.maxInitAttempts) {
            console.error(`❌ API Python não disponível após ${this.initAttempts} tentativas.`);
            this.showDatabaseError();
            return;
        } else {
            console.warn(`⚠️ API Python não detectada. Tentativa ${this.initAttempts}/${this.maxInitAttempts}...`);
            // Agendar nova tentativa com tempo de espera progressivo
            const delay = Math.min(500 * this.initAttempts, 3000); // Aumenta o tempo de espera gradualmente
            setTimeout(() => this.init(), delay);
        }
    },
    
    /**
     * Verifica se o banco de dados está acessível
     */
    checkDatabaseConnection: async function() {
        try {
            if (!this.isPyWebView) {
                await this.init();
                if (!this.isPyWebView) {
                    this.showDatabaseError();
                    return false;
                }
            }
            
            // Tenta buscar tipos de treino como teste de conexão
            const types = await window.pywebview.api.get_workout_types();
            if (types && Array.isArray(types)) {
                console.log("Conexão com banco de dados verificada com sucesso!");
                // Limpa qualquer mensagem de erro anterior
                if (window.app) {
                    window.app.clearDatabaseErrorNotifications();
                }
                return true;
            } else {
                this.showDatabaseError();
                return false;
            }
            
        } catch (error) {
            console.error("Erro ao verificar conexão com banco de dados:", error);
            this.showDatabaseError();
            return false;
        }
    },
    
    /**
     * Obtém todos os registros de corridas do banco de dados
     * @returns {Promise<Array>} Lista de registros de corridas
     */
    getAllRuns: async function() {
        try {
            if (!this.isPyWebView && !this.initialized) {
                await this.init();
            }
            
            if (this.isPyWebView) {
                // Executando no PyWebView - chamar diretamente a API Python
                console.log("📊 Buscando treinos do servidor Python...");
                const runs = await window.pywebview.api.get_all_runs();
                console.log(`✅ Recebidos ${runs.length} treinos do servidor`);
                
                // CORREÇÃO: Armazenar resultado para uso em caso de falha futura
                this.lastFetchedRuns = runs;
                return runs;
            } else {
                // Sem ambiente PyWebView, verificar se temos dados em cache
                if (this.lastFetchedRuns) {
                    console.log("📊 Usando dados de treinos em cache");
                    return this.lastFetchedRuns;
                }
                
                // Sem cache disponível, alerta sobre a impossibilidade de carregar dados
                this.showDatabaseError();
                return [];
            }
        } catch (error) {
            console.error("Erro ao buscar corridas:", error);
            
            // CORREÇÃO: Em caso de erro, retornar o cache se disponível
            if (this.lastFetchedRuns) {
                console.log("⚠️ Erro ao buscar treinos. Usando dados em cache...");
                return this.lastFetchedRuns;
            }
            
            this.showDatabaseError();
            return [];
        }
    },
    
    /**
     * Obtém um registro específico pelo ID
     * @param {Number} runId - ID da corrida
     * @returns {Promise<Object>} Dados da corrida
     */
    getRun: async function(runId) {
        try {
            if (this.isPyWebView) {
                return await window.pywebview.api.get_run(runId);
            } else {
                console.error("Erro: API Python não disponível para obter corrida específica.");
                return null;
            }
        } catch (error) {
            console.error(`Erro ao buscar corrida ID ${runId}:`, error);
            return null;
        }
    },
    
    /**
     * Adiciona um novo registro de corrida
     * @param {Object} runData - Dados da corrida
     * @returns {Promise<Object>} Resultado da operação
     */
    addRun: async function(runData) {
        try {
            if (this.isPyWebView) {
                // Executando no PyWebView - chamar API Python
                return await window.pywebview.api.add_run(runData);
            } else {
                console.error("Erro: API Python não disponível. Não é possível adicionar corridas.");
                this.showDatabaseError();
                return { success: false, error: "Banco de dados não disponível" };
            }
        } catch (error) {
            console.error("Erro ao adicionar corrida:", error);
            return { success: false, error: error.toString() };
        }
    },
    
    /**
     * Atualiza um registro existente
     * @param {Number} runId - ID da corrida
     * @param {Object} runData - Dados atualizados
     * @returns {Promise<Object>} Resultado da operação
     */
    updateRun: async function(runId, runData) {
        try {
            if (this.isPyWebView) {
                return await window.pywebview.api.update_run(runId, runData);
            } else {
                console.error("Erro: API Python não disponível. Não é possível atualizar corridas.");
                this.showDatabaseError();
                return { success: false, error: "Banco de dados não disponível" };
            }
        } catch (error) {
            console.error(`Erro ao atualizar corrida ID ${runId}:`, error);
            return { success: false, error: error.toString() };
        }
    },
    
    /**
     * Remove um registro de corrida
     * @param {Number} runId - ID da corrida a ser removida
     * @returns {Promise<Boolean>} Sucesso da operação
     */
    deleteRun: async function(runId) {
        try {
            if (this.isPyWebView) {
                return await window.pywebview.api.delete_run(runId);
            } else {
                console.error("Erro: API Python não disponível. Não é possível excluir corridas.");
                this.showDatabaseError();
                return false;
            }
        } catch (error) {
            console.error(`Erro ao excluir corrida ID ${runId}:`, error);
            return false;
        }
    },
    
    /**
     * Obtém os tipos de treino disponíveis
     * @returns {Promise<Array>} Lista de tipos de treino
     */
    getWorkoutTypes: async function() {
        try {
            if (this.isPyWebView) {
                return await window.pywebview.api.get_workout_types();
            } else {
                console.error("Erro: API Python não disponível para obter tipos de treino.");
                // Retornar uma lista básica em caso de erro
                return ["Corrida de Rua", "Outro"];
            }
        } catch (error) {
            console.error("Erro ao obter tipos de treino:", error);
            return ["Corrida de Rua", "Outro"];
        }
    },
    
    /**
     * Exporta todas as corridas para Excel
     * @returns {Promise<Boolean>} Sucesso da operação
     */
    exportToExcel: async function() {
        try {
            if (this.isPyWebView) {
                return await window.pywebview.api.export_to_excel();
            } else {
                console.error("Erro: API Python não disponível. Não é possível exportar para Excel.");
                this.showDatabaseError();
                return false;
            }
        } catch (error) {
            console.error("Erro ao exportar para Excel:", error);
            return false;
        }
    },
    
    /**
     * Exporta todas as corridas para CSV
     * @returns {Promise<Boolean>} Sucesso da operação
     */
    exportToCSV: async function() {
        try {
            if (this.isPyWebView) {
                return await window.pywebview.api.export_to_csv();
            } else {
                console.error("Erro: API Python não disponível. Não é possível exportar para CSV.");
                this.showDatabaseError();
                return false;
            }
        } catch (error) {
            console.error("Erro ao exportar para CSV:", error);
            return false;
        }
    },
    
    /**
     * Exporta corridas selecionadas para Excel
     * @param {Array} runIds - Lista de IDs das corridas a exportar
     * @returns {Promise<Boolean>} Sucesso da operação
     */
    exportSelectedRunsToExcel: async function(runIds) {
        try {
            if (this.isPyWebView) {
                return await window.pywebview.api.export_selected_to_excel(runIds);
            } else {
                console.error("Erro: API Python não disponível. Não é possível exportar seleção para Excel.");
                this.showDatabaseError();
                return false;
            }
        } catch (error) {
            console.error("Erro ao exportar corridas selecionadas para Excel:", error);
            return false;
        }
    },
    
    /**
     * Exporta corridas selecionadas para CSV
     * @param {Array} runIds - Lista de IDs das corridas a exportar
     * @returns {Promise<Boolean>} Sucesso da operação
     */
    exportSelectedRunsToCSV: async function(runIds) {
        try {
            if (this.isPyWebView) {
                return await window.pywebview.api.export_selected_to_csv(runIds);
            } else {
                console.error("Erro: API Python não disponível. Não é possível exportar seleção para CSV.");
                this.showDatabaseError();
                return false;
            }
        } catch (error) {
            console.error("Erro ao exportar corridas selecionadas para CSV:", error);
            return false;
        }
    },

    /**
     * Mostra um erro de banco de dados ao usuário
     */
    showDatabaseError: function() {
        if (window.app) {
            window.app.showNotification(
                `Não foi possível conectar ao banco de dados. Por favor, reinicie o aplicativo ou verifique logs para mais detalhes.`,
                "error",
                "database-error"
            );
            
            // Mostrar informações de diagnóstico no console
            console.error("📊 INFORMAÇÕES DE DIAGNÓSTICO:");
            console.error(`- PyWebView detectado: ${window.pywebview !== undefined}`);
            console.error(`- API presente: ${window.pywebview && typeof window.pywebview.api === 'object'}`);
            console.error(`- Tentativas de inicialização: ${this.initAttempts}`);
            console.error(`- localStorage.pywebviewDetected: ${localStorage.getItem('pywebviewDetected')}`);
            console.error(`- _serverConfirmedAPI: ${window._serverConfirmedAPI}`);
            console.error(`- Body tem classe pywebview-ready: ${document.body.classList.contains('pywebview-ready')}`);
        }
    }
};

// CORREÇÃO: Inicializar API imediatamente e na ordem correta
(function initializeAPI() {
    console.log("🚀 Inicializando API imediatamente na carga do script...");
    api.init();
    
    // Adicionar evento específico para PyWebView
    document.addEventListener('pywebviewready', function() {
        console.log("✅ Evento pywebviewready recebido!");
        document.body.classList.add('pywebview-ready');
        setTimeout(() => api.init(), 100);
    });

    // Também configurar inicialização no carregamento do documento
    document.addEventListener('DOMContentLoaded', () => {
        console.log("🔍 Documento carregado, verificando estado da API...");
        if (!api.initialized) {
            console.log("⚠️ API ainda não inicializada no carregamento do documento. Tentando novamente...");
            setTimeout(() => api.init(), 200);
        }
    });
})();

// Exportar a API para uso global
window.api = api;
