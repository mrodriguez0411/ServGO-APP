import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { createServiceOffer } from '../../services/offerService';

interface ServiceDetails {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  category: string;
  status: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ServiceDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { serviceId } = route.params as { serviceId: string };
  
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchServiceDetails();
    fetchUser();
  }, [serviceId]);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          user:profiles(
            full_name,
            avatar_url
          )
        `)
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service details:', error);
      Alert.alert('Error', 'No se pudo cargar los detalles del servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerAmount || !offerDescription) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await createServiceOffer({
        service_id: serviceId,
        professional_id: user.id,
        user_id: service?.user_id || '',
        amount: Number(offerAmount),
        description: offerDescription,
      });

      if (error) throw error;

      Alert.alert(
        '¡Oferta enviada!',
        'Tu oferta ha sido enviada correctamente. Serás notificado cuando el cliente responda.',
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting offer:', error);
      Alert.alert('Error', 'No se pudo enviar la oferta. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !service) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{service.title}</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{service.user?.full_name || 'Usuario'}</Text>
          <Text style={styles.date}>
            Publicado el {new Date(service.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{service.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categoría</Text>
        <Text style={styles.category}>{service.category}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hacer una oferta</Text>
        
        <Text style={styles.label}>Monto de la oferta</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="Ej: 5000"
            keyboardType="numeric"
            value={offerAmount}
            onChangeText={setOfferAmount}
          />
        </View>

        <Text style={styles.label}>Descripción de la oferta</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Describe por qué eres la mejor opción para este trabajo..."
          multiline
          numberOfLines={4}
          value={offerDescription}
          onChangeText={setOfferDescription}
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmitOffer}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar oferta</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userName: {
    color: '#4b5563',
    marginRight: 12,
  },
  date: {
    color: '#9ca3af',
    fontSize: 12,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    color: '#4b5563',
    lineHeight: 22,
  },
  category: {
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '500',
  },
  label: {
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#4b5563',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    height: 48,
    color: '#1f2937',
    fontSize: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    minHeight: 120,
    textAlignVertical: 'top',
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
