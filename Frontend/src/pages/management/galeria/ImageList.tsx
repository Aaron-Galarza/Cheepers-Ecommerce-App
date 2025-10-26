import React from 'react';
import ImageCard from './ImageCard';
import styles from '../../management.styles/admingallery.module.css';
import { GalleryImage } from './AdminGallery';

interface ImageListProps {
  images: GalleryImage[];
  selectedImages: string[];
  onSelectImage: (id: string) => void;
}

const ImageList: React.FC<ImageListProps> = ({ images, selectedImages, onSelectImage }) => {
  return (
    <main>
      {images.length === 0 ? <p className={styles.emptyGallery}>No hay imágenes en la galería.</p> : 
        <div className={styles.imageGrid}>
          {images.map((image) => {
            const isSelected = selectedImages.includes(image.id);
            return <ImageCard key={image.id} image={image} isSelected={isSelected} onSelect={onSelectImage} />;
          })}
        </div>
      }
    </main>
  );
};

export default ImageList;