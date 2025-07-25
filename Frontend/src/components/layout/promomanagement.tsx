import React, { useState, useEffect, useRef } from 'react'; // Importa useRef
import axios from 'axios';
import styles from './promomanagement.module.css';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import authService from '../../services/authservice';

// Interfaz Promotion debe ser idéntica a Product del backend
export interface Promotion {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  discountPercentage?: number;
  isActive: boolean;
}

type NewPromotionData = Omit<Promotion, '_id'>;

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const PromoManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [newPromotion, setNewPromotion] = useState<NewPromotionData>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'Promos Solo en Efectivo',
    discountPercentage: 0,
    isActive: true,
  });
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // Crea una referencia para el contenedor principal del componente
  const promoManagementContainerRef = useRef<HTMLDivElement>(null);
  // Estado para detectar si es móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Efecto para actualizar isMobile cuando la ventana cambia de tamaño
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para desplazar el elemento relevante al inicio, solo en móviles
  const scrollToTopForMobile = () => {
    if (isMobile) {
      // Usamos setTimeout para asegurar que el scroll se ejecuta después del renderizado del DOM
      setTimeout(() => {
        // Intenta desplazar la ventana completa (para el caso más general)
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Si la ventana no es la que se desplaza, intenta desplazar el documento HTML
        document.documentElement.scrollTop = 0;
        // Y también el body, por si acaso (compatibilidad)
        document.body.scrollTop = 0;

        // Finalmente, si el scroll está en el contenedor de este componente, desplázalo
        if (promoManagementContainerRef.current) {
          promoManagementContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
      }, 50); // Un pequeño retardo para asegurar que el DOM esté listo
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get<Promotion[]>(`${API_BASE_URL}/api/products?includeInactive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/api/products`, newPromotion, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewPromotion({ name: '', description: '', price: 0, imageUrl: '', category: 'Promos Solo en Efectivo', discountPercentage: 0, isActive: true });
      fetchPromotions();
      scrollToTopForMobile(); // Desplaza al inicio después de crear una promoción (solo en móvil)
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
    // Desplazarse al formulario de edición (solo en móvil)
    scrollToTopForMobile();
  };

  const handleUpdatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromotion) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE_URL}/api/products/${editingPromotion._id}`, editingPromotion, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingPromotion(null);
      fetchPromotions();
      scrollToTopForMobile(); // Desplaza al inicio después de actualizar una promoción (solo en móvil)
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
    console.log('Confirmación de eliminación: ¿Estás seguro de que quieres eliminar esta promoción?');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPromotions();
      scrollToTopForMobile(); // Desplaza al inicio después de eliminar una promoción (solo en móvil)
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

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/api/products/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Promoción ${id} cambiada a ${response.data.product.isActive}`);
      fetchPromotions();
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

  const filteredPromotions = promotions.filter(promo => {
    const matchesStatus = filterStatus === 'Todos' ||
                          (filterStatus === 'Activas' && promo.isActive) ||
                          (filterStatus === 'Inactivas' && !promo.isActive);
    return matchesStatus;
  });

  if (loading) return <div className={styles.loading}>Cargando promociones...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    // Adjunta la referencia al contenedor principal del componente
    <div ref={promoManagementContainerRef} className={styles.promoManagementContainer}>
      <h1 className={styles.title}>Gestión de Promociones</h1>

      {/* Añade un ID a la sección del formulario para poder hacer scroll a ella */}
      <div id="promo-form-section" className={styles.formSection}>
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

      <div className={styles.filterSection}>
        <label htmlFor="statusFilter" className={styles.filterLabel}>Filtrar por Estado:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.selectField}
        >
          <option value="Todos">Todos</option>
          <option value="Activas">Activas</option>
          <option value="Inactivas">Inactivas</option>
        </select>
      </div>

      <h2 className={styles.listTitle}>Promociones Existentes</h2>
      <div className={styles.promotionsList}>
        {filteredPromotions.length === 0 && !loading && !error ? (
          <p className={styles.noPromosMessage}>No hay promociones creadas o que coincidan con el filtro.</p>
        ) : (
          filteredPromotions.map((promo) => (
            <div key={promo._id} className={styles.promoCard}>
              {/* Capa gris si está desactivada */}
              {!promo.isActive && <div className={styles.promoCardOverlay} />}
              
              <img src={promo.imageUrl || 'https://placehold.co/400x200/cccccc/333333?text=Promo+Image'} alt={promo.name} className={styles.promoImage} />
              <div className={styles.promoInfo}>
                <h3>{promo.name}</h3>
                <p>{promo.description}</p>
                <p className={styles.promoPrice}>Precio: ${promo.price?.toFixed(2) || 'N/A'}</p>
                <p className={styles.promoStatus}>Estado: <span className={promo.isActive ? styles.activeStatus : styles.inactiveStatus}>{promo.isActive ? 'Activa' : 'Inactiva'}</span></p>
              </div>
              <div className={styles.promoActions}>
                <button
                  onClick={() => handleToggleActive(promo._id, promo.isActive)}
                  className={promo.isActive ? styles.toggleInactiveButton : styles.toggleActiveButton}
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
