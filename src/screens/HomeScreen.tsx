import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CommonActions } from '@react-navigation/native';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    if (isLoading) return;

    // Usar un pequeño retraso para asegurar que la navegación esté lista
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        // Navegar al stack de autenticación
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      } else {
        // Usar reset para limpiar la pila de navegación
        // Navegar a la pantalla principal según el tipo de usuario
        if (user.userType === 'provider') {
          // Para proveedores, navegar a ProfessionalApp
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'ProfessionalApp' }],
            })
          );
        } else {
          // Para clientes, navegar a ClientApp
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'ClientApp' }],
            })
          );
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user, navigation]);

  // Mostrar solo un indicador de carga mientras se verifica la autenticación
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0ea5a3" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
});
