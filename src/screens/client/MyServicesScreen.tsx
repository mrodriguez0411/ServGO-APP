import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  Image,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';

// Mock data for categories
const categories = [
  { id: '1', name: 'Plomería', icon: 'water' },
  { id: '2', name: 'Electricidad', icon: 'flash' },
  { id: '3', name: 'Limpieza', icon: 'broom' },
  { id: '4', name: 'Pintura', icon: 'brush' },
  { id: '5', name: 'Mudanza', icon: 'car' },
  { id: '6', name: 'Jardinería', icon: 'leaf' },
];

type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rated';

interface BookedService {
  id: string;
  title: string;
  category: string;
  professional: string;
  date: string;
  time: string;
  status: ServiceStatus;
  address: string;
  price: number;
  rating: number;
  notes: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function MyServicesScreen() {
  const navigation = useNavigation();
  const [services, setServices] = useState<BookedService[]>([]);
  const [selectedService, setSelectedService] = useState<BookedService | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Request permissions for camera and gallery
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se requieren permisos para acceder a la galería');
      }
    }
  };

  const pickImage = async () => {
    await requestPermissions();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    await requestPermissions();
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleBookService = () => {
    if (!selectedCategory || !serviceDescription || !address) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const newService: BookedService = {
      id: Date.now().toString(),
      title: serviceDescription.substring(0, 30) + (serviceDescription.length > 30 ? '...' : ''),
      category: selectedCategory,
      professional: 'Profesional por asignar',
      date: selectedDate.toLocaleDateString(),
      time: selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      address: address,
      price: 0, // You can implement pricing logic
      rating: 0,
      notes: notes,
      photos: [...photos],
      location: {
        latitude: -34.6037, // Default location, implement geocoding
        longitude: -58.3816,
      },
    };

    setServices([...services, newService]);
    setShowNewServiceForm(false);
    resetForm();
    Alert.alert('Éxito', 'Servicio agendado correctamente');
  };

  const handleRateService = (serviceId: string) => {
    const updatedServices = services.map(service => 
      service.id === serviceId 
        ? { ...service, status: 'rated', rating: rating } 
        : service
    );
    setServices(updatedServices);
    setShowRatingModal(false);
    Alert.alert('Gracias', '¡Gracias por calificar el servicio!');
  };

  const resetForm = () => {
    setSelectedCategory('');
    setServiceDescription('');
    setAddress('');
    setNotes('');
    setPhotos([]);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setRating(0);
  };

  const renderServiceItem = ({ item }: { item: BookedService }) => (
    <TouchableOpacity 
      style={[styles.serviceCard, { borderLeftColor: getStatusColor(item.status) }]}
      onPress={() => setSelectedService(item)}
    >
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.serviceStatus, { color: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
      </View>
      <Text style={styles.serviceCategory}>{item.category}</Text>
      <Text style={styles.serviceDate}>{item.date} - {item.time}</Text>
      <Text style={styles.serviceAddress} numberOfLines={1}>{item.address}</Text>
      
      {item.status === 'completed' && !item.rating && (
        <TouchableOpacity 
          style={styles.rateButton}
          onPress={() => {
            setSelectedService(item);
            setShowRatingModal(true);
          }}
        >
          <Text style={styles.rateButtonText}>Calificar servicio</Text>
        </TouchableOpacity>
      )}
      
      {item.rating > 0 && (
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? 'star' : 'star-outline'}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'rated': return 'Calificado';
      default: return '';
    }
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'rated': return '#8B5CF6';
      default: return '#9CA3AF';
    }
  };

  const renderNewServiceForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Nuevo Servicio</Text>
      
      <Text style={styles.label}>Categoría *</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.name && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.name ? '#FFF' : '#4B5563'} 
            />
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category.name && styles.selectedCategoryText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Descripción del servicio *</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe el servicio que necesitas"
        value={serviceDescription}
        onChangeText={setServiceDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Dirección *</Text>
      <View style={styles.addressInputContainer}>
        <Ionicons name="location" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Ingresa la dirección del servicio"
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfContainer}>
          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#4B5563" />
            <Text style={styles.dateTimeText}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.halfContainer}>
          <Text style={styles.label}>Hora</Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={20} color="#4B5563" />
            <Text style={styles.dateTimeText}>
              {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
      </View>

      <Text style={styles.label}>Notas adicionales</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Agrega notas adicionales para el profesional"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Fotos (opcional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
        {photos.map((photo, index) => (
          <Image key={index} source={{ uri: photo }} style={styles.photo} />
        ))}
        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
          <Ionicons name="add" size={24} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
          <Ionicons name="camera" size={24} color="#4B5563" />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => setShowNewServiceForm(false)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.submitButton]}
          onPress={handleBookService}
        >
          <Text style={styles.submitButtonText}>Solicitar Servicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRatingModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.ratingModal}>
        <Text style={styles.modalTitle}>Calificar Servicio</Text>
        <Text style={styles.ratingText}>¿Cómo calificarías este servicio?</Text>
        
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={star} 
              onPress={() => setRating(star)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color="#FFD700"
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <TextInput
          style={[styles.input, styles.ratingNotesInput]}
          placeholder="Escribe tus comentarios (opcional)"
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
        
        <View style={styles.ratingButtonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelRatingButton]}
            onPress={() => setShowRatingModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.submitRatingButton]}
            onPress={() => selectedService && handleRateService(selectedService.id)}
          >
            <Text style={styles.submitButtonText}>Enviar Calificación</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d9488', '#10b981', '#34d399']}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Servicios</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {!showNewServiceForm ? (
          <>
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.servicesList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="document-text" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>No tienes servicios agendados</Text>
                  <Text style={styles.emptyStateSubtext}>Agenda tu primer servicio</Text>
                </View>
              }
            />
            
            <TouchableOpacity 
              style={styles.fab}
              onPress={() => setShowNewServiceForm(true)}
            >
              <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>
          </>
        ) : (
          <ScrollView style={styles.formScrollView}>
            {renderNewServiceForm()}
          </ScrollView>
        )}
      </View>

      {showRatingModal && renderRatingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  servicesList: {
    padding: 16,
    paddingBottom: 80,
  },
  serviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  serviceStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  serviceCategory: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  serviceDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  serviceAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  rateButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  rateButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#0D9488',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formScrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  addressInput: {
    flex: 1,
    paddingLeft: 0,
    borderWidth: 0,
  },
  notesInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfContainer: {
    width: '48%',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategory: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#4B5563',
  },
  selectedCategoryText: {
    color: '#FFF',
    fontWeight: '500',
  },
  photosContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  submitButton: {
    backgroundColor: '#0D9488',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ratingModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  star: {
    marginHorizontal: 4,
  },
  ratingNotesInput: {
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 24,
  },
  ratingButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelRatingButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  submitRatingButton: {
    backgroundColor: '#0D9488',
    flex: 2,
  },
});
