import React, { useState, useMemo, useEffect, useCallback } from 'react'; 
import { FaUpload, FaTrash } from 'react-icons/fa';
import styles from '../../management.styles/admingallery.module.css'; 
import ImageList from './ImageList'; 
import ImageUploader from './ImagenUploader';
import axios from 'axios';
import { listGalleryImages, deleteGalleryImage } from '../../management/galeria/galleryApi'; 
import { toast } from 'react-toastify';

export interface GalleryImage { 
  id: string;
  url: string;
  name: string;
  publicId: string;
}

const AdminGallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listGalleryImages();
      const mappedImages: GalleryImage[] = data.images.map((img: any) => {
        const simpleId = img.public_id.split('/').pop() || img.public_id;
        return { id: simpleId, url: img.secure_url, name: simpleId, publicId: img.public_id };
      });
      mappedImages.sort((a, b) => a.id.localeCompare(b.id));
      setImages(mappedImages);
    } catch (err: any) {
      const errorMsg = axios.isAxiosError(err) ? (err.response?.data?.message || 'Error de conexión.') : 'Error desconocido.';
      setError(errorMsg);
      toast.error(`Error al cargar la galería: ${errorMsg}`, { position: "bottom-center" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleDeleteClick = async () => {
    if (selectedImages.length === 0 || !window.confirm(`¿Eliminar ${selectedImages.length} imagen(es)?`)) return;
    setIsLoading(true);
    try {
      const simpleIdsToDelete = images.filter(img => selectedImages.includes(img.id)).map(img => img.id);
      await Promise.all(simpleIdsToDelete.map(id => deleteGalleryImage(id)));
      await fetchImages();
      setSelectedImages([]);
      toast.success(`✅ ${simpleIdsToDelete.length} imagen(es) eliminada(s).`, { position: "bottom-center" });
    } catch (err: any) {
      const errorMsg = axios.isAxiosError(err) ? (err.response?.data?.message || 'Error al eliminar.') : 'Error desconocido.';
      toast.error(`Error al eliminar: ${errorMsg}`, { position: "bottom-center" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setIsUploaderOpen(false);
    fetchImages();
    toast.success('✅ Imagen subida exitosamente.', { position: "bottom-center" });
  };

  const handleSelectImage = (id: string) => {
    setSelectedImages(prev => prev.includes(id) ? prev.filter(imgId => imgId !== id) : [...prev, id]);
  };

  const filteredImages = useMemo(() => {
    return !searchQuery ? images : images.filter(image => image.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [images, searchQuery]);

  return (
    <div className={styles.galleryContainer}>
      <header className={styles.galleryHeader}>
        <h1 className={styles.galleryTitle}>Galería de Imágenes</h1>
        <input type="text" placeholder="Buscar por nombre..." className={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <div className={styles.buttonGroup}>
          <button onClick={() => setIsUploaderOpen(true)} className={`${styles.galleryButton} ${styles.uploadBtn}`}>
            <FaUpload /> Subir imagen
          </button>
          {selectedImages.length > 0 && (
            <button onClick={handleDeleteClick} className={`${styles.galleryButton} ${styles.deleteBtn}`}>
              <FaTrash /> Eliminar ({selectedImages.length})
            </button>
          )}
        </div>
      </header>

      {isLoading ? <p className={styles.loadingMessage}>Cargando galería...</p> : <ImageList images={filteredImages} selectedImages={selectedImages} onSelectImage={handleSelectImage} />}
      <ImageUploader isOpen={isUploaderOpen} onClose={() => setIsUploaderOpen(false)} onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default AdminGallery;