import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfessionalScheduleScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Professional Schedule</Text>
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

export default ProfessionalScheduleScreen;
