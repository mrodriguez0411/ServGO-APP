import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export function useNotifications() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Registrar para notificaciones push
    registerForPushNotificationsAsync();

    // Escuchar notificaciones recibidas en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Escuchar interacciones con notificaciones
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Usuario interactuó con la notificación:', data);
      
      // Navegar según los datos de la notificación
      if (data.screen) {
        router.push(data.screen as string);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}