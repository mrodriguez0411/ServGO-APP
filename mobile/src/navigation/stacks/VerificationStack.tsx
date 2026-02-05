import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Import verification screens
import { PhoneVerificationScreen } from '../../screens/verification/PhoneVerificationScreen';
import { DocumentVerificationScreen } from '../../screens/verification/DocumentVerificationScreen';
import { FaceVerificationScreen } from '../../screens/verification/FaceVerificationScreen';
import { VerificationPendingScreen } from '../../screens/verification/VerificationPendingScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const VerificationStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="PhoneVerification"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen 
        name="PhoneVerification" 
        component={PhoneVerificationScreen} 
        options={{
          title: 'Verificación de Teléfono',
          headerShown: true,
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen 
        name="DocumentVerification" 
        component={DocumentVerificationScreen} 
        options={{
          title: 'Documentos de Identidad',
          headerShown: true,
          headerBackTitle: 'Atrás',
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen 
        name="FaceVerification" 
        component={FaceVerificationScreen} 
        options={{
          title: 'Verificación Facial',
          headerShown: true,
          headerBackTitle: 'Atrás',
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="VerificationPending" 
        component={VerificationPendingScreen} 
        options={{
          title: 'Verificación en Progreso',
          headerShown: false,
          gestureEnabled: false, // Prevent going back from this screen
        }}
      />
    </Stack.Navigator>
  );
};

export default VerificationStack;
