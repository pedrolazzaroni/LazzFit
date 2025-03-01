import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Telas de autenticação
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Telas principais
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Telas específicas para dispositivos móveis
let MapScreen;
if (Platform.OS !== 'web') {
  MapScreen = require('../screens/main/MapScreen').default;
} else {
  MapScreen = require('../screens/main/WebMapScreen').default;
}

// Contexto de autenticação
import { useAuth } from '../contexts/AuthContext';

// Tela de carregamento
import LoadingScreen from '../screens/LoadingScreen';

// Cores
import { Colors } from '../theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator para as telas principais após login
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey600,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.grey200,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator para as telas de autenticação
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Navegador principal que verifica se o usuário está autenticado
export default function AuthNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Configuração específica para web
  const linking = {
    prefixes: ['https://lazzfit.app', 'lazzfit://'],
    config: {
      screens: {
        Login: 'login',
        Register: 'register',
        HomeTab: 'home',
        MapTab: 'map',
        ProfileTab: 'profile',
      },
    },
  };

  return (
    <NavigationContainer linking={Platform.OS === 'web' ? linking : undefined}>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
