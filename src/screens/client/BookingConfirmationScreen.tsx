import React, { useEffect, useState } from '../../../node_modules/@types/react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Linking,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data for the professional
const professional = {
  id: '1',
  name: 'Juan Pérez',
  profession: 'Plomero Profesional',
  image: 'https://randomuser.me/api/portraits/men/1.jpg',
  phone: '+525512345678',
};

// Mock service data
const services = {
  '1': { name: 'Reparación de fugas', price: 300 },
  '2': { name: 'Instalación de tuberías', price: 800 },
  '3': { name: 'Limpieza de drenajes', price: 500 },
  '4': { name: 'Mantenimiento general', price: 600 },
};

type BookingConfirmationRouteProp = RouteProp<RootStackParamList, 'BookingConfirmation'>;

export default function BookingConfirmationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BookingConfirmationRouteProp>();
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes in seconds
  
  // In a real app, you would get this data from the route params
  const bookingDetails = {
    id: 'BK' + Math.floor(100000 + Math.random() * 900000),
    serviceId: '1',
    date: new Date(),
    time: new Date(),
    address: 'Calle Falsa 123, Colonia Centro, CDMX',
    total: 300,
    status: 'pending',
    paymentMethod: 'Visa terminada en 4242',
  };
  
  const service = services[bookingDetails.serviceId as keyof typeof services];
  
  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleCallProfessional = () => {
    Linking.openURL(`tel:${professional.phone}`);
  };
  
  const handleMessageProfessional = () => {
    // In a real app, this would open a chat with the professional
    Alert.alert('Mensaje', 'Esta función abrirá un chat con el profesional en una implementación real');
  };
  
  const handleShareBooking = async () => {
    try {
      await Share.share({
        message: `He agendado un servicio de ${service.name} con ${professional.name} para el ${bookingDetails.date.toLocaleDateString()} a las ${bookingDetails.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Total: $${bookingDetails.total} MXN`,
      });
    } catch (error) {
      console.error('Error sharing booking:', error);
    }
  };
  
  const handleViewBookings = () => {
    // Navegar a la pantalla de reservas
    navigation.navigate('ClientApp');
    // Usar setTimeout para asegurar que la navegación anterior se complete
    // antes de intentar navegar a MyBookings
    setTimeout(() => {
      navigation.navigate('ClientApp', { screen: 'MyBookings' } as any);
    }, 100);
  };
  
  const handleDone = () => {
    // Navegar a la pantalla de inicio del cliente
    navigation.navigate('ClientApp');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Confirmation Header */}
        <View style={styles.header}>
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          </View>
          <Text style={styles.headerTitle}>¡Cita agendada!</Text>
          <Text style={styles.headerSubtitle}>
            Tu cita ha sido confirmada exitosamente
          </Text>
          
          {countdown > 0 && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                El profesional tiene {formatTime(countdown)} para confirmar tu cita
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(countdown / (15 * 60)) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>
        
        {/* Booking Details */}
        <View style={styles.detailsCard}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de la cita</Text>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Fecha y hora</Text>
                <Text style={styles.detailValue}>
                  {bookingDetails.date.toLocaleDateString('es-MX', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {' a las '}
                  {bookingDetails.time.toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Dirección</Text>
                <Text style={styles.detailValue}>{bookingDetails.address}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={20} color="#666" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Método de pago</Text>
                <Text style={styles.detailValue}>{bookingDetails.paymentMethod}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={20} color="#666" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Número de reservación</Text>
                <Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>{bookingDetails.id}</Text>
              </View>
            </View>
          </View>
          
          {/* Professional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profesional</Text>
            <View style={styles.professionalInfo}>
              <Image 
                source={{ uri: professional.image }} 
                style={styles.professionalImage}
              />
              <View style={styles.professionalDetails}>
                <Text style={styles.professionalName}>{professional.name}</Text>
                <Text style={styles.professionalProfession}>{professional.profession}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.ratingText}>4.8</Text>
                  <Text style={styles.reviewsText}>(124 reseñas)</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={handleCallProfessional}
              >
                <Ionicons name="call-outline" size={20} color="#4f46e5" />
                <Text style={[styles.actionButtonText, { color: '#4f46e5' }]}>
                  Llamar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.messageButton]}
                onPress={handleMessageProfessional}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#4f46e5" />
                <Text style={[styles.actionButtonText, { color: '#4f46e5' }]}>
                  Mensaje
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Service Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles del servicio</Text>
            <View style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDuration}>1 hora aprox.</Text>
              </View>
              <Text style={styles.servicePrice}>${service.price} MXN</Text>
            </View>
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>${bookingDetails.total} MXN</Text>
            </View>
            
            <Text style={styles.paymentNote}>
              El pago se realizará una vez que el servicio haya sido completado satisfactoriamente.
            </Text>
          </View>
          
          {/* Help Section */}
          <View style={styles.helpSection}>
            <Ionicons name="help-circle-outline" size={24} color="#4f46e5" />
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
              <Text style={styles.helpText}>
                Si tienes alguna pregunta o necesitas hacer cambios en tu reservación, contáctanos.
              </Text>
            </View>
            <TouchableOpacity style={styles.helpButton}>
              <Text style={styles.helpButtonText}>Contactar soporte</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footerSpacer} />
      </ScrollView>
      
      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleShareBooking}
        >
          <Ionicons name="share-outline" size={20} color="#4f46e5" />
          <Text style={[styles.buttonText, { color: '#4f46e5' }]}>Compartir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleViewBookings}
        >
          <Ionicons name="list-outline" size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>Ver mis citas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100, // Space for the fixed footer
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  countdownContainer: {
    width: '100%',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  countdownText: {
    fontSize: 14,
    color: '#065f46',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#d1fae5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  detailsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 24,
    paddingBottom: 120, // Extra padding for the footer
  },
  section: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
    lineHeight: 20,
  },
  professionalInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  professionalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  professionalDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  professionalProfession: {
    fontSize: 14,
    color: '#4f46e5',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  callButton: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
    marginRight: 8,
  },
  messageButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  paymentNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  helpSection: {
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  helpTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  helpButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  helpButtonText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '600',
  },
  footerSpacer: {
    height: 100, // Space for the fixed footer
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
    marginRight: 12,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
