import React, { useState } from 'react';
import axios from 'axios';
import styles from './../management.styles/ventasmanagement.module.css';
import { FaDollarSign, FaShoppingCart, FaCheckCircle, FaBox, FaFilter, FaCalendarDay, FaTag, FaTrophy, FaSearch, FaTruck, FaCreditCard, FaMoneyBill } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';

import { useSalesData } from '../../hooks/useSalesData';
import DailySalesTable from '../../components/layout/admin/dailysalestable';

const INITIAL_ROWS_LIMIT = 10;

const VentasManagement: React.FC = () => {
  const {
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
  } = useSalesData();

  const [rowsToShow, setRowsToShow] = useState(INITIAL_ROWS_LIMIT);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeRange = e.target.value;
    
    // Type assertion para el setter
    (setTimeRangeFilter as React.Dispatch<React.SetStateAction<string>>)(newTimeRange);
    
    setStartDate('');
    setEndDate('');
    setRowsToShow(INITIAL_ROWS_LIMIT);
    
    // Limpiar el filtro de método de pago al cambiar el rango de tiempo
    setPaymentMethodFilter('all');
  };

  const handleCustomSearchClick = () => {
    handleCustomSearch();
    setRowsToShow(INITIAL_ROWS_LIMIT);
    
    // Limpiar el filtro de método de pago al hacer una búsqueda personalizada
    setPaymentMethodFilter('all');
  };

  if (loading) return <div className={styles.loading}>Cargando estadísticas...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.ventasManagementContainer}>
      <h1 className={styles.title}>Panel de Estadísticas de Ventas</h1>

      {/* Filter Section - SOLO filtro de tiempo */}
      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="timeRangeFilter" className={styles.filterLabel}>
              <FaFilter /> Rango de Tiempo:
            </label>
            <select
              id="timeRangeFilter"
              value={timeRangeFilter}
              onChange={handleFilterChange}
              className={styles.selectField}
            >
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="week">Última Semana</option>
              <option value="month">Este Mes</option>
              <option value="year">Este Año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
        </div>

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
            <button onClick={handleCustomSearchClick} className={styles.searchButton}>
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
          <h3>Productos Vendidos</h3>
          <p>{soldProductsCount}</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIconContainer}>
            <FaTag />
          </div>
          <h3>Promos Vendidas</h3>
          <p>{promosSoldCount}</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIconContainer}>
            <FaTruck />
          </div>
          <h3>Pedidos a Domicilio</h3>
          <p>{deliveryPercentage.toFixed(1)}%</p>
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

          <div className={styles.bestDaysSection}>
            <h3 className={styles.bestDaysTitle}>
              <span className={styles.trophyIcon}><FaTrophy /></span>
              {timeRangeFilter === 'year' ? 'Top 5 Meses de Ventas:' :
                timeRangeFilter === 'month' ? 'Top 10 Días de Ventas:' :
                timeRangeFilter === 'week' ? 'Top 3 Días de Ventas:' :
                timeRangeFilter === 'yesterday' ? 'Ventas de Ayer:' :
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

      {/* Componente de Tabla de Detalle de Ventas */}
      <DailySalesTable
        dailySalesTableData={dailySalesTableData}
        dailyTotalSales={dailyTotalSales}
        rowsToShow={rowsToShow}
        setRowsToShow={setRowsToShow}
        INITIAL_ROWS_LIMIT={INITIAL_ROWS_LIMIT}
        exportDailySalesToCsv={exportDailySalesToCsv}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
      />
    </div>
  );
};
export default VentasManagement;