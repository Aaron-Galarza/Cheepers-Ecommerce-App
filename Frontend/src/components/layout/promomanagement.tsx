// src/components/layout/PromoManagement.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './promomanagement.module.css';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import authService from '../../services/authservice';

// <-- CAMBIO/ADICIÓN AQUÍ: Interfaz Promotion debe ser idéntica a Product del backend
export interface Promotion {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  // Estos campos ahora son obligatorios en la interfaz para que TypeScript los reconozca siempre
  // si tu backend los devuelve, lo cual es el caso de 'isActive'.
  discountPercentage?: number; // Sigue siendo opcional si no lo usas en el backend para todas las promos
  isActive: boolean; // <-- AHORA OBLIGATORIO Y PARTE DE CADA PROMOCIÓN/PRODUCTO
}

// <-- CAMBIO/ADICIÓN AQUÍ: Tipo para crear/editar promociones sin _id
type NewPromotionData = Omit<Promotion, '_id'>;


const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const PromoManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  // <-- CAMBIO/ADICIÓN AQUÍ: Inicializa newPromotion con isActive: true
  const [newPromotion, setNewPromotion] = useState<NewPromotionData>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'Promos Solo en Efectivo',
    discountPercentage: 0,
    isActive: true, // <-- Por defecto, una nueva promoción estará activa
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      // <-- CAMBIO/ADICIÓN AQUÍ: Obtener TODOS los productos (incluyendo inactivos) para el admin
      const response = await axios.get<Promotion[]>(`${API_BASE_URL}/api/products?includeInactive=true`);
      const filteredPromos = response.data.filter(p => p.category === 'Promos Solo en Efectivo');
      setPromotions(filteredPromos);
    } catch (err: any) {
      console.error('Error al cargar las promociones:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('No se pudieron cargar las promociones. Verifica la conexión o tu sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // newPromotion ya incluye isActive por defecto
      await axios.post(`${API_BASE_URL}/api/products`, newPromotion);
      setNewPromotion({ name: '', description: '', price: 0, imageUrl: '', category: 'Promos Solo en Efectivo', discountPercentage: 0, isActive: true }); // Reset form
      fetchPromotions(); // Refresh list
    } catch (err: any) {
      console.error('Error al crear promoción:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al crear promoción. Verifica los datos y tu sesión.');
      }
    }
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
  };

  const handleUpdatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromotion) return;
    try {
      // editingPromotion ya incluye isActive
      await axios.put(`${API_BASE_URL}/api/products/${editingPromotion._id}`, editingPromotion);
      setEditingPromotion(null); // Exit editing mode
      fetchPromotions(); // Refresh list
    } catch (err: any) {
      console.error('Error al actualizar promoción:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al actualizar promoción. Verifica los datos y tu sesión.');
      }
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      fetchPromotions(); // Refresh list
    } catch (err: any) {
      console.error('Error al eliminar promoción:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Error al eliminar promoción. Verifica tu sesión.');
      } else {
        setError('Error al eliminar promoción. Verifica tu sesión.');
      }
    }
  };

  // <-- ADICIÓN AQUÍ: Nueva función para cambiar el estado activo de una promoción
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/products/${id}/toggle-active`);
      console.log(`Promoción ${id} cambiada a ${response.data.product.isActive}`);
      fetchPromotions(); // Refresca la lista para mostrar el nuevo estado
    } catch (err: any) {
      console.error(`Error al cambiar estado de promoción ${id}:`, err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError(`Error al cambiar estado de promoción. ¿Estás logueado?`);
      }
    }
  };


  if (loading) return <div className={styles.loading}>Cargando promociones...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.promoManagementContainer}>
      <h1 className={styles.title}>Gestión de Promociones</h1>

      {/* Formulario para Crear/Editar Promoción */}
      <div className={styles.formSection}>
        <h2 className={styles.formTitle}>{editingPromotion ? 'Editar Promoción' : 'Crear Nueva Promoción'}</h2>
        <form onSubmit={editingPromotion ? handleUpdatePromotion : handleCreatePromotion} className={styles.promoForm}>
          <input
            type="text"
            placeholder="Nombre de la Promoción"
            value={editingPromotion ? editingPromotion.name : newPromotion.name}
            onChange={(e) => editingPromotion ? setEditingPromotion({ ...editingPromotion, name: e.target.value }) : setNewPromotion({ ...newPromotion, name: e.target.value })}
            className={styles.inputField}
            required
          />
          <textarea
            placeholder="Descripción de la Promoción"
            value={editingPromotion ? editingPromotion.description : newPromotion.description}
            onChange={(e) => editingPromotion ? setEditingPromotion({ ...editingPromotion, description: e.target.value }) : setNewPromotion({ ...newPromotion, description: e.target.value })}
            className={styles.textareaField}
            required
          />
          <input
            type="number"
            placeholder="Precio Base de la Promoción"
            value={editingPromotion ? editingPromotion.price : newPromotion.price}
            onChange={(e) => editingPromotion ? setEditingPromotion({ ...editingPromotion, price: parseFloat(e.target.value) }) : setNewPromotion({ ...newPromotion, price: parseFloat(e.target.value) })}
            className={styles.inputField}
            step="0.01"
            required
          />
          <input
            type="text"
            placeholder="URL de la Imagen (Opcional)"
            value={editingPromotion ? editingPromotion.imageUrl || '' : newPromotion.imageUrl || ''}
            onChange={(e) => editingPromotion ? setEditingPromotion({ ...editingPromotion, imageUrl: e.target.value }) : setNewPromotion({ ...newPromotion, imageUrl: e.target.value })}
            className={styles.inputField}
          />
          {/* <-- ADICIÓN AQUÍ: Campo para isActive en el formulario de edición/creación */}
          <div className={styles.formGroup}>
            <label htmlFor="promoIsActive">Activa:</label>
            <input
              type="checkbox"
              id="promoIsActive"
              checked={editingPromotion ? editingPromotion.isActive : newPromotion.isActive}
              onChange={(e) => editingPromotion ? setEditingPromotion({ ...editingPromotion, isActive: e.target.checked }) : setNewPromotion({ ...newPromotion, isActive: e.target.checked })}
              className={styles.checkboxField}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              <FaSave /> {editingPromotion ? 'Actualizar Promoción' : 'Crear Promoción'}
            </button>
            {editingPromotion && (
              <button type="button" onClick={() => setEditingPromotion(null)} className={styles.cancelButton}>
                <FaTimes /> Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Promociones */}
      <h2 className={styles.listTitle}>Promociones Existentes</h2>
      <div className={styles.promotionsList}>
        {promotions.length === 0 && !loading && !error ? (
          <p className={styles.noPromosMessage}>No hay promociones creadas.</p>
        ) : (
          promotions.map((promo) => (
            <div key={promo._id} className={styles.promoCard}>
              <img src={promo.imageUrl || 'https://placehold.co/400x200/cccccc/333333?text=Promo+Image'} alt={promo.name} className={styles.promoImage} />
              <div className={styles.promoInfo}>
                <h3>{promo.name}</h3>
                <p>{promo.description}</p>
                <p className={styles.promoPrice}>Precio: ${promo.price?.toFixed(2) || 'N/A'}</p>
                {/* <-- ADICIÓN AQUÍ: Mostrar el estado isActive para la promoción */}
                <p className={styles.promoStatus}>Estado: <span className={promo.isActive ? styles.activeStatus : styles.inactiveStatus}>{promo.isActive ? 'Activa' : 'Inactiva'}</span></p>
              </div>
              <div className={styles.promoActions}>
                {/* <-- ADICIÓN AQUÍ: Botón para cambiar el estado isActive de la promoción */}
                <button
                  onClick={() => handleToggleActive(promo._id, promo.isActive)}
                  className={promo.isActive ? styles.toggleInactiveButton : styles.toggleActiveButton} // Clases CSS para diferentes estilos
                >
                  {promo.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleEditPromotion(promo)} className={styles.editButton}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDeletePromotion(promo._id)} className={styles.deleteButton}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PromoManagement;