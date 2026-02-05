import React from '../../node_modules/@types/react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const MyBookingsScreen = () => {
  // Temporary data - replace with actual data from your state/API
  const bookings = [
    { id: '1', service: 'Plomería', date: '2023-05-15', status: 'Completado' },
    { id: '2', service: 'Electricista', date: '2023-05-20', status: 'Pendiente' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Reservas</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            <Text style={styles.service}>{item.service}</Text>
            <Text>Fecha: {item.date}</Text>
            <Text>Estado: {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes reservas pendientes</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bookingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  service: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default MyBookingsScreen;
