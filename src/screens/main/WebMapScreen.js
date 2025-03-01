import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  ScrollView 
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importação condicional para MapView
let MapView;
let Marker;
try {
  if (Platform.OS === 'web') {
    const WebMaps = require('react-native-web-maps');
    MapView = WebMaps.default;
    Marker = WebMaps.Marker;
  } else {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
  }
} catch (error) {
  console.log('Erro ao importar os mapas:', error);
}

// Tela de mapa adaptada para web
export default function WebMapScreen() {
  const [mapReady, setMapReady] = useState(false);

  // Localizações de academias de exemplo
  const gymLocations = [
    { id: 1, name: 'Academia Power Fitness', latitude: -22.9083, longitude: -43.1964 },
    { id: 2, name: 'Strong Gym', latitude: -22.9063, longitude: -43.1984 },
    { id: 3, name: 'Academia Flex', latitude: -22.9103, longitude: -43.1944 }
  ];

  // Localização inicial (Rio de Janeiro)
  const initialRegion = {
    latitude: -22.9068,
    longitude: -43.1729,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (!MapView) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="map-outline" size={60} color={Colors.grey500} />
        <Text style={styles.fallbackTitle}>Mapa não disponível</Text>
        <Text style={styles.fallbackText}>
          Este navegador não suporta o componente de mapa.
          Tente outro navegador ou utilize o aplicativo móvel.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            onMapReady={() => setMapReady(true)}
          >
            {mapReady && gymLocations.map(gym => (
              <Marker
                key={gym.id}
                coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
                title={gym.name}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.fallback}>
            <Ionicons name="map-outline" size={60} color={Colors.grey500} />
            <Text style={styles.fallbackTitle}>Mapa não disponível</Text>
            <Text style={styles.fallbackText}>
              Esta versão do aplicativo não suporta mapas no navegador.
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Academias Próximas</Text>
        <ScrollView style={styles.infoScroll}>
          {gymLocations.map(gym => (
            <View key={gym.id} style={styles.gymCard}>
              <View style={styles.gymIconContainer}>
                <Ionicons name="fitness-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.gymInfo}>
                <Text style={styles.gymName}>{gym.name}</Text>
                <Text style={styles.gymDistance}>Aproximadamente 1.2 km</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey500} />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;
const mapHeight = Platform.OS === 'web' ? Math.min(400, windowWidth * 0.6) : 300;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey100,
  },
  mapContainer: {
    height: mapHeight,
    width: '100%',
    backgroundColor: Colors.grey300,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.grey100,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 16,
    color: Colors.grey700,
    textAlign: 'center',
    maxWidth: 400,
  },
  infoContainer: {
    flex: 1,
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 16,
  },
  infoScroll: {
    flex: 1,
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gymIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.secondary,
  },
  gymDistance: {
    fontSize: 14,
    color: Colors.grey600,
    marginTop: 4,
  },
});
