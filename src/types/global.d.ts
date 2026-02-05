declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': {
        name: string;
        style?: any;
      };
    }
  }

  interface Window {
    Ionicons: any;
  }
}
