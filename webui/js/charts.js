/**
 * Charts Module
 * Handles creation of charts for app statistics
 */
const charts = {
    // Armazenar instâncias de gráficos para destruição/recriação
    charts: {},
    
    /**
     * Verificar se Chart.js está disponível e carregar se necessário
     * @param {Function} callback - Função a ser chamada quando disponível
     */
    ensureChartJsAvailable: function(callback) {
        if (typeof Chart !== 'undefined') {
            callback();
            return;
        }
        
        console.log("Chart.js não disponível, tentando carregar dinamicamente...");
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
        script.onload = callback;
        script.onerror = () => {
            console.error("Erro ao carregar Chart.js dinamicamente");
            if (window.app) {
                app.showNotification("Não foi possível carregar a biblioteca de gráficos", "error");
            }
        };
        document.head.appendChild(script);
    },
    
    /**
     * Create recent runs chart for dashboard
     * @param {string} elementId - Container element ID
     * @param {Array} runs - Run data
     */
    createRecentRunsChart: function(elementId, runs) {
        try {
            console.log("Criando gráfico de corridas recentes");
            // Verificar se o container existe
            const container = document.getElementById(elementId);
            if (!container) {
                console.error("Container de gráficos não encontrado:", elementId);
                return;
            }
            
            // Limitar a 7 corridas mais recentes
            const recentRuns = runs.slice(-7);
            
            // Preparar dados para o gráfico
            const labels = recentRuns.map(run => {
                // Formatar data como "dd/mm"
                const date = new Date(run.date);
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            });
            
            const distances = recentRuns.map(run => parseFloat(run.distance || 0));
            const durations = recentRuns.map(run => parseInt(run.duration || 0) / 60); // Converter para horas
            
            this.ensureChartJsAvailable(() => {
                // Destruir gráfico existente se houver
                if (this.charts.recentRuns) {
                    this.charts.recentRuns.destroy();
                }
                
                // Criar o novo gráfico
                const ctx = container.getContext('2d');
                this.charts.recentRuns = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Distância (km)',
                            data: distances,
                            backgroundColor: 'rgba(255, 133, 51, 0.7)',
                            borderColor: 'rgb(255, 133, 51)',
                            borderWidth: 1,
                            order: 1,
                            yAxisID: 'y'
                        }, {
                            label: 'Tempo (h)',
                            data: durations,
                            type: 'line',
                            fill: false,
                            backgroundColor: 'rgba(51, 153, 255, 0.7)',
                            borderColor: 'rgb(51, 153, 255)',
                            borderWidth: 2,
                            pointRadius: 4,
                            order: 0,
                            yAxisID: 'y1'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Distância (km)'
                                }
                            },
                            y1: {
                                beginAtZero: true,
                                position: 'right',
                                grid: {
                                    drawOnChartArea: false
                                },
                                title: {
                                    display: true,
                                    text: 'Tempo (h)'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Treinos Recentes'
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.datasetIndex === 0) {
                                            label += context.parsed.y.toFixed(2) + ' km';
                                        } else {
                                            const hours = Math.floor(context.parsed.y);
                                            const minutes = Math.round((context.parsed.y - hours) * 60);
                                            label += `${hours}h ${minutes}min`;
                                        }
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                });
                
                console.log("Gráfico criado com sucesso");
            });
        } catch (error) {
            console.error("Erro ao criar gráfico de corridas recentes:", error);
        }
    },
    
    /**
     * Create distance chart
     * @param {string} elementId - Container element ID
     * @param {Array} runs - Run data
     */
    createDistanceChart: function(elementId, runs) {
        try {
            // Verificar se o container existe
            const container = document.getElementById(elementId);
            if (!container) {
                console.error(`Container de gráficos não encontrado: ${elementId}`);
                return;
            }
            
            this.ensureChartJsAvailable(() => {
                // Preparar dados para o gráfico
                const sortedRuns = [...runs].sort((a, b) => new Date(a.date) - new Date(b.date));
                const labels = sortedRuns.map(run => {
                    const date = new Date(run.date);
                    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                });
                
                const distances = sortedRuns.map(run => parseFloat(run.distance || 0));
                
                // Calcular tendência linear
                const trend = this._calculateTrendLine(distances);
                const trendData = distances.map((_, i) => trend.slope * i + trend.intercept);
                
                // Destruir gráfico existente se houver
                if (this.charts.distance) {
                    this.charts.distance.destroy();
                }
                
                // Criar o novo gráfico
                const ctx = container.getContext('2d');
                this.charts.distance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Distância (km)',
                            data: distances,
                            backgroundColor: 'rgba(255, 133, 51, 0.1)',
                            borderColor: 'rgb(255, 133, 51)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1
                        }, {
                            label: 'Tendência',
                            data: trendData,
                            borderColor: 'rgba(153, 153, 153, 0.8)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                            pointRadius: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Distância (km)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Data'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Evolução da Distância'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (context.datasetIndex === 0) {
                                            return `Distância: ${context.parsed.y.toFixed(2)} km`;
                                        }
                                        return `Tendência: ${context.parsed.y.toFixed(2)} km`;
                                    }
                                }
                            }
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Erro ao criar gráfico de distância:", error);
        }
    },
    
    /**
     * Create duration chart
     * @param {string} elementId - Container element ID
     * @param {Array} runs - Run data
     */
    createDurationChart: function(elementId, runs) {
        try {
            // Verificar se o container existe
            const container = document.getElementById(elementId);
            if (!container) {
                console.error(`Container de gráficos não encontrado: ${elementId}`);
                return;
            }
            
            this.ensureChartJsAvailable(() => {
                // Preparar dados para o gráfico
                const sortedRuns = [...runs].sort((a, b) => new Date(a.date) - new Date(b.date));
                const labels = sortedRuns.map(run => {
                    const date = new Date(run.date);
                    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                });
                
                const durations = sortedRuns.map(run => parseInt(run.duration || 0));
                
                // Calcular tendência linear
                const trend = this._calculateTrendLine(durations);
                const trendData = durations.map((_, i) => trend.slope * i + trend.intercept);
                
                // Destruir gráfico existente se houver
                if (this.charts.duration) {
                    this.charts.duration.destroy();
                }
                
                // Criar o novo gráfico
                const ctx = container.getContext('2d');
                this.charts.duration = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Duração (min)',
                            data: durations,
                            backgroundColor: 'rgba(51, 153, 255, 0.1)',
                            borderColor: 'rgb(51, 153, 255)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1
                        }, {
                            label: 'Tendência',
                            data: trendData,
                            borderColor: 'rgba(153, 153, 153, 0.8)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                            pointRadius: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Duração (min)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Data'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Evolução da Duração'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (context.datasetIndex === 0) {
                                            const minutes = context.parsed.y;
                                            const hours = Math.floor(minutes / 60);
                                            const mins = minutes % 60;
                                            if (hours > 0) {
                                                return `Duração: ${hours}h ${mins}min`;
                                            } else {
                                                return `Duração: ${mins}min`;
                                            }
                                        }
                                        return `Tendência: ${context.parsed.y.toFixed(0)} min`;
                                    }
                                }
                            }
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Erro ao criar gráfico de duração:", error);
        }
    },
    
    /**
     * Create pace chart
     * @param {string} elementId - Container element ID
     * @param {Array} runs - Run data
     */
    createPaceChart: function(elementId, runs) {
        try {
            // Verificar se o container existe
            const container = document.getElementById(elementId);
            if (!container) {
                console.error(`Container de gráficos não encontrado: ${elementId}`);
                return;
            }
            
            this.ensureChartJsAvailable(() => {
                // Preparar dados para o gráfico
                const sortedRuns = [...runs].sort((a, b) => new Date(a.date) - new Date(b.date));
                const labels = sortedRuns.map(run => {
                    const date = new Date(run.date);
                    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                });
                
                // Calcular ritmo para cada corrida (em segundos/km)
                const paceData = sortedRuns.map(run => {
                    if (!run.distance || run.distance <= 0) return null;
                    return (run.duration * 60) / run.distance;
                }).filter(pace => pace !== null);
                
                // Calcular tendência linear
                const trend = this._calculateTrendLine(paceData);
                const trendData = paceData.map((_, i) => trend.slope * i + trend.intercept);
                
                // Destruir gráfico existente se houver
                if (this.charts.pace) {
                    this.charts.pace.destroy();
                }
                
                // Criar o novo gráfico
                const ctx = container.getContext('2d');
                this.charts.pace = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Ritmo (min/km)',
                            data: paceData,
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderColor: 'rgb(76, 175, 80)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1
                        }, {
                            label: 'Tendência',
                            data: trendData,
                            borderColor: 'rgba(153, 153, 153, 0.8)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                            pointRadius: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                reverse: true, // Valores menores são melhores para ritmo
                                title: {
                                    display: true,
                                    text: 'Ritmo (segundos/km)'
                                },
                                ticks: {
                                    callback: function(value) {
                                        const minutes = Math.floor(value / 60);
                                        const seconds = Math.floor(value % 60);
                                        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Data'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Evolução do Ritmo'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const value = context.parsed.y;
                                        const minutes = Math.floor(value / 60);
                                        const seconds = Math.floor(value % 60);
                                        return `Ritmo: ${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
                                    }
                                }
                            }
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Erro ao criar gráfico de ritmo:", error);
        }
    },
    
    /**
     * Create cardio chart (heart rate)
     * @param {string} elementId - Container element ID
     * @param {Array} runs - Run data
     */
    createCardioChart: function(elementId, runs) {
        try {
            // Verificar se o container existe
            const container = document.getElementById(elementId);
            if (!container) {
                console.error(`Container de gráficos não encontrado: ${elementId}`);
                return;
            }
            
            this.ensureChartJsAvailable(() => {
                // Filtrar corridas com dados de frequência cardíaca
                const runsWithHR = runs.filter(run => run.avg_bpm || run.max_bpm);
                
                // Se não houver dados suficientes
                if (runsWithHR.length < 2) {
                    container.innerHTML = '<div class="no-data-message">Dados insuficientes de frequência cardíaca.</div>';
                    return;
                }
                
                // Ordenar por data
                const sortedRuns = [...runsWithHR].sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // Preparar dados para o gráfico
                const labels = sortedRuns.map(run => {
                    const date = new Date(run.date);
                    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                });
                
                const avgBpm = sortedRuns.map(run => run.avg_bpm || null);
                const maxBpm = sortedRuns.map(run => run.max_bpm || null);
                
                // Destruir gráfico existente se houver
                if (this.charts.cardio) {
                    this.charts.cardio.destroy();
                }
                
                // Criar o novo gráfico
                const ctx = container.getContext('2d');
                this.charts.cardio = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'BPM Médio',
                            data: avgBpm,
                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                            borderColor: 'rgb(255, 193, 7)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1
                        }, {
                            label: 'BPM Máximo',
                            data: maxBpm,
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            borderColor: 'rgb(244, 67, 54)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false,
                                title: {
                                    display: true,
                                    text: 'BPM'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Data'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Frequência Cardíaca'
                            }
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Erro ao criar gráfico de cardio:", error);
        }
    },
    
    /**
     * Create monthly summary chart
     * @param {string} elementId - Container element ID
     * @param {Array} runs - Run data
     */
    createMonthlyChart: function(elementId, runs) {
        try {
            // Verificar se o container existe
            const container = document.getElementById(elementId);
            if (!container) {
                console.error(`Container de gráficos não encontrado: ${elementId}`);
                return;
            }
            
            this.ensureChartJsAvailable(() => {
                // Agrupar corridas por mês
                const monthlyData = this._groupRunsByMonth(runs);
                
                // Preparar dados para o gráfico
                const labels = Object.keys(monthlyData);
                const distanceData = labels.map(month => monthlyData[month].totalDistance);
                const runCountData = labels.map(month => monthlyData[month].runCount);
                
                // Destruir gráfico existente se houver
                if (this.charts.monthly) {
                    this.charts.monthly.destroy();
                }
                
                // Criar o novo gráfico
                const ctx = container.getContext('2d');
                this.charts.monthly = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Distância Total (km)',
                            data: distanceData,
                            backgroundColor: 'rgba(255, 133, 51, 0.7)',
                            borderColor: 'rgb(255, 133, 51)',
                            borderWidth: 1,
                            order: 1,
                            yAxisID: 'y'
                        }, {
                            label: 'Número de Treinos',
                            data: runCountData,
                            type: 'line',
                            backgroundColor: 'rgba(51, 153, 255, 0.7)',
                            borderColor: 'rgb(51, 153, 255)',
                            borderWidth: 2,
                            pointRadius: 4,
                            order: 0,
                            yAxisID: 'y1'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Distância Total (km)'
                                }
                            },
                            y1: {
                                beginAtZero: true,
                                position: 'right',
                                grid: {
                                    drawOnChartArea: false
                                },
                                title: {
                                    display: true,
                                    text: 'Número de Treinos'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Resumo Mensal'
                            }
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Erro ao criar gráfico mensal:", error);
        }
    },
    
    /**
     * Calcular tendência linear (regressão)
     * @param {Array} data - Array de valores numéricos
     * @returns {Object} Objeto com slope e intercept
     */
    _calculateTrendLine: function(data) {
        try {
            // Se não houver dados suficientes, retornar uma linha reta
            if (!data || data.length < 2) {
                return { slope: 0, intercept: data && data.length > 0 ? data[0] : 0 };
            }
            
            const n = data.length;
            let sumX = 0;
            let sumY = 0;
            let sumXY = 0;
            let sumXX = 0;
            
            // Para X usamos o índice (0, 1, 2, ...)
            for (let i = 0; i < n; i++) {
                const x = i;
                const y = data[i];
                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumXX += x * x;
            }
            
            // Fórmulas de regressão linear
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            return { slope, intercept };
        } catch (error) {
            console.error("Erro ao calcular linha de tendência:", error);
            return { slope: 0, intercept: 0 };
        }
    },
    
    /**
     * Agrupar corridas por mês
     * @param {Array} runs - Array de corridas
     * @returns {Object} Objeto com dados mensais
     */
    _groupRunsByMonth: function(runs) {
        try {
            const months = {};
            
            // Definir nomes dos meses em português
            const monthNames = [
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
            ];
            
            // Percorrer todas as corridas
            runs.forEach(run => {
                try {
                    const date = new Date(run.date);
                    const monthKey = `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
                    
                    // Inicializar dados para este mês se necessário
                    if (!months[monthKey]) {
                        months[monthKey] = {
                            totalDistance: 0,
                            totalDuration: 0,
                            runCount: 0
                        };
                    }
                    
                    // Acumular dados
                    months[monthKey].totalDistance += parseFloat(run.distance || 0);
                    months[monthKey].totalDuration += parseInt(run.duration || 0);
                    months[monthKey].runCount++;
                } catch (e) {
                    console.warn("Erro ao processar corrida para gráfico mensal:", e);
                }
            });
            
            return months;
        } catch (error) {
            console.error("Erro ao agrupar corridas por mês:", error);
            return {};
        }
    }
};

// Exportar globalmente para uso em outras partes da aplicação
window.charts = charts;
