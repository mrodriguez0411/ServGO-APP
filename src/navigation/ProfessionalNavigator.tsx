import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
//import { Text } from 'react';

// Screens
import ProfessionalDashboardScreen from '../screens/professional/DashboardScreen';
import ProfessionalJobsScreen from '../screens/professional/JobsScreen';
import ProfessionalScheduleScreen from '../screens/professional/ScheduleScreen';
import ProfileScreen from '../screens/professional/ProfileScreen';
import ProfessionalEarningsScreen from '../screens/professional/EarningsScreen';
import ProfessionalReviewsScreen from '../screens/professional/ReviewsScreen';
import ProfessionalServicesScreen from '../screens/professional/ServicesScreen';

// Types
export type ProfessionalTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Schedule: undefined;
  Profile: { userId?: string };
  Earnings: undefined;
}
export type ProfessionalStackParamList = {
  MainTabs: undefined;
  Reviews: { professionalId: string };
  Services: undefined;
  EditService: { serviceId?: string };
  Availability: undefined;
};

const Tab = createBottomTabNavigator<ProfessionalTabParamList>();
const Stack = createNativeStackNavigator<ProfessionalStackParamList>();

// Tab Navigator for Professional
function ProfessionalTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={ProfessionalDashboardScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={ProfessionalJobsScreen} 
        options={{ title: 'Trabajos' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={ProfessionalScheduleScreen} 
        options={{ title: 'Horario' }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={ProfessionalEarningsScreen} 
        options={{ title: 'Ganancias' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Main Professional Navigator
function ProfessionalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={ProfessionalTabs} />
      <Stack.Screen 
        name="Reviews" 
        component={ProfessionalReviewsScreen} 
        options={{ headerShown: true, title: 'Reseñas' }}
      />
      <Stack.Screen 
        name="Services" 
        component={ProfessionalServicesScreen} 
        options={{ headerShown: true, title: 'Mis Servicios' }}
      />
      <Stack.Screen 
        name="EditService" 
        component={ProfessionalServicesScreen} // TODO: Create EditServiceScreen
        options={{ headerShown: true, title: 'Editar Servicio' }}
      />
      <Stack.Screen 
        name="Availability" 
        component={ProfessionalScheduleScreen} // TODO: Create AvailabilityScreen
        options={{ headerShown: true, title: 'Disponibilidad' }}
      />
    </Stack.Navigator>
  );
}

export default ProfessionalNavigator;
