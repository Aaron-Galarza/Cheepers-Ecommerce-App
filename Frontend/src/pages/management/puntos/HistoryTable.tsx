// src/pages/admin/components/HistoryTable.tsx

import React from 'react';
import styles from './css/puntosmanagement.module.css';
import { FaSearch } from 'react-icons/fa'; // Importamos el ícono

// 1. Definimos el 'type' Redemption (asegúrate de que coincida)
export type Redemption = {
  _id: string; // <-- Usamos _id
  dni: string;
  clientName: string;
  rewardId: string;
  rewardName: string;
  pointsUsed: number;
  date: string;
};

// 2. CORRECCIÓN: Definimos las props que SÍ estamos recibiendo
interface HistoryTableProps {
  items: Redemption[]; // <-- Acepta 'items'
  historyFilterDni: string;
  setHistoryFilterDni: (dni: string) => void;
  onSearchHistory: () => void; // Función para buscar
}

const HistoryTable: React.FC<HistoryTableProps> = ({ 
  items, // <-- Recibe 'items'
  historyFilterDni, 
  setHistoryFilterDni,
  onSearchHistory 
}) => {
  
  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchHistory(); // Llama a la función del padre
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Historial de Canjes</h2>
      
      <form className={styles.formRow} onSubmit={handleSearchClick}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Buscar Historial por DNI</label>
          <div className={styles.searchDniWrapper}>
            <input 
              className={styles.input} 
              placeholder="Ingresar DNI..." 
              value={historyFilterDni} 
              onChange={e => setHistoryFilterDni(e.target.value)} 
            />
            <button type="submit" className={styles.buttonPrimary}>
              <FaSearch />
              Buscar Historial
            </button>
          </div>
        </div>
      </form>

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
            {/* 3. La tabla ahora usa 'items' */}
            {items.length === 0 && (
              <tr><td colSpan={5} className={styles.empty}>No se encontró historial.</td></tr>
            )}
            {items.map(r => (
              <tr key={r._id}>
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