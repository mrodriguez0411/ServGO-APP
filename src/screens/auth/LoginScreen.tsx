"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from "@expo/vector-icons"
import { useRoute, RouteProp } from '@react-navigation/native'
import { useAuth } from "../../contexts/AuthContext"
import { LoadingSpinner } from "../../components/LoadingSpinner"

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const [role, setRole] = useState<'client' | 'provider'>('client')
  const route = useRoute<RouteProp<Record<string, { initialRole?: 'client' | 'provider' }>, string>>()
  // If navigated from RoleSelection, preselect the role
  useEffect(() => {
    const initialRole = (route.params as any)?.initialRole as 'client' | 'provider' | undefined
    if (initialRole) setRole(initialRole)
  }, [route.params])

  const handleLogin = async () => {
    console.log('handleLogin called with:', { email, password, role });
    
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      console.log('Calling login function...');
      const result = await login(email, password, role);
      console.log('Login result:', result);
      
      if (result.success) {
        // Forzar una actualización del estado de autenticación
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navegar a la pantalla principal según el rol del usuario
        // Usamos las rutas definidas en App.tsx
        const targetScreen = role === 'client' ? 'Main' : 'Professional';
        console.log('Navigating to:', targetScreen);
        
        // Navegar a la pantalla principal
        navigation.navigate(targetScreen);
      } else {
        console.log('Login failed with error:', result.error);
        Alert.alert("Error", result.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert("Error", "Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo.")
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[ '#0ea5a3', '#10b981', '#16a34a' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.title}>Iniciar Sesión</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.demoInfo}>
            <Text style={styles.demoTitle}>Demo - Usa estas credenciales:</Text>
            <Text style={styles.demoText}>Email: test@servigo.com</Text>
            <Text style={styles.demoText}>Contraseña: password123</Text>
          </View>

          <View style={styles.inputContainer}>
          
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Tu contraseña"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            <Text style={styles.loginButtonText}>{isLoading ? "Iniciando..." : "Iniciar Sesión"}</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("RegisterRoleSelection")}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0ea5a3",
  },
  gradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  roleToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  roleButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  roleButtonText: {
    color: '#6b7280',
    fontFamily: 'DMSans-Medium',
  },
  roleButtonTextActive: {
    color: '#ffffff',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk-Bold",
    color: "#ffffff",
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 24,
  },
  demoInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5a3",
  },
  demoTitle: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#059669",
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#16a34a",
    marginBottom: 2,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    backgroundColor: "#ffffff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    //color: "#059669",
    color: '#fff'
  },
  loginButton: {
    backgroundColor: "#0ea5a3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#ffffff",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#6b7280",
    
  },
  registerLink: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    //color: "#059669",
    color: '#fff',
  },
})
