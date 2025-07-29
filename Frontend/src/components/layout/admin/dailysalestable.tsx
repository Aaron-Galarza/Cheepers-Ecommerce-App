import React from 'react';
import styles from '../../../pages/management.styles/ventasmanagement.module.css'; // Importa los estilos
import { FaCalendarDay, FaFileCsv } from 'react-icons/fa';
import { DailySaleTableItem } from '../../../hooks/useSalesData'; // Importa la interfaz desde el hook

interface DailySalesTableProps {
  dailySalesTableData: DailySaleTableItem[];
  dailyTotalSales: number;
  rowsToShow: number;
  setRowsToShow: React.Dispatch<React.SetStateAction<number>>;
  INITIAL_ROWS_LIMIT: number;
  exportDailySalesToCsv: () => void;
}

const DailySalesTable: React.FC<DailySalesTableProps> = ({
  dailySalesTableData,
  dailyTotalSales,
  rowsToShow,
  setRowsToShow,
  INITIAL_ROWS_LIMIT,
  exportDailySalesToCsv
}) => {
  return (
    <div className={styles.dailySalesTableSection}>
      <h2 className={styles.sectionTitle}>
        <FaCalendarDay /> Detalle de Ventas
      </h2>
      <div className={styles.dailyDateFilter}>
        <button onClick={exportDailySalesToCsv} className={styles.exportButton}>
          <FaFileCsv /> Exportar CSV
        </button>
      </div>

      {dailySalesTableData.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.dailySalesTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Pedido</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {dailySalesTableData.slice(0, rowsToShow).map((item, index) => (
                <tr key={index}>
                  <td>{item.orderDate}</td>
                  <td>{item.orderTime}</td>
                  <td>{item.orderSummary}</td>
                  <td>${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className={styles.totalRowLabel}>Total del Período:</td>
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
  );
};

export default DailySalesTable;
