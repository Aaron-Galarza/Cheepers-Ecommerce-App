// src/components/layout/PromoManagement.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './promomanagement.module.css'; // Importa el CSS Module
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'; // Iconos para CRUD
import authService from '../../services/authservice'; // Importa authService para su interceptor

// Interfaz para la estructura de una Promoción (ahora compatible con Product)
// Asumimos que las promociones son productos con una categoría específica.
export interface Promotion {
  _id: string;
  name: string;
  description: string;
  price: number; // Las promociones también pueden tener un precio base
  imageUrl: string;
  category: string; // Esperamos 'Promos Solo en Efectivo'
  // Puedes añadir otros campos específicos de promoción si tu backend los maneja,
  // pero por ahora, nos basamos en la estructura de Product.
  discountPercentage?: number; // Campo opcional si lo usas para mostrar
  isActive?: boolean; // Campo opcional si lo usas para activar/desactivar
}

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const PromoManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [newPromotion, setNewPromotion] = useState<Omit<Promotion, '_id'>>({
    name: '',
    description: '',
    price: 0, // Precio base para la promoción
    imageUrl: '',
    category: 'Promos Solo en Efectivo', // Categoría por defecto para nuevas promociones
    discountPercentage: 0, // Se mantiene en el estado inicial, pero no se muestra en el formulario
    isActive: true, // Se mantiene en el estado inicial, pero no se muestra en el formulario
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener productos y luego filtrar por categoría de promoción
      const response = await axios.get<Promotion[]>(`${API_BASE_URL}/api/products`);
      const filteredPromos = response.data.filter(p => p.category === 'Promos Solo en Efectivo');
      setPromotions(filteredPromos);
    } catch (err: any) {
      console.error('Error al cargar las promociones:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout(); // Limpia el token si la sesión no es válida
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
      // Al crear, enviamos a /api/products con la categoría de promoción
      await axios.post(`${API_BASE_URL}/api/products`, newPromotion);
      // Reset form, manteniendo los valores por defecto para discountPercentage y isActive
      setNewPromotion({ name: '', description: '', price: 0, imageUrl: '', category: 'Promos Solo en Efectivo', discountPercentage: 0, isActive: true });
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
      // Al actualizar, enviamos a /api/products/:id
      // Se envían todos los campos del objeto editingPromotion, incluyendo discountPercentage e isActive
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
      // Al eliminar, enviamos a /api/products/:id
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
          {/* Campo de Porcentaje de Descuento ELIMINADO */}
          {/* Checkbox de Promoción Activa ELIMINADO */}
          <input
            type="text"
            placeholder="URL de la Imagen (Opcional)"
            value={editingPromotion ? editingPromotion.imageUrl || '' : newPromotion.imageUrl || ''}
            onChange={(e) => editingPromotion ? setEditingPromotion({ ...editingPromotion, imageUrl: e.target.value }) : setNewPromotion({ ...newPromotion, imageUrl: e.target.value })}
            className={styles.inputField}
          />

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
                {/* Descuento ELIMINADO */}
                {/* Estado ELIMINADO */}
              </div>
              <div className={styles.promoActions}>
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