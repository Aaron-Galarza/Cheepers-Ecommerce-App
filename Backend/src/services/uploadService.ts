import { v2 as cloudinary } from 'cloudinary';


// AGREGAR ESTO TEMPORALMENTE:
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'CARGADO' : 'NO CARGADO');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'CARGADO' : 'NO CARGADO');
// FIN DE LA VERIFICACIÓN TEMPORAL

// 1. Inicializar Cloudinary con las variables de entorno
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Usar HTTPS
});

// Parámetros por defecto para las subidas (seguridad y orden)
const UPLOAD_PRESET = 'cheepers_gallery';
const FOLDER_NAME = 'cheepers_admin_gallery';
const MAX_FILE_SIZE_BYTES = 2000000; // 2 MB

/**
 * Genera una firma segura (signature) para la subida directa desde el frontend.
 * Esta firma asegura que solo subidas autorizadas lleguen a Cloudinary.
 * @param publicId - Nombre que tendrá la imagen en Cloudinary (obligatorio según tu plan).
 * @returns Un objeto con la firma y el timestamp.
 */
export const generateCloudinarySignature = (publicId: string): { signature: string, timestamp: number, apiKey: string, cloudName: string, folder: string, uploadPreset: string } => {
    // El timestamp (segundos desde 1970) es necesario para la firma
    const timestamp = Math.round((new Date().getTime() / 1000));
    
    // Parámetros a firmar
    const paramsToSign = {
        timestamp: timestamp,
        //folder: FOLDER_NAME,
        public_id: `${FOLDER_NAME}/${publicId}`, // Forzar el publicId completo
        upload_preset: UPLOAD_PRESET,
        // Opcional: reforzar validaciones en Cloudinary si es necesario
    };
    
    // Generar la firma
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

    // Devolver todos los datos que el frontend necesita para la subida
    return {
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY as string,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
        folder: FOLDER_NAME,
        uploadPreset: UPLOAD_PRESET
    };
};

/**
 * Elimina una imagen de Cloudinary.
 * @param publicId El ID público de la imagen a eliminar (incluyendo el folder).
 * @returns La respuesta de la API de Cloudinary.
 */
export const deleteCloudinaryImage = async (publicId: string) => {
    // Eliminar la imagen
    const result = await cloudinary.uploader.destroy(publicId);
    
    // Cloudinary devuelve 'ok' o 'not found'
    return result;
};

/**
 * Obtiene la lista de imágenes subidas a la carpeta de la galería.
 * @param maxResults Límite de imágenes a devolver.
 * @param nextCursor Paginación (opcional).
 */
export const listCloudinaryImages = async (maxResults: number = 10, nextCursor?: string) => {
    const result = await cloudinary.api.resources({
        type: 'upload', // Solo archivos subidos
        prefix: FOLDER_NAME, // Solo la carpeta de la galería
        max_results: maxResults,
        direction: 'desc', // Las más nuevas primero
        next_cursor: nextCursor,
    });
    
    return {
        resources: result.resources,
        nextCursor: result.next_cursor,
        totalCount: result.total_count // Nota: total_count puede ser estimado
    };
};

export default cloudinary;