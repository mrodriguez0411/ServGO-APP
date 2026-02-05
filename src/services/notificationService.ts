import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configura el manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Registra el dispositivo para notificaciones push
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4f46e5',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('No se otorgaron permisos para notificaciones push');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Guarda el token en Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_tokens')
        .upsert(
          { 
            user_id: user.id, 
            fcm_token: token,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
    }
  } else {
    console.log('Debes usar un dispositivo físico para las notificaciones push');
  }

  return token;
}

// Envía una notificación local
export async function sendLocalNotification(title: string, body: string, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Enviar inmediatamente
  });
}