/**
 * Charts Module
 * Provides methods for creating and updating charts using Chart.js
 */
class ChartManager {
    constructor() {
        this.charts = {};
        this.themeColors = {
            primary: '#FF6700',
            primaryLight: '#FF8533',
            primaryDark: '#CC5200',
            gray: '#888888',
            lightGray: '#DDDDDD',
            chartGrid: '#444444'
        };
        
        // Set global Chart.js defaults
        Chart.defaults.color = '#FFFFFF';
        Chart.defaults.font.family = "'Roboto', 'Segoe UI', Arial, sans-serif";
        
        // Custom gradient for area charts
        this.gradientOptions = {
            backgroundColor: context => {
                if (!context.chart.chartArea) return 'rgba(255, 103, 0, 0.5)';
                
                const chartArea = context.chart.chartArea;
                const gradient = context.chart.ctx.createLinearGradient(
                    0, chartArea.bottom, 0, chartArea.top
                );
                
                gradient.addColorStop(0, 'rgba(255, 103, 0, 0.1)');
                gradient.addColorStop(1, 'rgba(255, 103, 0, 0.6)');
                
                return gradient;
            }
        };
    }

    /**
     * Create a dashboard recent runs chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} data - Run data array
     */
    createRecentRunsChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Extract the last 10 entries and reverse for chronological order
        const recentRuns = data.slice(0, 10).reverse();
        
        // Extract data points
        const labels = recentRuns.map(run => run.date);
        const distances = recentRuns.map(run => run.distance);
        
        // Create the chart
        this.charts.recentRuns = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Distância (km)',
                    data: distances,
                    backgroundColor: this.themeColors.primary,
                    borderColor: this.themeColors.primary,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const run = recentRuns[context.dataIndex];
                                return [
                                    `Distância: ${run.distance.toFixed(2)} km`,
                                    `Duração: ${this._formatDuration(run.duration)}`,
                                    `Ritmo: ${run.avg_pace} min/km`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        },
                        ticks: {
                            callback: (value) => `${value} km`
                        }
                    }
                }
            }
        });
    }

    /**
     * Create distance chart for statistics view
     * @param {string} canvasId - Canvas element ID
     * @param {Array} data - Run data array
     */
    createDistanceChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Extract data points
        const labels = data.map((_, index) => `Treino ${index + 1}`);
        const distances = data.map(run => run.distance);
        
        // Create the chart
        this.charts.distance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Distância (km)',
                    data: distances,
                    backgroundColor: this.themeColors.primary,
                    borderColor: this.themeColors.primaryDark,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distância por Treino',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const index = context[0].dataIndex;
                                return `Treino ${index + 1} (${data[index].date})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        },
                        title: {
                            display: true,
                            text: 'Distância (km)'
                        }
                    }
                }
            }
        });
        
        // Add trend line if we have enough data
        if (distances.length >= 3) {
            this._addTrendline(this.charts.distance, distances);
        }
    }

    /**
     * Create duration chart for statistics view
     * @param {string} canvasId - Canvas element ID
     * @param {Array} data - Run data array
     */
    createDurationChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Extract data points
        const labels = data.map((_, index) => `Treino ${index + 1}`);
        const durations = data.map(run => run.duration);
        
        // Create the chart
        this.charts.duration = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Duração (min)',
                    data: durations,
                    borderColor: this.themeColors.primary,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: this.themeColors.primaryLight,
                    pointBorderColor: this.themeColors.primaryDark,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Duração por Treino',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const index = context[0].dataIndex;
                                return `Treino ${index + 1} (${data[index].date})`;
                            },
                            label: (context) => {
                                const duration = context.raw;
                                return `${this._formatDuration(duration)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        },
                        title: {
                            display: true,
                            text: 'Duração (min)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Create pace chart for statistics view
     * @param {string} canvasId - Canvas element ID
     * @param {Array} data - Run data array
     */
    createPaceChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Extract and convert pace data
        const labels = data.map((_, index) => `Treino ${index + 1}`);
        const paces = data.map(run => {
            const parts = run.avg_pace.split(':');
            const minutes = parseInt(parts[0], 10);
            const seconds = parseInt(parts[1], 10);
            return minutes + seconds / 60; // Convert to decimal minutes
        });
        
        // Create the chart (inverted y-axis since lower pace is better)
        this.charts.pace = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ritmo (min/km)',
                    data: paces,
                    borderColor: this.themeColors.primaryLight,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: this.themeColors.primaryLight,
                    pointBorderColor: this.themeColors.primaryDark,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução do Ritmo',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const index = context[0].dataIndex;
                                return `Treino ${index + 1} (${data[index].date})`;
                            },
                            label: (context) => {
                                const paceDecimal = context.raw;
                                const minutes = Math.floor(paceDecimal);
                                const seconds = Math.round((paceDecimal - minutes) * 60);
                                return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        }
                    },
                    y: {
                        reverse: true, // Lower is better for pace
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        },
                        title: {
                            display: true,
                            text: 'Ritmo (min/km)'
                        },
                        ticks: {
                            callback: value => {
                                const minutes = Math.floor(value);
                                const seconds = Math.round((value - minutes) * 60);
                                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create heart rate or elevation chart for statistics view
     * @param {string} canvasId - Canvas element ID
     * @param {Array} data - Run data array
     */
    createCardioChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Extract BPM or elevation data - prioritize BPM if available
        const labels = data.map((_, index) => `Treino ${index + 1}`);
        
        let chartType = 'bpm';
        let chartData = data.map(run => run.avg_bpm).filter(v => v !== null && v !== undefined);
        
        // If no BPM data, try elevation data
        if (chartData.length === 0) {
            chartType = 'elevation';
            chartData = data.map(run => run.elevation_gain).filter(v => v !== null && v !== undefined);
        }
        
        // If still no data, show message
        if (chartData.length === 0) {
            this._renderNoDataMessage(ctx, 'Sem dados de BPM ou Elevação');
            return;
        }
        
        const title = chartType === 'bpm' ? 'BPM Médio por Treino' : 'Elevação por Treino';
        const yAxisLabel = chartType === 'bpm' ? 'BPM' : 'Elevação (m)';
        const color = chartType === 'bpm' ? '#FF9966' : '#FF8533';
        
        // Create the chart
        this.charts.cardio = new Chart(ctx, {
            type: chartType === 'bpm' ? 'line' : 'bar',
            data: {
                labels: labels.slice(0, chartData.length),
                datasets: [{
                    label: yAxisLabel,
                    data: chartData,
                    backgroundColor: color,
                    borderColor: chartType === 'bpm' ? color : undefined,
                    borderWidth: chartType === 'bpm' ? 2 : 1,
                    tension: 0.4,
                    pointBackgroundColor: color,
                    pointRadius: chartType === 'bpm' ? 4 : 0,
                    pointHoverRadius: chartType === 'bpm' ? 6 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        },
                        title: {
                            display: true,
                            text: yAxisLabel
                        }
                    }
                }
            }
        });
    }

    /**
     * Create monthly summary chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} data - Run data array
     */
    createMonthlyChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Group data by month
        const monthlyData = this._aggregateDataByMonth(data);
        
        // Extract labels and values
        const labels = Object.keys(monthlyData);
        const distances = labels.map(month => monthlyData[month].distance.toFixed(1));
        
        // Create the chart
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Distância mensal (km)',
                    data: distances,
                    backgroundColor: this.themeColors.primary,
                    borderColor: this.themeColors.primaryDark,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                const monthKey = labels[context.dataIndex];
                                const monthData = monthlyData[monthKey];
                                return [
                                    `Treinos: ${monthData.count}`,
                                    `Tempo total: ${this._formatDuration(monthData.duration)}`,
                                    `Distância média: ${(monthData.distance / monthData.count).toFixed(2)} km`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.themeColors.chartGrid,
                            borderColor: this.themeColors.chartGrid
                        },
                        ticks: {
                            callback: (value) => `${value} km`
                        }
                    }
                }
            }
        });
    }

    /**
     * Add a trendline to an existing chart
     * @private
     * @param {Chart} chart - Chart.js instance
     * @param {Array} data - Data points
     */
    _addTrendline(chart, data) {
        const n = data.length;
        if (n <= 1) return; // Need at least 2 points
        
        // Calculate trendline using linear regression
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumXX += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Calculate trendline points
        const trendData = [];
        for (let i = 0; i < n; i++) {
            trendData.push(slope * i + intercept);
        }
        
        // Add trendline dataset to the chart
        chart.data.datasets.push({
            label: 'Tendência',
            data: trendData,
            borderColor: '#FFaa44',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 0
        });
        
        chart.update();
    }

    /**
     * Aggregate run data by month
     * @private
     * @param {Array} data - Run data array
     * @returns {Object} Aggregated monthly data
     */
    _aggregateDataByMonth(data) {
        const monthlyData = {};
        
        // Process each run
        data.forEach(run => {
            const date = new Date(run.date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = this._formatMonthYear(date);
            
            // Initialize if this month doesn't exist yet
            if (!monthlyData[monthName]) {
                monthlyData[monthName] = {
                    count: 0,
                    distance: 0,
                    duration: 0,
                    monthYear: monthYear // For sorting
                };
            }
            
            // Add this run's data
            monthlyData[monthName].count++;
            monthlyData[monthName].distance += parseFloat(run.distance) || 0;
            monthlyData[monthName].duration += parseInt(run.duration) || 0;
        });
        
        // Sort by date (newest first)
        const sortedKeys = Object.keys(monthlyData).sort((a, b) => {
            return monthlyData[b].monthYear.localeCompare(monthlyData[a].monthYear);
        });
        
        // Create a new object with sorted keys
        const result = {};
        sortedKeys.forEach(key => {
            result[key] = monthlyData[key];
        });
        
        return result;
    }

    /**
     * Format duration in minutes to hours and minutes
     * @private
     * @param {number} minutes - Duration in minutes
     * @returns {string} Formatted duration
     */
    _formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
    }

    /**
     * Format month and year for display
     * @private
     * @param {Date} date - Date object
     * @returns {string} Formatted month and year
     */
    _formatMonthYear(date) {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[date.getMonth()]}/${date.getFullYear()}`;
    }

    /**
     * Render a message when no data is available
     * @private
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} message - Message to display
     */
    _renderNoDataMessage(ctx, message) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '16px Roboto, "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        
        const canvas = ctx.canvas;
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        
        ctx.restore();
    }
}

// Create and export a singleton instance
const charts = new ChartManager();
