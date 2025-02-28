import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Telas de autenticação
// Se LoginScreen não existir, vamos criar um componente simples para substituí-lo
const LoginScreenFallback = ({ navigation }) => (
  <View style={styles.loginContainer}>
    <Text style={styles.loginTitle}>LazzFit</Text>
    <Text style={styles.loginSubtitle}>Seu app de corrida</Text>
    
    <TouchableOpacity 
      style={styles.loginButton} 
      onPress={() => navigation.navigate('Main')}
    >
      <Text style={styles.loginButtonText}>Entrar</Text>
    </TouchableOpacity>
  </View>
);

// Tentamos importar o LoginScreen real, mas usamos o fallback se não existir
let LoginScreen;
try {
  // Tente importar o LoginScreen real
  LoginScreen = require('../screens/LoginScreen').default;
} catch (error) {
  // Se falhar, use o fallback
  LoginScreen = LoginScreenFallback;
}

// Serviço de autenticação
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Componentes de fallback para telas
const PlaceholderScreen = ({ route, name }) => {
  const screenName = name || (route && route.name) || 'Desconhecida';
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Tela {screenName} em construção</Text>
    </View>
  );
};

// Componentes de tela simples
const HomeScreen = ({ navigation }) => (
  <View style={styles.homeContainer}>
    <Text style={styles.welcomeText}>Bem-vindo ao LazzFit</Text>
    
    <TouchableOpacity 
      style={styles.startRunButton}
      onPress={() => navigation.navigate('Run')}
    >
      <Ionicons name="play" size={24} color="white" />
      <Text style={styles.startRunText}>Iniciar Corrida</Text>
    </TouchableOpacity>
  </View>
);

const HistoryScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Histórico de Corridas</Text>
    <Text style={styles.placeholderSubtext}>Em breve você verá suas corridas aqui</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Perfil do Usuário</Text>
    <Text style={styles.placeholderSubtext}>Em breve você poderá editar seu perfil</Text>
  </View>
);

const RunScreen = ({ navigation }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Tela de Corrida</Text>
    <TouchableOpacity 
      style={styles.placeholderButton}
      onPress={() => navigation.navigate('RunSummary')}
    >
      <Text style={styles.placeholderButtonText}>Finalizar Corrida</Text>
    </TouchableOpacity>
  </View>
);

const RunSummaryScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Resumo da Corrida</Text>
    <Text style={styles.placeholderSubtext}>Parabéns por completar sua corrida!</Text>
  </View>
);

// Mapa de componentes (sem usar require dinâmico)
const SCREEN_COMPONENTS = {
  HomeScreen,
  HistoryScreen,
  ProfileScreen,
  RunScreen,
  RunSummaryScreen
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Início',
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          title: 'Histórico',
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Detectar mudanças no estado de autenticação
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (initializing) setInitializing(false);
      }, (error) => {
        console.error("Erro na autenticação:", error);
        setError(error);
        setInitializing(false);
      });

      // Cleanup subscription
      return unsubscribe;
    } catch (err) {
      console.error("Erro ao configurar autenticação:", err);
      setError(err);
      setInitializing(false);
    }
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ocorreu um erro</Text>
        <Text style={styles.errorDetail}>{error.message || 'Erro desconhecido'}</Text>
        <TouchableOpacity 
          style={styles.placeholderButton}
          onPress={() => setUser({})} // Forçar login para teste
        >
          <Text style={styles.placeholderButtonText}>Continuar mesmo assim</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Rotas para usuários não autenticados
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // Rotas para usuários autenticados
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="Run" 
              component={RunScreen}
              options={{ 
                headerShown: true,
                title: 'Nova Corrida',
                headerStyle: {
                  backgroundColor: '#2E7D32',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen 
              name="RunSummary" 
              component={RunSummaryScreen}
              options={{ 
                headerShown: true,
                title: 'Resumo da Corrida',
                headerStyle: {
                  backgroundColor: '#2E7D32',
                },
                headerTintColor: '#fff',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: '#D32F2F',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  errorDetail: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  placeholderButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  placeholderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  startRunButton: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    width: 200,
  },
  startRunText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 20,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 50,
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default AppNavigator;