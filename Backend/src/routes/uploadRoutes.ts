import express from 'express';
import { getUploadSignature, deleteImage, listImages } from '../controllers/uploadControllers';
// Importa tus middlewares de autenticación y autorización
// Asegúrate de que estos paths sean correctos en tu proyecto
import { protect, admin, owner } from '../middleware/authMiddleware'; 

const router = express.Router();

// 1. GET /api/uploads/list - Listar imágenes (Solo lectura, Admin)
router.route('/list').get(protect, admin, owner, listImages);
// 2. POST /api/uploads/sign - Obtener firma para subida (Admin)
router.route('/sign').post(protect, admin, owner, getUploadSignature);
// 3. DELETE /api/uploads/:publicId - Eliminar imagen (Admin)
router.route('/:publicId').delete(protect, admin, owner, deleteImage);

export default router;