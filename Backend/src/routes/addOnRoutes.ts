import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
    getAddOns,
    getAddOnById,
    createAddOn,
    updateAddOn,
    deleteAddOn,
    toggleAddOnActiveStatus,
} from '../controllers/addOnController'; // Tus controladores de adicionales
import { protect, admin } from '../middleware/authMiddleware'; // <-- IMPORTA LOS MIDDLEWARES

const router = Router();

// Rutas públicas (cualquiera puede ver los adicionales activos)
// Similar a productos, los usuarios verán solo los adicionales 'isActive: true' por defecto.
// Para el admin, se puede usar '?includeInactive=true' en el frontend.
router.get('/', asyncHandler(getAddOns));
router.get('/:id', asyncHandler(getAddOnById));

// Rutas protegidas (solo usuarios autenticados y administradores pueden hacer estas operaciones)
// Para crear un adicional, necesitas estar autenticado Y ser admin
router.post('/', protect, admin, asyncHandler(createAddOn));
// Para actualizar un adicional, necesitas estar autenticado Y ser admin
router.put('/:id', protect, admin, asyncHandler(updateAddOn));
// Para eliminar un adicional, necesitas estar autenticado Y ser admin
router.delete('/:id', protect, admin, asyncHandler(deleteAddOn));
// Ruta para que el administrador pueda habilitar/deshabilitar un adicional
router.put('/:id/toggle-active', protect, admin, toggleAddOnActiveStatus);

export default router;