// src/pages/management/galeria/AdminGallery.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react'; 
import { FaUpload, FaTrash } from 'react-icons/fa';
import styles from '../../management.styles/admingallery.module.css'; 
import ImageList from './ImageList'; 
import ImageUploader from './ImagenUploader';
import axios from 'axios'; // Necesario para el manejo de errores de axios
// 🚨 ASUME LA RUTA: Ajusta la importación según donde creaste galleryApi.ts
import { listGalleryImages, deleteGalleryImage } from '../../management/galeria/galleryApi'; 
import { toast } from 'react-toastify'; // Usaremos toast para feedback

// --- INTERFAZ ACTUALIZADA ---
export interface GalleryImage { 
  id: string;  // ID simple (ej: 'sandwich-vacio'), usado para la selección y el backend
  url: string; // secure_url de Cloudinary
  name: string; // nombre del archivo (igual a id)
  publicId: string; // 👈 ¡NUEVO!: ID completo de Cloudinary (con la carpeta)
}

const AdminGallery: React.FC = () => {
  
  const [images, setImages] = useState<GalleryImage[]>([]); // 👈 INICIALIZAR VACÍO
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // 👇 Nuevo estado para manejar la carga y mensajes
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------
  // --- LÓGICA DE CARGA DE DATOS REALES (FETCHING) ---
  // ----------------------------------------------------

  // Función para obtener las imágenes del backend
  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listGalleryImages();
      
      // Mapeamos la respuesta del backend (Cloudinary) a la interfaz GalleryImage
      const mappedImages: GalleryImage[] = data.images.map((img: any) => {
        // El ID simple (usado en tu interfaz) es el nombre del archivo sin la carpeta
        const simpleId = img.public_id.split('/').pop() || img.public_id; 

        return {
          id: simpleId, 
          url: img.secure_url,
          name: simpleId, 
          publicId: img.public_id 
        };
      });
      
      // Ordenar por fecha de subida (o como prefieras)
      mappedImages.sort((a, b) => a.id.localeCompare(b.id)); 
      setImages(mappedImages); 

    } catch (err: any) {
      console.error('Error al cargar imágenes:', err);
      const errorMsg = axios.isAxiosError(err) ? (err.response?.data?.message || 'Error de conexión con el servidor.') : 'Error desconocido al cargar.';
      setError(errorMsg);
      toast.error(`Error al cargar la galería: ${errorMsg}`, { position: "bottom-center" });
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);


  // ----------------------------------------------------
  // --- LÓGICA DE ELIMINACIÓN REAL ---
  // ----------------------------------------------------
  const handleDeleteClick = async () => {
    if (selectedImages.length === 0 || !window.confirm(`¿Estás seguro de eliminar ${selectedImages.length} imagen(es)? Esta acción es permanente en Cloudinary.`)) {
      return;
    }

    setIsLoading(true);
    try {
      // Obtenemos solo los IDs simples necesarios para la eliminación en el backend
      const simpleIdsToDelete = images
        .filter(img => selectedImages.includes(img.id))
        .map(img => img.id); // Aquí usamos el ID simple para el DELETE

      // Ejecutamos todas las peticiones de eliminación en paralelo
      const deletePromises = simpleIdsToDelete.map(id => deleteGalleryImage(id));
      await Promise.all(deletePromises);
      
      // Recargar la lista para reflejar los cambios
      await fetchImages(); 
      setSelectedImages([]);
      toast.success(`✅ ${simpleIdsToDelete.length} imagen(es) eliminada(s) exitosamente.`, { position: "bottom-center" });
      
    } catch (err: any) {
      console.error('Error al eliminar imágenes:', err);
      const errorMsg = axios.isAxiosError(err) ? (err.response?.data?.message || 'Error al eliminar en el servidor.') : 'Error desconocido.';
      setError(errorMsg);
      toast.error(`Error al eliminar: ${errorMsg}`, { position: "bottom-center" });
    } finally {
      setIsLoading(false);
    }
  };


  // ----------------------------------------------------
  // --- MANEJADOR DE SUBIDA EXITOSA ---
  // ----------------------------------------------------
  // Ahora ImageUploader manejará la subida y nos notificará el éxito.
  const handleUploadSuccess = () => {
    setIsUploaderOpen(false);
    // Recargamos la lista para mostrar la imagen recién subida
    fetchImages(); 
    toast.success('✅ Imagen subida exitosamente y galería actualizada.', { position: "bottom-center" });
  };

  // (handleSelectImage se mantiene igual)
  const handleSelectImage = (id: string) => { 
    setSelectedImages((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((imgId) => imgId !== id);
      }
      return [...prevSelected, id];
    });
  };

  // (filteredImages se mantiene igual)
  const filteredImages = useMemo(() => {
    if (!searchQuery) {
      return images;
    }
    return images.filter(image =>
      image.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [images, searchQuery]); 


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

      {isLoading ? (
        <p className={styles.loadingMessage}>Cargando galería...</p>
      ) : (
        <ImageList
          images={filteredImages} 
          selectedImages={selectedImages}
          onSelectImage={handleSelectImage}
        />
      )}

      <ImageUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUploadSuccess={handleUploadSuccess} 
      />

    </div>
  );
};

export default AdminGallery;