"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { Platform } from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { secureStorage } from '../utils/secureStorage'
import { 
  signInWithEmail, 
  signOut as supabaseSignOut, 
  signUpWithEmail, 
  getSession as supabaseGetSession, 
  onAuthStateChange 
} from '../services/supabaseAuth'
import { createUsuario, upsertUsuario } from '../services/db'
import { seedDefaultAdmin, isAdminEmail } from '../api/admins'

// Types
export type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected' | 'banned';

export interface Document {
  id: string;
  type: 'id_front' | 'id_back' | 'selfie' | 'certification' | 'other';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PhoneVerification {
  verified: boolean;
  verifiedAt?: string;
  verificationMethod?: 'sms' | 'call';
  lastVerificationAttempt?: string;
}

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // Agregado para manejo de contraseña
  userType: 'client' | 'provider';
  avatar?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationStep: 'phone' | 'documents' | 'face' | 'completed';
  phoneVerification: PhoneVerification;
  documents: Document[];
  rejectionReasons?: string[];
  isActive: boolean;
  isAdmin?: boolean; // Agregado para manejo de administradores
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface ClientUser extends BaseUser {
  userType: "client"
  // Client specific fields
  savedProviders?: string[]
  recentSearches?: string[]
  paymentMethods?: Array<{
    id: string
    type: 'credit_card' | 'debit_card' | 'paypal' | 'efectivo' | 'mercadopago'
    last4?: string
    isDefault: boolean
    // For Mercado Pago, we can store additional info like email or phone
    metadata?: Record<string, any>
  }>
  preferences?: {
    notifications: boolean
    language: string
    marketingEmails?: boolean
    // Add other preferences as needed
  }
}

export interface ProviderUser extends BaseUser {
  userType: "provider"
  // Professional specific fields
  profession: string
  specialties: string[]
  experienceYears: number
  description: string
  serviceRadius: number // in kilometers
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  services: Array<{
    id: string
    name: string
    price: number
    duration: number // in minutes
    description?: string
  }>
  schedule: {
    days: Array<{
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
      available: boolean
      startTime?: string // Format: "HH:MM"
      endTime?: string   // Format: "HH:MM"
      breakStart?: string
      breakEnd?: string
    }>
    unavailableDates: string[] // ISO date strings
  }
  rating?: {
    average: number
    totalReviews: number
  }
  verificationStatus: VerificationStatus
  documents: Document[]
  preferences?: {
    notifications: boolean
    language: string
    marketingEmails?: boolean
    // Add other preferences as needed
  }
}

export type User = ClientUser | ProviderUser

// Verification result types
export interface VerificationResult {
  success: boolean;
  error?: string;
  documentId?: string;
  verificationStatus?: VerificationStatus;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdminSession: boolean;
  login: (email: string, password: string, desiredRole?: 'client' | 'provider') => Promise<{ success: boolean; error?: string; user?: User; verificationStep?: string }>;
  register: (userData: RegisterData) => Promise<{ 
    success: boolean; 
    error?: string; 
    userId?: string;
    user?: User;
  }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  
  // Verification functions
  verifyPhone: (userId: string, code: string) => Promise<VerificationResult>;
  resendVerificationCode: (userId: string) => Promise<VerificationResult>;
  uploadVerificationDocument: (userId: string, type: Document['type'], uri: string) => Promise<VerificationResult>;
  verifyFace: (userId: string, imageUri: string) => Promise<VerificationResult>;
  checkVerificationStatus: (userId: string) => Promise<{
    success: boolean;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
    nextStep?: 'documents' | 'face' | 'completed';
  }>;
}

interface BaseRegisterData {
  name: string
  email: string
  phone: string
  password: string
  userType: "client" | "provider"
  acceptTerms: boolean
  acceptMarketing: boolean
}

interface ClientRegisterData extends BaseRegisterData {
  userType: "client"
  // Additional client registration fields
  paymentMethods?: Array<{
    type: 'credit_card' | 'debit_card' | 'paypal' | 'efectivo' | 'mercadopago'
    isDefault: boolean
    details?: Record<string, any>
  }>
  preferences?: {
    notifications: boolean
    language: string
    // Add other preferences as needed
  }
}

interface ProviderRegisterData extends BaseRegisterData {
  userType: "provider"
  profession: string
  specialties: string[]
  experienceYears: number
  description: string
  serviceRadius: number
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  schedule?: {
    days: Array<{
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
      available: boolean
      startTime?: string // Format: "HH:MM"
      endTime?: string   // Format: "HH:MM"
      breakStart?: string
      breakEnd?: string
    }>
  }
  verificationStatus?: 'pending' | 'verified' | 'rejected'
  documents?: Document[]
  rating?: {
    average: number
    totalReviews: number
  }
}

type RegisterData = ClientRegisterData | ProviderRegisterData

// Constants
const TOKEN_KEY = "servigo_auth_token"
const USER_DATA_KEY = "servigo_user_data"
// For development, use a local server or mock API
// For production, replace with your actual API URL
const API_BASE_URL = "http://localhost:3000/api" // Local development server

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook to use the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdminSession, setIsAdminSession] = useState(false)
  
  // Mock function to simulate API delay
  const simulateApiCall = async (duration = 1000) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };
  
  // Forgot password function
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      console.log('Sending forgot password request to:', `${API_BASE_URL}/auth/forgot-password`);
      
      // For development, log the request details
      if (__DEV__) {
        console.log('Development mode: Using mock response for forgot password');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { 
          success: true, 
          message: 'If an account with that email exists, you will receive a password reset link.' 
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || 'Failed to process forgot password request' 
        };
      }

      return { 
        success: true, 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      return { 
        success: false, 
        message: 'An error occurred while processing your request. Please check your connection.' 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password function
  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      console.log('Sending reset password request to:', `${API_BASE_URL}/auth/reset-password`);
      
      // For development, log the request details
      if (__DEV__) {
        console.log('Development mode: Using mock response for password reset');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { 
          success: true, 
          message: 'Your password has been reset successfully.' 
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || 'Failed to reset password' 
        };
      }

      return { 
        success: true, 
        message: 'Your password has been reset successfully.' 
      };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { 
        success: false, 
        message: 'An error occurred while resetting your password. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data from storage
  const loadUserData = async () => {
    try {
      // Hydrate from Supabase session first
      const { data } = await supabaseGetSession()
      const session = data?.session

      const storedUserRaw = await AsyncStorage.getItem(USER_DATA_KEY)
      let validatedUser: User | null = null

      if (storedUserRaw) {
        const parsedUser = JSON.parse(storedUserRaw) as User
        validatedUser = parsedUser.userType === 'client'
          ? {
              ...parsedUser,
              savedProviders: (parsedUser as ClientUser).savedProviders || [],
              recentSearches: (parsedUser as ClientUser).recentSearches || [],
              paymentMethods: (parsedUser as ClientUser).paymentMethods || []
            } as ClientUser
          : {
              ...parsedUser,
              services: (parsedUser as ProviderUser).services || [],
              schedule: (parsedUser as ProviderUser).schedule || {
                days: [
                  { day: 'monday', available: false },
                  { day: 'tuesday', available: false },
                  { day: 'wednesday', available: false },
                  { day: 'thursday', available: false },
                  { day: 'friday', available: false },
                  { day: 'saturday', available: false },
                  { day: 'sunday', available: false },
                ],
                unavailableDates: []
              },
              verificationStatus: (parsedUser as ProviderUser).verificationStatus || 'pending',
              specialties: (parsedUser as ProviderUser).specialties || [],
              experienceYears: (parsedUser as ProviderUser).experienceYears || 0,
              serviceRadius: (parsedUser as ProviderUser).serviceRadius || 20
            } as ProviderUser
      }

      if (session && validatedUser) {
        setUser(validatedUser)
        setIsAuthenticated(true)
      } else if (!session) {
        // No session -> clear
        await clearAuthData()
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      await clearAuthData()
    } finally {
      setIsLoading(false)
    }
  }

  // Clear all auth data and reset state
  const clearAuthData = async (): Promise<void> => {
    try {
      // Clear secure storage
      await secureStorage.removeItem(TOKEN_KEY);
      
      // Clear async storage
      await AsyncStorage.multiRemove([USER_DATA_KEY, TOKEN_KEY]);
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setIsAdminSession(false);
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  }

  // Check authentication state on mount
  useEffect(() => {
    loadUserData()
    // Seed a default admin in development environment
    if (__DEV__) {
      seedDefaultAdmin('Admin', 'admin@servigo.app', 'Admin123!').catch((e) => {
        console.warn('Admin seed failed:', e)
      })
    }

    // Subscribe to Supabase auth changes
    const unsubscribe = onAuthStateChange(async () => {
      await loadUserData()
    })
    return () => {
      try { unsubscribe() } catch {}
    }
  }, [])

  // Function to store auth data
  const storeAuthData = async (token: string, userData: User): Promise<void> => {
    try {
      await secureStorage.setItem(TOKEN_KEY, token);
      
      // Ensure we're storing a properly typed user object
      const userToStore: User = userData.userType === 'client' 
        ? {
            ...userData,
            savedProviders: (userData as ClientUser).savedProviders || [],
            recentSearches: (userData as ClientUser).recentSearches || [],
            paymentMethods: (userData as ClientUser).paymentMethods || []
          } as ClientUser
        : {
            ...userData,
            profession: (userData as ProviderUser).profession,
            specialties: (userData as ProviderUser).specialties || [],
            experienceYears: (userData as ProviderUser).experienceYears || 0,
            serviceRadius: (userData as ProviderUser).serviceRadius || 20,
            services: (userData as ProviderUser).services || [],
            schedule: (userData as ProviderUser).schedule || {
              days: [
                { day: 'monday', available: false },
                { day: 'tuesday', available: false },
                { day: 'wednesday', available: false },
                { day: 'thursday', available: false },
                { day: 'friday', available: false },
                { day: 'saturday', available: false },
                { day: 'sunday', available: false }
              ],
              unavailableDates: []
            },
            verificationStatus: (userData as ProviderUser).verificationStatus || 'pending',
            documents: (userData as ProviderUser).documents || []
          } as ProviderUser;
      
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userToStore));
      setUser(userToStore);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw error;
    }
  }

  // Register function
  const register = async (userData: RegisterData): Promise<{ 
    success: boolean; 
    error?: string; 
    userId?: string;
    user?: User;
  }> => {
    setIsLoading(true)
    
    try {
      // Validate required fields
      if (!userData.name || !userData.email || !userData.phone || !userData.password) {
        return { 
          success: false, 
          error: 'Por favor completa todos los campos requeridos' 
        };
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return { 
          success: false, 
          error: 'Por favor ingresa un correo electrónico válido' 
        };
      }
      
      // Validate password strength
      if (userData.password.length < 8) {
        return { 
          success: false, 
          error: 'La contraseña debe tener al menos 8 caracteres' 
        };
      }
      
      // Validate phone number (basic validation)
      const phoneRegex = /^\d{10,15}$/
      if (!phoneRegex.test(userData.phone)) {
        return { 
          success: false, 
          error: 'Por favor ingresa un número de teléfono válido (10-15 dígitos)' 
        };
      }
      
      // Create user object based on type
      const baseUser: BaseUser = {
        id: `user_${Date.now()}`,
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        phone: userData.phone.trim(),
        password: userData.password, // En producción, usar hash
        userType: userData.userType,
        isVerified: false,
        verificationStatus: 'pending',
        verificationStep: 'phone',
        phoneVerification: {
          verified: false,
        },
        documents: [] as Document[],
        isActive: false, // Cuenta inactiva hasta aprobación del administrador
        rejectionReasons: [] as string[],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: undefined,
      };

      let newUser: User;

      if (userData.userType === 'client') {
        newUser = {
          ...baseUser,
          userType: 'client' as const,
          savedProviders: [],
          recentSearches: [],
          paymentMethods: [],
          preferences: {
            notifications: true,
            language: 'es',
            marketingEmails: userData.acceptMarketing,
          },
        };
      } else {
        const providerData = userData as ProviderRegisterData;
        newUser = {
          ...baseUser,
          userType: 'provider' as const,
          profession: providerData.profession || '',
          specialties: providerData.specialties || [],
          experienceYears: providerData.experienceYears || 0,
          description: providerData.description || '',
          serviceRadius: providerData.serviceRadius || 10,
          address: providerData.address || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          },
          services: [],
          schedule: {
            days: [
              { day: 'monday', available: false },
              { day: 'tuesday', available: false },
              { day: 'wednesday', available: false },
              { day: 'thursday', available: false },
              { day: 'friday', available: false },
              { day: 'saturday', available: false },
              { day: 'sunday', available: false },
            ],
            unavailableDates: [],
          },
        };
      }
      
      // Create Supabase auth user
      const { data, error } = await signUpWithEmail({
        email: userData.email,
        password: userData.password,
        metadata: {
          name: userData.name,
          userType: userData.userType,
          phone: userData.phone,
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Insert profile row in usuarios linked to auth user
      const authUserId = data?.user?.id
      if (authUserId) {
        const { error: dbErr } = await createUsuario({
          id: authUserId,
          nombre: userData.name.trim(),
          email: userData.email.toLowerCase().trim(),
          telefono: userData.phone.trim(),
          tipo: userData.userType,
        })
        if (dbErr) {
          console.warn('usuarios insert warning:', dbErr.message)
        }
        // Align local user id with auth uid
        newUser.id = authUserId
      }

      // Store local profile
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(newUser));
      setUser(newUser) // Not authenticated until login/confirmation
      return { success: true, userId: newUser.id, user: newUser }
      
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Error al registrar el usuario. Por favor intenta de nuevo.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Login function with admin approval check
  const login = useCallback(async (
    email: string, 
    password: string, 
    desiredRole?: 'client' | 'provider'
  ): Promise<{ 
    success: boolean; 
    error?: string;
    verificationStep?: string;
    user?: User;
  }> => {
    setIsLoading(true);
    try {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        return { success: false, error: error.message }
      }

      // Load profile from storage or create a minimal one
      const storedRaw = await AsyncStorage.getItem(USER_DATA_KEY)
      let profile: User | null = storedRaw ? JSON.parse(storedRaw) as User : null

      if (desiredRole && profile && profile.userType !== desiredRole) {
        return {
          success: false,
          error: `Esta cuenta está registrada como ${profile.userType === 'provider' ? 'profesional' : 'cliente'}. Por favor, inicia sesión con el tipo de cuenta correcto.`
        }
      }

      // Ensure usuarios row exists/updated in DB
      try {
        const { data } = await supabaseGetSession()
        const authUserId = data?.session?.user?.id
        if (authUserId) {
          await upsertUsuario({ id: authUserId, nombre: profile?.name || email.split('@')[0] })
        }
      } catch {}

      if (!profile) {
        // Minimal default profile (client) if none stored
        const now = new Date().toISOString()
        const { data } = await supabaseGetSession()
        const authUserId = data?.session?.user?.id || `user_${Date.now()}`
        profile = {
          id: authUserId,
          name: email.split('@')[0],
          email,
          phone: '',
          password,
          userType: 'client',
          isVerified: true,
          verificationStatus: 'verified',
          verificationStep: 'completed',
          phoneVerification: { verified: true },
          documents: [],
          isActive: true,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          savedProviders: [],
          recentSearches: [],
          paymentMethods: [],
          preferences: { notifications: true, language: 'es', marketingEmails: false },
        } as ClientUser
      }

      profile = { ...profile, lastLoginAt: new Date().toISOString() }
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profile))

      setUser(profile)
      setIsAuthenticated(true)
      setIsAdminSession(false)

      return { success: true, user: profile, verificationStep: profile.verificationStep }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.' }
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setIsAuthenticated, setIsAdminSession])

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabaseSignOut()
      await clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user is logged in' };
    }
    
    try {
      setIsLoading(true);
      
      if (__DEV__) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update local user data with proper type safety
        let updatedUser: User;
        
        if (user.userType === 'client') {
          updatedUser = {
            ...user,
            ...userData,
            userType: 'client', // Ensure type is preserved
            updatedAt: new Date().toISOString()
          } as ClientUser;
        } else {
          updatedUser = {
            ...user,
            ...userData,
            userType: 'provider', // Ensure type is preserved
            updatedAt: new Date().toISOString()
          } as ProviderUser;
        }
            
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true };
      }
      
      // Production implementation
      const token = await secureStorage.getItem(TOKEN_KEY);
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || 'Failed to update profile' 
        };
      }
      
      const updatedUser = await response.json();
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
      
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while updating profile' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify phone number with code
  const verifyPhone = async (userId: string, code: string): Promise<VerificationResult> => {
    try {
      await simulateApiCall(1500);
      
      // In a real app, you would validate the code with your backend
      if (code.length !== 6 || isNaN(Number(code))) {
        return { 
          success: false, 
          error: 'Código inválido. Por favor ingresa un código de 6 dígitos.' 
        };
      }
      
      // Get current user data
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) {
        return { 
          success: false, 
          error: 'Usuario no encontrado' 
        };
      }
      
      const user = JSON.parse(userData);
      
      // Update user verification status
      const updatedUser = {
        ...user,
        phoneVerification: {
          ...user.phoneVerification,
          verified: true,
          verifiedAt: new Date().toISOString(),
          verificationMethod: 'sms'
        },
        verificationStep: 'documents',
        updatedAt: new Date().toISOString()
      };
      
      // Save updated user
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { 
        success: true,
        verificationStatus: 'pending'
      };
      
    } catch (error) {
      console.error('Phone verification error:', error);
      return { 
        success: false, 
        error: 'Error al verificar el código. Por favor intenta de nuevo.' 
      };
    }
  };
  
  // Resend verification code
  const resendVerificationCode = async (userId: string): Promise<VerificationResult> => {
    try {
      await simulateApiCall(1000);
      
      // In a real app, you would request a new code from your backend
      console.log(`Resending verification code to user ${userId}`);
      
      return { success: true };
      
    } catch (error) {
      console.error('Resend code error:', error);
      return { 
        success: false, 
        error: 'Error al reenviar el código. Por favor intenta de nuevo.' 
      };
    }
  };
  
  // Upload verification document
  const uploadVerificationDocument = async (
    userId: string, 
    type: Document['type'], 
    uri: string
  ): Promise<VerificationResult> => {
    try {
      await simulateApiCall(2000);
      
      // In a real app, you would upload the file to your server
      // and get back a document ID and URL
      const documentId = `doc_${Date.now()}`;
      const documentUrl = `https://api.servigo.com/documents/${documentId}`;
      
      // Get current user data
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) {
        return { 
          success: false, 
          error: 'Usuario no encontrado' 
        };
      }
      
      const user = JSON.parse(userData);
      
      // Check if document of this type already exists
      const existingDocIndex = user.documents.findIndex(
        (doc: Document) => doc.type === type
      );
      
      const newDocument: Document = {
        id: documentId,
        type,
        url: documentUrl,
        status: 'pending',
        uploadedAt: new Date().toISOString()
      };
      
      // Update or add the document
      const updatedDocuments = [...user.documents];
      if (existingDocIndex >= 0) {
        updatedDocuments[existingDocIndex] = newDocument;
      } else {
        updatedDocuments.push(newDocument);
      }
      
      // Check if all required documents are uploaded
      const requiredDocs = ['id_front', 'id_back', 'selfie'];
      const hasAllRequiredDocs = requiredDocs.every(docType => 
        updatedDocuments.some((doc: Document) => doc.type === docType)
      );
      
      // Update user data
      const updatedUser = {
        ...user,
        documents: updatedDocuments,
        verificationStep: hasAllRequiredDocs ? 'face' : user.verificationStep,
        updatedAt: new Date().toISOString()
      };
      
      // Save updated user
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { 
        success: true,
        documentId,
        verificationStatus: 'pending'
      };
      
    } catch (error) {
      console.error('Document upload error:', error);
      return { 
        success: false, 
        error: 'Error al subir el documento. Por favor intenta de nuevo.' 
      };
    }
  };
  
  // Verify face with selfie
  const verifyFace = async (userId: string, imageUri: string): Promise<VerificationResult> => {
    try {
      await simulateApiCall(3000);
      
      // In a real app, you would send the image to your face verification service
      console.log(`Verifying face for user ${userId}`);
      
      // Get current user data
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) {
        return { 
          success: false, 
          error: 'Usuario no encontrado' 
        };
      }
      
      const user = JSON.parse(userData);
      
      // Update user verification status
      const updatedUser = {
        ...user,
        verificationStatus: 'in_review',
        verificationStep: 'completed',
        updatedAt: new Date().toISOString()
      };
      
      // Save updated user
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { 
        success: true,
        verificationStatus: 'in_review'
      };
      
    } catch (error) {
      console.error('Face verification error:', error);
      return { 
        success: false, 
        error: 'Error al verificar tu rostro. Por favor intenta de nuevo.' 
      };
    }
  };
  
  // Check verification status
  const checkVerificationStatus = async (userId: string) => {
    try {
      await simulateApiCall(1000);
      
      // Get current user data
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) {
        return { 
          success: false, 
          isVerified: false,
          verificationStatus: 'pending' as const
        };
      }
      
      const user = JSON.parse(userData);
      
      // In a real app, you would check with your backend for the latest status
      return {
        success: true,
        isVerified: user.isActive && user.verificationStatus === 'verified',
        verificationStatus: user.verificationStatus,
        nextStep: user.verificationStep === 'completed' ? undefined : user.verificationStep
      };
      
    } catch (error) {
      console.error('Verification status check error:', error);
      return { 
        success: false, 
        isVerified: false,
        verificationStatus: 'pending' as const
      };
    }
  };
  
  // Provide the auth context value
  const authContextValue: AuthContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    isAdminSession,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifyPhone,
    resendVerificationCode,
    uploadVerificationDocument,
    verifyFace,
    checkVerificationStatus
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
