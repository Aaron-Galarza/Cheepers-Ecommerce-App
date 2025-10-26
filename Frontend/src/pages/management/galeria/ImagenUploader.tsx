import React, { useState } from 'react';
import styles from './css/imagenuploader.module.css';
import { toast } from 'react-toastify';
import { getUploadSignature } from '../../management/galeria/galleryApi';

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
                setErrorMessage('Tipo de archivo no permitido.');
                e.target.value = '';
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setErrorMessage(`El archivo es demasiado grande. Máx: ${MAX_FILE_SIZE_MB}MB.`);
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        if (!imageName.trim() || !selectedFile) {
            setErrorMessage('Por favor, ingresa un nombre y selecciona un archivo.');
            return;
        }
        setIsUploading(true);
        try {
            const simpleName = imageName.trim().replace(/\s/g, '-').toLowerCase();
            const signatureData = await getUploadSignature(simpleName);
            const formData = new FormData();
            formData.append('api_key', signatureData.apiKey);
            formData.append('file', selectedFile);
            formData.append('public_id', `${signatureData.folder}/${simpleName}`);
            formData.append('signature', signatureData.signature);
            formData.append('timestamp', signatureData.timestamp.toString());
            formData.append('upload_preset', signatureData.uploadPreset);
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
            const response = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Error ${response.status} al subir.`);
            toast.success('✅ Imagen subida exitosamente.', { position: "bottom-center" });
            onUploadSuccess();
        } catch (error: any) {
            const errorMsg = error.message || 'Error desconocido.';
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

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Subir Nueva Imagen</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="imageName">Nombre de la imagen</label>
                        <input type="text" id="imageName" value={imageName} onChange={(e) => setImageName(e.target.value)} placeholder="Ej: Promo Hamburguesa Lunes" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fileUpload">Cargar archivo (Máx: {MAX_FILE_SIZE_MB}MB)</label>
                        <input type="file" id="fileUpload" accept={ALLOWED_TYPES.join(',')} onChange={handleFileChange} />
                    </div>
                    {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                    <div className={styles.buttonContainer}>
                        <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={handleClose} disabled={isUploading}>Cancelar</button>
                        <button type="submit" className={`${styles.button} ${styles.uploadButton}`} disabled={!selectedFile || !imageName.trim() || isUploading}>
                            {isUploading ? 'Subiendo...' : 'Subir'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImageUploader;