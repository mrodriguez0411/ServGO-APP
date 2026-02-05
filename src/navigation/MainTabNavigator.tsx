import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

// Screens
import HomeScreen from "../screens/client/HomeScreen";
import SearchScreen from "../screens/client/SearchScreen";
import MyServicesScreen from "../screens/client/MyServicesScreen";
import FavoritesScreen from "../screens/client/FavoritesScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Types
type TabParamList = {
  Inicio: undefined;
  Buscar: undefined;
  Servicios: undefined;
  Favoritos: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export default function MainTabNavigator() {
  const screenOptions = ({
    route,
  }: {
    route: { name: keyof TabParamList };
  }): BottomTabNavigationOptions => ({
    lazy: false, // Desactiva la carga perezosa para evitar parpadeos
    tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
      let iconName: keyof typeof Ionicons.glyphMap = "home";

      if (route.name === "Inicio") {
        iconName = focused ? "home" : "home-outline";
      } else if (route.name === "Buscar") {
        iconName = focused ? "search" : "search-outline";
      } else if (route.name === "Servicios") {
        iconName = focused ? "briefcase" : "briefcase-outline";
      } else if (route.name === "Favoritos") {
        iconName = focused ? "heart" : "heart-outline";
      } else if (route.name === "Perfil") {
        iconName = focused ? "person" : "person-outline";
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: "#059669",
    tabBarInactiveTintColor: "gray",
    headerShown: false,
    tabBarStyle: {
      paddingBottom: 8,
      paddingTop: 8,
      height: 60,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontFamily: "DMSans-Medium",
    },
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={{ tabBarLabel: "Inicio" }} 
      />
      <Tab.Screen 
        name="Buscar" 
        component={SearchScreen} 
        options={{ tabBarLabel: "Buscar" }} 
      />
      <Tab.Screen 
        name="Servicios" 
        component={MyServicesScreen}
        options={{ tabBarLabel: "Servicios" }} 
      />
      <Tab.Screen 
        name="Favoritos" 
        component={FavoritesScreen}
        options={{ tabBarLabel: "Favoritos" }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: "Perfil",
        }} 
      />
    </Tab.Navigator>
  );
}
