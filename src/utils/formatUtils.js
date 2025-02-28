/**
 * Formata a data para exibição
 * @param {string} dateString - String de data no formato ISO
 * @returns {string} Data formatada
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return dateString;
  }
};

/**
 * Calcula o ritmo baseado na distância e duração
 * @param {number} distance - Distância em km
 * @param {number} duration - Duração em minutos
 * @returns {string} Ritmo formatado (min:seg por km)
 */
export const calculatePace = (distance, duration) => {
  if (!distance || !duration) return '--:--';
  
  const distanceKm = parseFloat(distance);
  const durationMinutes = parseFloat(duration);
  
  if (isNaN(distanceKm) || isNaN(durationMinutes) || distanceKm <= 0) {
    return '--:--';
  }
  
  const paceMinutes = durationMinutes / distanceKm;
  const paceMinutesWhole = Math.floor(paceMinutes);
  const paceSeconds = Math.round((paceMinutes - paceMinutesWhole) * 60);
  
  return `${paceMinutesWhole}:${paceSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formata números para exibir com precisão específica
 * @param {number} value - Valor a formatar
 * @param {number} precision - Casas decimais (padrão: 2)
 * @returns {number} Valor formatado
 */
export const formatNumber = (value, precision = 1) => {
  if (value === undefined || value === null) return 0;
  
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
};
