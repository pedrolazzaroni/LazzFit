import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Colors } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validação de nome
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    }

    // Validação de email
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    // Validação de senha
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    // Validação de confirmação de senha
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(email, password);
      // O usuário será redirecionado automaticamente pela navegação de autenticação
      Alert.alert('Sucesso!', 'Conta criada com sucesso!');
    } catch (error) {
      Alert.alert('Erro no Cadastro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Colors.secondary, Colors.secondaryDark]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.logoText}>LazzFit</Text>
              <Text style={styles.headerTitle}>Criar Conta</Text>
              <Text style={styles.headerSubtitle}>
                Junte-se a nós e comece sua jornada fitness
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Nome completo"
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                iconName="person-outline"
                error={errors.name}
                autoCapitalize="words"
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                iconName="mail-outline"
                error={errors.email}
              />

              <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha"
                secureTextEntry
                iconName="lock-closed-outline"
                error={errors.password}
              />

              <Input
                label="Confirmar senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme sua senha"
                secureTextEntry
                iconName="lock-closed-outline"
                error={errors.confirmPassword}
              />

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
                  <Text style={styles.termsLink}>Política de Privacidade</Text>.
                </Text>
              </View>

              <Button
                title="Criar Conta"
                onPress={handleRegister}
                loading={isLoading}
                fullWidth
              />

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já tem uma conta?</Text>
                <TouchableOpacity onPress={goToLogin}>
                  <Text style={styles.loginLink}>Faça login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.grey300,
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  termsContainer: {
    marginVertical: 16,
  },
  termsText: {
    fontSize: 12,
    color: Colors.grey700,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: Colors.grey700,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
});
