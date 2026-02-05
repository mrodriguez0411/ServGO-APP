import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfessionalDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Professional Dashboard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfessionalDashboardScreen;
