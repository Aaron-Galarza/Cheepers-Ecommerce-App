// src/components/ui/PremioCard.tsx

import React from 'react';
import { FaWhatsapp, FaStar } from 'react-icons/fa';
import styles from '../css/PremioCard.module.css';

export interface PremioData {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  costPoints: number;
}

export interface PremioCardProps {
  premio: PremioData; 
  puntosUsuario: number | null;
  onCanjear: () => void;
}

const PremioCard: React.FC<PremioCardProps> = ({ premio, puntosUsuario, onCanjear }) => {
  const { name, description, imageUrl, costPoints } = premio;

  // Aseguramos que puntosUsuario sea un número (0 si es null)
  const puntosActuales = puntosUsuario || 0;

  const puedeCanjear = puntosActuales >= costPoints;
  
  // Calculamos el porcentaje (máximo 100%)
  const progreso = Math.min((puntosActuales / costPoints) * 100, 100);
  
  // Calculamos restantes (mínimo 0)
  const restantes = Math.max(costPoints - puntosActuales, 0);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqIvY_EddgWVLKNZD3S-xTjijRkfogKFxFkA&s'} 
          alt={name} 
          className={styles.image}
        />
        <div className={styles.pointsBadgeFloat}>
          <FaStar color="#f6ad55" />
          <span>{costPoints} pts</span>
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.description}>{description || 'Sin descripción disponible.'}</p>

        {/* Barra de Progreso (Siempre visible si ya consultó, o si es 0) */}
        {puntosUsuario !== null && (
          <div className={styles.progressInfo}>
            
            {/* La Barra */}
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${progreso}%`, 
                  // Color directo: Verde si alcanza, Rojo si falta
                  backgroundColor: puedeCanjear ? '#25D366' : '#e53e3e' 
                }}
              />
            </div>

            {/* Textos: Izquierda (Actual/Total) - Derecha (Faltantes) */}
            <div className={styles.progressTextRow}>
              <span className={styles.currentPoints}>
                {puntosActuales} / {costPoints} pts
              </span>
              
              {!puedeCanjear && (
                <span className={styles.remainingPoints}>
                  {restantes} pts restantes
                </span>
              )}
              {puedeCanjear && (
                <span className={styles.completedText}>
                  ¡Puntos alcanzados!
                </span>
              )}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <button 
            className={styles.botonCanjear}
            onClick={onCanjear}
            disabled={!puedeCanjear}
          >
            <FaWhatsapp className={styles.whatsappIcon} />
            {puedeCanjear ? 'Canjear Ahora' : 'Seguir Sumando'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremioCard;