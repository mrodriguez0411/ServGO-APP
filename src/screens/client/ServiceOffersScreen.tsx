import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { respondToOffer } from '../../services/offerService';

interface Offer {
  id: string;
  amount: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  professional: {
    id: string;
    full_name: string;
    avatar_url: string;
    rating: number;
  };
}

export default function ServiceOffersScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { serviceId } = route.params as { serviceId: string };
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('service_offers')
        .select(`
          *,
          professional:profiles(
            id,
            full_name,
            avatar_url,
            rating
          )
        `)
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      Alert.alert('Error', 'No se pudieron cargar las ofertas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [serviceId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const handleRespondToOffer = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      setSelectedOffer(offerId);
      const { error } = await respondToOffer(offerId, status);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setOffers(offers.map(offer => 
        offer.id === offerId ? { ...offer, status } : offer
      ));
      
      // Si se acepta una oferta, rechazar automáticamente las demás
      if (status === 'accepted') {
        const otherOffers = offers.filter(offer => offer.id !== offerId);
        for (const offer of otherOffers) {
          if (offer.status === 'pending') {
            await respondToOffer(offer.id, 'rejected');
          }
        }
        
        // Actualizar el estado del servicio a "en progreso"
        await supabase
          .from('services')
          .update({ status: 'in_progress' })
          .eq('id', serviceId);
          
        // Navegar de vuelta a la pantalla anterior
        setTimeout(() => {
          navigation.goBack();
          Alert.alert(
            '¡Oferta aceptada!', 
            'Has aceptado la oferta. Ahora puedes coordinar los detalles con el profesional.'
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error responding to offer:', error);
      Alert.alert('Error', 'No se pudo procesar tu respuesta. Inténtalo de nuevo.');
    } finally {
      setSelectedOffer(null);
    }
  };

  const renderOfferItem = ({ item }: { item: Offer }) => (
    <View style={[
      styles.offerCard,
      item.status === 'accepted' && styles.acceptedOffer,
      item.status === 'rejected' && styles.rejectedOffer
    ]}>
      <View style={styles.offerHeader}>
        <View style={styles.profileInfo}>
          {item.professional.avatar_url ? (
            <Image 
              source={{ uri: item.professional.avatar_url }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {item.professional.full_name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.professionalName}>{item.professional.full_name || 'Profesional'}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{item.professional.rating?.toFixed(1) || 'Nuevo'}</Text>
              <Text style={styles.ratingIcon}>★</Text>
            </View>
          </View>
        </View>
        <Text style={styles.amount}>${item.amount.toLocaleString()}</Text>
      </View>
      
      <Text style={styles.offerDescription}>{item.description}</Text>
      
      <Text style={styles.offerDate}>
        Oferta enviada el {new Date(item.created_at).toLocaleDateString()}
      </Text>
      
      {item.status === 'pending' ? (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRespondToOffer(item.id, 'rejected')}
            disabled={!!selectedOffer}
          >
            {selectedOffer === item.id ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={styles.rejectButtonText}>Rechazar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleRespondToOffer(item.id, 'accepted')}
            disabled={!!selectedOffer}
          >
            {selectedOffer === item.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.acceptButtonText}>Aceptar oferta</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[
          styles.statusBadge,
          item.status === 'accepted' && styles.statusAccepted,
          item.status === 'rejected' && styles.statusRejected
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={offers}
        renderItem={renderOfferItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No hay ofertas disponibles para este servicio</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  offerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptedOffer: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  rejectedOffer: {
    opacity: 0.7,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#4f46e5',
    fontSize: 20,
    fontWeight: 'bold',
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    color: '#6b7280',
    fontSize: 14,
    marginRight: 4,
  },
  ratingIcon: {
    color: '#f59e0b',
    fontSize: 14,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  offerDescription: {
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 22,
  },
  offerDate: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#fef2f2',
    marginRight: 8,
  },
  acceptButton: {
    backgroundColor: '#4f46e5',
    marginLeft: 8,
  },
  rejectButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  statusAccepted: {
    backgroundColor: '#d1fae5',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  statusRejectedText: {
    color: '#991b1b',
  },
});
