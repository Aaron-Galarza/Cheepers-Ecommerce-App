import React from 'react';
import styles from '../../../pages/management.styles/ventasmanagement.module.css';
import { FaCalendarDay, FaFileCsv, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { DailySaleTableItem } from '../../../hooks/useSalesData';
import { 
  normalizePaymentMethod, 
  getPaymentMethodDisplayName 
} from '../../../lib/paymentMethods';

interface DailySalesTableProps {
  dailySalesTableData: DailySaleTableItem[];
  dailyTotalSales: number;
  rowsToShow: number;
  setRowsToShow: React.Dispatch<React.SetStateAction<number>>;
  INITIAL_ROWS_LIMIT: number;
  exportDailySalesToCsv: () => void;
  paymentMethodFilter: 'all' | 'mercadopago' | 'efectivo';
  setPaymentMethodFilter: React.Dispatch<React.SetStateAction<'all' | 'mercadopago' | 'efectivo'>>;
}

const DailySalesTable: React.FC<DailySalesTableProps> = ({
  dailySalesTableData,
  dailyTotalSales,
  rowsToShow,
  setRowsToShow,
  INITIAL_ROWS_LIMIT,
  exportDailySalesToCsv,
  paymentMethodFilter,
  setPaymentMethodFilter
}) => {
  // Ícono del método de pago
  const getPaymentMethodIcon = (method: string) => {
    const normalized = normalizePaymentMethod(method);
    
    if (normalized === 'efectivo') {
      return <FaMoneyBillWave title="Efectivo" />;
    }
    
    if (normalized === 'mercadopago') {
      return <FaCreditCard title="Mercado Pago" />;
    }
    
    return null;
  };

  // Datos ya vienen filtrados desde el hook
  const filteredData = dailySalesTableData;

  // Total
  const filteredTotal = filteredData.reduce((total, item) => total + item.subtotal, 0);

  // Cambio en el filtro
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethodFilter(e.target.value as 'all' | 'mercadopago' | 'efectivo');
    setRowsToShow(INITIAL_ROWS_LIMIT);
  };

  return (
    <div className={styles.dailySalesTableSection}>
      <h2 className={styles.sectionTitle}>
        <FaCalendarDay /> Detalle de Ventas
      </h2>
      
      <div className={styles.dailyDateFilter}>
        <div className={styles.paymentFilterGroup}>
          <label htmlFor="paymentMethodFilterTable" className={styles.filterLabel}>
            <FaCreditCard /> Método de Pago:
          </label>
          <select
            id="paymentMethodFilterTable"
            value={paymentMethodFilter}
            onChange={handlePaymentMethodChange}
            className={styles.selectField}
          >
            <option value="all">Todos</option>
            <option value="mercadopago">Mercado Pago</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>
        
        <button onClick={exportDailySalesToCsv} className={styles.exportButton}>
          <FaFileCsv /> Exportar CSV
        </button>
      </div>

      {filteredData.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.dailySalesTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Pedido</th>
                <th>Método de Pago</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, rowsToShow).map((item, index) => (
                <tr key={index}>
                  <td>{item.orderDate}</td>
                  <td>{item.orderTime}</td>
                  <td>{item.orderSummary}</td>
                  <td className={styles.paymentMethodCell}>
                    {getPaymentMethodIcon(item.paymentMethod)}
                    <span className={styles.paymentMethodText}>
                      {getPaymentMethodDisplayName(item.paymentMethod)}
                    </span>
                  </td>
                  <td>${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className={styles.totalRowLabel}>Total del Período:</td>
                <td className={styles.totalRowValue}>${filteredTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          {filteredData.length > rowsToShow && (
            <button onClick={() => setRowsToShow(filteredData.length)} className={styles.seeMoreButton}>
              Ver más ({filteredData.length - rowsToShow} pedidos)
            </button>
          )}
          {rowsToShow > INITIAL_ROWS_LIMIT && (
            <button onClick={() => setRowsToShow(INITIAL_ROWS_LIMIT)} className={styles.seeLessButton}>
              Ver menos
            </button>
          )}
        </div>
      ) : (
        <p className={styles.noDataMessage}>
          No hay ventas registradas para el rango seleccionado.
        </p>
      )}
    </div>
  );
};

export default DailySalesTable;
