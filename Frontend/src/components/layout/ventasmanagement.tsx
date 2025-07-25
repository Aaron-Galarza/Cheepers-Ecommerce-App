import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import styles from './ventasmanagement.module.css';
import { FaDollarSign, FaShoppingCart, FaCheckCircle, FaBox, FaFilter, FaCalendarDay, FaTag, FaTrophy, FaSearch, FaFileCsv } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';
import authService from '../../services/authservice';
import { SelectedAddOn, IAddOn } from './productlist'; // Asegúrate de que esta ruta sea correcta

export interface Order {
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
  products: Array<{ productId: string; quantity: number; addOns?: SelectedAddOn[] }>;
  createdAt: string;
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
  period: string;
  sales: number;
}

// INTERFAZ ACTUALIZADA para los datos de la tabla (una fila por pedido)
interface DailySaleTableItem {
  orderId: string;
  orderSummary: string; // Resumen de productos y adicionales del pedido
  subtotal: number; // totalAmount del pedido
  orderDate: string; // Fecha del pedido (DD/MM/YYYY)
  orderTime: string; // Hora del pedido (HH:MM)
  fullOrderTime: Date; // Para ordenar
}

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const VentasManagement: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allAddOns, setAllAddOns] = useState<Map<string, IAddOn>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRangeFilter, setTimeRangeFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [triggerSearch, setTriggerSearch] = useState<number>(0);

  // Estado para controlar cuántas filas se muestran en la tabla de detalle
  const [rowsToShow, setRowsToShow] = useState(10);
  const INITIAL_ROWS_LIMIT = 10; // Límite inicial de filas para "Ver más"

  useEffect(() => {
    // Solo recargar datos si el filtro no es personalizado O si se activó la búsqueda personalizada
    if (timeRangeFilter !== 'custom' || triggerSearch > 0) {
      fetchData();
    }
  }, [timeRangeFilter, triggerSearch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken'); // Obtener el token de autenticación

      const [productsResponse, addOnsResponse, ordersResponse] = await Promise.all([
        axios.get<Product[]>(`${API_BASE_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` }}),
        axios.get<IAddOn[]>(`${API_BASE_URL}/api/addons?includeInactive=true`, { headers: { Authorization: `Bearer ${token}` }}),
        axios.get<Order[]>(`${API_BASE_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` }}),
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
  };

  const handleCustomSearch = () => {
    if (startDate && endDate) {
      setTriggerSearch(prev => prev + 1); // Forzar re-ejecución de fetchData y useMemo
      setRowsToShow(INITIAL_ROWS_LIMIT); // Resetear "Ver más" al buscar
    } else {
      console.error('Error: Por favor, selecciona ambas fechas para el rango personalizado.');
      setError('Por favor, selecciona ambas fechas para el rango personalizado.');
    }
  };

  const {
    totalSales,
    totalOrdersCount,
    completedOrdersCount,
    activeProductsCount,
    promosSoldCount,
    bestSellingProducts,
    salesDataForChart,
    topSellingPeriods,
    dailySalesTableData, // Añadido al retorno
    dailyTotalSales // Añadido al retorno
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

    const deliveredOrders = currentOrders.filter(order => order.status === 'delivered');

    const calculatedTotalSales = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const calculatedTotalOrdersCount = currentOrders.length;
    const calculatedCompletedOrdersCount = deliveredOrders.length;

    const calculatedActiveProductsCount = allProducts.filter(p => p.isActive).length;

    let calculatedPromosSoldCount = 0;
    deliveredOrders.forEach(order => {
      order.products.forEach(item => {
        const product = allProducts.find(p => p._id === item.productId);
        if (product && product.category === 'Promos Solo en Efectivo') {
          calculatedPromosSoldCount += item.quantity;
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

    // --- CÁLCULO DE DATOS PARA LA TABLA DE VENTAS POR RANGO (CON FECHA Y HORA) ---
    const tableData: DailySaleTableItem[] = [];
    let tableTotalSales = 0;
    const productMapForTable = new Map(allProducts.map(p => [p._id, p]));

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
        orderDate: orderCreatedAt.toLocaleDateString('es-AR'), // Formato de fecha (DD/MM/YYYY)
        orderTime: orderCreatedAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        fullOrderTime: orderCreatedAt
      });
      tableTotalSales += order.totalAmount;
    });

    tableData.sort((a, b) => a.fullOrderTime.getTime() - b.fullOrderTime.getTime());
    // --- FIN CÁLCULO DE DATOS PARA LA TABLA ---

    return {
      totalSales: calculatedTotalSales,
      totalOrdersCount: calculatedTotalOrdersCount,
      completedOrdersCount: calculatedCompletedOrdersCount,
      activeProductsCount: calculatedActiveProductsCount,
      promosSoldCount: calculatedPromosSoldCount,
      bestSellingProducts: bestSellingWithPercentage,
      salesDataForChart: calculatedSalesDataForChart,
      topSellingPeriods: calculatedTopSellingPeriods,
      dailySalesTableData: tableData, // Exportar los datos de la tabla
      dailyTotalSales: tableTotalSales // Exportar el total de la tabla
    };
  }, [allOrders, allProducts, allAddOns, timeRangeFilter, startDate, endDate]); // Dependencias actualizadas

  const exportDailySalesToCsv = () => {
    if (dailySalesTableData.length === 0) {
      console.log('No hay datos para exportar.');
      return;
    }

    const headers = [
      'Fecha', // Nuevo encabezado
      'Hora',
      'Resumen del Pedido',
      'Subtotal'
    ];

    const rows = dailySalesTableData.map(item => [
      `"${item.orderDate}"`, // Nuevo campo
      `"${item.orderTime}"`,
      `"${item.orderSummary.replace(/"/g, '""')}"`,
      `"${item.subtotal.toFixed(2)}"`
    ]);

    rows.push(['', '', 'Total del Período:', `"${dailyTotalSales.toFixed(2)}"`]); // Etiqueta de total ajustada, colSpan 2 para los dos primeros vacíos

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const BOM = "\uFEFF"; // Byte Order Mark para UTF-8
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    // Nombre del archivo CSV dinámico según el filtro
    let filename = 'ventas_';
    if (timeRangeFilter === 'custom') {
      filename += `personalizado_${startDate}_a_${endDate}.csv`;
    } else if (timeRangeFilter === 'today') {
      filename += `hoy_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      filename += `${timeRangeFilter}.csv`;
    }
    link.setAttribute('download', filename);

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


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
            setStartDate('');
            setEndDate('');
            setTriggerSearch(0);
            setRowsToShow(INITIAL_ROWS_LIMIT); // Resetear "Ver más" al cambiar filtro
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
                    const [year, month] = tick.split('-');
                    return `${month}/${year}`;
                  } else {
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
                    const [year, month] = data.period.split('-').map(Number);
                    const localDate = new Date(year, month - 1, 1);
                    displayDate = localDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                  } else {
                    const [year, month, day] = data.period.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day);
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

      {/* SECCIÓN ACTUALIZADA: Tabla de Detalle de Ventas por Rango */}
      <div className={styles.dailySalesTableSection}>
        <h2 className={styles.sectionTitle}>
          <FaCalendarDay /> Detalle de Ventas
        </h2>
        <div className={styles.dailyDateFilter}> {/* Mantengo el div por si hay otros elementos en el futuro */}
          <button onClick={exportDailySalesToCsv} className={styles.exportButton}>
            <FaFileCsv /> Exportar CSV
          </button>
        </div>

        {dailySalesTableData.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.dailySalesTable}>
              <thead>
                <tr>
                  <th>Fecha</th> {/* Nueva columna de fecha */}
                  <th>Hora</th>
                  <th>Pedido</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {dailySalesTableData.slice(0, rowsToShow).map((item, index) => (
                  <tr key={index}>
                    <td>{item.orderDate}</td> {/* Mostrar la fecha */}
                    <td>{item.orderTime}</td>
                    <td>{item.orderSummary}</td>
                    <td>${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className={styles.totalRowLabel}>Total del Período:</td> {/* colSpan ajustado a 3 */}
                  <td className={styles.totalRowValue}>${dailyTotalSales.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            {dailySalesTableData.length > rowsToShow && (
              <button onClick={() => setRowsToShow(dailySalesTableData.length)} className={styles.seeMoreButton}>
                Ver más ({dailySalesTableData.length - rowsToShow} pedidos)
              </button>
            )}
            {rowsToShow > INITIAL_ROWS_LIMIT && (
              <button onClick={() => setRowsToShow(INITIAL_ROWS_LIMIT)} className={styles.seeLessButton}>
                Ver menos
              </button>
            )}
          </div>
        ) : (
          <p className={styles.noDataMessage}>No hay ventas registradas para el rango seleccionado.</p>
        )}
      </div>
    </div>
  );
};

export default VentasManagement;