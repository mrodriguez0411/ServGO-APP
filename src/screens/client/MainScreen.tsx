// src/screens/client/MainScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

// Datos de ejemplo con íconos
const categories = [
  { id: '1', name: 'Plomería', icon: 'plumbing' },
  { id: '2', name: 'Electricidad', icon: 'electrical-services' },
  { id: '3', name: 'Limpieza', icon: 'cleaning-services' },
  { id: '4', name: 'Mudanzas', icon: 'local-shipping' },
  { id: '5', name: 'Jardinería', icon: 'grass' },
];

const popularServices = [
  {
    id: '1',
    title: 'Plomero a domicilio',
    rating: 4.8,
    reviews: 124,
    price: '25,000',
    icon: 'plumbing',
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'Electricista profesional',
    rating: 4.9,
    reviews: 98,
    price: '35,000',
    icon: 'electrical-services',
    color: '#f59e0b',
  },
  // Agregar más servicios según sea necesario
];

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export default function MainScreen({ navigation }: { navigation: MainScreenNavigationProp }) {
  const [searchQuery, setSearchQuery] = useState('');

  const renderCategory = ({ item }: { item: { id: string; name: string; icon: string } }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIcon}>
        <MaterialIcons name={item.icon as any} size={24} color="#4f46e5" />
      </View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderService = ({ item }: { item: { id: string; title: string; rating: number; reviews: number; price: string; icon: string; color: string } }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ProviderDetails', { id: item.id })}
    >
      <View style={[styles.serviceIcon, { backgroundColor: `${item.color}20` }]}>
        <MaterialIcons name={item.icon as any} size={32} color={item.color} />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={14} color="#f59e0b" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews})</Text>
        </View>
        <Text style={styles.priceText}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, Usuario</Text>
          <Text style={styles.subtitle}>¿Qué necesitas hoy?</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={40} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar servicios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={[styles.section, { flex: 1 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Servicios populares</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={popularServices}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.servicesGrid}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  categoriesList: {
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4b5563',
  },
  servicesGrid: {
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
});