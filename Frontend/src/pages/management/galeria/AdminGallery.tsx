import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'; 
import { FaUpload, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import styles from '../../management.styles/admingallery.module.css'; 
import ImageList from './ImageList'; 
import ImageUploader from './ImagenUploader';
import axios from 'axios';
import { listGalleryImages, deleteGalleryImage } from './galleryApi'; 
import { toast } from 'react-toastify';
import { galleryCache } from './GalleryCache';

export interface GalleryImage { 
  id: string;
  url: string;
  name: string;
  publicId: string;
}

interface PageState {
  cursor?: string;
  pageNumber: number;
}

const AdminGallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [allImages, setAllImages] = useState<GalleryImage[] | null>(null); // Todas las imágenes para búsqueda global
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingAll, setIsFetchingAll] = useState(false); // indicador específico para fetchAll

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState<PageState>({ pageNumber: 1 });
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [pageHistory, setPageHistory] = useState<PageState[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  const searchDebounceMs = 300;
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Función principal para cargar imágenes (por página)
  const fetchImages = useCallback(async (cursor?: string, isNewSearch: boolean = false) => {
    if (isNewSearch) {
      galleryCache.clear();
    }

    // Verificar cache primero
    const cached = galleryCache.getPage(cursor);
    if (cached && !isNewSearch) {
      console.log('📦 Usando cache para página:', cursor || 'primera');
      const mappedImages = mapImages(cached.images);
      setImages(mappedImages);
      setNextCursor(cached.nextCursor);
      setHasNextPage(!!cached.nextCursor);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await listGalleryImages(cursor);
      
      // Guardar en cache
      galleryCache.setPage(cursor, {
        images: data.images,
        nextCursor: data.nextCursor
      });

      const mappedImages = mapImages(data.images);
      setImages(mappedImages);
      setNextCursor(data.nextCursor);
      setHasNextPage(!!data.nextCursor);

    } catch (err: any) {
      const errorMsg = axios.isAxiosError(err) ? (err.response?.data?.message || 'Error de conexión.') : 'Error desconocido.';
      setError(errorMsg);
      toast.error(`Error al cargar la galería: ${errorMsg}`, { position: "bottom-center" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función auxiliar para mapear imágenes
  const mapImages = (imageList: any[]): GalleryImage[] => {
    return imageList.map((img: any) => {
      const simpleId = img.public_id.split('/').pop() || img.public_id;
      return { id: simpleId, url: img.secure_url, name: simpleId, publicId: img.public_id };
    });
  };

  // Nuevo: descargar todas las páginas (usando cache por página cuando esté disponible)
  const fetchAllImages = useCallback(async (signal?: AbortSignal) => {
    // Si ya cargamos todas las imágenes en memoria, no repetir
    if (allImages) return allImages;

    setIsFetchingAll(true);
    setError(null);
    try {
      let cursor: string | undefined = undefined;
      let accumulatedRaw: any[] = [];

      // Iterar páginas hasta que nextCursor sea falsy
      do {
        const cached = galleryCache.getPage(cursor);
        if (cached) {
          accumulatedRaw.push(...cached.images);
          cursor = cached.nextCursor;
          continue;
        }

        // listGalleryImages acepta opcionalmente { signal } si lo adaptas (axios con cancel token o fetch)
        const data = await listGalleryImages(cursor, { signal });
        // Guardar página en cache
        galleryCache.setPage(cursor, { images: data.images, nextCursor: data.nextCursor });
        accumulatedRaw.push(...data.images);
        cursor = data.nextCursor;
      } while (cursor && !signal?.aborted);

      const mapped = mapImages(accumulatedRaw);
      setAllImages(mapped);
      return mapped;
    } catch (err: any) {
      if (signal?.aborted) return null;
      const errorMsg = axios.isAxiosError(err) ? (err.response?.data?.message || 'Error de conexión al obtener todas las imágenes.') : 'Error desconocido.';
      setError(errorMsg);
      toast.error(`Error al buscar en todas las imágenes: ${errorMsg}`, { position: "bottom-center" });
      return null;
    } finally {
      setIsFetchingAll(false);
    }
  }, [allImages]);

  // Carga inicial
  useEffect(() => { 
    fetchImages(undefined, true);
  }, [fetchImages]);

  // Navegación entre páginas
  const goToPage = useCallback((cursor?: string, direction: 'next' | 'prev' | 'first' = 'first') => {
    if (direction === 'next' && !nextCursor) return;
    
    const newPageState: PageState = { cursor, pageNumber: currentPage.pageNumber + (direction === 'next' ? 1 : -1) };
    
    setPageHistory(prev => {
      if (direction === 'next') {
        return [...prev, currentPage];
      } else if (direction === 'prev' && prev.length > 0) {
        return prev.slice(0, -1);
      }
      return prev;
    });

    setCurrentPage(newPageState);
    fetchImages(cursor);
  }, [currentPage, nextCursor, fetchImages]);

  const handleNextPage = () => {
    if (nextCursor) {
      goToPage(nextCursor, 'next');
    }
  };

  const handlePrevPage = () => {
    if (pageHistory.length > 0) {
      const previousPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(previousPage);
      fetchImages(previousPage.cursor);
    }
  };

  const handleFirstPage = () => {
    setPageHistory([]);
    setCurrentPage({ pageNumber: 1 });
    fetchImages(undefined, true);
  };

  // Eliminación de imágenes
  const handleDeleteClick = async () => {
    if (selectedImages.length === 0 || !window.confirm(`¿Eliminar ${selectedImages.length} imagen(es)?`)) return;
    
    setIsLoading(true);
    try {
      const simpleIdsToDelete = images.filter(img => selectedImages.includes(img.id)).map(img => img.id);
      await Promise.all(simpleIdsToDelete.map(id => deleteGalleryImage(id)));
      
      // Invalidar cache y recargar
      galleryCache.invalidate();
      setAllImages(null); // invalidar conjunto completo también
      await fetchImages(currentPage.cursor, true);
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
    // Invalidar cache y volver a la primera página
    galleryCache.invalidate();
    setAllImages(null);
    handleFirstPage();
    toast.success('✅ Imagen subida exitosamente.', { position: "bottom-center" });
  };

  const handleSelectImage = (id: string) => {
    setSelectedImages(prev => prev.includes(id) ? prev.filter(imgId => imgId !== id) : [...prev, id]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Cuando cambia la query de búsqueda, si no está vacía, asegurarse de cargar todas las imágenes
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setAllImages(null); fetchImages(currentPage.cursor); return; }

    debounceRef.current = window.setTimeout(() => {
      // cancelar petición previa
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setIsLoading(true);
      fetchAllImages(ac.signal).finally(() => setIsLoading(false));
    }, searchDebounceMs);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      // don't abort here to allow finishing unless new run starts
    };
  }, [searchQuery, fetchAllImages, fetchImages, currentPage.cursor]);

  // Filtrar imágenes basado en búsqueda (si hay búsqueda, usar allImages cuando esté lista)
  const filteredImages = useMemo(() => {
    const source = searchQuery.trim() ? (allImages ?? images) : images;
    return !searchQuery ? source : source.filter(image => 
      image.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [images, allImages, searchQuery]);

  const canGoBack = pageHistory.length > 0;
  const canGoForward = hasNextPage;

  return (
  <div className={styles.galleryContainer}>
    <header className={styles.galleryHeader}>
      <h1 className={styles.galleryTitle}>Galería de Imágenes</h1>
      
      <input 
        type="text" 
        placeholder="Buscar por nombre..." 
        className={styles.searchInput} 
        value={searchQuery} 
        onChange={handleSearch} 
      />

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

    {/* Si hay búsqueda global activa, mostrar info de resultados en lugar de paginado */}
    {!isLoading && filteredImages.length > 0 && searchQuery.trim() ? (
      <div className={styles.paginationContainer}>
        <div className={styles.paginationInfo}>
          Resultados: {filteredImages.length} imágenes (buscando en toda la galería)
        </div>
      </div>
    ) : (
      !isLoading && images.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Mostrando {filteredImages.length} imágenes - Página {currentPage.pageNumber}
          </div>
          <div className={styles.paginationControls}>
            <button 
              onClick={handlePrevPage}
              disabled={!canGoBack}
              className={styles.paginationButton}
            >
              <FaArrowLeft /> Anterior
            </button>
            <button 
              onClick={handleNextPage}
              disabled={!canGoForward}
              className={styles.paginationButton}
            >
              Siguiente <FaArrowRight />
            </button>
          </div>
        </div>
      )
    )}

    {/* Contenido de la galería */}
    {isLoading ? (
      <p className={styles.loadingMessage}>Cargando galería...</p>
    ) : error ? (
      <p className={styles.errorMessage}>{error}</p>
    ) : (
      <>
        <ImageList 
          images={filteredImages} 
          selectedImages={selectedImages}
          onSelectImage={handleSelectImage} 
        />
        
        {filteredImages.length === 0 && searchQuery && (
          <p className={styles.noResults}>No se encontraron imágenes con "{searchQuery}"</p>
        )}
      </>
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