import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import {
  startLocationTracking,
  calculateRunStats,
} from '../services/locationService';
import { saveRun } from '../services/runService';

const RunScreen = ({ navigation }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats] = useState({
    distance: 0,
    pace: 0,
    calories: 0,
  });

  const mapRef = useRef(null);
  const locationSubscription = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // Inicializar localização uma vez ao montar o componente
  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão necessária',
            'Precisamos de acesso à sua localização para rastrear sua corrida.'
          );
          navigation.goBack();
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setCurrentLocation(location);

        // Centralizar mapa na localização inicial
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      } catch (error) {
        console.error('Erro ao obter localização inicial:', error);
        Alert.alert(
          'Erro',
          'Não foi possível acessar sua localização. Verifique suas permissões.'
        );
        navigation.goBack();
      }
    };

    getInitialLocation();

    // Interceptar botão voltar
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => {
      stopTracking();
      backHandler.remove();
    };
  }, []);

  // Gerenciar o temporizador
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current - pausedTimeRef.current;
        setElapsedTime(elapsed);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const startRun = async () => {
    try {
      // Iniciar o rastreamento de localização
      locationSubscription.current = await startLocationTracking(
        handleLocationUpdate
      );

      // Iniciar o tempo
      startTimeRef.current = Date.now();
      setIsRunning(true);
    } catch (error) {
      console.error('Erro ao iniciar corrida:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o rastreamento.');
    }
  };

  const pauseRun = () => {
    setIsPaused(true);
    pausedTimeRef.current += Date.now() - (startTimeRef.current + pausedTimeRef.current);
  };

  const resumeRun = () => {
    setIsPaused(false);
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleLocationUpdate = (location) => {
    setCurrentLocation(location);
    setLocationHistory((prev) => [...prev, location]);

    // Atualizar estatísticas
    const updatedStats = calculateRunStats([...locationHistory, location]);
    setStats(updatedStats);

    // Centralizar mapa na localização atual
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const finishRun = async () => {
    stopTracking();

    if (locationHistory.length < 2) {
      Alert.alert(
        'Corrida muito curta',
        'Você precisa correr por mais tempo para registrar uma corrida válida.'
      );
      navigation.goBack();
      return;
    }

    // Preparar dados da corrida para salvar
    const runData = {
      title: `Corrida ${new Date().toLocaleDateString()}`,
      distance: stats.distance,
      duration: stats.duration,
      pace: stats.pace,
      calories: stats.calories,
      path: locationHistory.map(loc => ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: loc.timestamp,
      })),
      startTime: new Date(startTimeRef.current),
      endTime: new Date(),
    };

    try {
      // Salvar corrida no Firebase
      const savedRun = await saveRun(runData);
      
      // Navegar para tela de resumo
      navigation.replace('RunSummary', { runId: savedRun.id });
    } catch (error) {
      console.error('Erro ao salvar corrida:', error);
      Alert.alert(
        'Erro',
        'Não foi possível salvar os dados da sua corrida. Tente novamente.'
      );
    }
  };

  const handleBackPress = () => {
    if (isRunning) {
      Alert.alert(
        'Sair da corrida',
        'Deseja realmente cancelar sua corrida atual? Os dados serão perdidos.',
        [
          { text: 'Não', style: 'cancel' },
          { 
            text: 'Sim', 
            onPress: () => {
              stopTracking();
              navigation.goBack();
            } 
          },
        ]
      );
      return true; // Prevent default back behavior
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {currentLocation && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation
            followsUserLocation
          >
            {locationHistory.length >= 2 && (
              <Polyline
                coordinates={locationHistory.map(loc => ({
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                }))}
                strokeColor="#2E7D32"
                strokeWidth={4}
              />
            )}
          </MapView>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.distance} km</Text>
            <Text style={styles.statLabel}>Distância</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pace} min/km</Text>
            <Text style={styles.statLabel}>Ritmo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.calories}</Text>
            <Text style={styles.statLabel}>Calorias</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={startRun}>
            <Ionicons name="play" size={30} color="white" />
            <Text style={styles.buttonText}>Iniciar</Text>
          </TouchableOpacity>
        ) : (
          <>
            {!isPaused ? (
              <TouchableOpacity style={styles.pauseButton} onPress={pauseRun}>
                <Ionicons name="pause" size={30} color="white" />
                <Text style={styles.buttonText}>Pausar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.resumeButton}
                onPress={resumeRun}
              >
                <Ionicons name="play" size={30} color="white" />
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.stopButton} onPress={finishRun}>
              <Ionicons name="stop" size={30} color="white" />
              <Text style={styles.buttonText}>Finalizar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    height: '60%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 15,
    padding: 15,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  startButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FFA000',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default RunScreen;
