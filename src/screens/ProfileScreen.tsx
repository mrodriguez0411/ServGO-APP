import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentMethods'>;

type ProfileScreenProps = {
  navigation: ProfileScreenNavigationProp;
  route: any;
};

const ProfileScreen = ({ navigation, route }: ProfileScreenProps) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const goToEditProfile = () => {
    navigation.navigate('EditProfile', {});
  };

  const goToPaymentMethods = useCallback(() => {
    try {
      // Navigate to PaymentMethods in the root stack
      navigation.navigate('PaymentMethods', { refresh: true });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'No se pudo abrir la pantalla de métodos de pago');
    }
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const handleEditProfile = useCallback(() => {
    try {
      goToEditProfile();
    } catch (error) {
      console.error('Error al navegar a Editar Perfil:', error);
      Alert.alert('Error', 'No se pudo abrir la pantalla de edición de perfil');
    }
  }, [goToEditProfile]);

  const handlePaymentMethods = useCallback(() => {
    try {
      console.log('Iniciando navegación a PaymentMethods');
      goToPaymentMethods();
    } catch (error) {
      console.error('Error de navegación:', error);
      Alert.alert('Error', 'No se pudo abrir la pantalla de métodos de pago');
    }
  }, [goToPaymentMethods]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEditProfile}
            disabled={isLoading}
          >
            <Ionicons 
              name="create-outline" 
              size={20} 
              color={isLoading ? "#9ca3af" : "#059669"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#9ca3af" />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              {user.phone && (
                <Text style={styles.userPhone}>{user.phone}</Text>
              )}
              <View style={styles.userTypeContainer}>
                <Text style={styles.userType}>
                  {user.userType === "client" ? "Cliente" : "Proveedor de Servicios"}
                </Text>
                {user.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#059669" style={styles.verifiedIcon} />
                )}
              </View>
            </View>
          </View>
        </View>

          {user?.userType === "provider" && (
            <View style={styles.providerStatsSection}>
              <Text style={styles.sectionTitle}>Estadísticas</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Trabajos Completados</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0.0</Text>
                  <Text style={styles.statLabel}>Calificación</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>$0</Text>
                  <Text style={styles.statLabel}>Ganancia Total</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <Ionicons name="person-outline" size={24} color="#475569" />
              <Text style={styles.menuText}>Editar Perfil</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {user?.userType === "provider" && (
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="briefcase-outline" size={24} color="#475569" />
                <Text style={styles.menuText}>Mis Servicios</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handlePaymentMethods}
              disabled={isLoading}
            >
              <Ionicons name="card-outline" size={24} color="#475569" />
              <Text style={styles.menuText}>Métodos de Pago</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="notifications-outline" size={24} color="#475569" />
              <Text style={styles.menuText}>Notificaciones</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="shield-outline" size={24} color="#475569" />
              <Text style={styles.menuText}>Privacidad y Seguridad</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle-outline" size={24} color="#475569" />
              <Text style={styles.menuText}>Ayuda y Soporte</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="information-circle-outline" size={24} color="#475569" />
              <Text style={styles.menuText}>Acerca de ServiGo</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoutSection}>
            <TouchableOpacity 
              style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]} 
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={styles.logoutText}>
                {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  profileHeader: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#475569',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#6b7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userType: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#059669',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#475569',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  providerStatsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#475569',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#059669',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: '#475569',
    marginLeft: 16,
  },
  logoutSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    marginTop: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    marginTop: 16,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    color: '#dc2626',
    marginLeft: 8,
  },
});
