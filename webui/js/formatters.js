/**
 * Formatters Module
 * Provides utility functions for formatting data values
 */
class FormattersUtil {
    /**
     * Format a timestamp in seconds to HH:MM:SS format
     * @param {number} totalSeconds - Total seconds to format
     * @returns {string} Formatted time string
     */
    formatTimeHHMMSS(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        
        let result = '';
        if (hours > 0) {
            result += `${hours.toString().padStart(2, '0')}:`;
        }
        
        result += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return result;
    }
    
    /**
     * Parse a time string in HH:MM:SS format to total seconds
     * @param {string} timeString - Time string in HH:MM:SS or MM:SS format
     * @returns {number} Total seconds
     */
    parseTimeToSeconds(timeString) {
        if (!timeString) return 0;
        
        const parts = timeString.split(':').map(part => parseInt(part, 10) || 0);
        
        if (parts.length === 3) {
            // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            // MM:SS
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
            // SS
            return parts[0];
        }
        
        return 0;
    }
    
    /**
     * Convert seconds to minutes for storage
     * @param {number} seconds - Total seconds
     * @returns {number} Total minutes (rounded)
     */
    secondsToMinutes(seconds) {
        return Math.round(seconds / 60);
    }
    
    /**
     * Convert minutes to a human-readable format (Xh Ymin)
     * @param {number} totalMinutes - Total minutes
     * @returns {string} Formatted duration
     */
    formatMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        
        return `${minutes}min`;
    }
    
    /**
     * Format a number to always show 2 decimal places
     * @param {number} value - Number to format
     * @returns {string} Formatted number with 2 decimal places
     */
    formatDistance(value) {
        return parseFloat(value).toFixed(2);
    }
    
    /**
     * Format a pace value (minutes per km) to MM:SS
     * @param {number} distance - Distance in km
     * @param {number} durationMinutes - Duration in minutes
     * @returns {string} Pace formatted as MM:SS
     */
    calculatePace(distance, durationMinutes) {
        if (!distance || distance <= 0 || !durationMinutes) return '0:00';
        
        const paceSeconds = (durationMinutes * 60) / distance;
        const minutes = Math.floor(paceSeconds / 60);
        const seconds = Math.floor(paceSeconds % 60);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Create and export a singleton instance
const formatters = new FormattersUtil();
