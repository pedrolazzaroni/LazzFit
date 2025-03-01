import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Colors } from '../../theme/colors';
import { resetPassword } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useAuth();

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

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
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      // Navegação acontecerá automaticamente pelo AuthNavigator
    } catch (error) {
      Alert.alert('Erro de Login', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setRecoveryEmail(email); // Pré-preenche com o email atual
    setForgotPasswordModalVisible(true);
  };

  const handleSendPasswordReset = async () => {
    if (!recoveryEmail || !/\S+@\S+\.\S+/.test(recoveryEmail)) {
      Alert.alert('Erro', 'Por favor, digite um email válido');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(recoveryEmail);
      Alert.alert(
        'Email Enviado',
        'Verifique sua caixa de entrada para instruções de recuperação de senha.',
        [{ text: 'OK', onPress: () => setForgotPasswordModalVisible(false) }]
      );
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
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
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LazzFit</Text>
              <Text style={styles.tagline}>Sua jornada fitness começa aqui</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.heading}>Login</Text>
              
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

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              <Button
                title="Entrar"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Criar Nova Conta"
                onPress={goToRegister}
                type="outline"
                fullWidth
              />
            </View>
          </ScrollView>

          {/* Modal de Recuperação de Senha */}
          <Modal
            visible={forgotPasswordModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setForgotPasswordModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Recuperar Senha</Text>
                  <TouchableOpacity 
                    onPress={() => setForgotPasswordModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={Colors.grey600} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDescription}>
                  Digite seu email para receber instruções de recuperação de senha.
                </Text>

                <Input
                  label="Email"
                  value={recoveryEmail}
                  onChangeText={setRecoveryEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  iconName="mail-outline"
                />

                <Button
                  title="Enviar Email de Recuperação"
                  onPress={handleSendPasswordReset}
                  loading={resetLoading}
                  fullWidth
                  style={styles.resetButton}
                />
              </View>
            </View>
          </Modal>
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
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    color: Colors.white,
    marginTop: 8,
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grey300,
  },
  dividerText: {
    color: Colors.grey600,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  closeButton: {
    padding: 5,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.grey700,
    marginBottom: 20,
  },
  resetButton: {
    marginTop: 10,
  },
});
