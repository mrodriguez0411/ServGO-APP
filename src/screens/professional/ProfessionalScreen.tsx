// src/screens/professional/ProfessionalScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

type ProfessionalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Professional'>;

const services = [
  {
    id: '1',
    title: 'Solicitudes de servicio',
    count: 5,
    icon: 'assignment' as const,
    color: '#4f46e5',
    screen: 'ServiceRequests',
  },
  {
    id: '2',
    title: 'Mis servicios',
    count: 8,
    icon: 'handyman' as const,
    color: '#10b981',
    screen: 'MyServices',
  },
  {
    id: '3',
    title: 'Agenda',
    count: 0,
    icon: 'calendar-today' as const,
    color: '#f59e0b',
    screen: 'Schedule',
  },
  {
    id: '4',
    title: 'Reseñas',
    count: 23,
    icon: 'star-rate' as const,
    color: '#ec4899',
    screen: 'Reviews',
  },
  {
    id: '5',
    title: 'Ganancias',
    count: 0,
    icon: 'attach-money' as const,
    color: '#06b6d4',
    screen: 'Earnings',
  },
  {
    id: '6',
    title: 'Configuración',
    count: 0,
    icon: 'settings' as const,
    color: '#8b5cf6',
    screen: 'Settings',
  },
];

export default function ProfessionalScreen({ navigation }: { navigation: ProfessionalScreenNavigationProp }) {
  const [activeTab, setActiveTab] = useState('all');

  const renderServiceItem = ({ item }: { item: typeof services[0] }) => (
    <TouchableOpacity 
      style={[styles.serviceCard, { borderLeftColor: item.color }]}
      onPress={() => navigation.navigate(item.screen as any)}
    >
      <View style={[styles.serviceIcon, { backgroundColor: `${item.color}20` }]}>
        <MaterialIcons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <Text style={[styles.serviceCount, { color: item.color }]}>
          {item.count} {item.count === 1 ? 'tarea' : 'tareas'}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, Profesional</Text>
          <Text style={styles.subtitle}>Gestiona tus servicios</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={40} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
            <MaterialIcons name="pending-actions" size={24} color="#4f46e5" />
          </View>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <MaterialIcons name="check-circle" size={24} color="#10b981" />
          </View>
          <Text style={styles.statValue}>48</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <MaterialIcons name="star" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Calificación</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Todos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Activos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completados</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTab: {
    backgroundColor: '#f3f4f6',
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  servicesList: {
    padding: 16,
    paddingBottom: 32,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});