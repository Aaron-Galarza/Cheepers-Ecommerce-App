// src/pages/management/galeria/AdminGallery.tsx

import React, { useState, useMemo } from 'react'; // 1. Importamos useMemo
import { FaUpload, FaTrash } from 'react-icons/fa';
import styles from '../../management.styles/admingallery.module.css'; 

import ImageList from './ImageList'; 
import ImageUploader from './ImagenUploader';

// --- INTERFAZ Y DATOS ---
interface GalleryImage {
  id: string; 
  url: string;
  name: string;
}

const hardcodedImages: GalleryImage[] = [
  { id: '1', url: 'https://res.cloudinary.com/dwqxdensk/image/upload/v1759779697/WhatsApp_Image_2025-10-06_at_12.50.44_mgspwe.jpg', name: 'Sandwich vacio' },
  { id: '2', url: 'https://res.cloudinary.com/dwqxdensk/image/upload/v1759259039/WhatsApp_Image_2025-09-30_at_11.35.41_iye8ca.jpg', name: 'Tostado' },
  { id: '3', url: 'https://res.cloudinary.com/dwqxdensk/image/upload/v1758907144/WhatsApp_Image_2025-09-26_at_11.24.50_vlhypn.jpg', name: 'Hamburguesa' },
  { id: '4', url: 'https://res.cloudinary.com/dwqxdensk/image/upload/v1757520998/WhatsApp_Image_2025-09-10_at_12.26.40_1_atlfgu.jpg', name: 'Pizza' },
];


const AdminGallery: React.FC = () => {
  
  const [images, setImages] = useState<GalleryImage[]>(hardcodedImages);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  // 👇 2. NUEVO ESTADO PARA EL BUSCADOR
  const [searchQuery, setSearchQuery] = useState('');
  
  // (Las funciones de HdeSelectImage y handleDeleteClick se quedan igual)
  const handleSelectImage = (id: string) => {
    setSelectedImages((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((imgId) => imgId !== id);
      }
      return [...prevSelected, id];
    });
  };

  const handleDeleteClick = () => {
    setImages((currentImages) => 
      currentImages.filter(img => !selectedImages.includes(img.id))
    );
    setSelectedImages([]); 
  };

  // (La lógica de subida se queda igual)
  const handleUpload = (name: string, file: File) => {
    console.log('Subiendo:', name, file);
    const newImage: GalleryImage = {
      id: (Math.random() * 1000).toString(),
      url: URL.createObjectURL(file),
      name: name,
    };
    // Añadimos la nueva imagen al *principio* de la lista
    setImages([newImage, ...images]);
  };

  // 👇 3. FILTRAMOS LAS IMÁGENES USANDO useMemo
  // Esto recalcula la lista solo si 'images' o 'searchQuery' cambian
  const filteredImages = useMemo(() => {
    // Si no hay búsqueda, devolvemos todas las imágenes
    if (!searchQuery) {
      return images;
    }
    // Si hay búsqueda, filtramos (ignorando mayúsculas/minúsculas)
    return images.filter(image =>
      image.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [images, searchQuery]); // Dependencias


  return (
    <div className={styles.galleryContainer}>
      
      <header className={styles.galleryHeader}>
        <h1 className={styles.galleryTitle}>
          Galería de Imágenes
        </h1>

        {/* 👇 4. AÑADIMOS EL INPUT DEL BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar por nombre..."
          className={styles.searchInput} // Nueva clase CSS
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className={styles.buttonGroup}>
          <button
            onClick={() => setIsUploaderOpen(true)}
            className={`${styles.galleryButton} ${styles.uploadBtn}`}
          >
            <FaUpload />
            Subir imagen
          </button>
          {selectedImages.length > 0 && (
            <button
              onClick={handleDeleteClick}
              className={`${styles.galleryButton} ${styles.deleteBtn}`}
            >
              <FaTrash />
              Eliminar ({selectedImages.length})
            </button>
          )}
        </div>
      </header>

      {/* 👇 5. PASAMOS LAS IMÁGENES FILTRADAS A ImageList */}
      <ImageList
        images={filteredImages} 
        selectedImages={selectedImages}
        onSelectImage={handleSelectImage}
      />

      {/* (El modal de Uploader no cambia) */}
      <ImageUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUpload={handleUpload}
      />

    </div>
  );
};

export default AdminGallery;