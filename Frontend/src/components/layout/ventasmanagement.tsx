import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from './ventasmanagement.module.css';
import { FaDollarSign, FaShoppingCart, FaCheckCircle, FaBox, FaFilter, FaCalendarDay, FaTag, FaTrophy, FaSearch } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';
import authService from '../../services/authservice';

// Reutilizamos las interfaces de Order y Product de OrdersManagement
interface Order {
  _id: string;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  deliveryType: 'delivery' | 'pickup';
  shippingAddress?: {
    street: string;
    city: string;
  };
  products: Array<{ productId: string; quantity: number }>;
  createdAt: string; // ISO 8601 string, likely UTC
  status: 'pending' | 'delivered' | 'cancelled';
}

interface Product {
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
  period: string; // 'YYYY-MM-DD' for daily, 'YYYY-MM' for monthly
  sales: number;
}

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const VentasManagement: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRangeFilter, setTimeRangeFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [triggerSearch, setTriggerSearch] = useState<number>(0); // Used to trigger fetch for custom date range

  useEffect(() => {
    // Fetch data when filter changes or custom search is triggered
    if (timeRangeFilter !== 'custom' || triggerSearch > 0) {
      fetchData();
    }
  }, [timeRangeFilter, triggerSearch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products
      const productsResponse = await axios.get<Product[]>(`${API_BASE_URL}/api/products`);
      setAllProducts(productsResponse.data);

      // Fetch orders
      const ordersResponse = await axios.get<Order[]>(`${API_BASE_URL}/api/orders`);
      setAllOrders(ordersResponse.data);

    } catch (err: any) {
      console.error('Error al cargar datos para estadísticas:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        // If unauthorized, log out the user
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('No se pudieron cargar los datos. Verifica la conexión o tu sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for custom date range search button
  const handleCustomSearch = () => {
    if (startDate && endDate) {
      setTriggerSearch(prev => prev + 1); 
    } else {
      setError('Por favor, selecciona ambas fechas para el rango personalizado.');
    }
  };

  // Memoized calculations for all statistics
  const {
    filteredOrders,
    totalSales,
    totalOrdersCount,
    completedOrdersCount,
    completedOrdersSubtotal,
    activeProductsCount,
    promosSoldCount,
    bestSellingProducts,
    salesDataForChart, // Data for the chart (all periods in range, chronologically sorted)
    topSellingPeriods // Data for the "top N" list (top periods by sales)
  } = useMemo(() => {
    let currentOrders = [...allOrders];
    const now = new Date(); // Current local date/time
    let filterStartDate: Date | null = null;
    let filterEndDate: Date | null = null;

    // Determine the date range based on the selected filter
    if (timeRangeFilter === 'today') {
      filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeRangeFilter === 'week') {
      filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeRangeFilter === 'month') {
      filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of current month
    } else if (timeRangeFilter === 'year') {
      filterStartDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
      filterEndDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st of current year
    } else if (timeRangeFilter === 'custom' && startDate && endDate) {
      // For custom range, parse dates as local to match user input
      filterStartDate = new Date(startDate + 'T00:00:00'); // Parse as local start of day
      filterEndDate = new Date(endDate + 'T23:59:59.999'); // Parse as local end of day
    }

    // Filter orders by the determined date range
    if (filterStartDate && filterEndDate) {
      currentOrders = currentOrders.filter(order => {
        const orderDate = new Date(order.createdAt); // Date object from backend UTC string
        // Compare timestamps (milliseconds since epoch), which are timezone-agnostic
        return orderDate.getTime() >= filterStartDate!.getTime() && orderDate.getTime() <= filterEndDate!.getTime();
      });
    }

    // Filter for delivered orders
    const deliveredOrders = currentOrders.filter(order => order.status === 'delivered');

    // Calculate summary metrics
    const calculatedTotalSales = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const calculatedTotalOrdersCount = currentOrders.length;
    const calculatedCompletedOrdersCount = deliveredOrders.length;
    const calculatedCompletedOrdersSubtotal = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const calculatedActiveProductsCount = allProducts.filter(p => p.isActive).length;

    // Calculate promos sold count
    let calculatedPromosSoldCount = 0;
    deliveredOrders.forEach(order => {
      order.products.forEach(item => {
        const product = allProducts.find(p => p._id === item.productId);
        if (product && product.category === 'Promos Solo en Efectivo') {
          calculatedPromosSoldCount += item.quantity;
        }
      });
    });

    // Calculate best selling products
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
      .slice(0, 5); // Top 5 best-selling products

    const totalQuantitySold = bestSelling.reduce((sum, p) => sum + p.quantity, 0);
    const bestSellingWithPercentage = bestSelling.map(p => ({
      ...p,
      percentage: totalQuantitySold > 0 ? (p.quantity / totalQuantitySold) * 100 : 0
    }));

    // Group sales data by period (day or month) based on local date
    let allSalesData: SalesData[] = [];
    if (timeRangeFilter === 'year') {
      const monthlySalesMap = new Map<string, number>();
      deliveredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        // Extract local year and month for grouping
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1; // getMonth() is 0-indexed
        const monthKey = `${year}-${String(month).padStart(2, '0')}`; // YYYY-MM
        monthlySalesMap.set(monthKey, (monthlySalesMap.get(monthKey) || 0) + order.totalAmount);
      });
      allSalesData = Array.from(monthlySalesMap.entries())
        .map(([period, sales]) => ({ period, sales }));
    } else {
      const dailySalesMap = new Map<string, number>();
      deliveredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        // Extract local year, month, and day for grouping
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const day = orderDate.getDate();
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // YYYY-MM-DD
        dailySalesMap.set(dateKey, (dailySalesMap.get(dateKey) || 0) + order.totalAmount);
      });
      allSalesData = Array.from(dailySalesMap.entries())
        .map(([period, sales]) => ({ period, sales }));
    }

    // Data for the chart: all sales data in the range, sorted chronologically by period
    const calculatedSalesDataForChart = [...allSalesData].sort((a, b) => a.period.localeCompare(b.period));

    // Data for the "top N" list: all sales data, sorted by sales amount (descending)
    let calculatedTopSellingPeriods = [...allSalesData].sort((a, b) => b.sales - a.sales);

    // Apply slicing for "top N" based on time range filter
    if (timeRangeFilter === 'week') {
      calculatedTopSellingPeriods = calculatedTopSellingPeriods.slice(0, 3); // Top 3 days for week
    } else if (timeRangeFilter === 'month') {
      calculatedTopSellingPeriods = calculatedTopSellingPeriods.slice(0, 10); // Top 10 days for month
    } else if (timeRangeFilter === 'year') {
      calculatedTopSellingPeriods = calculatedTopSellingPeriods.slice(0, 5); // Top 5 months for year
    }
    // For 'today' and 'custom', all periods with sales are shown, sorted by sales amount

    return {
      filteredOrders: currentOrders,
      totalSales: calculatedTotalSales,
      totalOrdersCount: calculatedTotalOrdersCount,
      completedOrdersCount: calculatedCompletedOrdersCount,
      completedOrdersSubtotal: calculatedCompletedOrdersSubtotal,
      activeProductsCount: calculatedActiveProductsCount,
      promosSoldCount: calculatedPromosSoldCount,
      bestSellingProducts: bestSellingWithPercentage,
      salesDataForChart: calculatedSalesDataForChart,
      topSellingPeriods: calculatedTopSellingPeriods
    };
  }, [allOrders, allProducts, timeRangeFilter, startDate, endDate]);


  if (loading) return <div className={styles.loading}>Cargando estadísticas...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.ventasManagementContainer}>
      <h1 className={styles.title}>Panel de Estadísticas de Ventas</h1>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <label htmlFor="timeRangeFilter" className={styles.filterLabel}>
          <FaFilter /> Rango de Tiempo:
        </label>
        <select
          id="timeRangeFilter"
          value={timeRangeFilter}
          onChange={(e) => {
            setTimeRangeFilter(e.target.value as 'today' | 'week' | 'month' | 'year' | 'custom');
            setStartDate(''); // Clear custom dates on filter change
            setEndDate('');
            setTriggerSearch(0); // Reset trigger
          }}
          className={styles.selectField}
        >
          <option value="today">Hoy</option>
          <option value="week">Última Semana</option>
          <option value="month">Este Mes</option>
          <option value="year">Este Año</option>
          <option value="custom">Personalizado</option>
        </select>

        {timeRangeFilter === 'custom' && (
          <div className={styles.customDateFilter}>
            <label htmlFor="startDate" className={styles.filterLabel}>Desde:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.inputField}
            />
            <label htmlFor="endDate" className={styles.filterLabel}>Hasta:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.inputField}
            />
            <button onClick={handleCustomSearch} className={styles.searchButton}>
              <FaSearch /> Buscar
            </button>
          </div>
        )}
      </div>

      {/* Summary Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIconContainer}>
            <FaDollarSign />
          </div>
          <h3>Ventas Totales</h3>
          <p>${totalSales.toFixed(2)}</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIconContainer}>
            <FaShoppingCart />
          </div>
          <h3>Total de Pedidos</h3>
          <p>{totalOrdersCount}</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIconContainer}>
            <FaCheckCircle />
          </div>
          <h3>Pedidos Completados</h3>
          <p>{completedOrdersCount}</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIconContainer}>
            <FaBox />
          </div>
          <h3>Productos Activos</h3>
          <p>{activeProductsCount}</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIconContainer}>
            <FaTag />
          </div>
          <h3>Promos Vendidas</h3>
          <p>{promosSoldCount}</p>
        </div>
      </div>

      {/* Charts and Top Products List */}
      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            {timeRangeFilter === 'year' ? 'Ventas por Mes' : 'Ventas por Día'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesDataForChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="period"
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(tick) => {
                  if (timeRangeFilter === 'year') {
                    // Format YYYY-MM to MM/YYYY
                    const [year, month] = tick.split('-');
                    return `${month}/${year}`;
                  } else {
                    // Format YYYY-MM-DD to DD/MM
                    const [year, month, day] = tick.split('-');
                    return `${day}/${month}`;
                  }
                }}
              />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="sales" name="Ventas" fill="#007bff" radius={[10, 10, 0, 0]} />
              <Brush dataKey="period" height={30} stroke="#007bff" fillOpacity={0.6} />
            </BarChart>
          </ResponsiveContainer>

          {/* Best Selling Days/Months Section */}
          <div className={styles.bestDaysSection}>
            <h3 className={styles.bestDaysTitle}>
              <span className={styles.trophyIcon}><FaTrophy /></span>
              {timeRangeFilter === 'year' ? 'Top 5 Meses de Ventas:' :
               timeRangeFilter === 'month' ? 'Top 10 Días de Ventas:' :
               timeRangeFilter === 'week' ? 'Top 3 Días de Ventas:' :
               'Mejores Días de Ventas:'}
            </h3>
            {topSellingPeriods.length > 0 ? (
              <ul className={styles.bestDaysList}>
                {topSellingPeriods.map((data, index) => {
                  let displayDate;
                  if (timeRangeFilter === 'year') {
                    // For year, display month name and year (e.g., "Julio 2025")
                    // data.period is YYYY-MM. Create a Date object in local time for correct month name.
                    const [year, month] = data.period.split('-').map(Number);
                    const localDate = new Date(year, month - 1, 1); // Month is 0-indexed
                    displayDate = localDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                  } else {
                    // For other filters, data.period is YYYY-MM-DD
                    // Create a Date object in local time for correct day, month, year.
                    const [year, month, day] = data.period.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day); // Month is 0-indexed
                    displayDate = localDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  }
                  return (
                    <li key={index} className={styles.bestDaysItem}>
                      <span>{displayDate}</span>
                      <span>${data.sales.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.noDataMessage}>No hay datos suficientes para mostrar.</p>
            )}
          </div>
        </div>

        {/* Top 5 Best Selling Products */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Top 5 Productos Más Vendidos</h2>
          <div className={styles.bestSellingList}>
            {bestSellingProducts.length > 0 ? (
              <ul>
                {bestSellingProducts.map((product, index) => (
                  <li key={index} className={styles.bestSellingItem}>
                    <span className={styles.bestSellingName}>{product.name}</span>
                    <span className={styles.bestSellingQuantity}>({product.quantity} unidades)</span>
                    <span className={styles.bestSellingPercentage}>{product.percentage.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noDataMessage}>No hay datos de ventas para mostrar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentasManagement;
