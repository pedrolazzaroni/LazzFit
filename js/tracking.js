// LazzFit Tracking Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Period selector functionality
    const periodOptions = document.querySelectorAll('.period-option');
    const customPeriodContainer = document.getElementById('custom-period-container');
    
    periodOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            periodOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            const period = this.dataset.period;
            
            // Show/hide custom period container
            if (period === 'custom') {
                customPeriodContainer.style.display = 'block';
            } else {
                customPeriodContainer.style.display = 'none';
                
                // Redirect to the selected period page
                window.location.href = `tracking.php?period=${period}`;
            }
        });
    });
    
    // Initialize Chart.js charts
    initCharts();
    
    // Chart tab functionality
    const chartTabs = document.querySelectorAll('.chart-tab');
    const chartPanels = document.querySelectorAll('.chart-panel');
    
    chartTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and panels
            chartTabs.forEach(t => t.classList.remove('active'));
            chartPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding panel
            const chartName = this.dataset.chart;
            document.getElementById(`${chartName}-chart`).classList.add('active');
        });
    });
    
    // Workout view button functionality
    const viewWorkoutButtons = document.querySelectorAll('.view-workout-btn');
    
    viewWorkoutButtons.forEach(button => {
        button.addEventListener('click', function() {
            const workoutId = this.dataset.id;
            window.location.href = `workout-details.php?id=${workoutId}`;
        });
    });
});

// Initialize charts with data from PHP
function initCharts() {
    // Check if chartData exists
    if (typeof chartData === 'undefined') {
        console.error('Chart data not found');
        return;
    }
    
    // Distance Chart
    const distanceCtx = document.getElementById('distanceChartCanvas');
    if (distanceCtx) {
        new Chart(distanceCtx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Distância (km)',
                    data: chartData.distance,
                    backgroundColor: 'rgba(255, 140, 0, 0.6)',
                    borderColor: 'rgba(255, 140, 0, 1)',
                    borderWidth: 1,
                    borderRadius: 5
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
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} km`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' km';
                            }
                        },
                        grid: {
                            display: true,
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                }
            }
        });
    }
    
    // Pace Chart (lower is better, so we invert the scale)
    const paceCtx = document.getElementById('paceChartCanvas');
    if (paceCtx) {
        // Filter out null values and get max/min
        const filteredPaceData = chartData.pace.filter(p => p !== null);
        const maxPace = Math.max(...filteredPaceData) * 1.1; // Add some margin
        const minPace = Math.min(...filteredPaceData) * 0.9; // Add some margin
        
        new Chart(paceCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Ritmo (s/km)',
                    data: chartData.pace,
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6
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
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const pace = context.parsed.y;
                                if (pace === null) return 'Sem dados';
                                
                                const min = Math.floor(pace / 60);
                                const sec = Math.round(pace % 60);
                                return `${min}:${sec.toString().padStart(2, '0')} min/km`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: filteredPaceData.length ? minPace : 0,
                        max: filteredPaceData.length ? maxPace : 600,
                        reverse: false, // Lower is better for pace
                        ticks: {
                            callback: function(value) {
                                const min = Math.floor(value / 60);
                                const sec = Math.round(value % 60);
                                return `${min}:${sec.toString().padStart(2, '0')}`;
                            }
                        },
                        grid: {
                            display: true,
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                }
            }
        });
    }
    
    // Duration Chart
    const durationCtx = document.getElementById('durationChartCanvas');
    if (durationCtx) {
        new Chart(durationCtx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Duração (minutos)',
                    data: chartData.duration,
                    backgroundColor: 'rgba(46, 204, 113, 0.6)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1,
                    borderRadius: 5
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
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const minutes = context.parsed.y;
                                if (minutes >= 60) {
                                    const hours = Math.floor(minutes / 60);
                                    const mins = Math.round(minutes % 60);
                                    return `${hours}h ${mins}min`;
                                } else {
                                    return `${minutes} minutos`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 60) {
                                    const hours = Math.floor(value / 60);
                                    const mins = value % 60;
                                    return `${hours}h${mins ? ' ' + mins + 'm' : ''}`;
                                } else {
                                    return `${value}min`;
                                }
                            }
                        },
                        grid: {
                            display: true,
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                }
            }
        });
    }
}
