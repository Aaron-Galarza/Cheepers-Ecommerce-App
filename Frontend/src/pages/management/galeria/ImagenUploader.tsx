// src/pages/management/galeria/ImageUploader.tsx

import React, { useState } from 'react';
import styles from './css/imagenuploader.module.css'; 

interface ImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (name: string, file: File) => void;
}

// --- 1. DEFINIMOS LAS CONSTANTES DE VALIDACIÓN ---
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 2MB en bytes

const ImageUploader: React.FC<ImageUploaderProps> = ({ isOpen, onClose, onUpload }) => {
  const [imageName, setImageName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // --- 2. LÓGICA DE VALIDACIÓN EN handleFileChange ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpiamos errores y archivos anteriores
    setErrorMessage('');
    setSelectedFile(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // --- Verificación de Tipo ---
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMessage(`Tipo de archivo no permitido. Sube solo ${ALLOWED_TYPES.join(', ')}`);
        e.target.value = ''; // Resetea el input
        return;
      }

      // --- Verificación de Tamaño ---
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`El archivo es demasiado grande. El máximo es ${MAX_FILE_SIZE_MB}MB.`);
        e.target.value = ''; // Resetea el input
        return;
      }

      // ¡Validación exitosa!
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrorMessage(''); // Limpia errores por si acaso

    // Validaciones de formulario (ya las tenías)
    if (!imageName.trim()) {
      setErrorMessage('Por favor, ingresa un nombre para la imagen.');
      return;
    }
    if (!selectedFile) {
      setErrorMessage('Por favor, selecciona un archivo válido.');
      return;
    }

    // Si todo está bien, llamamos a la función del padre
    onUpload(imageName, selectedFile);
    
    // Limpiamos y cerramos el modal
    handleClose();
  };

  const handleClose = () => {
    setImageName('');
    setSelectedFile(null);
    setErrorMessage('');
    onClose(); 
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <h2 className={styles.modalTitle}>Subir Nueva Imagen</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="imageName">Nombre de la imagen</label>
            <input
              type="text"
              id="imageName"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="Ej: Promo Hamburguesa Lunes"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="fileUpload">Cargar archivo (Máx: {MAX_FILE_SIZE_MB}MB)</label>
            <input
              type="file"
              id="fileUpload"
              // 3. ACTUALIZAMOS EL 'accept' para que coincida
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileChange}
            />
          </div>

          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}

          <div className={styles.buttonContainer}>
            <button
              type="button" 
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.uploadButton}`}
              disabled={!selectedFile || !imageName.trim()}
            >
              Subir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageUploader;