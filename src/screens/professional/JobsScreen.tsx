import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfessionalJobsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Professional Jobs</Text>
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

export default ProfessionalJobsScreen;
