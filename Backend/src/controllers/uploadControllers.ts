import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { generateCloudinarySignature, deleteCloudinaryImage, listCloudinaryImages } from '../services/uploadService';

interface SignRequest extends Request {
    body: { publicId: string; }
}

export const getUploadSignature = asyncHandler(async (req: SignRequest, res: Response) => {
    const { publicId } = req.body;
    
    if (!publicId) {
        res.status(400);
        throw new Error('El nombre de archivo (publicId) es obligatorio.');
    }

    try {
        const signatureData = generateCloudinarySignature(publicId);
        res.status(200).json(signatureData);
    } catch (error) {
        console.error('Error generando firma de Cloudinary:', error);
        res.status(500);
        throw new Error('Error al generar la firma.');
    }
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const publicId = `cheepers_admin_gallery/${req.params.publicId}`;

    try {
        const result = await deleteCloudinaryImage(publicId);
        if (result.result === 'not found') {
            res.status(404);
            throw new Error(`Imagen "${req.params.publicId}" no encontrada.`);
        }
        res.status(200).json({ message: 'Imagen eliminada exitosamente.', result });
    } catch (error) {
        if (res.statusCode === 404) throw error;
        console.error('Error eliminando imagen:', error);
        res.status(500);
        throw new Error('Error al eliminar la imagen.');
    }
});

export const listImages = asyncHandler(async (req: Request, res: Response) => {
    const maxResults = parseInt(req.query.limit as string) || 10;
    const nextCursor = req.query.cursor as string | undefined;

    try {
        const data = await listCloudinaryImages(maxResults, nextCursor);
        res.status(200).json({
            images: data.resources.map((r: any) => ({
                public_id: r.public_id,
                secure_url: r.secure_url,
                width: r.width,
                height: r.height,
                created_at: r.created_at,
            })),
            nextCursor: data.nextCursor,
            totalCount: data.totalCount
        });
    } catch (error) {
        console.error('Error listando imágenes:', error);
        res.status(500);
        throw new Error('Error al listar las imágenes.');
    }
});