import React, { useState, useEffect, useRef } from 'react';
import styles from './../../pages/management.styles/promomanagement.module.css';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { usePromoManagement, Promotion, NewPromotionData, PROMO_TAGS } from '../../hooks/usePromomanagement'; 

const PromoManagement: React.FC = () => {
  const {
    promotions,
    loading,
    error,
    editingPromotion,
    setEditingPromotion,
    filterStatus,
    setFilterStatus,
    handleCreatePromotion,
    handleUpdatePromotion,
    handleDeletePromotion,
    handleToggleActive,
  } = usePromoManagement();

  // CORREGIDO: Usamos la categoría original
  const [newPromotion, setNewPromotion] = useState<NewPromotionData>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'Promos Solo en Efectivo',
    isActive: true,
    tags: [],
  });

  const promoManagementContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTagChange = (tag: string) => {
    if (editingPromotion) {
      const currentTags = editingPromotion.tags || [];
      if (currentTags.includes(tag)) {
        setEditingPromotion({
          ...editingPromotion,
          tags: currentTags.filter(t => t !== tag),
        });
      } else {
        setEditingPromotion({
          ...editingPromotion,
          tags: [...currentTags, tag],
        });
      }
    } else {
      const currentTags = newPromotion.tags || [];
      if (currentTags.includes(tag)) {
        setNewPromotion({
          ...newPromotion,
          tags: currentTags.filter(t => t !== tag),
        });
      } else {
        setNewPromotion({
          ...newPromotion,
          tags: [...currentTags, tag],
        });
      }
    }
  };

  const scrollToTopForMobile = () => {
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (promoManagementContainerRef.current) {
          promoManagementContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
      }, 50);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleCreatePromotion(newPromotion);
    if (result.success) {
      setNewPromotion({ name: '', description: '', price: 0, imageUrl: '', category: 'Promos Solo en Efectivo', isActive: true, tags: [] });
      scrollToTopForMobile();
    } else {
      console.error("Error al crear:", result.error);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromotion) return;
    const result = await handleUpdatePromotion(editingPromotion._id, editingPromotion);
    if (result.success) {
      setEditingPromotion(null);
      scrollToTopForMobile();
    } else {
      console.error("Error al actualizar:", result.error);
    }
  };

  const handleEditPromotionClick = (promo: Promotion) => {
    setEditingPromotion(promo);
    scrollToTopForMobile();
  };

  const handleDeletePromotionClick = async (id: string) => {
    if (window.confirm('Estás seguro de que quieres eliminar esta promo? Esto puede eliminar el producto del historial de pedidos y afectarlo')) {
      const result = await handleDeletePromotion(id);
      if (result.success) {
      } else {
        console.error("Error al eliminar:", result.error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPromotion(null);
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
    <div ref={promoManagementContainerRef} className={styles.promoManagementContainer}>
      <h1 className={styles.title}>Gestión de Promociones</h1>

      {/* Formulario de Creación/Edición */}
      <div id="promo-form-section" className={styles.formSection}>
        <h2 className={styles.formTitle}>{editingPromotion ? 'Editar Promoción' : 'Crear Nueva Promoción'}</h2>
        <form onSubmit={editingPromotion ? handleUpdateSubmit : handleCreateSubmit} className={styles.promoForm}>
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
            type="text"
            placeholder="Precio"
            value={!editingPromotion && newPromotion.price === 0 ? '' : (editingPromotion ? editingPromotion.price.toString() : newPromotion.price.toString())}
            onChange={(e) => {
              const value = e.target.value;
              const cleanedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
              const parsedValue = parseFloat(cleanedValue);
              const price = cleanedValue === '' || isNaN(parsedValue) ? 0 : parsedValue;

              editingPromotion
                ? setEditingPromotion({ ...editingPromotion, price })
                : setNewPromotion({ ...newPromotion, price });
            }}
            className={styles.inputField}
            required
          />

          <input
            type="text"
            placeholder="URL de la Imagen"
            value={editingPromotion ? editingPromotion.imageUrl || '' : newPromotion.imageUrl || ''}
            onChange={(e) => editingPromotion ? setEditingPromotion({ ...editingPromotion, imageUrl: e.target.value }) : setNewPromotion({ ...newPromotion, imageUrl: e.target.value })}
            className={styles.inputField}
            required
          />

          <div className={styles.tagsContainer}>
            <p className={styles.tagsTitle}>Etiquetas (Tags):</p>
            {PROMO_TAGS.map(tag => (
              <label key={tag} className={styles.tagLabel}>
                <input
                  type="checkbox"
                  value={tag}
                  checked={editingPromotion 
                    ? (editingPromotion.tags || []).includes(tag) 
                    : (newPromotion.tags || []).includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className={styles.tagCheckbox}
                />
                {tag}
              </label>
            ))}
          </div>
          
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
              <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>
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
              {!promo.isActive && <div className={styles.promoCardOverlay} />}
              
              <img src={promo.imageUrl || 'https://placehold.co/400x200/cccccc/333333?text=Promo+Image'} alt={promo.name} className={styles.promoImage} />
              <div className={styles.promoInfo}>
                <h3>{promo.name}</h3>
                <p>{promo.description}</p>
                <p className={styles.promoPrice}>Precio: ${promo.price?.toFixed(2) || 'N/A'}</p>
                <p className={styles.promoStatus}>Estado: <span className={promo.isActive ? styles.activeStatus : styles.inactiveStatus}>{promo.isActive ? 'Activa' : 'Inactiva'}</span></p>
              
                {promo.tags && promo.tags.length > 0 && (
                  <div className={styles.promoTags}>
                    {promo.tags.map(tag => (
                      <span key={tag} className={styles.tagBadge}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.promoActions}>
                <button
                  onClick={() => handleToggleActive(promo._id, promo.isActive)}
                  className={promo.isActive ? styles.toggleInactiveButton : styles.toggleActiveButton}
                >
                  {promo.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleEditPromotionClick(promo)} className={styles.editButton}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDeletePromotionClick(promo._id)} className={styles.deleteButton}>
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