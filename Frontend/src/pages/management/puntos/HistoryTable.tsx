// src/pages/admin/components/HistoryTable.tsx (o donde lo ubiques)

import React from 'react';
import styles from './css/puntosmanagement.module.css';

// Copiamos la 'type'
export type Redemption = {
  id: string;
  dni: string;
  clientName: string;
  rewardId: string;
  rewardName: string;
  pointsUsed: number;
  date: string;
};

// Definimos las 'props'
interface HistoryTableProps {
  filteredHistory: Redemption[];
  historyFilterDni: string;
  setHistoryFilterDni: (dni: string) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ filteredHistory, historyFilterDni, setHistoryFilterDni }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Historial de Canjes</h2>
      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Filtrar por DNI</label>
          <input className={styles.input} placeholder="Buscar por DNI..." value={historyFilterDni} onChange={e => setHistoryFilterDni(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Cliente</th>
              <th>Premio</th>
              <th>Puntos</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 && (
              <tr><td colSpan={5} className={styles.empty}>Sin canjes registrados.</td></tr>
            )}
            {filteredHistory.map(r => (
              <tr key={r.id}>
                <td>{r.dni}</td>
                <td>{r.clientName}</td>
                <td>{r.rewardName}</td>
                <td>{r.pointsUsed}</td>
                <td>{new Date(r.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default HistoryTable;