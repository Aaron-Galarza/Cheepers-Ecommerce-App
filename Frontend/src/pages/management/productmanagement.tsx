import React, { useState, useEffect, useRef } from 'react';
import styles from './../management.styles/productmanagement.module.css';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useProductManagement, Product, NewProductData } from '../../hooks/useProductmanagement'; // Importa el custom hook

// Importaciones de React-Toastify para mensajes de alerta
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductManagement: React.FC = () => {
  // Usa el custom hook para obtener los datos y funciones de API
  const {
    products,
    loading,
    error,
    editingProduct,
    setEditingProduct, // Importado del hook para poder cambiar el estado de edición
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleToggleActive,
    ALLOWED_CATEGORIES
  } = useProductManagement();

  // Estado local para el nuevo producto (cuando no estamos editando)
  const [newProduct, setNewProduct] = useState<NewProductData>({
    name: '',
    description: '',
    price: 0, // Inicializado a 0
    imageUrl: '',
    category: 'Hamburguesas',
    isActive: true,
  });

  // Crea una referencia para el contenedor principal del componente
  const productManagementContainerRef = useRef<HTMLDivElement>(null);

  // Función para desplazar el elemento relevante al inicio
  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (productManagementContainerRef.current) {
        productManagementContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 50);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que el precio sea mayor a 0
    if (newProduct.price <= 0) {
      toast.error('El precio debe ser mayor a 0.', { position: "top-center" });
      return;
    }

    const result = await handleCreateProduct(newProduct); // Pasa newProduct al hook
    if (result.success) {
      toast.success('Producto creado exitosamente!', { position: "top-center" });
      // Resetear el formulario después de crear
      setNewProduct({ name: '', description: '', price: 0, imageUrl: '', category: 'Hamburguesas', isActive: true });
      scrollToTop();
    } else {
      toast.error(`Error al crear producto: ${result.error}`, { position: "top-center" });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Validar que el precio sea mayor a 0
    if (editingProduct.price <= 0) {
      toast.error('El precio debe ser mayor a 0.', { position: "top-center" });
      return;
    }

    const result = await handleUpdateProduct(editingProduct._id, editingProduct); // Pasa editingProduct al hook
    if (result.success) {
      toast.success('Producto actualizado exitosamente!', { position: "top-center" });
      setEditingProduct(null); // Sale del modo edición
      scrollToTop();
    } else {
      toast.error(`Error al actualizar producto: ${result.error}`, { position: "top-center" });
    }
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product); // Establece el producto a editar en el estado del hook
    scrollToTop();
  };

 const handleDeleteProductClick = async (id: string) => {
  const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este producto? Esto puede eliminar el producto del historial de pedidos y afectarlo');
  if (!confirmed) return;

  const result = await handleDeleteProduct(id);
  if (result.success) {
    toast.success('Producto eliminado exitosamente!', { position: "top-center" });
  } else {
    toast.error(`Error al eliminar producto: ${result.error}`, { position: "top-center" });
  }
};


  const handleCancelEdit = () => {
    setEditingProduct(null); // Cancela la edición
  };

  // Los filtros ahora se aplican directamente al array 'products' que viene del hook
  const filteredProducts = products
    .filter(p => ALLOWED_CATEGORIES.includes(p.category))
    .filter(p => filterCategory === 'Todas' || p.category === filterCategory)
    .filter(p => filterStatus === 'Todos' ||
      (filterStatus === 'Activos' && p.isActive) ||
      (filterStatus === 'Inactivos' && !p.isActive)
    );

  if (loading) return <div className={styles.loading}>Cargando productos...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div ref={productManagementContainerRef} className={styles.productManagementContainer}>
      <ToastContainer /> {/* Agrega ToastContainer aquí para que los toasts se muestren */}
      <h1 className={styles.title}>Gestión de Productos</h1>

      {/* Formulario de Creación/Edición */}
      <div id="product-form-section" className={styles.formSection}>
        <h2 className={styles.formTitle}>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
        <form onSubmit={editingProduct ? handleUpdateSubmit : handleCreateSubmit} className={styles.productForm}>
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={editingProduct ? editingProduct.name : newProduct.name}
            onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })}
            className={styles.inputField}
            required
          />
          <textarea
            placeholder="Descripción"
            value={editingProduct ? editingProduct.description : newProduct.description}
            onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value })}
            className={styles.textareaField}
            required
          />
          <input
            type="text" // Cambiado de "number" a "text" para quitar las flechas
            placeholder="Precio"
            // Muestra vacío si es 0 en modo creación, de lo contrario muestra el valor
            value={!editingProduct && newProduct.price === 0 ? '' : (editingProduct ? editingProduct.price.toString() : newProduct.price.toString())}
            onChange={(e) => {
              const value = e.target.value;
              // Permite solo dígitos y un punto decimal
              const cleanedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
              const parsedValue = parseFloat(cleanedValue);
              
              // Si el valor es vacío o NaN, usar 0 internamente para el estado
              const price = cleanedValue === '' || isNaN(parsedValue) ? 0 : parsedValue;
              
              editingProduct
                ? setEditingProduct({ ...editingProduct, price: price })
                : setNewProduct({ ...newProduct, price: price });
            }}
            className={styles.inputField}
            required
          />
          <input
            type="text"
            placeholder="Etiqueta Promocional (Opcional)"
            // Asegúrate de que el valor sea string, si es null/undefined, usar ''
            value={editingProduct ? editingProduct.promotionalLabel || '' : newProduct.promotionalLabel || ''}
            onChange={(e) => 
              editingProduct 
                ? setEditingProduct({ ...editingProduct, promotionalLabel: e.target.value }) 
                : setNewProduct({ ...newProduct, promotionalLabel: e.target.value })
            }
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="URL de la Imagen"
            // Asegúrate de que el valor sea string, si es null/undefined, usar ''
            value={editingProduct ? editingProduct.imageUrl || '' : newProduct.imageUrl || ''}
            onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, imageUrl: e.target.value }) : setNewProduct({ ...newProduct, imageUrl: e.target.value })}
            className={styles.inputField}
            required
          />
          <select
            value={editingProduct ? editingProduct.category : newProduct.category}
            onChange={(e) => {
              const selectedCategory = e.target.value;
              if (editingProduct) {
                setEditingProduct({ ...editingProduct, category: selectedCategory });
              } else {
                setNewProduct({ ...newProduct, category: selectedCategory });
              }
            }}
            className={styles.selectField}
            required
          >
            {ALLOWED_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className={styles.formGroup}>
            <label htmlFor="isActive">Activo:</label>
            <input
              type="checkbox"
              id="isActive"
              checked={editingProduct ? editingProduct.isActive : newProduct.isActive}
              onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, isActive: e.target.checked }) : setNewProduct({ ...newProduct, isActive: e.target.checked })}
              className={styles.checkboxField}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              <FaSave /> {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
            {editingProduct && (
              <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>
                <FaTimes /> Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={styles.filterSection}>
        <label htmlFor="categoryFilter" className={styles.filterLabel}>Filtrar por Categoría:</label>
        <select
          id="categoryFilter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.selectField}
        >
          <option value="Todas">Todas las Categorías</option>
          {ALLOWED_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label htmlFor="statusFilter" className={styles.filterLabel}>Filtrar por Estado:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.selectField}
        >
          <option value="Todos">Todos</option>
          <option value="Activos">Activos</option>
          <option value="Inactivos">Inactivos</option>
        </select>
      </div>

      <h2 className={styles.listTitle}>Productos Existentes</h2>
      <div className={styles.productsList}>
        {filteredProducts.length === 0 && !loading && !error ? (
          <p className={styles.noProductsMessage}>No hay productos en esta categoría o estado.</p>
        ) : (
          filteredProducts.map((p) => (
            <div key={p._id} className={`${styles.productCard} ${!p.isActive ? styles.inactiveProduct : ''}`}>
              <img
                src={p.imageUrl || 'https://placehold.co/400x200/cccccc/333333?text=Product+Image'}
                alt={p.name}
                className={styles.productImage}
              />
              <div className={styles.productInfo}>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className={styles.productPrice}>${p.price.toFixed(2)}</p>
                <p className={styles.productCategory}>Categoría: {p.category}</p>
                <p className={styles.productStatus}>
                  Estado: <span className={p.isActive ? styles.activeStatus : styles.inactiveStatus}>{p.isActive ? 'Activo' : 'Inactivo'}</span>
                </p>
              </div>

              {!p.isActive && <div className={styles.productCardOverlay} />}

              <div className={styles.productActions}>
                <button
                  onClick={() => handleToggleActive(p._id, p.isActive)}
                  className={p.isActive ? styles.toggleInactiveButton : styles.toggleActiveButton}
                >
                  {p.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleEditProductClick(p)} className={styles.editButton}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteProductClick(p._id)} className={styles.deleteButton}>
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

export default ProductManagement;
