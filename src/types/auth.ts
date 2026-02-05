export type User = {
  id: string;
  email: string;
  name: string;
  userType: 'client' | 'professional';
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'client' | 'professional';
  phoneNumber?: string;
};
