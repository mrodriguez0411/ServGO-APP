// src/screens/client/WriteReviewScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { Ionicons } from '@expo/vector-icons';

type WriteReviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WriteReview'>;

export default function WriteReviewScreen({ navigation, route }: { navigation: WriteReviewScreenNavigationProp, route: any }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const { providerId, providerName, serviceName } = route.params || {};

  const handleSubmit = () => {
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Por favor escribe tu reseña antes de enviar');
      return;
    }

    // Aquí iría la lógica para enviar la reseña al servidor
    console.log('Enviando reseña:', {
      providerId,
      rating,
      review: reviewText
    });

    // Navegar de vuelta a la pantalla anterior
    navigation.goBack();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => setRating(i)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={i <= rating ? 'star' : 'star-outline'} 
            size={40} 
            color={i <= rating ? '#f59e0b' : '#d1d5db'} 
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4f46e5" />
        </TouchableOpacity>
        <Text style={styles.title}>Escribe una reseña</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileContainer}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={40} color="#4f46e5" />
          </View>
          <Text style={styles.providerName}>{providerName || 'Proveedor'}</Text>
          <Text style={styles.serviceName}>{serviceName || 'Servicio'}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>Tu calificación:</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
          </View>
        </View>

        <View style={styles.reviewContainer}>
          <Text style={styles.label}>Cuéntanos tu experiencia</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="¿Cómo fue tu experiencia con este profesional?"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={5}
            value={reviewText}
            onChangeText={setReviewText}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Enviar reseña</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  reviewInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});