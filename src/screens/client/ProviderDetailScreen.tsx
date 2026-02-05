import React from '../../node_modules/@types/react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { ClientStackParamList } from '../navigation/ClientNavigator';

type ProviderDetailScreenRouteProp = RouteProp<ClientStackParamList, 'ProviderDetail'>;

type Props = {
  route: ProviderDetailScreenRouteProp;
};

const ProviderDetailScreen = ({ route }: Props) => {
  const { providerId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/150' }} 
          style={styles.avatar}
        />
        <Text style={styles.name}>Profesional #{providerId}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios</Text>
        <Text style={styles.sectionText}>Información de servicios aparecerá aquí</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    color: '#666',
  },
});

export default ProviderDetailScreen;
