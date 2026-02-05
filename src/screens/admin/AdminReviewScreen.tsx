// src/screens/admin/AdminReviewScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

type AdminReviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminReview'>;

const pendingApprovals = [
  {
    id: '1',
    name: 'Juan Pérez',
    service: 'Plomería',
    rating: 4.8,
    reviews: 24,
    avatarIcon: 'person' as const,
    date: '2023-11-05',
    status: 'pending',
  },
  {
    id: '2',
    name: 'María García',
    service: 'Electricista',
    rating: 4.9,
    reviews: 32,
    avatarIcon: 'person' as const,
    date: '2023-11-04',
    status: 'pending',
  },
  // ... más datos de ejemplo
];

export default function AdminReviewScreen({ navigation }: { navigation: AdminReviewScreenNavigationProp }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pendientes'); // pendientes, aprobados, rechazados

  const filteredApprovals = pendingApprovals.filter(approval => 
    approval.status === activeTab && 
    (approval.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     approval.service.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderApprovalItem = ({ item }: { item: any }) => (
    <View style={styles.approvalCard}>
      <View style={styles.approvalHeader}>
        <View style={styles.avatar}>
            <Ionicons name={item.avatarIcon} size={40} color="#4f46e5" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.serviceName}>{item.service}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} reseñas)</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(item.id)}
        >
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={[styles.actionText, styles.approveText]}>Aprobar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <Ionicons name="close-circle" size={20} color="#ef4444" />
          <Text style={[styles.actionText, styles.rejectText]}>Rechazar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => navigation.navigate('ProviderDetails', { id: item.id })}
        >
          <Text style={[styles.actionText, styles.detailsText]}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={16} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleApprove = (id: string) => {
    // Lógica para aprobar al profesional
    console.log('Aprobar profesional:', id);
  };

  const handleReject = (id: string) => {
    // Lógica para rechazar al profesional
    console.log('Rechazar profesional:', id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Revisión de Profesionales</Text>
          <Text style={styles.subtitle}>Gestiona las solicitudes de registro</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar profesionales..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pendientes' && styles.activeTab]}
          onPress={() => setActiveTab('pendientes')}
        >
          <Text style={[styles.tabText, activeTab === 'pendientes' && styles.activeTabText]}>Pendientes</Text>
          {activeTab === 'pendientes' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'aprobados' && styles.activeTab]}
          onPress={() => setActiveTab('aprobados')}
        >
          <Text style={[styles.tabText, activeTab === 'aprobados' && styles.activeTabText]}>Aprobados</Text>
          {activeTab === 'aprobados' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rechazados' && styles.activeTab]}
          onPress={() => setActiveTab('rechazados')}
        >
          <Text style={[styles.tabText, activeTab === 'rechazados' && styles.activeTabText]}>Rechazados</Text>
          {activeTab === 'rechazados' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredApprovals}
        renderItem={renderApprovalItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay solicitudes {activeTab}</Text>
          </View>
        }
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTab: {},
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '100%',
    backgroundColor: '#4f46e5',
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  approvalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  approvalHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#ecfdf5',
  },
  rejectButton: {
    backgroundColor: '#fef2f2',
  },
  detailsButton: {
    backgroundColor: '#eef2ff',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  approveText: {
    color: '#10b981',
  },
  rejectText: {
    color: '#ef4444',
  },
  detailsText: {
    color: '#4f46e5',
  },
});