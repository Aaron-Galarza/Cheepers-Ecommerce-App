import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import authService from '../services/authservice';

export interface Promotion {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string; // Will be 'Promos Solo en Efectivo'
  isActive: boolean;
  // discountPercentage removed as per user request
}

export type NewPromotionData = Omit<Promotion, '_id'>;

const API_BASE_URL = 'https://cheepers-ecommerce-app.onrender.com';

export const usePromoManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  const fetchPromotions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // handleCreatePromotion ahora acepta 'data' como argumento
  const handleCreatePromotion = useCallback(async (data: NewPromotionData) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE_URL}/api/products`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPromotions();
      return { success: true };
    } catch (err: any) {
      console.error('Error al crear promoción:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al crear promoción. Verifica los datos y tu sesión.');
      }
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchPromotions]);

  // handleUpdatePromotion ahora acepta 'data' como argumento
  const handleUpdatePromotion = useCallback(async (id: string, data: Promotion) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE_URL}/api/products/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingPromotion(null);
      fetchPromotions();
      return { success: true };
    } catch (err: any) {
      console.error('Error al actualizar promoción:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError('Error al actualizar promoción. Verifica los datos y tu sesión.');
      }
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchPromotions]);

  const handleDeletePromotion = useCallback(async (id: string) => {
    console.log('Confirmación de eliminación: ¿Estás seguro de que quieres eliminar esta promoción?');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPromotions();
      return { success: true };
    } catch (err: any) {
      console.error('Error al eliminar promoción:', err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Error al eliminar promoción. Verifica tu sesión.');
      } else {
        setError('Error al eliminar promoción. Verifica tu sesión.');
      }
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchPromotions]);

  const handleToggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/api/products/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Promoción ${id} cambiada a ${response.data.product.isActive}`);
      fetchPromotions();
      return { success: true };
    } catch (err: any) {
      console.error(`Error al cambiar estado de promoción ${id}:`, err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        authService.logout();
        setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else {
        setError(`Error al cambiar estado de promoción. ¿Estás logueado?`);
      }
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchPromotions]);

  const filteredPromotions = promotions.filter(promo => {
    const matchesStatus = filterStatus === 'Todos' ||
                          (filterStatus === 'Activas' && promo.isActive) ||
                          (filterStatus === 'Inactivas' && !promo.isActive);
    return matchesStatus;
  });

  return {
    promotions: filteredPromotions,
    loading,
    error,
    editingPromotion,
    setEditingPromotion,
    filterStatus,
    setFilterStatus,
    fetchPromotions,
    handleCreatePromotion,
    handleUpdatePromotion,
    handleDeletePromotion,
    handleToggleActive,
  };
};