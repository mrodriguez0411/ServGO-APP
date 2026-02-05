import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth, User } from '../contexts/AuthContext';
import ClientNavigator from './ClientNavigator';
import ProfessionalNavigator from './ProfessionalNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import { VerificationStack } from './stacks/VerificationStack';
// Onboarding will be added in a future update
const OnboardingScreen = () => null;

// Define the parameter list for the root stack
export type RootStackParamList = {
  // Auth stack
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Verification flow
  Verification: {
    screen: 'PhoneVerification' | 'DocumentVerification' | 'FaceVerification' | 'VerificationPending';
    params: {
      userId: string;
      phoneNumber?: string;
    };
  };
  
  // Main app
  ClientApp: undefined;
  ProfessionalApp: undefined;
  
  // Shared screens
  WriteReview: {
    bookingId: string;
  };
  
  // Payment methods
  PaymentMethods: {
    refresh?: boolean;
  };
  
  // Index signature for dynamic routes
  [key: string]: object | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  animationTypeForReplace: 'push',
};

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen 
      name="PaymentMethods" 
      component={require('../components/profile/PaymentMethods').default}
      options={{
        headerShown: true,
        title: 'Métodos de Pago',
        headerBackTitle: 'Atrás',
      }}
    />
  </Stack.Navigator>
);

// Role-based navigation
const AppNavigator = () => {
  const { isAuthenticated, isLoading, user, checkVerificationStatus } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (isAuthenticated && user) {
          setIsCheckingVerification(true);
          const { isVerified, verificationStatus } = await checkVerificationStatus(user.id);
          
          if (verificationStatus === 'pending' || verificationStatus === 'in_review') {
            setNeedsVerification(true);
          } else {
            setNeedsVerification(false);
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      } finally {
        setIsReady(true);
        setIsCheckingVerification(false);
      }
    };

    checkAuthStatus();
  }, [isAuthenticated, user, checkVerificationStatus]);

  if (isLoading || !isReady || isCheckingVerification) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          // Auth stack
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : needsVerification ? (
          // Verification flow
          <Stack.Screen 
            name="Verification" 
            component={VerificationStack} 
            initialParams={{
              screen: user?.verificationStep === 'phone' ? 'PhoneVerification' : 
                     user?.verificationStep === 'documents' ? 'DocumentVerification' : 
                     user?.verificationStep === 'face' ? 'FaceVerification' : 'VerificationPending',
              params: {
                userId: user?.id || '',
                phoneNumber: user?.phone
              }
            }}
          />
        ) : user?.userType === 'provider' ? (
          // Professional app
          <Stack.Screen name="ProfessionalApp" component={ProfessionalNavigator} />
        ) : (
          // Client app (default)
          <Stack.Screen name="ClientApp" component={ClientNavigator} />
        )}
        
        {/* Shared screens */}
        <Stack.Screen 
          name="PaymentMethods" 
          component={require('../components/profile/PaymentMethods').default}
          options={{
            headerShown: true,
            title: 'Métodos de Pago',
            headerBackTitle: 'Atrás',
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerShadowVisible: false,
            headerTintColor: '#000000',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
