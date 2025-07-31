import React, { useState } from 'react';
import axios from 'axios'; // Se mantiene para axios.isAxiosError si es necesario en el error global
import styles from './../management.styles/ventasmanagement.module.css';
import { FaDollarSign, FaShoppingCart, FaCheckCircle, FaBox, FaFilter, FaCalendarDay, FaTag, FaTrophy, FaSearch, FaTruck } from 'react-icons/fa'; // Importar FaTruck
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';

// Importa el custom hook
import { useSalesData } from '../../hooks/useSalesData';
// Importa el nuevo componente de tabla
import DailySalesTable from '../../components/layout/admin/dailysalestable';

// Las interfaces Order y Product ya se manejan dentro de useSalesData.ts
// No necesitamos re-declararlas aquí a menos que sean usadas directamente en el JSX de este componente.

const INITIAL_ROWS_LIMIT = 10; // Límite inicial de filas para "Ver más"

const VentasManagement: React.FC = () => {
  // Usamos el custom hook para obtener todos los datos y funciones
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
    activeProductsCount,
    promosSoldCount,
    bestSellingProducts,
    salesDataForChart,
    topSellingPeriods,
    dailySalesTableData,
    dailyTotalSales,
    exportDailySalesToCsv,
    deliveryPercentage // NUEVO: Importar el porcentaje de pedidos a domicilio
  } = useSalesData();

  // Estado local para controlar cuántas filas se muestran en la tabla de detalle
  const [rowsToShow, setRowsToShow] = useState(INITIAL_ROWS_LIMIT);

  // Funciones de manejo de filtros que también resetean el estado de la tabla
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRangeFilter(e.target.value as 'today' | 'week' | 'month' | 'year' | 'custom');
    setStartDate('');
    setEndDate('');
    setRowsToShow(INITIAL_ROWS_LIMIT); // Resetear "Ver más" al cambiar filtro
  };

  const handleCustomSearchClick = () => {
    handleCustomSearch();
    setRowsToShow(INITIAL_ROWS_LIMIT); // Resetear "Ver más" al aplicar búsqueda personalizada
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
          onChange={handleFilterChange}
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
        {/* NUEVO CUADRO DE MÉTRICA: Porcentaje de Pedidos a Domicilio */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconContainer}>
            <FaTruck /> {/* Icono para delivery */}
          </div>
          <h3>Pedidos a Domicilio</h3>
          <p>{deliveryPercentage.toFixed(1)}%</p> {/* Mostrar el porcentaje */}
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

      {/* Componente de Tabla de Detalle de Ventas */}
      <DailySalesTable
        dailySalesTableData={dailySalesTableData}
        dailyTotalSales={dailyTotalSales}
        rowsToShow={rowsToShow}
        setRowsToShow={setRowsToShow}
        INITIAL_ROWS_LIMIT={INITIAL_ROWS_LIMIT}
        exportDailySalesToCsv={exportDailySalesToCsv}
      />
    </div>
  );
};
export default VentasManagement;
