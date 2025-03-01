import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LazzFit</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});
