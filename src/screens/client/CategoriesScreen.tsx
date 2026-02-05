import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const categories = [
  { id: '1', name: 'Plomería' },
  { id: '2', name: 'Electricidad' },
  { id: '3', name: 'Carpintería' },
  { id: '4', name: 'Limpieza' },
  { id: '5', name: 'Jardinería' },
  { id: '6', name: 'Pintura' },
];

const CategoriesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categorías</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryItem}>
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
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
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CategoriesScreen;
