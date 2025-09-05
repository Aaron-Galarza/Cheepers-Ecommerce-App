// Frontend/src/hooks/useSalesData.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import authService from '../services/authservice';
import { SelectedAddOn, IAddOn } from '../components/layout/checkout/productlist';
import { getPaymentMethodDisplayName } from '../lib/paymentMethods'; // Importación añadida

// Interfaces
export interface Order {
  _id: string;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  totalAmount: number;
  // Asegúrate de que este tipo en el backend coincida con lo que se envía
  paymentMethod: 'cash' | 'card' | 'transfer'; 
  deliveryType: 'delivery' | 'pickup';
  shippingAddress?: {
    street: string;
    city: string;
  };
  products: Array<{ productId: string; quantity: number; addOns?: SelectedAddOn[] }>;
  createdAt: string;
  status: 'pending' | 'delivered' | 'cancelled';
}

export interface Product {
  _id: string;
  name: string;
  isActive: boolean;
  price: number;
  category: string;
}

interface BestSellingProduct {
  name: string;
  quantity: number;
  percentage: number;
}

interface SalesData {
  period: string;
  sales: number;
}

export interface DailySaleTableItem {
  orderId: string;
  orderSummary: string;
  subtotal: number;
  orderDate: string;
  orderTime: string;
  fullOrderTime: Date;
  paymentMethod: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useSalesData = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allAddOns, setAllAddOns] = useState<Map<string, IAddOn>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRangeFilter, setTimeRangeFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [triggerSearch, setTriggerSearch] = useState<number>(0);
  
  // Los valores 'mercadopago' y 'efectivo' son para el frontend
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'mercadopago' | 'efectivo'>('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const responseConfig = { headers: { Authorization: `Bearer ${token}` } };

      const [productsResponse, addOnsResponse, ordersResponse] = await Promise.all([
        axios.get<Product[]>(`${API_BASE_URL}/api/products`, responseConfig),
        axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons?includeInactive=true`, responseConfig),
        axios.get<Order[]>(`${API_BASE_URL}/api/orders`, responseConfig),
      ]);

      setAllProducts(productsResponse.data);
      setAllOrders(ordersResponse.data);

      const addOnMap = new Map<string, IAddOn>();
      addOnsResponse.data.forEach(ao => addOnMap.set(ao._id, ao));
      setAllAddOns(addOnMap);

    } catch (err: any) {
      console.error('Error al cargar datos para estadísticas:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('No se pudieron cargar los datos. Verifica la conexión o tu sesión.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeRangeFilter !== 'custom' || triggerSearch > 0) {
      fetchData();
    }
  }, [timeRangeFilter, triggerSearch, fetchData]);

  const handleCustomSearch = useCallback(() => {
    if (startDate && endDate) {
      setTriggerSearch(prev => prev + 1);
    } else {
      setError('Por favor, selecciona ambas fechas para el rango personalizado.');
    }
  }, [startDate, endDate]);

  const {
    totalSales,
    totalOrdersCount,
    completedOrdersCount,
    soldProductsCount,
    promosSoldCount,
    bestSellingProducts,
    salesDataForChart,
    topSellingPeriods,
    dailySalesTableData,
    dailyTotalSales,
    deliveryPercentage
  } = useMemo(() => {
    let currentOrders = [...allOrders];
    const now = new Date();

    let filterStartDate: Date | null = null;
    let filterEndDate: Date | null = null;

    if (timeRangeFilter === 'today') {
      filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeRangeFilter === 'week') {
      filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeRangeFilter === 'month') {
      filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeRangeFilter === 'year') {
      filterStartDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      filterEndDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (timeRangeFilter === 'custom' && startDate && endDate) {
      filterStartDate = new Date(startDate + 'T00:00:00');
      filterEndDate = new Date(endDate + 'T23:59:59.999');
    }

    if (filterStartDate && filterEndDate) {
      currentOrders = currentOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getTime() >= filterStartDate!.getTime() && orderDate.getTime() <= filterEndDate!.getTime();
      });
    }

    // LÓGICA DE FILTRADO CORRECTAMENTE MAPEADA - CON DEBUG
    if (paymentMethodFilter !== 'all') {
      console.log('=== FILTRADO EN HOOK useSalesData ===');
      console.log('Filtrando por método de pago:', paymentMethodFilter);
      console.log('Órdenes antes de filtrar:', currentOrders.length);
      
      currentOrders = currentOrders.filter(order => {
        const backendPaymentMethod = order.paymentMethod;
        console.log('Método de pago del backend:', backendPaymentMethod);
        
        if (paymentMethodFilter === 'mercadopago') {
          const result = backendPaymentMethod === 'card' || backendPaymentMethod === 'transfer';
          console.log('¿Es Mercado Pago?', result);
          return result;
        }
        if (paymentMethodFilter === 'efectivo') {
          const result = backendPaymentMethod === 'cash';
          console.log('¿Es Efectivo?', result);
          return result;
        }
        return false;
      });
      
      console.log('Órdenes después de filtrar:', currentOrders.length);
      console.log('=====================================');
    }

    const deliveredOrders = currentOrders.filter(order => order.status === 'delivered');

    const calculatedTotalSales = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const calculatedTotalOrdersCount = currentOrders.length;
    const calculatedCompletedOrdersCount = deliveredOrders.length;

    const deliveredOrdersForDeliveryPercentage = deliveredOrders.filter(order => order.deliveryType === 'delivery');
    const calculatedDeliveryPercentage = calculatedCompletedOrdersCount > 0
      ? (deliveredOrdersForDeliveryPercentage.length / calculatedCompletedOrdersCount) * 100
      : 0;

    let calculatedSoldProductsCount = 0;
    let calculatedPromosSoldCount = 0;

    deliveredOrders.forEach(order => {
      order.products.forEach(item => {
        const product = allProducts.find(p => p._id === item.productId);
        if (product) {
          if (product.category === 'Promos Solo en Efectivo') {
            calculatedPromosSoldCount += item.quantity;
          } else {
            calculatedSoldProductsCount += item.quantity;
          }
        }
      });
    });

    const productSalesMap = new Map<string, { quantity: number; totalAmount: number }>();
    deliveredOrders.forEach(order => {
      order.products.forEach(item => {
        const product = allProducts.find(p => p._id === item.productId);
        const current = productSalesMap.get(item.productId) || { quantity: 0, totalAmount: 0 };
        productSalesMap.set(item.productId, {
          quantity: current.quantity + item.quantity,
          totalAmount: current.totalAmount + (item.quantity * (product?.price || 0))
        });
      });
    });

    const bestSelling: BestSellingProduct[] = Array.from(productSalesMap.entries())
      .map(([productId, data]) => {
        const product = allProducts.find(p => p._id === productId);
        return {
          name: product?.name || 'Producto Desconocido',
          quantity: data.quantity,
          percentage: 0
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const totalQuantitySold = bestSelling.reduce((sum, p) => sum + p.quantity, 0);
    const bestSellingWithPercentage = bestSelling.map(p => ({
      ...p,
      percentage: totalQuantitySold > 0 ? (p.quantity / totalQuantitySold) * 100 : 0
    }));

    let allSalesData: SalesData[] = [];
    if (timeRangeFilter === 'year') {
      const monthlySalesMap = new Map<string, number>();
      deliveredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        monthlySalesMap.set(monthKey, (monthlySalesMap.get(monthKey) || 0) + order.totalAmount);
      });
      allSalesData = Array.from(monthlySalesMap.entries())
        .map(([period, sales]) => ({ period, sales }));
    } else {
      const dailySalesMap = new Map<string, number>();
      deliveredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const day = orderDate.getDate();
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dailySalesMap.set(dateKey, (dailySalesMap.get(dateKey) || 0) + order.totalAmount);
      });
      allSalesData = Array.from(dailySalesMap.entries())
        .map(([period, sales]) => ({ period, sales }));
    }

    const calculatedSalesDataForChart = [...allSalesData].sort((a, b) => a.period.localeCompare(b.period));

    let calculatedTopSellingPeriods = [...allSalesData].sort((a, b) => b.sales - a.sales);

    if (timeRangeFilter === 'week') {
      calculatedTopSellingPeriods = calculatedTopSellingPeriods.slice(0, 3);
    } else if (timeRangeFilter === 'month') {
      calculatedTopSellingPeriods = calculatedTopSellingPeriods.slice(0, 10);
    } else if (timeRangeFilter === 'year') {
      calculatedTopSellingPeriods = calculatedTopSellingPeriods.slice(0, 5);
    }

    // Datos para la tabla
    const tableData: DailySaleTableItem[] = [];
    let tableTotalSales = 0;
    const productMapForTable = new Map(allProducts.map(p => [p._id, p]));

    // REEMPLAZA la función formatPaymentMethodForTable con esta:
    const formatPaymentMethodForTable = getPaymentMethodDisplayName;

    deliveredOrders.forEach(order => {
      const orderCreatedAt = new Date(order.createdAt);

      let orderSummary = order.products.map(productInOrder => {
        const productInfo = productMapForTable.get(productInOrder.productId);
        let productText = productInfo ? `${productInfo.name} (x${productInOrder.quantity})` : `Producto desconocido (x${productInOrder.quantity})`;

        if (productInOrder.addOns && productInOrder.addOns.length > 0) {
          const addOnsText = productInOrder.addOns.map(ao => {
            const addOnDetail = allAddOns.get(ao._id);
            const name = addOnDetail?.name || ao.name || 'Adicional desconocido';
            return `+ ${name} (x${ao.quantity})`;
          }).join(', ');
          productText += ` [${addOnsText}]`;
        }
        return productText;
      }).join('; ');

      tableData.push({
        orderId: order._id,
        orderSummary: orderSummary,
        subtotal: order.totalAmount,
        orderDate: orderCreatedAt.toLocaleDateString('es-AR'),
        orderTime: orderCreatedAt.toLocaleTimeString('es-AR', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        fullOrderTime: orderCreatedAt,
        paymentMethod: formatPaymentMethodForTable(order.paymentMethod)
      });
      tableTotalSales += order.totalAmount;
    });
    tableData.sort((a, b) => a.fullOrderTime.getTime() - b.fullOrderTime.getTime());

    console.log('=== DATOS DE TABLA GENERADOS ===');
    console.log('Total de items en tabla:', tableData.length);
    console.log('Métodos de pago en tabla:', tableData.map(item => item.paymentMethod));
    console.log('================================');

    return {
      totalSales: calculatedTotalSales,
      totalOrdersCount: calculatedTotalOrdersCount,
      completedOrdersCount: calculatedCompletedOrdersCount,
      soldProductsCount: calculatedSoldProductsCount, 
      promosSoldCount: calculatedPromosSoldCount,
      bestSellingProducts: bestSellingWithPercentage,
      salesDataForChart: calculatedSalesDataForChart,
      topSellingPeriods: calculatedTopSellingPeriods,
      dailySalesTableData: tableData,
      dailyTotalSales: tableTotalSales,
      deliveryPercentage: calculatedDeliveryPercentage
    };
  }, [allOrders, allProducts, allAddOns, timeRangeFilter, startDate, endDate, paymentMethodFilter]);

  const exportDailySalesToCsv = useCallback(() => {
    if (dailySalesTableData.length === 0) {
      console.log('No hay datos para exportar.');
      return;
    }

    const headers = [
      'Fecha',
      'Hora',
      'Resumen del Pedido',
      'Metodo de Pago',
      'Subtotal'
    ];

    const rows = dailySalesTableData.map(item => [
      `"${item.orderDate}"`,
      `"${item.orderTime}"`,
      `"${item.orderSummary.replace(/"/g, '""')}"`,
      `"${item.paymentMethod}"`,
      `"${item.subtotal.toFixed(2)}"`
    ]);

    rows.push(['', '', '', 'Total del Periodo:', `"${dailyTotalSales.toFixed(2)}"`]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    let filename = 'ventas_';
    if (timeRangeFilter === 'custom') {
      filename += `personalizado_${startDate}_a_${endDate}`;
    } else if (timeRangeFilter === 'today') {
      filename += `hoy_${new Date().toISOString().split('T')[0]}`;
    } else {
      filename += `${timeRangeFilter}`;
    }
    
    if (paymentMethodFilter !== 'all') {
      filename += `_${paymentMethodFilter}`;
    }
    
    filename += '.csv';
    
    link.setAttribute('download', filename);

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [dailySalesTableData, dailyTotalSales, timeRangeFilter, startDate, endDate, paymentMethodFilter]);

  return {
    loading,
    error,
    timeRangeFilter,
    setTimeRangeFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleCustomSearch,
    totalSales,
    totalOrdersCount,
    completedOrdersCount,
    soldProductsCount,
    promosSoldCount,
    bestSellingProducts,
    salesDataForChart,
    topSellingPeriods,
    dailySalesTableData,
    dailyTotalSales,
    exportDailySalesToCsv,
    deliveryPercentage,
    paymentMethodFilter,
    setPaymentMethodFilter
  };
};