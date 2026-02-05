import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type PaymentMethodsScreenProps = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;

type PaymentMethodType = 'credit_card' | 'debit_card' | 'efectivo' | 'mercadopago';

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description: string;
  isDefault: boolean;
  lastFour?: string;
  brand?: string;
  expirationDate?: string;
}

const getPaymentMethodIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'credit_card':
      return 'card-outline';
    case 'debit_card':
      return 'card-outline';
    case 'efectivo':
      return 'cash-outline';
    case 'mercadopago':
      return 'wallet-outline';
    default:
      return 'card-outline';
  }
};

const PaymentMethods = ({ navigation, route }: PaymentMethodsScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  const { refresh } = route?.params || {};

    const loadPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Example data - replace with actual API call
      const methods: PaymentMethod[] = [
        {
          id: '1',
          type: 'credit_card',
          name: 'Visa •••• 4242',
          description: 'Visa terminada en 4242',
          isDefault: true,
          lastFour: '4242',
          brand: 'visa',
          expirationDate: '12/25'
        },
        {
          id: '2',
          type: 'efectivo',
          name: 'Efectivo',
          description: 'Pago en efectivo al recibir el servicio',
          isDefault: false
        },
        {
          id: '3',
          type: 'mercadopago',
          name: 'Mercado Pago',
          description: 'Paga con tu cuenta de Mercado Pago',
          isDefault: false
        }
      ];
      
      setPaymentMethods(methods);
      const defaultMethod = methods.find(method => method.isDefault);
      setSelectedMethod(defaultMethod?.id || null);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'No se pudieron cargar los métodos de pago');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load payment methods on mount and when refresh changes
  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);
  
  // Handle refresh when the refresh param changes
  useEffect(() => {
    if (refresh === true) {
      loadPaymentMethods();
    }
  }, [refresh, loadPaymentMethods]);

  const handleAddCard = () => {
    Alert.alert(
      'Agregar tarjeta',
      'Esta funcionalidad abrirá el formulario seguro de Mercado Pago para agregar una tarjeta.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar',
          onPress: () => {
            const newCard: PaymentMethod = {
              id: `card_${Date.now()}`,
              type: 'credit_card',
              name: 'Nueva tarjeta',
              description: 'Tarjeta recién agregada',
              isDefault: false,
              lastFour: '1234',
              brand: 'visa',
              expirationDate: '12/25'
            };
            
            setPaymentMethods(prev => [...prev, newCard]);
            setSelectedMethod(newCard.id);
          },
        },
      ]
    );
  };
  
  const handleSetAsDefault = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    setSelectedMethod(methodId);
    Alert.alert('Éxito', 'Método de pago predeterminado actualizado');
  };
  
  const handlePayWithMercadoPago = () => {
    Alert.alert(
      'Pagar con Mercado Pago',
      'Serás redirigido a Mercado Pago para completar el pago de forma segura.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar',
          onPress: () => {
            // In a real app, integrate with Mercado Pago SDK
            Alert.alert('Pago exitoso', 'Tu pago se ha procesado correctamente');
          },
        },
      ]
    );
  };
  
  const handlePayInCash = () => {
    Alert.alert(
      'Pago en efectivo',
      'El pago se realizará en efectivo cuando recibas el servicio. ¿Deseas continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            Alert.alert('Confirmación', 'Has seleccionado pago en efectivo');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Métodos de pago guardados</Text>
        
        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedMethodCard
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View style={styles.methodHeader}>
              <Ionicons 
                name={getPaymentMethodIcon(method.type)}
                size={24} 
                color={selectedMethod === method.id ? '#4f46e5' : '#6b7280'} 
              />
              <Text style={[
                styles.methodName,
                selectedMethod === method.id && styles.selectedMethodText
              ]}>
                {method.name}
              </Text>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Predeterminado</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.methodDescription}>
              {method.description}
            </Text>
            
            {method.lastFour && (
              <Text style={styles.methodDetails}>
                Terminada en {method.lastFour} • Vence {method.expirationDate}
              </Text>
            )}
            
            <View style={styles.methodActions}>
              {!method.isDefault && (
                <TouchableOpacity 
                  style={styles.setDefaultButton}
                  onPress={() => handleSetAsDefault(method.id)}
                >
                  <Text style={styles.setDefaultButtonText}>Hacer predeterminado</Text>
                </TouchableOpacity>
              )}
              
              {method.type === 'credit_card' && (
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCard}
        >
          <Ionicons name="add-circle-outline" size={24} color="#4f46e5" />
          <Text style={styles.addButtonText}>Agregar tarjeta</Text>
        </TouchableOpacity>
        
        <View style={styles.paymentActions}>
          <TouchableOpacity 
            style={[styles.payButton, !selectedMethod && styles.disabledButton]}
            disabled={!selectedMethod}
            onPress={() => {
              const method = paymentMethods.find(m => m.id === selectedMethod);
              if (method) {
                if (method.type === 'efectivo') {
                  handlePayInCash();
                } else if (method.type === 'mercadopago') {
                  handlePayWithMercadoPago();
                } else {
                  Alert.alert('Pago', `Procesando pago con ${method.name}`);
                }
              }
            }}
          >
            <Text style={styles.payButtonText}>
              {selectedMethod ? 'Pagar ahora' : 'Selecciona un método de pago'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentMethods;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedMethodCard: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  selectedMethodText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '500',
  },
  methodDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 13,
    color: '#9ca3af',
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  setDefaultButton: {
    padding: 8,
  },
  setDefaultButtonText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  addButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  paymentActions: {
    marginTop: 24,
    marginBottom: 32,
  },
  payButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
