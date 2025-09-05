// Frontend/src/utils/paymentMethods.ts
export const normalizePaymentMethod = (method: string): 'efectivo' | 'mercadopago' | 'other' => {
  const normalized = method.toLowerCase().trim();
  
  if (normalized === 'cash' || normalized === 'efectivo') {
    return 'efectivo';
  }
  
  if (normalized === 'card' || normalized === 'transfer' || normalized === 'mercadopago') {
    return 'mercadopago';
  }
  
  return 'other';
};

export const getPaymentMethodDisplayName = (method: string): string => {
  const normalized = normalizePaymentMethod(method);
  return normalized === 'efectivo' ? 'Efectivo' : 
         normalized === 'mercadopago' ? 'Mercado Pago' : 
         method || 'No especificado';
};