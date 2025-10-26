import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { generateCloudinarySignature, deleteCloudinaryImage, listCloudinaryImages } from '../services/uploadService';

// Tipado para la solicitud que debe incluir el campo 'publicId'
interface SignRequest extends Request {
    body: {
        publicId: string;
        // Se puede añadir aquí más metadata si es necesaria para la firma.
    }
}

// @desc    Generar una firma de subida segura para Cloudinary
// @route   POST /api/uploads/sign
// @access  Private/Admin
export const getUploadSignature = asyncHandler(async (req: SignRequest, res: Response) => {
    const { publicId } = req.body;
    
    // 🛡️ VALIDACIÓN: El nombre del archivo es obligatorio para la galería.
    if (!publicId) {
        res.status(400);
        throw new Error('El nombre de archivo (publicId) es obligatorio para generar la firma.');
    }

    try {
        // Genera el objeto de firma con los datos necesarios para el frontend
        const signatureData = generateCloudinarySignature(publicId);

        res.status(200).json({
            signature: signatureData.signature,
            timestamp: signatureData.timestamp,
            apiKey: signatureData.apiKey,
            cloudName: signatureData.cloudName,
            folder: signatureData.folder,
            uploadPreset: signatureData.uploadPreset
        });

    } catch (error) {
        console.error('Error generando firma de Cloudinary:', error);
        res.status(500);
        throw new Error('Error al conectar con Cloudinary o al generar la firma.');
    }
});

// @desc    Eliminar una imagen de Cloudinary
// @route   DELETE /api/uploads/:publicId
// @access  Private/Admin
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
    // ⚠️ NOTA: El publicId debe incluir el nombre de la carpeta: 'cheepers_admin_gallery/nombre_de_archivo'
    const publicId = `cheepers_admin_gallery/${req.params.publicId}`; 

    try {
        const result = await deleteCloudinaryImage(publicId);

        if (result.result === 'not found') {
            res.status(404);
            throw new Error(`Imagen con Public ID "${req.params.publicId}" no encontrada en Cloudinary.`);
        }

        // Cloudinary devuelve 'ok' si se elimina correctamente.
        res.status(200).json({ message: 'Imagen eliminada exitosamente.', result: result });

    } catch (error) {
        // Aseguramos que el error de 404 pase si no lo encontró
        if (res.statusCode === 404) {
             throw error; 
        }
        console.error('Error al intentar eliminar la imagen de Cloudinary:', error);
        res.status(500);
        throw new Error('Error al conectar con Cloudinary o al eliminar la imagen.');
    }
});

// @desc    Obtener una lista de imágenes subidas a la galería
// @route   GET /api/uploads/list
// @access  Private/Admin (Solo lectura)
export const listImages = asyncHandler(async (req: Request, res: Response) => {
    const maxResults = parseInt(req.query.limit as string) || 10;
    const nextCursor = req.query.cursor as string | undefined;

    try {
        const data = await listCloudinaryImages(maxResults, nextCursor);
        
        res.status(200).json({
            images: data.resources.map((r: any) => ({
                public_id: r.public_id,        // ✅ Mantener el nombre original de Cloudinary
                secure_url: r.secure_url,      // ✅ secure_url con guión bajo
                width: r.width,
                height: r.height,
                created_at: r.created_at,
            })),
            nextCursor: data.nextCursor,
            totalCount: data.totalCount
        });

    } catch (error) {
        console.error('Error al listar imágenes de Cloudinary:', error);
        res.status(500);
        throw new Error('Error al conectar con Cloudinary o al listar las imágenes.');
    }
});