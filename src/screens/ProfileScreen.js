import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { auth } from '../services/firebase';
import { logoutUser } from '../services/authService';
import { getUserWorkouts } from '../services/workoutService';

const ProfileScreen = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDistance: 0,
    totalDuration: 0,
    averagePace: '--:--'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    setIsLoading(true);
    try {
      const { workouts, error } = await getUserWorkouts();
      
      if (error) {
        Alert.alert('Erro', error);
      } else {
        calculateStats(workouts);
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (workouts) => {
    if (workouts.length === 0) {
      setStats({
        totalWorkouts: 0,
        totalDistance: 0,
        totalDuration: 0,
        averagePace: '--:--'
      });
      return;
    }

    const totalWorkouts = workouts.length;
    let totalDistance = 0;
    let totalDuration = 0;

    workouts.forEach(workout => {
      totalDistance += workout.distance || 0;
      totalDuration += workout.duration || 0;
    });

    let averagePace = '--:--';
    if (totalDistance > 0) {
      const paceMinutes = totalDuration / totalDistance;
      const paceMinutesWhole = Math.floor(paceMinutes);
      const paceSeconds = Math.round((paceMinutes - paceMinutesWhole) * 60);
      averagePace = `${paceMinutesWhole}:${paceSeconds.toString().padStart(2, '0')}`;
    }

    setStats({
      totalWorkouts,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalDuration: Math.round(totalDuration),
      averagePace
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await logoutUser();
      if (error) {
        Alert.alert('Erro', error);
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.emailText}>{user?.email || 'Usuário'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Estatísticas</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalDistance}</Text>
            <Text style={styles.statLabel}>Km Totais</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalDuration}</Text>
            <Text style={styles.statLabel}>Min Totais</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.averagePace}</Text>
            <Text style={styles.statLabel}>Ritmo Médio</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileContainer: {
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  emailText: {
    fontSize: 18,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
  },
  logoutButton: {
    height: 50,
    backgroundColor: '#f44336',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
