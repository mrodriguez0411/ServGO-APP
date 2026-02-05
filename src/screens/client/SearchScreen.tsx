import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import BackgroundImage from '../../components/ui/BackgroundImage';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

// Mock data for categories
const categories = [
  { id: '1', name: 'Plomería', icon: 'water' },
  { id: '2', name: 'Electricista', icon: 'flash' },
  { id: '3', name: 'Limpieza', icon: 'broom' },
  { id: '4', name: 'Pintura', icon: 'brush' },
  { id: '5', name: 'Carpintería', icon: 'hammer' },
  { id: '6', name: 'Jardinería', icon: 'leaf' },
  { id: '7', name: 'Mudanza', icon: 'car' },
  { id: '8', name: 'Tecnología', icon: 'laptop' },
];

// Mock data for professionals
const professionals = [
  {
    id: '1',
    name: 'Juan Pérez',
    profession: 'Plomero',
    rating: 4.8,
    reviews: 124,
    price: 'Desde $300',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    available: true,
    verified: true,
  },
  {
    id: '2',
    name: 'María García',
    profession: 'Electricista',
    rating: 4.9,
    reviews: 89,
    price: 'Desde $400',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    available: true,
    verified: true,
  },
  {
    id: '3',
    name: 'Carlos López',
    profession: 'Pintor',
    rating: 4.7,
    reviews: 56,
    price: 'Desde $250',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    available: false,
    verified: true,
  },
];

type SearchScreenRouteProp = RouteProp<{ Search: { service?: string } }, 'Search'>;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();
  
  // Check if a service was passed as a parameter
  useEffect(() => {
    if (route.params?.service) {
      setSearchQuery(route.params.service);
      // In a real app, you would filter professionals based on the service
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    }
  }, [route.params?.service]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const renderProfessionalItem = ({ item }: { item: typeof professionals[0] }) => (
    <TouchableOpacity 
      style={styles.professionalCard}
      onPress={() => {
        navigation.navigate('Main', { 
          screen: 'ProviderDetails',
          params: { id: item.id }
        });
      }}
    >
      <View style={styles.professionalInfo}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.professionalImage}
          resizeMode="cover"
        />
        <View style={styles.professionalDetails}>
          <View style={styles.nameContainer}>
            <Text style={styles.professionalName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#4f46e5" style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.professionalProfession}>{item.profession}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} reseñas)</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{item.price}</Text>
            {!item.available && (
              <Text style={styles.notAvailableText}>No disponible</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#f9fafb' }]}>
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué servicio necesitas?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  activeCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory(
                  activeCategory === category.id ? null : category.id
                )}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={20} 
                  color={activeCategory === category.id ? '#4f46e5' : '#666'} 
                />
                <Text style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resultados</Text>
            <TouchableOpacity>
              <Text style={styles.filterText}>Filtros</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.loadingText}>Buscando profesionales...</Text>
            </View>
          ) : professionals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
              <Text style={styles.emptyText}>Prueba con otros términos de búsqueda o filtros</Text>
            </View>
          ) : (
            <FlatList
              data={professionals}
              renderItem={renderProfessionalItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resultsContainer}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  filterText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },
  categoryText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  resultsContainer: {
    paddingBottom: 16,
  },
  professionalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  professionalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  professionalDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 4,
    maxWidth: 150,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  professionalProfession: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  notAvailableText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  chatButton: {
    padding: 8,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
