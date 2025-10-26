// src/pages/management/galeria/ImageCard.tsx

import React, { useState } from 'react'; // Importamos useState
// Importamos FaCheck para el feedback de copiado
import { FaCheckCircle, FaLink, FaCheck } from 'react-icons/fa';
import { GalleryImage } from './AdminGallery'; // Asegúrate de que esta ruta sea correcta

import styles from './css/imagecard.module.css'; 


interface ImageCardProps {
  image: GalleryImage;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, isSelected, onSelect }) => {
  // Nuevo estado para el feedback de "Copiado!"
  const [isCopied, setIsCopied] = useState(false);

  // Llama a la función del padre para seleccionar
  const handleSelectClick = () => {
    onSelect(image.id);
  };

  // --- ¡FUNCIÓN DE COPIAR IMPLEMENTADA! ---
  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se seleccione la imagen
    
    // Usamos la API del navegador para copiar al portapapeles
    navigator.clipboard.writeText(image.url).then(() => {
      // 1. Mostramos el feedback
      setIsCopied(true);
      // 2. Reseteamos el botón después de 2 segundos
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Error al copiar el enlace: ', err);
      alert('Error al copiar el enlace');
    });
  };

  // Construimos las clases dinámicamente
  const cardClassName = `
    ${styles.imageItem}
    ${isSelected ? styles.selected : ''}
  `;

  return (
    <div
      className={cardClassName}
      onClick={handleSelectClick}
    >
      <img
        src={image.url}
        alt={image.name}
        className={styles.image}
      />

      {/* --- Checkmark de Selección --- */}
      {isSelected && (
        <div className={styles.checkmarkIcon}>
          <FaCheckCircle size={16} />
        </div>
      )}

      {/* --- Overlay de Hover --- */}
      <div className={styles.hoverOverlay}>
        <button
          // Aplicamos la clase 'copied' si el estado es true
          className={`${styles.copyButton} ${isCopied ? styles.copied : ''}`}
          onClick={handleCopyClick}
          title="Copiar enlace de la imagen"
        >
          {/* Cambiamos el icono según el estado */}
          {isCopied ? <FaCheck /> : <FaLink />}
        </button>
      </div>
    </div>
  );
};

export default ImageCard;