import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Linking,
  Share,
  Dimensions,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

// Mock data for the professional
const professional = {
  id: '1',
  name: 'Juan Pérez',
  profession: 'Plomero Profesional',
  rating: 4.8,
  reviews: 124,
  price: 'Desde $300',
  image: 'https://randomuser.me/api/portraits/men/1.jpg',
  verified: true,
  experience: 8, // years
  description: 'Soy un plomero con más de 8 años de experiencia en instalaciones, reparaciones y mantenimiento de sistemas de plomería residencial y comercial. Ofrezco servicios de calidad con garantía.',
  services: [
    { id: '1', name: 'Reparación de fugas', price: '$300 - $800' },
    { id: '2', name: 'Instalación de tuberías', price: '$500 - $1,500' },
    { id: '3', name: 'Limpieza de drenajes', price: '$400 - $700' },
    { id: '4', name: 'Mantenimiento general', price: '$600 - $1,200' },
  ],
  availability: [
    { day: 'Lun - Vie', hours: '9:00 AM - 7:00 PM' },
    { day: 'Sáb', hours: '10:00 AM - 4:00 PM' },
    { day: 'Dom', hours: 'Cerrado' },
  ],
  location: 'Ciudad de México',
  distance: '1.2 km',
  responseTime: 'Responde en 15 min',
  languages: ['Español', 'Inglés'],
  portfolio: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500',
    'https://images.unsplash.com/photo-1600566752225-4f2e2e5d02cc?w=500',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=500',
  ],
  reviewsList: [
    {
      id: '1',
      user: 'María González',
      rating: 5,
      date: 'Hace 2 semanas',
      comment: 'Excelente servicio, muy profesional y puntual. Resolvió el problema de la fuga en minutos y me explicó todo muy bien.',
      userImage: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: '2',
      user: 'Carlos Ruiz',
      rating: 4,
      date: 'Hace 1 mes',
      comment: 'Buen trabajo, aunque llegó un poco tarde. La reparación quedó perfecta y el precio fue justo.',
      userImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
  ]
};

type ProviderDetailsRouteProp = RouteProp<RootStackParamList, 'ProviderDetails'>;

export default function ProviderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProviderDetailsRouteProp>();
  const [activeTab, setActiveTab] = useState('services');
  const [isFavorite, setIsFavorite] = useState(false);

  // In a real app, you would fetch the professional data based on the ID from the route params
  // const { id } = route.params;
  // const professional = useProfessional(id);

  const handleContact = () => {
    // In a real app, this would open a chat or call the professional
    Linking.openURL(`tel:+525512345678`);
  };

  const handleBook = () => {
    navigation.navigate('Booking', { professionalId: professional.id });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira el perfil de ${professional.name} en ServiGO: https://servigo.app/professional/${professional.id}`,
        title: `${professional.name} - ${professional.profession}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderReviewItem = ({ item }: { item: typeof professional.reviewsList[0] }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image 
          source={{ uri: item.userImage }} 
          style={styles.reviewerImage}
        />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.user}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  const renderPortfolioItem = ({ item }: { item: string }) => (
    <Image 
      source={{ uri: item }} 
      style={styles.portfolioImage}
      resizeMode="cover"
    />
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header with image and basic info */}
        <View style={styles.header}>
          <Image 
            source={{ uri: professional.image }} 
            style={styles.profileImage}
          />
          <View style={styles.headerInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{professional.name}</Text>
              {professional.verified && (
                <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />
              )}
            </View>
            <Text style={styles.profession}>{professional.profession}</Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>{professional.rating}</Text>
              <Text style={styles.reviewsCount}>({professional.reviews} reseñas)</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{professional.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{professional.responseTime}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#ef4444" : "#666"} 
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.contactButton]}
            onPress={handleContact}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#4f46e5" />
            <Text style={[styles.buttonText, { color: '#4f46e5' }]}>Contactar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.bookButton]}
            onPress={handleBook}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff' }]}>Agendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.shareButton]}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
              Servicios
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>
              Portafolio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reseñas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              Acerca de
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'services' && (
            <View>
              <Text style={styles.sectionTitle}>Servicios ofrecidos</Text>
              {professional.services.map((service) => (
                <View key={service.id} style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>{service.price}</Text>
                  </View>
                  <TouchableOpacity style={styles.bookServiceButton}>
                    <Text style={styles.bookServiceButtonText}>Agendar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          {activeTab === 'portfolio' && (
            <View>
              <Text style={styles.sectionTitle}>Trabajos anteriores</Text>
              <FlatList
                data={professional.portfolio}
                renderItem={renderPortfolioItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.portfolioContainer}
              />
            </View>
          )}
          
          {activeTab === 'reviews' && (
            <View>
              <View style={styles.ratingOverview}>
                <Text style={styles.ratingNumber}>{professional.rating}</Text>
                <View style={styles.ratingDetails}>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons 
                        key={star} 
                        name={star <= Math.floor(professional.rating) ? "star" : "star-outline"} 
                        size={20} 
                        color="#f59e0b" 
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewsCount}>{professional.reviews} reseñas</Text>
                </View>
              </View>
              
              <FlatList
                data={professional.reviewsList}
                renderItem={renderReviewItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.reviewsList}
              />
              
              <TouchableOpacity style={styles.seeAllReviewsButton}>
                <Text style={styles.seeAllReviewsText}>Ver todas las reseñas</Text>
                <Ionicons name="chevron-forward" size={16} color="#4f46e5" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.writeReviewButton}>
                <Ionicons name="pencil-outline" size={16} color="#fff" />
                <Text style={styles.writeReviewButtonText}>Escribir una reseña</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {activeTab === 'about' && (
            <View>
              <Text style={styles.sectionTitle}>Acerca de {professional.name.split(' ')[0]}</Text>
              <Text style={styles.aboutText}>{professional.description}</Text>
              
              <Text style={styles.sectionTitle}>Disponibilidad</Text>
              <View style={styles.availabilityContainer}>
                {professional.availability.map((item, index) => (
                  <View key={index} style={styles.availabilityItem}>
                    <Text style={styles.availabilityDay}>{item.day}</Text>
                    <Text style={styles.availabilityHours}>{item.hours}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.sectionTitle}>Idiomas</Text>
              <View style={styles.languagesContainer}>
                {professional.languages.map((language, index) => (
                  <View key={index} style={styles.languageTag}>
                    <Text style={styles.languageText}>{language}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.sectionTitle}>Información adicional</Text>
              <View style={styles.infoItem}>
                <Ionicons name="briefcase-outline" size={20} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoText}>{professional.experience} años de experiencia</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoText}>A {professional.distance} de tu ubicación</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Fixed Book Button */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Precio desde</Text>
          <Text style={styles.price}>{professional.price}</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookNowButton}
          onPress={handleBook}
        >
          <Text style={styles.bookNowButtonText}>Agendar ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 80, // Space for the fixed button
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 6,
  },
  profession: {
    fontSize: 16,
    color: '#4f46e5',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviewsCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
    flex: 1,
  },
  contactButton: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  bookButton: {
    backgroundColor: '#4f46e5',
  },
  shareButton: {
    backgroundColor: '#f5f5f5',
    maxWidth: 50,
    marginRight: 0,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  bookServiceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eef2ff',
  },
  bookServiceButtonText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '600',
  },
  portfolioContainer: {
    paddingBottom: 8,
  },
  portfolioImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 16,
  },
  ratingDetails: {
    flex: 1,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewsList: {
    paddingBottom: 16,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  seeAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 16,
  },
  seeAllReviewsText: {
    color: '#4f46e5',
    fontWeight: '600',
    marginRight: 4,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
  },
  writeReviewButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 24,
  },
  availabilityContainer: {
    marginBottom: 24,
  },
  availabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  availabilityDay: {
    fontSize: 14,
    color: '#333',
  },
  availabilityHours: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  languageTag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 12,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
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
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  bookNowButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
