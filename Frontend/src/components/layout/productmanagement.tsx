// src/components/layout/ProductManagement.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './productmanagement.module.css';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import authService from '../../services/authservice';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

type NewProductData = Omit<Product, '_id'>;

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<NewProductData>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'Hamburguesas',
    isActive: true,
  });
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get<Product[]>(`${API_BASE_URL}/api/products?includeInactive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err: any) {
      console.error('Error al cargar los productos:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('No se pudieron cargar los productos. ¿Estás logueado?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/api/products`, newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewProduct({ name: '', description: '', price: 0, imageUrl: '', category: 'Hamburguesas', isActive: true });
      fetchProducts();
    } catch (err: any) {
      console.error('Error al crear producto:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al crear producto. Verifica los datos y tu sesión.');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE_URL}/api/products/${editingProduct._id}`, editingProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Error al actualizar producto:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al actualizar producto. Verifica los datos y tu sesión.');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err: any) {
      console.error('Error al eliminar producto:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al eliminar producto. Verifica tu sesión.');
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/api/products/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Producto ${id} cambiado a ${response.data.product.isActive}`);
      fetchProducts();
    } catch (err: any) {
      console.error(`Error al cambiar estado de producto ${id}:`, err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al cambiar estado de producto. ¿Estás logueado?');
      }
    }
  };

  const ALLOWED_CATEGORIES = ['Hamburguesas', 'Papas Fritas', 'Pizzas'];

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
    <div className={styles.productManagementContainer}>
      <h1 className={styles.title}>Gestión de Productos</h1>

      <div className={styles.formSection}>
        <h2 className={styles.formTitle}>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
        <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className={styles.productForm}>
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
            type="number"
            placeholder="Precio"
            value={editingProduct ? editingProduct.price : newProduct.price}
            onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) }) : setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
            className={styles.inputField}
            step="0.01"
            required
          />
          <input
            type="text"
            placeholder="URL de la Imagen"
            value={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl}
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
            <option value="Hamburguesas">Hamburguesas</option>
            <option value="Papas Fritas">Papas Fritas</option>
            <option value="Pizzas">Pizzas</option>
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
              <button type="button" onClick={() => setEditingProduct(null)} className={styles.cancelButton}>
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
          <option value="Hamburguesas">Hamburguesas</option>
          <option value="Papas Fritas">Papas Fritas</option>
          <option value="Pizzas">Pizzas</option>
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

              {/* Overlay para productos inactivos */}
              {!p.isActive && <div className={styles.productCardOverlay} />}

              <div className={styles.productActions}>
                <button
                  onClick={() => handleToggleActive(p._id, p.isActive)}
                  className={p.isActive ? styles.toggleInactiveButton : styles.toggleActiveButton}
                >
                  {p.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleEditProduct(p)} className={styles.editButton}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteProduct(p._id)} className={styles.deleteButton}>
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
