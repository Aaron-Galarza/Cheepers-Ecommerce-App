import React, { useState } from 'react';
import { FaCheckCircle, FaLink, FaCheck } from 'react-icons/fa';
import { GalleryImage } from './AdminGallery';
import styles from './css/imagecard.module.css';

interface ImageCardProps {
  image: GalleryImage;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, isSelected, onSelect }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleSelectClick = () => onSelect(image.id);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image.url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => console.error('Error al copiar:', err));
  };

  const cardClassName = `${styles.imageItem} ${isSelected ? styles.selected : ''}`;

  return (
    <div className={cardClassName} onClick={handleSelectClick}>
      <img src={image.url} alt={image.name} className={styles.image} />
      {isSelected && <div className={styles.checkmarkIcon}><FaCheckCircle size={16} /></div>}
      <div className={styles.hoverOverlay}>
        <button className={`${styles.copyButton} ${isCopied ? styles.copied : ''}`} onClick={handleCopyClick} title="Copiar enlace">
          {isCopied ? <FaCheck /> : <FaLink />}
        </button>
      </div>
    </div>
  );
};

export default ImageCard;