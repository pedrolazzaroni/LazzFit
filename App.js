import 'expo-dev-client';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importar o navegador principal
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
