// src/pages/admin/PuntosManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import styles from './css/puntosmanagement.module.css';
import RewardCard, { Reward } from './RewardCard'; // Importa el tipo Reward corregido
import HistoryTable, { Redemption } from './HistoryTable'; // Importa el tipo Redemption corregido
import RewardForm from './RewardForm';
import { apiClient } from '../../../services/authservice';
import { FaPen, FaTrash } from 'react-icons/fa';

// Mensajes (sin cambios)
const MESSAGES = {
  CONFIRM_DELETE: '¿Eliminar este premio? Esta acción no se puede deshacer.',
  ALERT_INVALID_FORM: 'Nombre y costo de puntos válidos son obligatorios.',
  ALERT_CANJE_OK: 'Canje registrado correctamente.',
  ERROR_CLIENT_NOT_FOUND: 'Cliente no encontrado.',
  ERROR_SEARCH_CLIENT: 'Buscar cliente primero.',
  ERROR_SELECT_REWARD: 'Seleccioná un premio.',
  ERROR_REWARD_INVALID: 'Premio inválido.',
  ERROR_REWARD_INACTIVE: 'Premio inactivo. No disponible.',
  ERROR_NOT_ENOUGH_POINTS: 'No tiene puntos suficientes.',
};

// Tipos
type Client = { dni: string; name: string; points: number; };
const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 9); // Para historial MOCK

const PuntosManagement: React.FC = () => {
  // --- STATE ---
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  

  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  
  // UI
  const [tab, setTab] = useState<'premios' | 'nuevo' | 'historial'>('premios');
  const [editing, setEditing] = useState<Reward | null>(null);
  const [form, setForm] = useState({ name: '', costPoints: 0, description: '', imageUrl: '', active: true });

  // Canje
  const [searchDni, setSearchDni] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [canjeError, setCanjeError] = useState<string | null>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);

  // Historial
  const [historyFilterDni, setHistoryFilterDni] = useState('');


  // Carga de Premios (API)
  useEffect(() => {
    let mounted = true;
    const fetchRewards = async () => {
      setIsLoadingRewards(true);
      try {
        const adminResp = await apiClient.get<Reward[]>('/api/rewards/admin');
        if (mounted && adminResp?.data) {
          setRewards(adminResp.data);
        }
      } catch (err: any) {
        console.warn('/api/rewards/admin falló, intentando /api/rewards:', err?.response?.status || err?.message);
        try {
          const resp = await apiClient.get<Reward[]>('/api/rewards');
          if (mounted && resp?.data) setRewards(resp.data);
        } catch (finalErr: any) {
          console.error('Error cargando premios (ambas rutas fallaron):', finalErr?.response?.status || finalErr?.message);
        }
      } finally {
        if (mounted) setIsLoadingRewards(false);
      }
    };
    fetchRewards();
    return () => { mounted = false; };
  }, []);

  // --- HANDLERS (Formulario de Premios - CONECTADOS) ---
  const clearForm = () => {
    setEditing(null);
    setForm({ name: '', costPoints: 0, description: '', imageUrl: '', active: true });
  };

  const handleEdit = (r: Reward) => {
    setEditing(r);
    setForm({ name: r.name, costPoints: r.costPoints, description: r.description || '', imageUrl: r.imageUrl || '', active: r.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveReward = async () => {
    if (!form.name.trim() || form.costPoints <= 0) return void window.alert(MESSAGES.ALERT_INVALID_FORM);
    const payload = { name: form.name.trim(), description: form.description.trim(), costPoints: Math.floor(form.costPoints), imageUrl: form.imageUrl.trim(), isActive: form.active };
    try {
      if (editing) {
        // Usa '_id' para editar
        const resp = await apiClient.put<Reward>(`/api/rewards/${editing._id}`, payload);
        if (resp?.data) setRewards(prev => prev.map(p => p._id === editing._id ? resp.data : p));
      } else {
        const resp = await apiClient.post<Reward>('/api/rewards', payload);
        if (resp?.data) setRewards(prev => [resp.data, ...prev]);
      }
      clearForm();
    } catch (err: any) {
      console.error('saveReward failed:', err);
    }
  };

  // 'id' aquí es el '_id'
  const toggleActive = async (id: string) => {
    const reward = rewards.find(r => r._id === id);
    if (!reward) return;
    const newIsActive = !reward.isActive;

    try {
      const resp = await apiClient.put(`/api/rewards/${id}`, { isActive: newIsActive });
      if (resp?.data) {
         setRewards(prev => prev.map(r => r._id === id ? { ...r, ...resp.data } : r));
      }
    } catch (err: any) {
      console.error('toggleActive failed:', err);
    }
  };

  // CONECTADO (DELETE /api/rewards/:id)
  const deleteReward = async (id: string) => {
    if (!window.confirm(MESSAGES.CONFIRM_DELETE)) return;
    
    // Guardamos estado por si falla
    const originalRewards = [...rewards];
    

    setRewards(prev => prev.filter(r => r._id !== id)); 
    
    try {
      // Llamamos a la API (que hace el borrado físico)
      await apiClient.delete(`/api/rewards/${id}`);
      // Si funciona, la UI ya está actualizada.
      
    } catch (err: any) {
      console.error('deleteReward failed:', err);
      // Si falla, revertimos
      setRewards(originalRewards);
    }
  };
  const handleSearchClient = async () => {
    setCanjeError(null);
    setSelectedClient(null);
    const dni = searchDni.trim();
    if (!dni) return setCanjeError('Ingresá un DNI.');
    
    setIsLoadingClient(true);
    try {
      // Usamos la ruta /admin
      const resp = await apiClient.get(`/api/loyalty/${encodeURIComponent(dni)}/admin`);
      if (resp.data) {
        const { totalPoints, name } = resp.data;
        setSelectedClient({ dni, name: name || 'Cliente', points: Number(totalPoints || 0) });
      } else {
        setCanjeError(MESSAGES.ERROR_CLIENT_NOT_FOUND);
      }
    } catch (err: any) {
      console.error('Error al buscar cliente:', err);
      setCanjeError(err?.response?.data?.message || MESSAGES.ERROR_CLIENT_NOT_FOUND);
    } finally {
      setIsLoadingClient(false);
    }
  };

  const handleRegisterCanje = async () => {
    if (!selectedClient) { setCanjeError(MESSAGES.ERROR_SEARCH_CLIENT); return; }
    if (!selectedRewardId) { setCanjeError(MESSAGES.ERROR_SELECT_REWARD); return; }
    const reward = rewards.find(r => r._id === selectedRewardId);
    if (!reward) { setCanjeError(MESSAGES.ERROR_REWARD_INVALID); return; }
    if (!reward.isActive) { setCanjeError(MESSAGES.ERROR_REWARD_INACTIVE); return; }
    if (selectedClient.points < reward.costPoints) { setCanjeError(MESSAGES.ERROR_NOT_ENOUGH_POINTS); return; }

    try {
      const resp = await apiClient.post('/api/loyalty/redeem', { 
        dni: selectedClient.dni, 
        rewardId: reward._id 
      });

      if (resp?.data) {
        const { remainingPoints, rewardName, pointsUsed } = resp.data;
        const updatedPoints = Number(remainingPoints);
        setSelectedClient(prev => prev ? { ...prev, points: updatedPoints } : null);

        // Actualizamos el historial (sigue siendo local, pero ahora se basa en la respuesta)
        const newRed: Redemption = {
          _id: uid('rd_'),
          dni: selectedClient.dni,
          clientName: selectedClient.name,
          rewardId: reward._id,
          rewardName: rewardName ?? reward.name,
          pointsUsed: pointsUsed ?? reward.costPoints,
          date: new Date().toISOString(),
        };
        setRedemptions(prev => [newRed, ...prev]);

        setSelectedRewardId(null);
        setCanjeError(null);
        window.alert(MESSAGES.ALERT_CANJE_OK);
      }
    } catch (err: any) {
      console.error('registerCanje failed:', err);
      setCanjeError(err?.response?.data?.message || 'Error al procesar el canje.');
    }
  };

  const handleSearchHistory = async () => {
    const dni = historyFilterDni.trim();
    if (!dni) {
      setRedemptions([]); // Limpia si no hay DNI
      return;
    }
    
    try {
      const resp = await apiClient.get(`/api/loyalty/${encodeURIComponent(dni)}/admin`);
      if (resp.data && resp.data.history) {
        const { history, name } = resp.data;
        
        const fetchedRedeems: Redemption[] = (history || [])
          .filter((h: any) => h.type === 'redeem') // Filtramos solo canjes
          .map((h: any) => ({
            _id: h._id || uid('rd_'),
            dni: h.dni,
            clientName: name || 'Cliente',
            rewardId: h.rewardId || '',
            rewardName: h.rewardName || h.reference || 'N/A',
            pointsUsed: Math.abs(Number(h.points || 0)),
            date: h.date || new Date().toISOString(),
          }));
          
        setRedemptions(fetchedRedeems);
      } else {
        setRedemptions([]); // Si no hay historial, vaciamos
      }
    } catch (err: any) {
      console.error('Error al buscar historial:', err);
      setRedemptions([]); // Limpiamos si hay error
    }
  };
  
  
  return (
    <div className={styles.container}>
      <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Gestión de Puntos</h1>
          <nav className={styles.tabs}>
            <button className={tab === 'premios' ? styles.tabActive : styles.tab} onClick={() => setTab('premios')}>Premios</button>
            <button className={tab === 'nuevo' ? styles.tabActive : styles.tab} onClick={() => setTab('nuevo')}>Nuevo Canje</button>
            <button className={tab === 'historial' ? styles.tabActive : styles.tab} onClick={() => setTab('historial')}>Historial</button>
          </nav>
        </header>

        <main className={styles.main}>
          {tab === 'premios' && (
            <>
              {/* REEMPLAZADO: form extraído a RewardForm */}
              <RewardForm
                form={form}
                setForm={setForm}
                editing={editing}
                clearForm={clearForm}
                handleSaveReward={handleSaveReward}
              />

              {/* Grid de Premios (sin cambios) */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Premios Existentes</h2>
                {isLoadingRewards ? <p className={styles.empty}>Cargando premios...</p> : (
                  <div className={styles.grid}>
                    {rewards.length === 0 && <p className={styles.empty}>No hay premios creados.</p>}
                    {rewards.map(r => (
                      <RewardCard 
                        key={r._id}
                        reward={r} 
                        onEdit={handleEdit} 
                        onToggleActive={toggleActive} 
                        onDelete={deleteReward} 
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* --- Pestaña NUEVO CANJE (Conectada) --- */}
          {tab === 'nuevo' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Registrar Nuevo Canje</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Buscar DNI del Cliente</label>
                  <div className={styles.searchDniWrapper}>
                    <input className={styles.input} placeholder="Ingresar DNI..." value={searchDni} onChange={e => setSearchDni(e.target.value)} />
                    <button className={styles.buttonPrimary} onClick={handleSearchClient} disabled={isLoadingClient}>{isLoadingClient ? 'Buscando...' : 'Buscar'}</button>
                  </div>
                </div>
              </div>
              {canjeError && <p className={styles.error}>{canjeError}</p>}
              {selectedClient && (
                <div className={styles.canjeBox}>
                  <h3 className={styles.canjeClientName}>{selectedClient.name}</h3>
                  <p className={styles.canjeClientInfo}>DNI: {selectedClient.dni}</p>
                  <p className={styles.canjeClientPoints}>Puntos disponibles: <strong>{selectedClient.points}</strong></p>
                  <hr className={styles.divider} />
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Seleccionar Premio a Canjear</label>
                      <select className={styles.select} value={selectedRewardId ?? ''} onChange={e => setSelectedRewardId(e.target.value || null)}>
                        <option value="">Seleccionar premio...</option>
                        {rewards.filter(r => r.isActive).map(r => (
                          <option key={r._id} value={r._id} disabled={selectedClient.points < r.costPoints}>
                            {r.name} — {r.costPoints} pts {selectedClient.points < r.costPoints ? '(Puntos insuficientes)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button className={styles.buttonConfirmCanje} onClick={handleRegisterCanje} disabled={!selectedRewardId}>Confirmar Canje</button>
                  </div>
                </div>
              )}
              {!selectedClient && !canjeError && (
                <p className={styles.empty}>Buscá al cliente por su DNI para ver sus puntos y poder canjear.</p>
              )}
            </section>
          )}

          {/* --- Pestaña HISTORIAL (CONECTADA) --- */}
          {tab === 'historial' && (
            <HistoryTable 
              items={redemptions} // Pasamos el historial filtrado
              historyFilterDni={historyFilterDni}
              setHistoryFilterDni={setHistoryFilterDni}
              onSearchHistory={handleSearchHistory} // Pasamos la función de búsqueda
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PuntosManagement;