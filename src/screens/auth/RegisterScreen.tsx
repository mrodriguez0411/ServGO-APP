import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  Dimensions,
  Image,
  ViewStyle,
  Alert,
  SafeAreaView
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import Flag from '../../components/Flag';
import { provinces, citiesByProvince } from '../../data/argentinaLocations';
import { signUpWithEmail } from '../../services/supabaseAuth';
import { createUserProfile, uploadFile } from '../../services/userService';

// Constantes
export const USER_DATA_KEY = '@user_data';

// Styles moved above component to avoid "no-use-before-define" linter error
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradient: { flex: 1 },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ecfdf5',
  },
  headerPlaceholder: {
    width: 24,
  },
  panel: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  form: {
    marginTop: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 0,
    height: 48,
    overflow: 'hidden',
  },
  countryPickerButton: {
    height: '100%',
    justifyContent: 'center',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    height: '100%',
    backgroundColor: '#f3f4f6',
    minWidth: 100,
  },
  countryCodeContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: 4,
  },
  flagContainer: {
    marginRight: 8,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCode: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  countryPickerContainer: {
    display: 'none', // Hide the default button
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: '100%',
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeButton: {
    padding: 8,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
    width: '100%',
  },
  navButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    width: '100%',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: '#10b981',
  },
  stepCompleted: {
    backgroundColor: '#059669',
  },
  stepDisabled: {
    opacity: 0.5,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  stepTextActive: {
    color: '#ffffff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  registerButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  strengthMeter: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    backgroundColor: '#e5e7eb',
  },
  strengthMeterFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  passwordTips: {
    marginTop: 12,
  },
  tipText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  // Estilos para la sección de verificación
  verificationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  verificationText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 16,
    textAlign: 'center',
  },
  verificationInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    height: 60,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendCodeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendCodeText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  successText: {
    color: '#065f46',
    marginLeft: 8,
    fontSize: 14,
  },
  // Step 3 (Welcome) styles
  welcomeContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  checkmarkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
  },
  welcomeMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 8,
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  verificationIcon: {
    marginRight: 8,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  identityContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 8,
  },
  // Nuevos estilos para subida de DNI y términos
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
    width: '100%',
  },
  uploadSection: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  uploadDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  removeButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
    paddingVertical: 12,
    borderRadius: 10,
  },
  uploadButtonText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  passwordStrengthBar: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 40,
  },
  termsContainer: {
    marginTop: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  termsText: {
    flex: 1,
    color: '#4b5563',
    fontSize: 13,
  },
  termsLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  // Dropdown (Province/City)
  dropdownSelector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownSearchInput: {
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
});

// Types
interface FormData {
  // Información personal
  name: string;
  email: string;
  phone: string;
  locality: string;
  province: string;
  city: string;
  password: string;
  confirmPassword: string;
  address: string;
  piso: string;
  departamento: string;
  postalCode: string;
  ciudad: string;
  state: string;
  country: string;
  // Tipo de usuario
  userType: 'client' | 'provider';
  // Documentos de identidad
  dniFront?: string;
  dniBack?: string;
  
  // Información del negocio (opcional)
  businessName?: string;
  businessDescription?: string;
  businessCategory?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  // Profesional
  profession?: string;
}

// Helper functions
const checkPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return { isValid: false, message: 'El correo electrónico es requerido' };
  if (!emailRegex.test(trimmedEmail)) return { isValid: false, message: 'Ingresa un correo electrónico válido' };
  return { isValid: true, message: '' };
};

const validatePhone = (phone: string, countryCode: string, localNumber: string) => {
  const phoneRegex = /^\+?[0-9\s-]+$/;
  
  if (!phone || phone === `+${localNumber}`) {
    return { isValid: false, message: 'El teléfono es requerido' };
  }
  
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: 'Ingresa un número de teléfono válido' };
  }
  
  // Validar longitud según el país
  if (countryCode === 'AR' && localNumber.length !== 10) {
    return {
      isValid: false,
      message: 'El número debe tener 10 dígitos (sin contar el código de área)'
    };
  } else if (countryCode === 'US' && localNumber.length !== 10) {
    return {
      isValid: false,
      message: 'El número debe tener 10 dígitos (código de área + número)'
    };
  }
  
  return { isValid: true, message: '' };
};

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  // Estados para la carga de imágenes del DNI
  const [isUploadingDniFront, setIsUploadingDniFront] = useState(false);
  const [isUploadingDniBack, setIsUploadingDniBack] = useState(false);
  const [dniFrontPreview, setDniFrontPreview] = useState<string | null>(null);
  const [dniBackPreview, setDniBackPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    locality: "",
    province: "",
    city: "",
    password: "",
    confirmPassword: "",
    userType: "client"
  });
  // Obtener el tipo de usuario de la navegación
  const route = useRoute<RouteProp<Record<string, { initialRole: 'client' | 'provider' }>, string>>();
  useEffect(() => {
    const initialRole = route.params?.initialRole;
    if (initialRole) {
      setFormData(prev => ({ ...prev, userType: initialRole }));
    }
  }, [route.params]);
  const [errors, setErrors] = useState<Partial<FormData> & { terms?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Autocomplete local state for province/city
  const [provinceQuery, setProvinceQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  // Dropdown visibility
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  // Función para seleccionar la imagen del frente del DNI
  const handleSelectDniFront = async () => {
    try {
      setIsUploadingDniFront(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setDniFrontPreview(uri);
        setFormData(prev => ({
          ...prev,
          dniFront: uri
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen del DNI:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsUploadingDniFront(false);
    }
  };

  // Función para seleccionar la imagen del dorso del DNI
  const handleSelectDniBack = async () => {
    try {
      setIsUploadingDniBack(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setDniBackPreview(uri);
        setFormData(prev => ({
          ...prev,
          dniBack: uri
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen del DNI:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsUploadingDniBack(false);
    }
  };

  // Función para eliminar la imagen del frente del DNI
  const handleRemoveDniFront = () => {
    setDniFrontPreview(null);
    setFormData(prev => ({
      ...prev,
      dniFront: undefined
    }));
  };

  // Función para eliminar la imagen del dorso del DNI
  const handleRemoveDniBack = () => {
    setDniBackPreview(null);
    setFormData(prev => ({
      ...prev,
      dniBack: undefined
    }));
  };
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('AR');
  const [callingCode, setCallingCode] = useState('54');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Set default country on mount
  useEffect(() => {
    // No necesitamos establecer un país por defecto manualmente
    // El CountryPicker se encargará de ello con el countryCode
  }, []);

  // Auto-redirect to Login after 5 seconds on Step 3
  useEffect(() => {
    if (currentStep === 3) {
      const timer = setTimeout(() => {
        navigation.navigate('Login');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, navigation]);

  // Format phone number for display (simplified without parentheses)
  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      if (!match[1] && !match[2] && !match[3]) return '';
      if (!match[2]) return `${match[1]}`;
      if (!match[3]) return `${match[1]} ${match[2]}`;
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return value;
  };


  // Get the full phone number with country code
  const getFullPhoneNumber = (value: string) => {
    if (!value) return `+${callingCode}`;
    const cleaned = value.replace(/\D/g, '');
    return `+${callingCode}${cleaned}`;
  };

  // Handle phone number input changes
  const handlePhoneNumberChange = (value: string) => {
    // Format the input value
    const formattedValue = value.replace(/\D/g, '').substring(0, 10);
    setPhoneNumber(formattedValue);
    updateFormData('phone', getFullPhoneNumber(formattedValue));
  };

  // Handle country selection
  const onSelectCountry = (selectedCountry: Country) => {
    console.log('Selected country:', selectedCountry);
    setCountryCode(selectedCountry.cca2);
    setCallingCode(selectedCountry.callingCode?.[0] || '1');
    
    // Update the phone number with the new country code
    if (phoneNumber) {
      updateFormData('phone', `+${selectedCountry.callingCode?.[0] || '1'}${phoneNumber}`);
    }
    setShowCountryPicker(false);
  };

  // Create a type-safe style object for the phone input container
  // Type-safe utility function for conditional styles
  const getConditionalStyle = (condition: boolean, style: any) => {
    return condition ? style : undefined;
  };

  // Phone input container style with type safety
  const phoneInputContainerStyle: ViewStyle = {
    ...styles.phoneInputContainer,
    borderColor: errors.phone ? '#ef4444' : '#e5e7eb',
  };

  // Input style helper
  const getInputStyle = (hasError: boolean) => [styles.input, hasError ? styles.inputError : null];

  // Format displayed phone number
  const displayPhoneNumber = phoneNumber ? formatPhoneNumber(phoneNumber) : '';

  // Función para generar un código de 4 dígitos
  const generateVerificationCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Función para enviar el código de verificación por correo
  const sendEmailVerificationCode = async () => {
    try {
      setIsSendingEmail(true);
      setEmailVerificationError('');
      
      // En un entorno real, aquí harías una llamada a tu backend para enviar el correo
      // Por ahora, simulamos el envío con un timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar y guardar el código (en producción, el backend lo generaría)
      const code = generateVerificationCode();
      // En producción, el código se enviaría por correo aquí
      console.log('Código de verificación por correo (solo para desarrollo):', code);
      
      setEmailVerificationSent(true);
      setEmailVerificationError('');
    } catch (error) {
      console.error('Error al enviar el código por correo:', error);
      setEmailVerificationError('Error al enviar el código. Intenta de nuevo.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Función para verificar el código de correo ingresado
  const verifyEmailCode = async () => {
    if (emailVerificationCode.length !== 4) {
      setEmailVerificationError('El código debe tener 4 dígitos');
      return;
    }
    
    try {
      setIsVerifying(true);
      setEmailVerificationError('');
      
      // En un entorno real, aquí validarías el código con tu backend
      // Por ahora, simulamos la verificación con un timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Si llegamos aquí, la verificación fue exitosa
      setEmailVerificationError('');
      setIsEmailVerified(true);
      
      // Mostrar mensaje de éxito
      alert('¡Correo verificado exitosamente!');
      
    } catch (error) {
      console.error('Error al verificar el código:', error);
      setEmailVerificationError('Código incorrecto. Intenta de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Función para enviar el código de verificación
  const sendVerificationCode = async () => {
    try {
      setIsSendingCode(true);
      setVerificationError('');
      
      // En un entorno real, aquí harías una llamada a tu backend para enviar el SMS
      // Por ahora, simulamos el envío con un timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar y guardar el código (en producción, el backend lo generaría)
      const code = generateVerificationCode();
      // En producción, el código se enviaría por SMS aquí
      console.log('Código de verificación (solo para desarrollo):', code);
      
      setVerificationSent(true);
      setVerificationError('');
    } catch (error) {
      console.error('Error al enviar el código:', error);
      setVerificationError('Error al enviar el código. Intenta de nuevo.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Función para verificar el código ingresado
  const verifyCode = async () => {
    if (verificationCode.length !== 4) {
      setVerificationError('El código debe tener 4 dígitos');
      return;
    }
    
    try {
      setIsVerifying(true);
      setVerificationError('');
      
      // En un entorno real, aquí validarías el código con tu backend
      // Por ahora, simulamos la verificación con un timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Si llegamos aquí, la verificación fue exitosa
      setVerificationError('');
      setCurrentStep(2); // Pasar al siguiente paso
    } catch (error) {
      console.error('Error al verificar el código:', error);
      setVerificationError('Código incorrecto. Intenta de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Enviar registro a la cola pendiente y notificar al administrador
  const submitRegistration = async () => {
    try {
      setIsLoading(true);
      
      // Validar que todos los campos requeridos estén completos
      const requiredFields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
      
      if (missingFields.length > 0) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos');
        setIsLoading(false);
        return;
      }
      
      // Validar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
        setIsLoading(false);
        return;
      }
      
      // Validar fortaleza de contraseña
      if (formData.password.length < 8) {
        Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
        setIsLoading(false);
        return;
      }
      
      // Validar que se hayan subido los documentos requeridos para proveedores
      if (formData.userType === 'provider' && (!formData.dniFront || !formData.dniBack)) {
        Alert.alert('Error', 'Por favor sube las fotos de tu DNI (frente y dorso)');
        setIsLoading(false);
        return;
      }

      console.log('Iniciando registro de usuario...');
      
      // 1. Preparar datos de dirección con manejo seguro de valores undefined
      const direccion = {
        calle: formData.address?.trim() || '',
        numero: '0', // Valor por defecto para el número
        piso: formData.piso?.trim() || '',
        departamento: formData.departamento?.trim() || '',
        codigoPostal: formData.postalCode?.trim() || '',
        ciudad: formData.ciudad?.trim() || formData.city?.trim() || '',
        provincia: formData.province?.trim() || '',
        pais: formData.country?.trim() || 'Argentina'
      };

      // Validar campos obligatorios de dirección
      const requiredAddressFields = [
        { key: 'calle', label: 'Dirección' },
        { key: 'codigoPostal', label: 'Código Postal' },
        { key: 'ciudad', label: 'Ciudad' },
        { key: 'provincia', label: 'Provincia' },
        { key: 'pais', label: 'País' }
      ];
      
      const missingAddressFields = requiredAddressFields
        .filter(({ key }) => !direccion[key as keyof typeof direccion]?.trim())
        .map(({ label }) => label);

      if (missingAddressFields.length > 0) {
        Alert.alert(
          'Error', 
          `Por favor completa los siguientes campos obligatorios de dirección:\n\n• ${missingAddressFields.join('\n• ')}`
        );
        setIsLoading(false);
        return;
      }

      // 2. Crear perfil de usuario
      const userProfile = {
        nombre: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        telefono: formData.phone.trim(),
        tipo: formData.userType,
        estado: 'pending',
        is_active: false,
        is_verified: false,
        verification_status: 'pending',
        direccion: {
          calle: direccion.calle,
          numero: direccion.numero,
          piso: direccion.piso,
          departamento: direccion.departamento,
          codigoPostal: direccion.codigoPostal,
          ciudad: direccion.ciudad,
          provincia: direccion.provincia,
          pais: direccion.pais
        },
        ...(formData.userType === 'provider' && formData.profession && {
          profession: formData.profession.trim()
        })
      };

      // 2. Registrar el usuario en Supabase Auth
      const { data: signUpData, error: signUpError } = await signUpWithEmail({
        email: userProfile.email,
        password: formData.password,
        metadata: {
          full_name: userProfile.nombre,
          phone: userProfile.telefono,
          userType: userProfile.tipo,
          direccion: userProfile.direccion,
          ...(formData.userType === 'provider' && formData.profession && {
            profession: formData.profession.trim()
          })
        }
      });

      if (signUpError) {
        console.error('Error en signUpWithEmail:', signUpError);
        throw signUpError;
      }

      if (!signUpData?.user) {
        throw new Error('No se pudo crear el usuario en Auth');
      }

      console.log('Usuario registrado en Auth:', signUpData.user.id);

      // 3. Subir documentos si es proveedor
      if (formData.userType === 'provider') {
        try {
          console.log('Subiendo documentos del proveedor...');
          
          if (formData.dniFront) {
            console.log('Subiendo DNI frontal...');
            const frontUrl = await uploadFile(
              formData.dniFront, 
              `users/${signUpData.user.id}/documents`,
              'dni_front'
            );
            
            // Agregar el documento al array de documentos
            userProfile.documentos.push({
              tipo: 'dni_front',
              url: frontUrl,
              estado: 'pendiente',
              fecha_subida: new Date().toISOString()
            });
            console.log('DNI frontal subido:', frontUrl);
          }
          
          if (formData.dniBack) {
            console.log('Subiendo DNI dorso...');
            const backUrl = await uploadFile(
              formData.dniBack,
              `users/${signUpData.user.id}/documents`,
              'dni_back'
            );
            
            // Agregar el documento al array de documentos
            userProfile.documentos.push({
              tipo: 'dni_back',
              url: backUrl,
              estado: 'pendiente',
              fecha_subida: new Date().toISOString()
            });
            console.log('DNI dorso subido:', backUrl);
          }
        } catch (uploadError) {
          console.error('Error al subir documentos:', uploadError);
          // Continuar a pesar del error de subida
          Alert.alert(
            'Advertencia', 
            'Se completó el registro, pero hubo un problema al subir algunos documentos. ' +
            'Un administrador se pondrá en contacto contigo para solucionarlo.'
          );
        }
      }

      // 4. Crear perfil de usuario en la base de datos
      console.log('Creando perfil de usuario...', userProfile);
      const profile = await createUserProfile(signUpData.user.id, {
        ...userProfile,
        // Asegurarse de que los campos requeridos estén presentes
        estado: 'pending',
        is_active: false,
        is_verified: false,
        verification_status: 'pending',
        verification_step: 'phone'
      });
      console.log('Perfil de usuario creado:', profile);

      // 5. Mostrar mensaje de éxito
      Alert.alert(
        '¡Registro exitoso! 🎉',
        'Tu cuenta ha sido creada exitosamente. ' +
        'Un administrador revisará tu documentación y te notificará por correo electrónico cuando tu cuenta sea activada. ' +
        'Este proceso puede tardar hasta 24-48 horas hábiles.\n\n' +
        '¿Qué puedes hacer mientras tanto?\n' +
        '• Revisa tu correo electrónico para confirmar tu cuenta.\n' +
        '• Asegúrate de que toda tu información sea correcta.\n' +
        '• Prepárate para comenzar a usar la aplicación una vez aprobada.',
        [
          {
            text: 'Entendido',
            onPress: () => {
              // Limpiar el formulario
              setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                userType: 'client',
                profession: '',
                address: '',
                city: '',
                province: '',
                postalCode: '',
                dniFront: '',
                dniBack: ''
              });
              // Navegar al login
              navigation.navigate('Login');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Error en el registro:', error);
      let errorMessage = 'Ocurrió un error al procesar tu registro. Por favor, intenta de nuevo más tarde.';
      
      // Manejar errores específicos
      if (error.message) {
        if (error.message.includes('already registered') || error.message.includes('already in use')) {
          errorMessage = 'Este correo electrónico ya está registrado. Por favor, inicia sesión o utiliza otro correo.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'El formato del correo electrónico no es válido.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleNext = async () => {
    const stepErrors: Partial<FormData> = {};
    let hasErrors = false;

    if (currentStep === 1) {
      // Validar nombre
      if (!formData.name.trim()) {
        stepErrors.name = 'El nombre es requerido';
        hasErrors = true;
      }

      // Validar correo electrónico
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        stepErrors.email = emailValidation.message;
        hasErrors = true;
      } else if (!isEmailVerified && !emailVerificationSent) {
        // Si el correo es válido pero no está verificado, enviamos el código
        await sendEmailVerificationCode();
        return; // No avanzamos hasta que se verifique el correo
      } else if (!isEmailVerified && emailVerificationSent) {
        // Si ya se envió el código pero no se ha verificado, mostramos error
        setEmailVerificationError('Por favor verifica tu correo electrónico');
        return;
      }
      
      // Validar teléfono solo si el correo es válido y verificado
      if (emailValidation.isValid && isEmailVerified) {
        const phoneValidation = validatePhone(formData.phone, countryCode, phoneNumber);
        if (!phoneValidation.isValid) {
          stepErrors.phone = phoneValidation.message;
          hasErrors = true;
        } else if (!verificationSent) {
          // Si el teléfono es válido y no se ha enviado el código, lo enviamos
          await sendVerificationCode();
          return; // No avanzamos hasta que se verifique el código
        } else if (verificationSent) {
          // Si ya se envió el código pero no se ha verificado, mostramos error
          setVerificationError('Por favor verifica tu número de teléfono');
          return;
        }
      }
    } else if (currentStep === 2) {
      // Validar imágenes de DNI
      if (!formData.dniFront) {
        stepErrors.dniFront = 'Sube una foto clara del frente del DNI';
        hasErrors = true;
      }
      if (!formData.dniBack) {
        stepErrors.dniBack = 'Sube una foto clara del reverso del DNI';
        hasErrors = true;
      }

      // Password validation for step 2
      if (!formData.password) {
        stepErrors.password = 'La contraseña es requerida';
        hasErrors = true;
      } else if (formData.password.length < 8) {
        stepErrors.password = 'Mínimo 8 caracteres';
        hasErrors = true;
      } else if (passwordStrength < 2) {
        stepErrors.password = 'La contraseña es muy débil';
        hasErrors = true;
      }

      if (formData.password !== formData.confirmPassword) {
        hasErrors = true;
      }

      // Validación específica para profesionales
      if (formData.userType === 'provider') {
        if (!formData.profession || !formData.profession.trim()) {
          (stepErrors as Partial<FormData>).profession = 'La profesión es requerida';
          hasErrors = true;
        }
      }

      // Localidad se deriva de provincia + ciudad (Opción A)
      // No se valida explícitamente la localidad en el paso 1

      // Validar aceptación de términos
      if (!termsAccepted) {
        (stepErrors as any).terms = 'Debes aceptar los términos y condiciones';
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(stepErrors);
      
      // Scroll to the first error
      if (Object.keys(stepErrors).length > 0) {
        const firstError = Object.keys(stepErrors)[0] as keyof FormData;
        const element = document.getElementById(firstError);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    // If we're on the first step and everything is valid, move to the next step
    if (currentStep === 1) {
      // Here you could add an API call to check if email is already registered
      // before proceeding to the next step
      setCurrentStep(2);
    } else {
      // On step 2 completion: send to pending and go to step 3 (pendiente de aprobación)
      await submitRegistration();
      setCurrentStep(3);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[ '#0ea5a3', '#10b981', '#16a34a' ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#ecfdf5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepContainer}>
          <View style={[
            styles.step,
            currentStep > 1 ? styles.stepCompleted : styles.stepActive
          ]}>
            <Text style={[
              styles.stepText,
              currentStep === 1 && styles.stepTextActive
            ]}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[
            styles.step,
            currentStep > 2 ? styles.stepCompleted : (currentStep === 2 ? styles.stepActive : styles.stepDisabled)
          ]}>
            <Text style={[
              styles.stepText,
              currentStep === 2 && styles.stepTextActive
            ]}>2</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[
            styles.step,
            currentStep === 3 ? styles.stepActive : styles.stepDisabled
          ]}>
            <Text style={[
              styles.stepText,
              currentStep === 3 && styles.stepTextActive
            ]}>3</Text>
          </View>
        </View>

        <View style={[styles.panel, styles.form]}>
          {currentStep === 1 && (
            <>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput
                  id="name"
                  style={getInputStyle(!!errors.name)}
                  value={formData.name}
                  onChangeText={(value) => updateFormData("name", value)}
                  placeholder="Tu nombre completo"
                  autoCapitalize="words"
                  onBlur={() => {
                    if (!formData.name.trim()) {
                      setErrors(prev => ({ ...prev, name: 'El nombre es requerido' }));
                    }
                  }}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Localidad (derivada de Provincia + Ciudad) */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Localidad</Text>
                <TextInput
                  id="locality"
                  style={getInputStyle(!!errors.locality)}
                  value={formData.locality || ''}
                  placeholder={formData.province && formData.city ? `${formData.city}, ${formData.province}` : 'Se completará al elegir provincia y ciudad'}
                  editable={false}
                  selectTextOnFocus={false}
                />
                {/* Sin error de localidad: se valida provincia/ciudad */}
              </View>

              {/* Dirección */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  id="address"
                  style={getInputStyle(!!errors.address)}
                  value={formData.address || ''}
                  onChangeText={(value) => updateFormData("address", value)}
                  placeholder="Calle y número"
                  onBlur={() => {
                    if (!formData.address?.trim()) {
                      setErrors(prev => ({ ...prev, address: 'La dirección es requerida' }));
                    }
                  }}
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>

              {/* Piso y Departamento */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={[styles.inputContainer, { width: '48%' }]}>
                  <Text style={styles.label}>Piso (opcional)</Text>
                  <TextInput
                    id="piso"
                    style={getInputStyle(!!errors.piso)}
                    value={formData.piso || ''}
                    onChangeText={(value) => updateFormData("piso", value)}
                    placeholder="Piso"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.inputContainer, { width: '48%' }]}>
                  <Text style={styles.label}>Depto (opcional)</Text>
                  <TextInput
                    id="departamento"
                    style={getInputStyle(!!errors.departamento)}
                    value={formData.departamento || ''}
                    onChangeText={(value) => updateFormData("departamento", value)}
                    placeholder="Departamento"
                  />
                </View>
              </View>

              {/* Código Postal */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Código Postal</Text>
                <TextInput
                  id="postalCode"
                  style={getInputStyle(!!errors.postalCode)}
                  value={formData.postalCode || ''}
                  onChangeText={(value) => updateFormData("postalCode", value.replace(/[^0-9]/g, ''))}
                  placeholder="Código postal"
                  keyboardType="number-pad"
                  maxLength={8}
                  onBlur={() => {
                    if (!formData.postalCode?.trim()) {
                      setErrors(prev => ({ ...prev, postalCode: 'El código postal es requerido' }));
                    } else if (formData.postalCode.length < 4) {
                      setErrors(prev => ({ ...prev, postalCode: 'Código postal inválido' }));
                    }
                  }}
                />
                {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}
              </View>

              {/* Provincia (AR) */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Provincia</Text>
                <TouchableOpacity
                  id="province"
                  activeOpacity={0.8}
                  style={[getInputStyle(!!errors.province), styles.dropdownSelector]}
                  onPress={() => setShowProvinceDropdown(prev => !prev)}
                >
                  <Text style={formData.province ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {formData.province || 'Selecciona tu provincia'}
                  </Text>
                  <Ionicons name={showProvinceDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
                </TouchableOpacity>
                {showProvinceDropdown && (
                  <View style={styles.dropdownList}>
                    <TextInput
                      style={styles.dropdownSearchInput}
                      value={provinceQuery}
                      onChangeText={setProvinceQuery}
                      placeholder="Buscar provincia..."
                    />
                    {provinces
                      .filter(p => !provinceQuery || p.toLowerCase().includes(provinceQuery.toLowerCase()))
                      .map(p => (
                      <TouchableOpacity
                        key={p}
                        style={styles.dropdownItem}
                        onPress={() => {
                          updateFormData('province', p);
                          setProvinceQuery('');
                          // Reset city and locality when province changes
                          updateFormData('city', '');
                          updateFormData('locality', '');
                          setCityQuery('');
                          setShowProvinceDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {errors.province && <Text style={styles.errorText}>{errors.province}</Text>}
              </View>

              {/* Ciudad/Barrio (AR) dependiente de provincia */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ciudad/Barrio</Text>
                <TouchableOpacity
                  id="city"
                  activeOpacity={!!formData.province ? 0.8 : 1}
                  style={[getInputStyle(!!errors.city), styles.dropdownSelector, !formData.province && styles.dropdownDisabled]}
                  onPress={() => {
                    if (formData.province) setShowCityDropdown(prev => !prev);
                  }}
                >
                  <Text style={(formData.city && formData.province) ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {formData.province ? (formData.city || 'Selecciona tu ciudad/barrio') : 'Primero selecciona una provincia'}
                  </Text>
                  <Ionicons name={showCityDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
                </TouchableOpacity>
                {showCityDropdown && formData.province && (
                  <View style={styles.dropdownList}>
                    <TextInput
                      style={styles.dropdownSearchInput}
                      value={cityQuery}
                      onChangeText={setCityQuery}
                      placeholder="Buscar ciudad/barrio..."
                    />
                    {(citiesByProvince[formData.province] || [])
                      .filter(c => !cityQuery || c.toLowerCase().includes(cityQuery.toLowerCase()))
                      .map(c => (
                      <TouchableOpacity
                        key={c}
                        style={styles.dropdownItem}
                        onPress={() => {
                          updateFormData('city', c);
                          // Derivar localidad: "Ciudad, Provincia"
                          updateFormData('locality', `${c}, ${formData.province || ''}`.trim());
                          setCityQuery('');
                          setShowCityDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                  id="email"
                  style={getInputStyle(!!errors.email)}
                  value={formData.email}
                  onChangeText={(value) => updateFormData("email", value)}
                  placeholder="tu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={() => {
                    const validation = validateEmail(formData.email);
                    if (!validation.isValid) {
                      setErrors(prev => ({ ...prev, email: validation.message }));
                    } else {
                      setErrors(prev => ({ ...prev, email: '' }));
                      // Si el correo cambia, reiniciamos la verificación
                      if (formData.email !== (emailVerificationSent as any)) {
                        setIsEmailVerified(false);
                        setEmailVerificationSent(false);
                        setEmailVerificationCode('');
                      }
                    }
                  }}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                
                {/* Sección de verificación de correo */}
                {emailVerificationSent && !isEmailVerified && (
                  <View style={styles.verificationContainer}>
                    <Text style={styles.verificationText}>
                      Hemos enviado un código de verificación a {formData.email}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        emailVerificationError ? styles.inputError : null,
                        styles.verificationInput
                      ]}
                      value={emailVerificationCode}
                      onChangeText={setEmailVerificationCode}
                      placeholder="Código de 4 dígitos"
                      keyboardType="number-pad"
                      maxLength={4}
                      autoFocus={true}
                    />
                    {emailVerificationError ? (
                      <Text style={styles.errorText}>{emailVerificationError}</Text>
                    ) : null}
                    
                    <TouchableOpacity
                      style={[styles.verifyButton, (isVerifying || emailVerificationCode.length !== 4) && styles.verifyButtonDisabled]}
                      onPress={verifyEmailCode}
                      disabled={isVerifying || emailVerificationCode.length !== 4}
                    >
                      {isVerifying ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.verifyButtonText}>Verificar Correo</Text>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.resendCodeButton}
                      onPress={sendEmailVerificationCode}
                      disabled={isSendingEmail}
                    >
                      <Text style={styles.resendCodeText}>
                        {isSendingEmail ? 'Enviando...' : 'Reenviar código'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {isEmailVerified && (
                  <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.successText}>Correo verificado exitosamente</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono</Text>
                <View style={[styles.phoneInputContainer, errors.phone ? styles.inputError : null]}>
                  <TouchableOpacity
                    style={styles.countryPickerButton}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <View style={styles.countrySelector}>
                      <View style={styles.flagContainer}>
                        <Flag countryCode={countryCode} size={20} />
                      </View>
                      <Text style={styles.countryCodeText}>+{callingCode}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6b7280" />
                    </View>
                  </TouchableOpacity>
                <TextInput
                  id="phone"
                  style={styles.phoneInput}
                  value={formatPhoneNumber(phoneNumber)}
                  onChangeText={handlePhoneNumberChange}
                  placeholder="123 456 7890"
                  keyboardType="phone-pad"
                  maxLength={12}
                  onBlur={() => {
                    const validation = validatePhone(formData.phone, countryCode, phoneNumber);
                    if (!validation.isValid) {
                      setErrors(prev => ({ ...prev, phone: validation.message }));
                    } else {
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }
                  }}
                />
                {showCountryPicker && (
                  <CountryPicker
                    countryCode={countryCode}
                    withFilter
                    withFlagButton={false}
                    withCallingCode
                    withAlphaFilter
                    withEmoji={true}
                    withCallingCodeButton={false}
                    onSelect={onSelectCountry}
                    visible={showCountryPicker}
                    onClose={() => setShowCountryPicker(false)}
                    containerButtonStyle={styles.countryPickerContainer}
                    theme={{
                      primaryColor: '#3b82f6',
                      primaryColorVariant: '#2563eb',
                      onBackgroundTextColor: '#1f2937',
                      backgroundColor: '#ffffff',
                    }}
                    renderFlagButton={() => null}
                  />
                )}
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              
              {/* Sección de verificación */}
              {verificationSent && (
                <View style={styles.verificationContainer}>
                  <Text style={styles.verificationText}>
                    Hemos enviado un código de verificación al número {`+${callingCode} ${formatPhoneNumber(phoneNumber)}`}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      verificationError ? styles.inputError : null,
                      styles.verificationInput
                    ]}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="Código de 4 dígitos"
                    keyboardType="number-pad"
                    maxLength={4}
                    autoFocus={true}
                  />
                  {verificationError ? (
                    <Text style={styles.errorText}>{verificationError}</Text>
                  ) : null}
                  
                  <TouchableOpacity
                    style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
                    onPress={verifyCode}
                    disabled={isVerifying || verificationCode.length !== 4}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verificar Código</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.resendCodeButton}
                    onPress={sendVerificationCode}
                    disabled={isSendingCode}
                  >
                    <Text style={styles.resendCodeText}>
                      {isSendingCode ? 'Enviando...' : 'Reenviar código'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Navigation Buttons */}
              <View style={styles.navButtons}>
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    (isLoading || !formData.name || !formData.email || !formData.phone) && styles.nextButtonDisabled
                  ]}
                  onPress={handleNext}
                  disabled={isLoading || !formData.name || !formData.email || !formData.phone || verificationSent}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.nextButtonText}>
                      {verificationSent ? 'Verificando...' : 'Siguiente'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
          )}
          
          {currentStep === 2 && (
            <View style={styles.identityContainer}>
              <Text style={styles.sectionTitle}>Verificación de Identidad</Text>
              <Text style={styles.sectionSubtitle}>
                Para completar tu registro, necesitamos verificar tu identidad. Por favor, sube fotos claras de tu DNI.
              </Text>
              
              {/* Frente del DNI */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadTitle}>Frente del DNI</Text>
                <Text style={styles.uploadDescription}>
                  Toma una foto del frente de tu DNI. Asegúrate de que todos los datos sean claramente visibles.
                </Text>
                
                {dniFrontPreview ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: dniFrontPreview }} 
                      style={styles.imagePreview}
                      resizeMode="contain"
                    />
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={handleRemoveDniFront}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                      <Text style={styles.removeButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={handleSelectDniFront}
                    disabled={isUploadingDniFront}
                  >
                    {isUploadingDniFront ? (
                      <ActivityIndicator color="#3b82f6" />
                    ) : (
                      <>
                        <Ionicons name="camera" size={24} color="#065f46" />
                        <Text style={styles.uploadButtonText}>Seleccionar Frente del DNI</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {errors.dniFront && <Text style={styles.errorText}>{errors.dniFront}</Text>}
              </View>
              
              {/* Reverso del DNI */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadTitle}>Reverso del DNI</Text>
                <Text style={styles.uploadDescription}>
                  Ahora, toma una foto del reverso de tu DNI. Asegúrate de que todos los datos sean claramente visibles.
                </Text>
                
                {dniBackPreview ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: dniBackPreview }} 
                      style={styles.imagePreview}
                      resizeMode="contain"
                    />
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={handleRemoveDniBack}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                      <Text style={styles.removeButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={handleSelectDniBack}
                    disabled={isUploadingDniBack}
                  >
                    {isUploadingDniBack ? (
                      <ActivityIndicator color="#3b82f6" />
                    ) : (
                      <>
                        <Ionicons name="camera" size={24} color="#065f46" />
                        <Text style={styles.uploadButtonText}>Seleccionar Reverso del DNI</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {errors.dniBack && <Text style={styles.errorText}>{errors.dniBack}</Text>}
              </View>
              
              {/* Campos de contraseña */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  id="password"
                  style={getInputStyle(!!errors.password)}
                  value={formData.password}
                  onChangeText={(value) => updateFormData("password", value)}
                  placeholder="Crea una contraseña segura"
                  secureTextEntry={!showPassword}
                  onBlur={() => {
                    if (!formData.password) {
                      setErrors(prev => ({ ...prev, password: 'La contraseña es requerida' }));
                    } else if (formData.password.length < 8) {
                      setErrors(prev => ({ ...prev, password: 'Mínimo 8 caracteres' }));
                    } else {
                      setErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                />
                <View style={styles.passwordStrengthContainer}>
                  <View 
                    style={[
                      styles.passwordStrengthBar, 
                      { 
                        width: `${passwordStrength * 33.33}%`,
                        backgroundColor: 
                          passwordStrength === 0 ? '#ef4444' : 
                          passwordStrength === 1 ? '#f59e0b' :
                          '#10b981'
                      }
                    ]} 
                  />
                </View>
                <View style={styles.passwordToggle}>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Contraseña</Text>
                <TextInput
                  id="confirmPassword"
                  style={getInputStyle(!!errors.confirmPassword)}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData("confirmPassword", value)}
                  placeholder="Vuelve a escribir tu contraseña"
                  secureTextEntry={!showConfirmPassword}
                  onBlur={() => {
                    if (formData.password !== formData.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
                    } else {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                />
                <View style={styles.passwordToggle}>
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              {/* Profesión - solo para profesionales */}
              {formData.userType === 'provider' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Profesión</Text>
                  <TextInput
                    id="profession"
                    style={getInputStyle(!!errors.profession)}
                    value={formData.profession || ''}
                    onChangeText={(value) => updateFormData('profession', value)}
                    placeholder="Ej.: Electricista, Plomero, Albañil"
                    autoCapitalize="words"
                    onBlur={() => {
                      if (!formData.profession || !formData.profession.trim()) {
                        setErrors(prev => ({ ...prev, profession: 'La profesión es requerida' }));
                      } else {
                        setErrors(prev => ({ ...prev, profession: '' }));
                      }
                    }}
                  />
                  {errors.profession && <Text style={styles.errorText}>{errors.profession}</Text>}
                </View>
              )}
              
              <View style={styles.termsContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                >
                  <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                    {termsAccepted && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                  </View>
                  <Text style={styles.termsText}>
                    Acepto los <Text style={styles.termsLink}>Términos y Condiciones</Text> y la <Text style={styles.termsLink}>Política de Privacidad</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
              </View>

              {/* Navigation Buttons for Step 2 */}
              <View style={styles.navButtons}>
                <TouchableOpacity
                  style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
                  onPress={handleNext}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.nextButtonText}>Continuar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Step 3: Welcome and Verification Pending */}
          {currentStep === 3 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark" size={48} color="#fff" />
              </View>
              
              <Text style={styles.welcomeTitle}>¡Bienvenido a ServiGO!</Text>
              
              <Text style={styles.welcomeMessage}>
                Tu registro se ha completado exitosamente. Estamos verificando tu información para activar tu cuenta.
              </Text>
              
              <View style={styles.verificationInfo}>
                <Ionicons name="time-outline" size={24} color="#f59e0b" style={styles.verificationIcon} />
                <Text style={styles.verificationText}>
                  Tu perfil está sujeto a verificación. Te notificaremos por correo electrónico una vez que tu cuenta haya sido verificada.
                </Text>
              </View>
              
              <View style={styles.tipBox}>
                <Ionicons name="bulb-outline" size={20} color="#92400e" />
                <Text style={styles.tipText}>
                  Mientras tanto, puedes explorar la aplicación y configurar tu perfil.
                </Text>
              </View>

              {/* Botón para ir al inicio de sesión */}
              <View style={{ marginTop: 24, width: '100%', alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.nextButtonText}>Ir al inicio de sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

export default RegisterScreen;
