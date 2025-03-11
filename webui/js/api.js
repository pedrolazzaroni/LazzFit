/**
 * API Module for communicating with PyWebView backend
 * Provides methods for CRUD operations on runs data
 */
class LazzFitAPI {
    constructor() {
        // Flag to check if we're running in PyWebView environment
        this.isPyWebView = window.pywebview !== undefined;
        
        // For testing outside of PyWebView
        this.mockData = {
            runs: [
                {
                    id: 1,
                    date: "2023-10-15",
                    distance: 5.2,
                    duration: 30,
                    avg_pace: "5:46",
                    avg_bpm: 148,
                    max_bpm: 165,
                    elevation_gain: 120,
                    calories: 350,
                    workout_type: "Corrida de Rua",
                    notes: "Corrida matinal no parque. Clima agradável."
                },
                {
                    id: 2,
                    date: "2023-10-17",
                    distance: 8.5,
                    duration: 50,
                    avg_pace: "5:53",
                    avg_bpm: 152,
                    max_bpm: 173,
                    elevation_gain: 210,
                    calories: 580,
                    workout_type: "Trail Running",
                    notes: "Trilha difícil com muita elevação."
                }
            ],
            workoutTypes: [
                "Corrida de Rua",
                "Trail Running",
                "Corrida na Esteira",
                "Intervalado",
                "Long Run",
                "Recuperação",
                "Fartlek",
                "Corrida de Montanha",
                "Outro"
            ]
        };
    }

    /**
     * Get all run records
     * @returns {Promise<Array>} Array of run objects
     */
    async getAllRuns() {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.get_all_runs();
            } catch (error) {
                console.error('Error fetching runs:', error);
                return [];
            }
        } else {
            // Return mock data for testing
            console.log('Using mock data (getAllRuns)');
            return this.mockData.runs;
        }
    }

    /**
     * Get a specific run by ID
     * @param {number} runId - The ID of the run to retrieve
     * @returns {Promise<Object>} Run object
     */
    async getRun(runId) {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.get_run(runId);
            } catch (error) {
                console.error(`Error fetching run ${runId}:`, error);
                return null;
            }
        } else {
            // Return mock data for testing
            console.log('Using mock data (getRun)');
            return this.mockData.runs.find(run => run.id === runId) || null;
        }
    }

    /**
     * Add a new run
     * @param {Object} runData - Run data to add
     * @returns {Promise<Object>} Added run with ID
     */
    async addRun(runData) {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.add_run(runData);
            } catch (error) {
                console.error('Error adding run:', error);
                throw error;
            }
        } else {
            // Simulate adding in mock data
            console.log('Using mock data (addRun)', runData);
            const newRun = {
                ...runData,
                id: this.mockData.runs.length + 1,
                avg_pace: this._calculatePace(runData.distance, runData.duration)
            };
            this.mockData.runs.push(newRun);
            return newRun;
        }
    }

    /**
     * Update existing run
     * @param {number} runId - ID of run to update
     * @param {Object} runData - Updated run data
     * @returns {Promise<Object>} Updated run
     */
    async updateRun(runId, runData) {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.update_run(runId, runData);
            } catch (error) {
                console.error(`Error updating run ${runId}:`, error);
                throw error;
            }
        } else {
            // Simulate updating in mock data
            console.log('Using mock data (updateRun)', runId, runData);
            const index = this.mockData.runs.findIndex(run => run.id === runId);
            if (index !== -1) {
                const updatedRun = {
                    ...this.mockData.runs[index],
                    ...runData,
                    avg_pace: this._calculatePace(runData.distance, runData.duration)
                };
                this.mockData.runs[index] = updatedRun;
                return updatedRun;
            }
            return null;
        }
    }

    /**
     * Delete a run
     * @param {number} runId - ID of run to delete
     * @returns {Promise<boolean>} Success flag
     */
    async deleteRun(runId) {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.delete_run(runId);
            } catch (error) {
                console.error(`Error deleting run ${runId}:`, error);
                throw error;
            }
        } else {
            // Simulate deleting from mock data
            console.log('Using mock data (deleteRun)', runId);
            const index = this.mockData.runs.findIndex(run => run.id === runId);
            if (index !== -1) {
                this.mockData.runs.splice(index, 1);
                return true;
            }
            return false;
        }
    }

    /**
     * Get available workout types
     * @returns {Promise<Array>} Array of workout type strings
     */
    async getWorkoutTypes() {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.get_workout_types();
            } catch (error) {
                console.error('Error fetching workout types:', error);
                return [];
            }
        } else {
            // Return mock data for testing
            console.log('Using mock data (getWorkoutTypes)');
            return this.mockData.workoutTypes;
        }
    }

    /**
     * Export runs to Excel file
     * @returns {Promise<boolean>} Success flag
     */
    async exportToExcel() {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.export_to_excel();
            } catch (error) {
                console.error('Error exporting to Excel:', error);
                return false;
            }
        } else {
            // Simulate export in testing environment
            console.log('Excel export simulation (not in PyWebView)');
            return true;
        }
    }

    /**
     * Export runs to CSV file
     * @returns {Promise<boolean>} Success flag
     */
    async exportToCSV() {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.export_to_csv();
            } catch (error) {
                console.error('Error exporting to CSV:', error);
                return false;
            }
        } else {
            // Simulate export in testing environment
            console.log('CSV export simulation (not in PyWebView)');
            return true;
        }
    }

    /**
     * Export selected runs to Excel file
     * @param {Array} runIds - Array of run IDs to export
     * @returns {Promise<boolean>} Success flag
     */
    async exportSelectedRunsToExcel(runIds) {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.export_selected_to_excel(runIds);
            } catch (error) {
                console.error('Error exporting selected runs to Excel:', error);
                return false;
            }
        } else {
            // Simulate export in testing environment
            console.log('Selected runs Excel export simulation (not in PyWebView)', runIds);
            return true;
        }
    }

    /**
     * Export selected runs to CSV file
     * @param {Array} runIds - Array of run IDs to export
     * @returns {Promise<boolean>} Success flag
     */
    async exportSelectedRunsToCSV(runIds) {
        if (this.isPyWebView) {
            try {
                return await pywebview.api.export_selected_to_csv(runIds);
            } catch (error) {
                console.error('Error exporting selected runs to CSV:', error);
                return false;
            }
        } else {
            // Simulate export in testing environment
            console.log('Selected runs CSV export simulation (not in PyWebView)', runIds);
            return true;
        }
    }

    /**
     * Calculate pace from distance and duration
     * @private
     * @param {number} distance - Distance in km
     * @param {number} duration - Duration in minutes
     * @returns {string} Pace in format 'mm:ss'
     */
    _calculatePace(distance, duration) {
        if (distance <= 0) return "0:00";
        
        const paceSeconds = (duration * 60) / distance;
        const minutes = Math.floor(paceSeconds / 60);
        const seconds = Math.floor(paceSeconds % 60);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Create and export a singleton instance
const api = new LazzFitAPI();
