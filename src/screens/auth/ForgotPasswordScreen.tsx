// src/screens/auth/RoleSelectionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { useNavigation } from '@react-navigation/native';

type RoleSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RoleSelection'>;

export default function RoleSelectionScreen() {
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();

  const handleRoleSelect = (role: 'client' | 'provider') => {
    // Aquí puedes guardar el rol seleccionado en tu estado global o contexto
    // Por ahora, navegamos a la pantalla principal correspondiente
    if (role === 'client') {
      navigation.replace('Main');
    } else {
      navigation.replace('Professional');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecciona tu perfil</Text>
        <Text style={styles.subtitle}>Elige cómo quieres usar la aplicación</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={[styles.card, styles.clientCard]}
          onPress={() => handleRoleSelect('client')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="person-outline" size={24} color="#4f46e5" />
          </View>
          <Text style={styles.cardTitle}>Cliente</Text>
          <Text style={styles.cardDescription}>
            Busca y contrata servicios profesionales de manera fácil y segura.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.providerCard]}
          onPress={() => handleRoleSelect('provider')}
        >
          <View style={[styles.cardIcon, styles.providerIconContainer]}>
            <Ionicons name="briefcase-outline" size={24} color="#10b981" />
          </View>
          <Text style={[styles.cardTitle, styles.providerTitle]}>Profesional</Text>
          <Text style={styles.cardDescription}>
            Ofrece tus servicios y gestiona tus trabajos de manera eficiente.
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => navigation.navigate('Welcome')}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  clientCard: {
    borderTopWidth: 4,
    borderTopColor: '#4f46e5',
  },
  providerCard: {
    borderTopWidth: 4,
    borderTopColor: '#10b981',
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerIconContainer: {
    backgroundColor: '#d1fae5',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  providerTitle: {
    color: '#10b981',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  logoutButton: {
    marginTop: 24,
    padding: 12,
  },
  logoutText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});