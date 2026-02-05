import React, { useState } from '../../../node_modules/@types/react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';

// Mock data for the professional
const professional = {
  id: '1',
  name: 'Juan Pérez',
  profession: 'Plomero Profesional',
  image: 'https://randomuser.me/api/portraits/men/1.jpg',
  services: [
    { id: '1', name: 'Reparación de fugas', duration: '1 hora', price: 300 },
    { id: '2', name: 'Instalación de tuberías', duration: '2-3 horas', price: 800 },
    { id: '3', name: 'Limpieza de drenajes', duration: '1-2 horas', price: 500 },
    { id: '4', name: 'Mantenimiento general', duration: '2 horas', price: 600 },
  ],
  rating: 4.8,
  reviews: 124,
};

type BookingScreenRouteProp = RouteProp<RootStackParamList, 'Booking'>;

export default function BookingScreen() {
  const navigation = useNavigation();
  const route = useRoute<BookingScreenRouteProp>();
  
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // In a real app, you would fetch the professional data based on the ID from the route params
  // const { professionalId } = route.params;
  // const professional = useProfessional(professionalId);
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const calculateTotal = () => {
    if (!selectedService) return 0;
    const service = professional.services.find(s => s.id === selectedService);
    return service ? service.price : 0;
  };
  
  const handleBookAppointment = () => {
    if (!selectedService) {
      Alert.alert('Error', 'Por favor selecciona un servicio');
      return;
    }
    
    if (!address.trim()) {
      Alert.alert('Error', 'Por favor ingresa una dirección');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, you would submit the booking to your API
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('BookingConfirmation', {
        professionalId: professional.id,
        serviceId: selectedService,
        date: date.toISOString(),
        time: time.toISOString(),
        address,
        total: calculateTotal(),
      });
    }, 1500);
  };
  
  const renderServiceItem = (service: typeof professional.services[0]) => (
    <TouchableOpacity
      key={service.id}
      style={[
        styles.serviceItem,
        selectedService === service.id && styles.serviceItemSelected,
      ]}
      onPress={() => setSelectedService(service.id)}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceDuration}>{service.duration}</Text>
      </View>
      <Text style={styles.servicePrice}>${service.price} MXN</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Professional Info */}
        <View style={styles.professionalInfo}>
          <View style={styles.professionalImageContainer}>
            <Image 
              source={{ uri: professional.image }} 
              style={styles.professionalImage}
            />
          </View>
          <View style={styles.professionalDetails}>
            <Text style={styles.professionalName}>{professional.name}</Text>
            <Text style={styles.professionalProfession}>{professional.profession}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>{professional.rating}</Text>
              <Text style={styles.reviewsText}>({professional.reviews} reseñas)</Text>
            </View>
          </View>
        </View>
        
        {/* Service Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona un servicio</Text>
          {professional.services.map(renderServiceItem)}
        </View>
        
        {/* Date & Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha y hora</Text>
          
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
            <Text style={styles.inputText}>
              {formatDate(date)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          
          <TouchableOpacity 
            style={[styles.inputContainer, { marginTop: 12 }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color="#666" style={styles.inputIcon} />
            <Text style={styles.inputText}>
              {formatTime(time)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
        
        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa la dirección del servicio"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#999"
            />
          </View>
        </View>
        
        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas adicionales (opcional)</Text>
          <View style={[styles.inputContainer, { alignItems: 'flex-start' }]}>
            <Ionicons name="document-text-outline" size={20} color="#666" style={[styles.inputIcon, { marginTop: 12 }]} />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="Ej: El timbre no funciona, por favor tocar fuerte la puerta."
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor="#999"
              multiline
            />
          </View>
        </View>
        
        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Método de pago</Text>
            <TouchableOpacity>
              <Text style={styles.changeText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentMethod}>
            <Ionicons name="card-outline" size={24} color="#4f46e5" />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentMethodName}>Visa terminada en 4242</Text>
              <Text style={styles.paymentMethodType}>Tarjeta de crédito</Text>
            </View>
          </View>
        </View>
        
        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Servicio</Text>
            <Text style={styles.summaryValue}>
              {selectedService 
                ? professional.services.find(s => s.id === selectedService)?.name 
                : 'No seleccionado'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fecha y hora</Text>
            <Text style={styles.summaryValue}>
              {formatDate(date)} a las {formatTime(time)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dirección</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {address || 'No especificada'}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 16 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${calculateTotal()} MXN</Text>
          </View>
        </View>
        
        <View style={styles.footerSpacer} />
      </ScrollView>
      
      {/* Fixed Footer */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>${calculateTotal()} MXN</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.bookButton,
            (!selectedService || !address.trim()) && styles.bookButtonDisabled,
          ]}
          onPress={handleBookAppointment}
          disabled={!selectedService || !address.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Confirmar cita</Text>
          )}
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
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 100, // Space for the fixed footer
  },
  professionalInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  professionalImageContainer: {
    marginRight: 16,
  },
  professionalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceItemSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    padding: 0,
  },
  changeText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentDetails: {
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paymentMethodType: {
    fontSize: 12,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
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
  priceContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  bookButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  bookButtonDisabled: {
    backgroundColor: '#a5b4fc',
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
