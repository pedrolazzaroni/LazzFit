import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserRuns } from '../services/runService';
import { auth } from '../services/firebase';

const HomeScreen = ({ navigation }) => {
  const [recentRuns, setRecentRuns] = useState([]);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalRuns: 0,
    averagePace: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const runs = await getUserRuns();
      
      // Obter as corridas mais recentes (máximo 3)
      const recent = runs.slice(0, 3);
      setRecentRuns(recent);
      
      // Calcular estatísticas gerais
      if (runs.length > 0) {
        const totalDistance = runs.reduce((sum, run) => sum + parseFloat(run.distance || 0), 0);
        const totalDuration = runs.reduce((sum, run) => sum + parseFloat(run.duration || 0), 0);
        const avgPace = totalDuration / totalDistance || 0;
        
        setStats({
          totalDistance: totalDistance.toFixed(2),
          totalRuns: runs.length,
          averagePace: avgPace.toFixed(2),
        });
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Data desconhecida';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho de boas-vindas */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Olá, {auth.currentUser?.displayName || 'Corredor'}!
        </Text>
        <Text style={styles.subtitle}>Pronto para sua próxima corrida?</Text>
      </View>

      {/* Botão de iniciar corrida */}
      <TouchableOpacity 
        style={styles.startRunButton}
        onPress={() => navigation.navigate('Run')}
      >
        <Ionicons name="play" size={24} color="white" />
        <Text style={styles.startRunText}>Iniciar Corrida</Text>
      </TouchableOpacity>

      {/* Resumo de estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalDistance} km</Text>
          <Text style={styles.statLabel}>Distância Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalRuns}</Text>
          <Text style={styles.statLabel}>Corridas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.averagePace} min/km</Text>
          <Text style={styles.statLabel}>Ritmo Médio</Text>
        </View>
      </View>

      {/* Corridas recentes */}
      <View style={styles.recentRunsSection}>
        <Text style={styles.sectionTitle}>Corridas Recentes</Text>
        
        {recentRuns.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Você ainda não registrou corridas.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Toque em "Iniciar Corrida" para começar!
            </Text>
          </View>
        ) : (
          recentRuns.map((run) => (
            <TouchableOpacity 
              key={run.id} 
              style={styles.runCard}
              onPress={() => navigation.navigate('RunSummary', { runId: run.id })}
            >
              <View style={styles.runCardLeft}>
                <Ionicons name="stopwatch-outline" size={24} color="#2E7D32" />
              </View>
              <View style={styles.runCardCenter}>
                <Text style={styles.runTitle}>{run.title || 'Corrida'}</Text>
                <Text style={styles.runDate}>{formatDate(run.createdAt)}</Text>
              </View>
              <View style={styles.runCardRight}>
                <Text style={styles.runDistance}>{run.distance} km</Text>
                <Text style={styles.runTime}>{run.duration} min</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        
        {recentRuns.length > 0 && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.viewAllText}>Ver todas as corridas</Text>
            <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  startRunButton: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    padding: 15,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  startRunText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginHorizontal: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  recentRunsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  runCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  runCardLeft: {
    justifyContent: 'center',
    marginRight: 15,
  },
  runCardCenter: {
    flex: 1,
  },
  runCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  runTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  runDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  runDistance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  runTime: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  viewAllText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
});

export default HomeScreen;
