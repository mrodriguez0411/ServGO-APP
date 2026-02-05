// Replace these with your actual Mercado Pago credentials
export const MERCADO_PAGO_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'ticket' | 'bank_transfer' | 'atm' | 'digital_wallet';
  image: string;
  description?: string;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'visa',
    name: 'Visa',
    type: 'credit_card',
    image: 'https://http2.mlstatic.com/secure/org-img/checkout/custom-navigation/mp-logo-120406.png',
  },
  {
    id: 'master',
    name: 'Mastercard',
    type: 'credit_card',
    image: 'https://http2.mlstatic.com/secure/org-img/checkout/custom-navigation/mp-logo-120406.png',
  },
  {
    id: 'amex',
    name: 'American Express',
    type: 'credit_card',
    image: 'https://http2.mlstatic.com/secure/org-img/checkout/custom-navigation/mp-logo-120406.png',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    type: 'digital_wallet',
    image: 'https://http2.mlstatic.com/secure/org-img/checkout/custom-navigation/mp-logo-120406.png',
    description: 'Paga con tu cuenta de Mercado Pago',
  },
  {
    id: 'efectivo',
    name: 'Efectivo',
    type: 'ticket',
    image: 'https://http2.mlstatic.com/secure/org-img/checkout/custom-navigation/mp-logo-120406.png',
    description: 'Paga en efectivo en puntos de pago',
  },
];

export const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
  return paymentMethods.find(method => method.id === id);
};
