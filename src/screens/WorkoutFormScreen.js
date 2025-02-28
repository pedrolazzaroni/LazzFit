import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { saveWorkout } from '../services/workoutService';

const WorkoutFormScreen = ({ navigation }) => {
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const calculatePace = () => {
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

  const handleSave = async () => {
    if (!distance || !duration || !date) {
      Alert.alert('Erro', 'Por favor, preencha distância, duração e data');
      return;
    }

    setIsLoading(true);
    
    try {
      const workoutData = {
        distance: parseFloat(distance),
        duration: parseFloat(duration),
        date,
        pace: calculatePace(),
        notes,
      };
      
      const { error } = await saveWorkout(workoutData);
      
      if (error) {
        Alert.alert('Erro', error);
      } else {
        Alert.alert('Sucesso', 'Treino salvo com sucesso!');
        
        // Limpar formulário
        setDistance('');
        setDuration('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        
        navigation.navigate('History');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registrar Novo Treino</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="AAAA-MM-DD"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Distância (km)</Text>
          <TextInput
            style={styles.input}
            value={distance}
            onChangeText={setDistance}
            placeholder="5.0"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duração (minutos)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="30"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.paceContainer}>
          <Text style={styles.label}>Ritmo (min/km)</Text>
          <Text style={styles.paceValue}>{calculatePace()}</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Como foi o treino? Como você se sentiu?"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Treino</Text>
          )}
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
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  paceContainer: {
    marginBottom: 15,
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 5,
  },
  paceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  saveButton: {
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkoutFormScreen;
