import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EmptyState = ({ 
  message, 
  subMessage, 
  icon = 'run-fast',
  iconColor = '#4CAF50'
}) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={70} color={iconColor} />
      <Text style={styles.message}>{message}</Text>
      {subMessage ? <Text style={styles.subMessage}>{subMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  subMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default EmptyState;
