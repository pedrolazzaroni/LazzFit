import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { getUserWorkouts, deleteWorkout } from '../services/workoutService';
import { useFocusEffect } from '@react-navigation/native';
import WorkoutCard from '../components/WorkoutCard';
import EmptyState from '../components/EmptyState';

const WorkoutHistoryScreen = () => {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    setIsLoading(true);
    try {
      const { workouts: workoutsData, error } = await getUserWorkouts();
      
      if (error) {
        Alert.alert('Erro', error);
      } else {
        setWorkouts(workoutsData);
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const handleDeleteWorkout = (id) => {
    Alert.alert(
      'Excluir Treino',
      'Tem certeza que deseja excluir este treino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await deleteWorkout(id);
              
              if (error) {
                Alert.alert('Erro', error);
              } else {
                setWorkouts(workouts.filter(workout => workout.id !== id));
              }
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Treinos</Text>
      
      {workouts.length > 0 ? (
        <FlatList
          data={workouts}
          renderItem={({ item }) => (
            <WorkoutCard workout={item} onDelete={handleDeleteWorkout} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <EmptyState
          message="Nenhum treino registrado ainda."
          subMessage="Registre seu primeiro treino na aba 'Novo Treino'!"
          icon="run-fast"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default WorkoutHistoryScreen;
