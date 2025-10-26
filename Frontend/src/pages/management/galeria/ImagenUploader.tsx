// C:\Users\Usuario\Desktop\Aaron\TRABAJO\Cheepers-Ecommerce-App\Frontend\src\pages\management\galeria\ImagenUploader.tsx

import React, { useState } from 'react';
import axios from 'axios'; // Mantenemos Axios para el manejo de errores generales si es necesario, aunque usamos fetch
import styles from './css/imagenuploader.module.css'; 
import { toast } from 'react-toastify'; 

// Importamos la API que sí necesita autenticación para tu backend
import { getUploadSignature } from '../../management/galeria/galleryApi';
import { GalleryImage } from './AdminGallery'; 

// Las constantes de validación se mantienen
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ImageUploaderProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void; 
}


const ImageUploader: React.FC<ImageUploaderProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [imageName, setImageName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false); 


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage('');
        setSelectedFile(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!ALLOWED_TYPES.includes(file.type)) {
                setErrorMessage(`Tipo de archivo no permitido.`);
                e.target.value = ''; 
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setErrorMessage(`El archivo es demasiado grande. El máximo es ${MAX_FILE_SIZE_MB}MB.`);
                e.target.value = ''; 
                return;
            }
            setSelectedFile(file);
        }
    };


    // --- LÓGICA DE SUBIDA A CLOUDINARY REAL (USANDO FETCH) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setErrorMessage('');

        if (!imageName.trim() || !selectedFile) {
            setErrorMessage('Por favor, ingresa un nombre y selecciona un archivo válido.');
            return;
        }
        
        setIsUploading(true);
        
        try {
            // 1. OBTENER LA FIRMA SEGURA de nuestro Backend (POST /api/uploads/sign)
            const simpleName = imageName.trim().replace(/\s/g, '-').toLowerCase(); 
            const signatureData = await getUploadSignature(simpleName); 
            
            console.log('✅ Firma obtenida del backend:', signatureData); // Para debugging
            
              // PREPARAR FormData - EN ORDEN ALFABÉTICO
    const formData = new FormData();
    formData.append('api_key', signatureData.apiKey);
    formData.append('file', selectedFile);
    formData.append('public_id', `${signatureData.folder}/${simpleName}`);
    formData.append('signature', signatureData.signature);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('upload_preset', signatureData.uploadPreset);

    // DEBUG: Ver qué se está enviando
    console.log('📤 Parámetros que se envían a Cloudinary:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

            // 3. SUBIR DIRECTAMENTE A LA API DE CLOUDINARY USANDO FETCH
            // (fetch NO usa interceptores de Axios, resolviendo el problema)
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData,
                // fetch NO necesita especificar Content-Type para FormData
                // y NO enviará automáticamente el header Authorization.
            });

            if (!response.ok) {
                // Si la subida falla, intenta obtener un mensaje de error de Cloudinary
                const errorData = await response.json();
                console.error('Error de respuesta de Cloudinary:', errorData);
                throw new Error(errorData.error?.message || `Error ${response.status} al subir.`);
            }
            
            // Opcional: obtener el resultado de la subida
            // const result = await response.json(); 
            
            // 4. Notificar al padre y cerrar
            toast.success('✅ Imagen subida exitosamente y galería actualizada.', { position: "bottom-center" });
            onUploadSuccess(); 
            
        } catch (error: any) {
            console.error('Error durante la subida:', error);
            
            // Aseguramos que el mensaje de error sea legible
            const errorMsg = error.message || 'Error desconocido al procesar la subida.';
                
            setErrorMessage(`❌ Subida fallida: ${errorMsg}`);
            toast.error(`❌ Subida fallida: ${errorMsg}`, { position: "bottom-center" });
        } finally {
            setIsUploading(false);
        }
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
                            disabled={isUploading} 
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.uploadButton}`}
                            disabled={!selectedFile || !imageName.trim() || isUploading}
                        >
                            {isUploading ? 'Subiendo...' : 'Subir'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImageUploader;