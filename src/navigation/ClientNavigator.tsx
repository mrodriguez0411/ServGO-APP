import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/client/HomeScreen';
import SearchScreen from '../screens/client/SearchScreen';
import CategoriesScreen from '../screens/client/CategoriesScreen';
import MyServicesScreen from '../screens/client/MyServicesScreen';
// PaymentMethods is now imported and used in AppNavigator

// Temporary implementations for missing screens
const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Pantalla de Perfil</Text>
  </View>
);

// Temporary implementations for missing screens
const ProviderDetailScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Detalles del Profesional</Text>
  </View>
);

const EditProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Editar Perfil</Text>
  </View>
);

const BookingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Reservar Servicio</Text>
  </View>
);

const MyBookingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Mis Reservas</Text>
  </View>
);

// Temporary implementations for missing screens
const FavoritesScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Favoritos</Text>
  </View>
);

const NotificationsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Notificaciones</Text>
  </View>
);

// Types
// Define the navigation params for the profile stack
type ProfileStackParamList = {
  Perfil: undefined;
  EditProfile: {
    userId?: string;
  };
  Notifications: undefined; // Added Notifications screen
  PaymentMethods: { refresh?: boolean };
  MyBookings: undefined;
  ProviderDetail: { providerId: string };
  Booking: { providerId: string; serviceId?: string };
  WriteReview: { bookingId: string };
  Categories: undefined;
};

// Define the navigation params for the main tabs
type MainTabsParamList = {
  Inicio: undefined;
  Buscar: { categoryId?: string; query?: string } | undefined;
  Servicios: { serviceId?: string } | undefined;
  Favoritos: undefined;
  Perfil: undefined;
  // Additional screens that can be navigated to from tabs
  Categories: undefined;
  PaymentMethods: { refresh?: boolean };
  WriteReview: { bookingId: string };
  ProviderDetail: { providerId: string };
  Booking: { providerId: string; serviceId?: string };
  MyBookings: undefined;
};

// Define the root stack params
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  ProviderDetail: { providerId: string };
  Booking: { providerId: string; serviceId?: string };
  MyBookings: undefined;
  Categories: undefined;
  WriteReview: { bookingId: string };
  [key: string]: object | undefined; // Index signature for dynamic routes
};

export type ClientTabParamList = MainTabsParamList;

// This type is used for the main client stack that contains the tab navigator
type ClientStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  // Screens that can be pushed on top of the tab navigator
  ProviderDetail: { providerId: string };
  Booking: { providerId: string; serviceId?: string };
  MyBookings: undefined;
  Categories: undefined;
  WriteReview: { bookingId: string };
  PaymentMethods: { refresh?: boolean };
  EditProfile: { userId?: string };
};

const Tab = createBottomTabNavigator<ClientTabParamList>();
const Stack = createNativeStackNavigator<ClientStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Create a separate stack navigator for Profile
export const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Atrás',
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: { backgroundColor: 'white' },
      }}
      initialRouteName="Perfil"
    >
      <ProfileStack.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ 
          title: 'Mi Perfil',
          headerShown: false
        }} 
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: 'Editar Perfil',
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
      <ProfileStack.Screen 
        name="Notifications"
        component={NotificationsScreen} 
        options={{ 
          title: 'Notificaciones',
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
    </ProfileStack.Navigator>
  );
};

// Tab Navigator for Client
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Buscar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Servicios') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Favoritos') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={{ 
          title: 'Inicio',
        }} 
      />
      <Tab.Screen 
        name="Buscar" 
        component={SearchScreen} 
        options={{ 
          title: 'Buscar',
        }}
      />
      <Tab.Screen 
        name="Servicios" 
        component={MyServicesScreen} 
        options={{ 
          title: 'Servicios',
        }}
      />
      <Tab.Screen 
        name="Favoritos" 
        component={FavoritesScreen} 
        options={{ 
          title: 'Favoritos',
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ 
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

// Main Client Navigator
function ClientNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={ClientTabs} />
      <Stack.Screen 
        name="ProviderDetail" 
        component={ProviderDetailScreen} 
        options={{ 
          headerShown: true, 
          title: 'Detalles del Profesional',
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
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{
          headerShown: true,
          title: 'Reservar Servicio',
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
      <Stack.Screen 
        name="MyBookings" 
        component={MyBookingsScreen}
        options={{
          headerShown: true,
          title: 'Mis Reservas',
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
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{
          headerShown: true,
          title: 'Categorías',
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
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: 'Editar Perfil',
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
      <Stack.Screen 
        name="ProviderDetail" 
        component={ProviderDetailScreen} 
        options={{ headerShown: true, title: 'Detalles del Profesional' }}
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{ headerShown: true, title: 'Categorías' }}
      />
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen} 
        options={{ headerShown: true, title: 'Reservar Servicio' }}
      />
      <Stack.Screen 
        name="MyBookings" 
        component={MyBookingsScreen} 
        options={{ headerShown: true, title: 'Mis Reservas' }}
      />
    </Stack.Navigator>
  );
}

export default ClientNavigator;
