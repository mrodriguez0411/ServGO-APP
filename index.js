import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Set up environment for web
if (Platform.OS === 'web') {
  // Add any web-specific initialization here
  window.addEventListener('DOMContentLoaded', () => {
    // Web-specific setup if needed
  });
}

// Register the root component
registerRootComponent(App);
