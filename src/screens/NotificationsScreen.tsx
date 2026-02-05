import React from '../../node_modules/@types/react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const NotificationsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.notification}>
        <Text style={styles.notificationText}>No hay notificaciones nuevas</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notification: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationText: {
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationsScreen;
