import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { loginUser, registerUser } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (!isLogin && !name) {
      Alert.alert('Erro', 'Por favor, informe seu nome para registro.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
        // A navegação acontecerá automaticamente através do observador de auth
      } else {
        await registerUser(email, password, name);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        setIsLogin(true);
      }
    } catch (error) {
      let message = 'Ocorreu um erro. Tente novamente mais tarde.';
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Este email já está sendo usado.';
      } else if (error.code === 'auth/weak-password') {
        message = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido.';
      }
      
      Alert.alert('Erro', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>LazzFit</Text>
        <Text style={styles.tagline}>Seu parceiro de corrida</Text>
      </View>

      <View style={styles.formContainer}>
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Registrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchMode}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin
              ? 'Não tem uma conta? Registre-se'
              : 'Já tem uma conta? Entre'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  tagline: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#2E7D32',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#2E7D32',
    fontSize: 16,
  },
});

export default LoginScreen;
