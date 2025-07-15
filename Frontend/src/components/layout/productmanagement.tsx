// src/components/layout/ProductManagement.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './productmanagement.module.css'; // Importa el nuevo CSS Module
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUpload } from 'react-icons/fa'; // Iconos para CRUD

// Asegúrate de que esta interfaz Product sea la misma que usas en menu.tsx y productlist.ts
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, '_id'>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'Hamburguesas', // Default category for new product
  });
  const [filterCategory, setFilterCategory] = useState<string>('Todas'); // Nuevo estado para el filtro de categoría

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken'); // Obtén el token del localStorage
      const response = await axios.get<Product[]>(`${API_BASE_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error al cargar los productos:', err);
      setError('No se pudieron cargar los productos. ¿Estás logueado?');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/api/products`, newProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewProduct({ name: '', description: '', price: 0, imageUrl: '', category: 'Hamburguesas' }); // Reset form
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError('Error al crear producto. Verifica los datos y tu sesión.');
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditingProduct(null); // Exit editing mode
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      setError('Error al actualizar producto. Verifica los datos y tu sesión.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError('Error al eliminar producto. Verifica tu sesión.');
    }
  };

  // Filtra los productos según la categoría seleccionada
  const filteredProducts = filterCategory === 'Todas'
    ? products
    : products.filter(p => p.category === filterCategory);

  if (loading) return <div className={styles.loading}>Cargando productos...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.productManagementContainer}>
      <h1 className={styles.title}>Gestión de Productos</h1>

      {/* Formulario para Crear/Editar Producto */}
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
            onChange={(e) => editingProduct ? setEditingProduct({ ...editingProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })}
            className={styles.selectField}
            required
          >
            <option value="Hamburguesas">Hamburguesas</option>
            <option value="Papas Fritas">Papas Fritas</option>
            <option value="Pizzas">Pizzas</option>
            {/* Agrega más categorías si tienes */}
          </select>

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

      {/* Selector de Categorías */}
      <div className={styles.filterSection}>
        <label htmlFor="categoryFilter" className={styles.filterLabel}>Filtrar por Categoría:</label>
        <select
          id="categoryFilter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.selectField} /* Reutiliza el estilo del select */
        >
          <option value="Todas">Todas las Categorías</option>
          <option value="Hamburguesas">Hamburguesas</option>
          <option value="Papas Fritas">Papas Fritas</option>
          <option value="Pizzas">Pizzas</option>
          {/* Asegúrate de que estas opciones coincidan con las categorías de tus productos */}
        </select>
      </div>

      {/* Lista de Productos */}
      <h2 className={styles.listTitle}>Productos Existentes</h2>
      <div className={styles.productsList}>
        {filteredProducts.length === 0 && !loading && !error ? (
          <p className={styles.noProductsMessage}>No hay productos en esta categoría.</p>
        ) : (
          filteredProducts.map((p) => (
            <div key={p._id} className={styles.productCard}>
              <img src={p.imageUrl || '/default-image.jpg'} alt={p.name} className={styles.productImage} />
              <div className={styles.productInfo}>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className={styles.productPrice}>${p.price.toFixed(2)}</p>
                <p className={styles.productCategory}>Categoría: {p.category}</p>
              </div>
              <div className={styles.productActions}>
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