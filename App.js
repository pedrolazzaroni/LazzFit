import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import { LogBox, Platform, View } from 'react-native';
import { Colors } from './src/theme/colors';
import { enableScreens } from 'react-native-screens';

// Habilita otimização para navegação entre telas
enableScreens();

// Ignorar warnings específicos que são conhecidos e não afetam a funcionalidade
LogBox.ignoreLogs([
  'Overwriting fontFamily style attribute preprocessor',
  'VirtualizedLists should never be nested',
  'Failed prop type',
]);

export default function App() {
  // Remover a tela de carregamento inicial quando o app estiver pronto
  useEffect(() => {
    if (Platform.OS === 'web') {
      const initialLoader = document.querySelector('.initial-loader');
      if (initialLoader) {
        setTimeout(() => {
          initialLoader.style.display = 'none';
        }, 500);
      }
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? Colors.grey100 : undefined }}>
          <AuthProvider>
            <StatusBar style="light" backgroundColor={Colors.primary} />
            <AuthNavigator />
          </AuthProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
