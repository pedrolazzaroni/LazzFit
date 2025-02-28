import * as Location from 'expo-location';

// Solicitar permissões de localização
export const requestLocationPermissions = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permissão de localização negada');
    }
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissões:', error);
    throw error;
  }
};

// Iniciar o rastreamento de localização
export const startLocationTracking = async (onLocationUpdate) => {
  try {
    await requestLocationPermissions();
    
    // Configurações para rastreamento de alta precisão
    const options = {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000, // Atualiza a cada segundo
      distanceInterval: 1, // Metros mínimos entre atualizações
    };
    
    // Inicia o rastreamento e retorna uma função para cancelar
    const subscription = await Location.watchPositionAsync(
      options,
      onLocationUpdate
    );
    
    return subscription;
  } catch (error) {
    console.error('Erro ao iniciar rastreamento:', error);
    throw error;
  }
};

// Calcular distância entre dois pontos (usando fórmula de Haversine)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // em metros
};

// Calcular estatísticas da corrida
export const calculateRunStats = (locations) => {
  if (!locations || locations.length < 2) {
    return { distance: 0, pace: 0, calories: 0 };
  }

  // Calcular distância total
  let totalDistance = 0;
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    
    totalDistance += calculateDistance(
      prev.coords.latitude,
      prev.coords.longitude,
      curr.coords.latitude,
      curr.coords.longitude
    );
  }

  // Converter para km
  const distanceKm = totalDistance / 1000;
  
  // Calcular tempo em minutos
  const startTime = locations[0].timestamp;
  const endTime = locations[locations.length - 1].timestamp;
  const durationMs = endTime - startTime;
  const durationMinutes = durationMs / 60000;
  
  // Calcular ritmo (min/km)
  const pace = durationMinutes / distanceKm;
  
  // Estimar calorias (aproximadamente 65 calorias por km para uma pessoa de 70kg)
  const calories = Math.round(distanceKm * 65);
  
  return {
    distance: distanceKm.toFixed(2),
    duration: durationMinutes.toFixed(2),
    pace: pace.toFixed(2),
    calories,
  };
};
