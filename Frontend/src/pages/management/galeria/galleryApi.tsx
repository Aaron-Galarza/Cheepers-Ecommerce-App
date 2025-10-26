import axios from 'axios';

// Usamos la misma lógica de URL base que tienes en OrdersManagement
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${API_BASE_URL}/api/uploads`; 

// --- Configuración de Autenticación (Basado en tu uso de 'adminToken' en OrdersManagement) ---
const getToken = () => {
    // Usamos 'adminToken' para mantener la coherencia con OrdersManagement.tsx
    return localStorage.getItem('adminToken'); 
};

// Función para obtener la configuración con el token de Admin
const getConfig = () => {
    const token = getToken();
    if (!token) {
        // En un entorno real, esto debería redirigir a la página de login
        throw new Error("No hay token de autenticación disponible. Sesión no autorizada.");
    }
    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
};

// --- SERVICIOS DE GALERÍA ---

/**
 * 1. Obtiene la firma segura del backend para subir una imagen a Cloudinary.
 * Endpoint: POST /api/uploads/sign
 */
export const getUploadSignature = async (publicId: string) => {
    try {
        const config = getConfig();
        const { data } = await axios.post(`${API_URL}/sign`, { publicId }, config);
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * 2. Obtiene la lista de imágenes de Cloudinary.
 * Endpoint: GET /api/uploads/list
 */
export const listGalleryImages = async (cursor?: string) => {
    try {
        const config = getConfig();
        const url = cursor ? `${API_URL}/list?cursor=${cursor}` : `${API_URL}/list`;
        const { data } = await axios.get(url, config);
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * 3. Elimina una imagen de Cloudinary a través del backend.
 * Endpoint: DELETE /api/uploads/:publicId
 * simplePublicId: El nombre simple del archivo (ej: 'foto-1', sin la carpeta 'cheepers_admin_gallery/').
 */
export const deleteGalleryImage = async (simplePublicId: string) => {
    try {
        const config = getConfig();
        const { data } = await axios.delete(`${API_URL}/${simplePublicId}`, config);
        return data;
    } catch (error) {
        throw error;
    }
};