import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const WorkoutCard = ({ workout, onDelete }) => {
  const formattedDate = new Date(workout.date).toLocaleDateString();
  
  return (
    <View style={styles.workoutCard}>
      <View style={styles.workoutHeader}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <TouchableOpacity 
          onPress={() => onDelete(workout.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.workoutDetails}>
        <View style={styles.metricContainer}>
          <Text style={styles.metricValue}>{workout.distance} km</Text>
          <Text style={styles.metricLabel}>Distância</Text>
        </View>
        
        <View style={styles.metricContainer}>
          <Text style={styles.metricValue}>{workout.duration} min</Text>
          <Text style={styles.metricLabel}>Duração</Text>
        </View>
        
        <View style={styles.metricContainer}>
          <Text style={styles.metricValue}>{workout.pace}</Text>
          <Text style={styles.metricLabel}>Ritmo</Text>
        </View>
      </View>
      
      {workout.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Observações:</Text>
          <Text style={styles.notesText}>{workout.notes}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffcdd2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#c62828',
    fontWeight: 'bold',
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricContainer: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  metricLabel: {
    fontSize: 12,
    color: '#777',
  },
  notesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
  },
});

export default WorkoutCard;
