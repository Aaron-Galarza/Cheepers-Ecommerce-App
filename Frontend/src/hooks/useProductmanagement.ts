import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import authService from '../services/authservice';
import { useLocation } from 'react-router-dom'; // Importar useLocation

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

export type NewProductData = Omit<Product, '_id'>;

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

export const useProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Se mantiene aquí para que el componente pueda acceder a él
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  const location = useLocation(); // Usar useLocation dentro del hook

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get<Product[]>(`${API_BASE_URL}/api/products?includeInactive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allowedCategories = ['Hamburguesas', 'Papas Fritas', 'Pizzas'];
      const filteredData = response.data.filter(p => allowedCategories.includes(p.category));
      setProducts(filteredData);

      const queryParams = new URLSearchParams(location.search);
      const editId = queryParams.get('editId');

      if (editId) {
        const productToEdit = filteredData.find(p => p._id === editId);
        if (productToEdit) {
          setEditingProduct(productToEdit);
        } else {
          console.warn(`Producto con ID ${editId} no encontrado.`);
        }
      } else {
        setEditingProduct(null); // Asegura que no haya un producto en edición si no hay editId en la URL
      }

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
  }, [location.search]); // Dependencia de location.search para re-fetch si cambia la URL

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = useCallback(async (data: NewProductData) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/api/products`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
      return { success: true };
    } catch (err: any) {
      console.error('Error al crear producto:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al crear producto. Verifica los datos y tu sesión.');
      }
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchProducts]);

  const handleUpdateProduct = useCallback(async (id: string, data: Product) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE_URL}/api/products/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingProduct(null); // Asegura que el modo edición se desactive después de actualizar
      fetchProducts();
      return { success: true };
    } catch (err: any) {
      console.error('Error al actualizar producto:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al actualizar producto. Verifica los datos y tu sesión.');
      }
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchProducts]);

  const handleDeleteProduct = useCallback(async (id: string) => {
    console.log('Confirmación de eliminación: ¿Estás seguro de que quieres eliminar este producto?');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
      return { success: true };
    } catch (err: any) {
      console.error('Error al eliminar producto:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Error al eliminar producto. Verifica tu sesión.');
      } else {
        setError('Error al eliminar producto. Verifica tu sesión.');
      }
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchProducts]);

  const handleToggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/api/products/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Producto ${id} cambiado a ${response.data.product.isActive}`);
      fetchProducts();
      return { success: true };
    } catch (err: any) {
      console.error(`Error al cambiar estado de producto ${id}:`, err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError(`Error al cambiar estado de producto. ¿Estás logueado?`);
      }
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchProducts]);

  const ALLOWED_CATEGORIES = ['Hamburguesas', 'Papas Fritas', 'Pizzas'];

  const filteredProducts = products
    .filter(p => ALLOWED_CATEGORIES.includes(p.category))
    .filter(p => filterCategory === 'Todas' || p.category === filterCategory)
    .filter(p => filterStatus === 'Todos' ||
      (filterStatus === 'Activos' && p.isActive) ||
      (filterStatus === 'Inactivos' && !p.isActive)
    );

  return {
    products: filteredProducts,
    loading,
    error,
    editingProduct,
    setEditingProduct, // Exporta setEditingProduct para que el componente lo use
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    fetchProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleToggleActive,
    ALLOWED_CATEGORIES
  };
};
