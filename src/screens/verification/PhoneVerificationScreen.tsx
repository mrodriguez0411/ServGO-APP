import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type PhoneVerificationRouteProp = RouteProp<RootStackParamList, 'PhoneVerification'>;
type PhoneVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneVerification'>;

const CODE_LENGTH = 6;
const RESEND_TIMEOUT = 60; // seconds

export const PhoneVerificationScreen = () => {
  const navigation = useNavigation<PhoneVerificationNavigationProp>();
  const route = useRoute<PhoneVerificationRouteProp>();
  const { phoneNumber, userId } = route.params;
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);
  const [error, setError] = useState('');
  
  const { verifyPhone, resendVerificationCode } = useAuth();
  
  // Format phone number for display
  const formattedPhone = `+${phoneNumber.substring(0, 2)} ${phoneNumber.substring(2, 5)} ${phoneNumber.substring(5, 8)} ${phoneNumber.substring(8)}`;
  
  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Handle code verification
  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      setError('Por favor ingresa el código de 6 dígitos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await verifyPhone(userId, code);
      
      if (result.success) {
        // Move to the next verification step (document upload)
        navigation.replace('DocumentVerification', { userId });
      } else {
        setError(result.error || 'Error al verificar el código. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Ocurrió un error al verificar el código. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resend code
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      const result = await resendVerificationCode(userId);
      
      if (result.success) {
        setCountdown(RESEND_TIMEOUT);
        Alert.alert('Éxito', 'Se ha enviado un nuevo código de verificación');
      } else {
        setError(result.error || 'Error al reenviar el código. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Resend code error:', err);
      setError('Ocurrió un error al reenviar el código. Intenta nuevamente.');
    } finally {
      setResendLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verifica tu número</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un código de verificación al número {formattedPhone}
        </Text>
        
        <TextInput
          label="Código de verificación"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.input}
          error={!!error}
          disabled={loading}
          autoFocus
          theme={{
            colors: {
              primary: '#2196F3',
              error: '#f44336',
            },
          }}
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            ¿No recibiste el código?{' '}
          </Text>
          <Button
            mode="text"
            onPress={handleResendCode}
            disabled={countdown > 0 || resendLoading}
            loading={resendLoading}
            labelStyle={styles.resendButton}
          >
            {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
          </Button>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleVerify}
            loading={loading}
            disabled={code.length !== CODE_LENGTH || loading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Verificar
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  errorText: {
    color: '#f44336',
    marginBottom: 15,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    color: '#666',
  },
  resendButton: {
    padding: 0,
    minWidth: 0,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
});

export default PhoneVerificationScreen;
