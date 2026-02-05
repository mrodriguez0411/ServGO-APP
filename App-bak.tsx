import { StatusBar } from "expo-status-bar"
import { NavigationContainer, ParamListBase, RouteProp } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState, useCallback } from "react"
import { View, Platform } from "react-native"
// @ts-ignore
import Modal from 'modal-react-native-web'
import { useFonts } from 'expo-font'
import * as Font from 'expo-font';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk'
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans'

// Definir los tipos de parámetros para cada pantalla
type RootStackParamList = {
  // Pantallas de autenticación
  Welcome: undefined;
  Login: undefined;
  Register: { userType: 'client' | 'provider' };
  RegisterRoleSelection: undefined;
  RoleSelection: undefined;
  
  // Pantallas principales
  Main: undefined;
  Professional: undefined;
  AdminReview: undefined; // Agregar AdminReview a los tipos
  
  // Otras pantallas
  ProviderDetails: { id: string };
  CreateServiceRequest: undefined;
  JobDetails: { job: any }; // Reemplaza 'any' con la interfaz Job si la tienes definida
  WriteReview: { bookingId: string };
  
  // Pantallas de autenticación adicionales
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Load custom fonts
const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'DMSans-Regular': DMSans_400Regular,
      'DMSans-Medium': DMSans_500Medium,
      'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    });
  } catch (e) {
    console.warn('Error loading fonts', e);
  }
};

// Load fonts
loadFonts().catch(console.error);

// Set app element for modal accessibility
if (Platform.OS === 'web') {
  Modal.setAppElement('#root');
}

import { AuthProvider, useAuth } from "./src/contexts/AuthContext"
import { LoadingSpinner } from "./src/components/LoadingSpinner"

// Screens
import WelcomeScreen from "./src/screens/WelcomeScreen"
import LoginScreen from "./src/screens/auth/LoginScreen"
import RoleSelectionScreen from "./src/screens/auth/RoleSelectionScreen"
import RegisterScreen from "./src/screens/auth/RegisterScreen"
import RegisterRoleSelectionScreen from "./src/screens/auth/RegisterRoleSelectionScreen"
import MainTabNavigator from "./src/navigation/MainTabNavigator"
import ProfessionalNavigator from "./src/navigation/ProfessionalNavigator"
import ProviderDetailsScreen from "./src/screens/client/ProviderDetailsScreen"
import CreateServiceRequestScreen from "./src/screens/client/CreateServiceRequestScreen"
import JobDetailsScreen from "./src/screens/professional/JobDetailsScreen"
import WriteReviewScreen from "./src/screens/WriteReviewScreen"
import AdminReviewScreen from "./src/screens/professional/AdminReviewScreen"

const Stack = createStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync()

function AppNavigator() {
  const { isAuthenticated, isLoading, isAdminSession, user } = useAuth()
  
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAdminSession ? (
        <>
          <Stack.Screen name="AdminReview" component={AdminReviewScreen} />
        </>
      ) : isAuthenticated ? (
        <>
          {user?.userType === 'provider' ? (
            <Stack.Screen name="Professional" component={ProfessionalNavigator} />
          ) : (
            <Stack.Screen name="Main" component={MainTabNavigator} />
          )}
          <Stack.Screen name="ProviderDetails" component={ProviderDetailsScreen} />
          <Stack.Screen name="CreateServiceRequest" component={CreateServiceRequestScreen} />
          <Stack.Screen name="JobDetails">
            {(props) => {
              // Asegurarse de que los parámetros requeridos estén presentes
              if (!props.route.params?.job) {
                console.warn('JobDetailsScreen requires a job parameter');
                return null;
              }
              return <JobDetailsScreen {...props} />;
            }}
          </Stack.Screen>
          <Stack.Screen name="WriteReview">
            {(props) => {
              // Asegurarse de que los parámetros requeridos estén presentes
              if (!props.route.params?.bookingId) {
                console.warn('WriteReviewScreen requires a bookingId parameter');
                return null;
              }
              return <WriteReviewScreen {...props} />;
            }}
          </Stack.Screen>
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegisterRoleSelection" component={RegisterRoleSelectionScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold || '',
    'DMSans-Regular': DMSans_400Regular || '',
    'DMSans-Medium': DMSans_500Medium || '',
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'SpaceGrotesk-Bold': SpaceGrotesk_700Bold || '',
          'DMSans-Regular': DMSans_400Regular || '',
          'DMSans-Medium': DMSans_500Medium || '',
        });

        // On web, we'll let the CSS handle the font loading
        if (Platform.OS !== 'web') {
          // @ts-ignore - loadFont is available at runtime
          await Icon.loadFont();
        }
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </View>
  )
}
