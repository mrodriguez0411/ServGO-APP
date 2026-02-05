import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AppLayout from '../../components/layout/AppLayout';
import { serviceCategories } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

// Mock data for services
const popularServices = [
  { id: '1', name: 'Plomería', icon: 'water', color: '#4f46e5' },
  { id: '2', name: 'Electricista', icon: 'flash', color: '#f59e0b' },
  { id: '3', name: 'Limpieza', icon: 'broom', color: '#10b981' },
  { id: '4', name: 'Mudanza', icon: 'car', color: '#8b5cf6' },
];

// Mock data for professionals
const recommendedProfessionals = [
  {
    id: '1',
    name: 'Juan Pérez',
    profession: 'Plomero',
    rating: 4.8,
    reviews: 124,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'María García',
    profession: 'Electricista',
    rating: 4.9,
    reviews: 89,
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
];

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
};

const getGreeting = (name: string | null): string => {
  const timeOfDay = getTimeOfDay();
  const greetings = {
    morning: 'Buenos días',
    afternoon: 'Buenas tardes',
    evening: 'Buenas tardes',
    night: 'Buenas noches'
  };
  return `${greetings[timeOfDay]}${name ? `, ${name.split(' ')[0]}` : ''} 👋`;
};

// Tipos de navegación
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface CategoryCardProps {
  item: typeof serviceCategories[0];
  onPress: (id: string) => void;
}

interface ProviderCardProps {
  item: {
    id: string;
    name: string;
    photo: string;
    rating: number;
    reviewCount: number;
    profession: string;
  };
  onPress?: () => void;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Tamaños y espaciado responsivo
  const isSmallScreen = width < 375;
  const CARD_WIDTH = (width - 48) / 2 - 8;
  
  const spacing = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  };
  
  const fontSize = {
    sm: isSmallScreen ? 12 : 14,
    md: isSmallScreen ? 14 : 16,
    lg: isSmallScreen ? 18 : 20,
    xl: isSmallScreen ? 22 : 24,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Aquí iría la lógica para actualizar los datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const navigateToService = (service: string) => {
    navigation.navigate('Search', { service });
  };

  const navigateToProfessional = (id: string) => {
    navigation.navigate('ProviderDetails', { id });
  };

  const dynamicStyles = StyleSheet.create({
    // Header styles
    header: {
      padding: spacing.lg,
      paddingBottom: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: spacing.sm,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    subtitle: {
      fontSize: fontSize.md,
      color: 'rgba(255, 255, 255, 0.9)',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    profileButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      padding: 5,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    
    // Search styles
    searchBar: {
      marginHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    searchIcon: {
      marginRight: 10,
    },
    searchText: {
      color: '#666',
      flex: 1,
    },
    
    // Section styles
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 16,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    seeAll: {
      color: '#ffffff',
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    
    // Services grid
    servicesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    serviceCard: {
      width: CARD_WIDTH,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    serviceIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    serviceName: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: '#ffffff',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    
    // Professionals horizontal scroll
    professionalsContainer: {
      paddingRight: 16,
    },
    professionalCard: {
      width: 150,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
      padding: 12,
      marginRight: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    professionalImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginBottom: 8,
    },
    professionalName: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 2,
    },
    professionalProfession: {
      fontSize: fontSize.sm - 2,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: fontSize.sm - 2,
      color: '#f59e0b',
      marginLeft: 4,
      fontWeight: '600',
    },
    reviewsText: {
      fontSize: fontSize.sm - 2,
      color: 'rgba(255, 255, 255, 0.6)',
      marginLeft: 4,
    },
    
    // Special offer card
    offerCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      justifyContent: 'space-between',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    offerContent: {
      flex: 1,
      marginRight: 16,
    },
    offerTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: '#ffffff',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
      marginBottom: 4,
    },
    offerDescription: {
      fontSize: fontSize.sm,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 12,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    offerButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignSelf: 'flex-start',
    },
    offerButtonText: {
      color: '#0d9488',
      fontSize: fontSize.sm - 1,
      fontWeight: '700',
    },
    offerImage: {
      width: 100,
      height: 100,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0d9488' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0d9488" />
      <LinearGradient
        colors={['#0d9488', '#10b981', '#34d399']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <AppLayout showHeader={false} style={{ backgroundColor: 'transparent' }}>
        <ScrollView 
          style={{ flex: 1, backgroundColor: 'transparent' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ffffff']}
              tintColor="#ffffff"
            />
          }
        >
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={dynamicStyles.greeting}>
                  {getGreeting(user?.name || null)}
                </Text>
                <Text style={dynamicStyles.subtitle}>¿Qué servicio necesitas hoy?</Text>
              </View>
              <TouchableOpacity 
                style={[dynamicStyles.profileButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person-circle" size={32} color="#ffffff" />
              </TouchableOpacity>
            </View>

          {/* Search Bar */}
          <TouchableOpacity 
            style={dynamicStyles.searchBar} 
            onPress={handleSearch}
          >
            <Ionicons 
              name="search" 
              size={20} 
              color="#666" 
              style={dynamicStyles.searchIcon} 
            />
            <Text style={dynamicStyles.searchText}>Buscar servicios...</Text>
          </TouchableOpacity>

          {/* Popular Services */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Categorías Populares</Text>
            <View style={dynamicStyles.servicesContainer}>
              {serviceCategories.slice(0, 4).map((service) => (
                <TouchableOpacity 
                  key={service.id} 
                  style={[
                    dynamicStyles.serviceCard, 
                    { backgroundColor: `${service.color}15` }
                  ]}
                  onPress={() => navigateToService(service.name)}
                >
                  <View 
                    style={[
                      dynamicStyles.serviceIcon, 
                      { backgroundColor: service.color }
                    ]}
                  >
                    <Ionicons name={service.icon as any} size={24} color="#fff" />
                  </View>
                  <Text style={dynamicStyles.serviceName}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recommended Professionals */}
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>Profesionales Recomendados</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Professionals')}>
                <Text style={dynamicStyles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.professionalsContainer}
            >
              {recommendedProfessionals.map((pro) => (
                <TouchableOpacity 
                  key={pro.id} 
                  style={dynamicStyles.professionalCard}
                  onPress={() => navigateToProfessional(pro.id)}
                >
                  <Image 
                    source={{ uri: pro.image }} 
                    style={dynamicStyles.professionalImage}
                    resizeMode="cover"
                  />
                  <Text style={dynamicStyles.professionalName} numberOfLines={1}>
                    {pro.name}
                  </Text>
                  <Text style={dynamicStyles.professionalProfession} numberOfLines={1}>
                    {pro.profession}
                  </Text>
                  <View style={dynamicStyles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text style={dynamicStyles.ratingText}>
                      {pro.rating.toFixed(1)}
                    </Text>
                    <Text style={dynamicStyles.reviewsText}>
                      ({pro.reviews})
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Special Offers */}
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>Ofertas Especiales</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Offers')}>
                <Text style={dynamicStyles.seeAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <View style={dynamicStyles.offerCard}>
              <View style={dynamicStyles.offerContent}>
                <Text style={dynamicStyles.offerTitle}>20% de descuento</Text>
                <Text style={dynamicStyles.offerDescription}>
                  En tu primer servicio de limpieza
                </Text>
                <TouchableOpacity 
                  style={dynamicStyles.offerButton}
                  onPress={() => navigation.navigate('OfferDetails', { id: '1' })}
                >
                  <Text style={dynamicStyles.offerButtonText}>Aplicar ahora</Text>
                </TouchableOpacity>
              </View>
              <View style={[dynamicStyles.offerImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12 }]}>
                <Ionicons name="brush" size={40} color="#ffffff" />
              </View>
            </View>
          </View>
          </View>
        </ScrollView>
      </AppLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    paddingTop: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginRight: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  searchText: {
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAll: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '500',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  professionalsContainer: {
    paddingBottom: 8,
  },
  professionalCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  professionalImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  professionalProfession: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
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
    color: '#999',
    marginLeft: 4,
  },
  offerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  offerContent: {
    flex: 2,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#e0e0ff',
    marginBottom: 12,
  },
  offerButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  offerButtonText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 14,
  },
  offerImage: {
    flex: 1,
    height: 100,
    marginLeft: 16,
  },
});
