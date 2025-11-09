// src/pages/admin/components/RewardCard.tsx (o donde lo ubiques)

import React from 'react';
import { FaPen, FaTrash } from 'react-icons/fa';
import styles from './css/puntosmanagement.module.css';
// Copiamos la 'type' para que el componente sea modular
export type Reward = {
  id: string;
  name: string;
  pointsCost: number;
  isActive: boolean;
  description?: string;
  imageUrl?: string;
};

// Definimos las 'props' que este componente espera recibir
interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, onEdit, onToggleActive, onDelete }) => {
  return (
    <article className={styles.card}>
      <img src={reward.imageUrl || 'https://via.placeholder.com/400x300.png?text=Premio'} alt={reward.name} className={styles.cardImage} />
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{reward.name}</h3>
        <p className={styles.cardDescription}>{reward.description}</p>
        
        <p className={styles.cardMeta}>{reward.pointsCost} Puntos</p>
        
        <p className={styles.cardInfo}>
          Categoría: Premio
        </p>
        <p className={styles.cardInfo}>
          Estado: <span className={reward.isActive ? styles.statusActive : styles.statusInactive}>{reward.isActive ? 'Activo' : 'Inactivo'}</span>
        </p>
      </div>
      <div className={styles.cardActions}>
        <button className={styles.buttonPrimary} onClick={() => onToggleActive(reward.id)}>
          {reward.isActive ? 'Desactivar' : 'Activar'}
        </button>
        <button className={styles.buttonSecondary} onClick={() => onEdit(reward)}>
          <FaPen />
        </button>
        <button className={styles.buttonDanger} onClick={() => onDelete(reward.id)}>
          <FaTrash />
        </button>
      </div>
    </article>
  );
};

export default RewardCard;