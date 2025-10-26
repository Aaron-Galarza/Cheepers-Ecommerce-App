// src/pages/management/galeria/ImageList.tsx

import React from 'react';
import ImageCard from './ImageCard';
// Usamos los estilos de la galería (para la grilla)
import styles from '../../management.styles/admingallery.module.css'; 
import { GalleryImage } from './AdminGallery'; // Asegúrate de que esta ruta sea correcta

// Definimos la interfaz de la imagen (puedes moverla a un archivo types.ts)

// Definimos las props que este componente espera recibir
interface ImageListProps {
  images: GalleryImage[];
  selectedImages: string[];
  onSelectImage: (id: string) => void;
}

const ImageList: React.FC<ImageListProps> = ({ images, selectedImages, onSelectImage }) => {
  return (
    <main>
      {images.length === 0 ? (
        <p className={styles.emptyGallery}>No hay imágenes en la galería.</p>
      ) : (
        // Usamos la clase de grilla del CSS de AdminGallery
        <div className={styles.imageGrid}>
          
          {images.map((image) => {
            const isSelected = selectedImages.includes(image.id);
            return (
              <ImageCard 
                key={image.id}
                image={image}
                isSelected={isSelected}
                onSelect={onSelectImage} // Pasamos el handler al hijo
              />
            );
          })}
        </div>
      )}
    </main>
  );
};

export default ImageList;