import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth Stack
  Welcome: undefined;
  Login: undefined;
  Register: { userType: 'client' | 'provider' };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  
  // Verification Stack
  PhoneVerification: {
    userId: string;
    phoneNumber: string;
  };
  DocumentVerification: {
    userId: string;
  };
  FaceVerification: {
    userId: string;
  };
  VerificationPending: {
    userId: string;
  };
  
  // Main App
  Main: NavigatorScreenParams<MainTabParamList>;
  NotFound: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Services: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  PaymentMethods: undefined;
};

// Add this if you have a services stack
export type ServicesStackParamList = {
  ServicesList: undefined;
  ServiceDetails: { serviceId: string };
  BookService: { serviceId: string };
};

// Add this if you have a search stack
export type SearchStackParamList = {
  Search: undefined;
  SearchResults: { query: string };
  Filter: undefined;
};

// Add this if you have a home stack
export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
  Promotions: undefined;
};

// This helps with type checking for navigation props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
