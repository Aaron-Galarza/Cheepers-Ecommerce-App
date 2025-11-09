// src/pages/admin/PuntosManagement.tsx

import React, { useState, useEffect, useMemo } from 'react';
import styles from './css/puntosmanagement.module.css';
// 1. Importamos los nuevos componentes
import RewardCard, { Reward } from './RewardCard';
import HistoryTable, { Redemption } from './HistoryTable';

// Mensajes centralizados (para i18n / fácil reemplazo)
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

// (Las 'type' de Reward y Redemption ahora vienen de los componentes, 
// solo necesitamos Client)
type Client = {
  dni: string;
  name: string;
  points: number;
};

// ... (IDs de Storage y mock clients)
const STORAGE_REWARDS = 'pm_rewards_v1';
const STORAGE_REDEMS = 'pm_redems_v1';
const mockClientsInitial: Client[] = [
  // Hardcoded demo clients — REEMPLAZAR por fetch/API real si corresponde
  { dni: '20123456', name: 'María Pérez', points: 1200 },
  { dni: '30111222', name: 'Juan López', points: 350 },
  { dni: '27123456', name: 'Ana García', points: 80 },
];
const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 9);


// Replaced several individual form state hooks and related handlers with a compact form object
type FormState = { name: string; pointsCost: number; description: string; imageUrl: string; active: boolean };
const initialForm: FormState = { name: '', pointsCost: 0, description: '', imageUrl: '', active: true };

const PuntosManagement: React.FC = () => {
  // --- STATE Y LÓGICA (Todo se queda aquí) ---
  // Data (kept as before)
  const [rewards, setRewards] = useState<Reward[]>(() => {
    const raw = localStorage.getItem(STORAGE_REWARDS);
    return raw ? JSON.parse(raw) as Reward[] : [
      // Premios iniciales hardcodeados — REEMPLAZAR con seed desde backend si se desea
      { id: uid('r_'), name: 'Café Gratis', pointsCost: 200, isActive: true, description: 'Café chico', imageUrl: 'https://via.placeholder.com/400x300.png?text=Cafe' },
      { id: uid('r_'), name: '10% Descuento', pointsCost: 500, isActive: true, description: 'En próxima compra', imageUrl: 'https://via.placeholder.com/400x300.png?text=10%25+Off' },
    ];
  });
  const [redemptions, setRedemptions] = useState<Redemption[]>(() => {
    const raw = localStorage.getItem(STORAGE_REDEMS);
    return raw ? JSON.parse(raw) as Redemption[] : [];
  });
  const [clients, setClients] = useState<Client[]>(mockClientsInitial);

  // UI state
  const [tab, setTab] = useState<'premios' | 'nuevo' | 'historial'>('premios');
  const [editing, setEditing] = useState<Reward | null>(null);

  // Compact form state (replaces multiple useState for form fields)
  const [form, setForm] = useState<FormState>(initialForm);

  // Nuevo canje (kept compact but readable)
  const [searchDni, setSearchDni] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [canjeError, setCanjeError] = useState<string | null>(null);

  // Persistencia combinada en una sola effect (reducción de líneas, mismo comportamiento)
  useEffect(() => {
    localStorage.setItem(STORAGE_REWARDS, JSON.stringify(rewards));
    localStorage.setItem(STORAGE_REDEMS, JSON.stringify(redemptions));
  }, [rewards, redemptions]);

  // --- HANDLERS (Toda la lógica se queda en el padre) ---

  const clearForm = () => { setEditing(null); setForm(initialForm); };

  const handleEdit = (r: Reward) => {
    setEditing(r);
    setForm({ name: r.name, pointsCost: r.pointsCost, description: r.description || '', imageUrl: r.imageUrl || '', active: r.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveReward = () => {
    if (!form.name.trim() || form.pointsCost <= 0) return void window.alert(MESSAGES.ALERT_INVALID_FORM);
    const rewardData = { name: form.name.trim(), pointsCost: Math.floor(form.pointsCost), isActive: form.active, description: form.description.trim(), imageUrl: form.imageUrl.trim() };
    setRewards(prev => editing ? prev.map(p => p.id === editing.id ? { ...p, ...rewardData } : p) : [{ id: uid('r_'), ...rewardData }, ...prev]);
    clearForm();
  };

  const toggleActive = (id: string) => setRewards(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));

  const deleteReward = (id: string) => { if (!window.confirm(MESSAGES.CONFIRM_DELETE)) return; setRewards(prev => prev.filter(r => r.id !== id)); };

  const handleSearchClient = () => {
    const found = clients.find(c => c.dni === searchDni.trim());
    setSelectedClient(found || null);
    setCanjeError(found ? null : MESSAGES.ERROR_CLIENT_NOT_FOUND);
  };

  const handleRegisterCanje = () => {
    if (!selectedClient) return setCanjeError(MESSAGES.ERROR_SEARCH_CLIENT);
    if (!selectedRewardId) return setCanjeError(MESSAGES.ERROR_SELECT_REWARD);
    const reward = rewards.find(r => r.id === selectedRewardId); if (!reward) return setCanjeError(MESSAGES.ERROR_REWARD_INVALID);
    if (!reward.isActive) return setCanjeError(MESSAGES.ERROR_REWARD_INACTIVE);
    if (selectedClient.points < reward.pointsCost) return setCanjeError(MESSAGES.ERROR_NOT_ENOUGH_POINTS);

    setClients(prev => prev.map(c => c.dni === selectedClient.dni ? { ...c, points: c.points - reward.pointsCost } : c));
    const newRed: Redemption = { id: uid('rd_'), dni: selectedClient.dni, clientName: selectedClient.name, rewardId: reward.id, rewardName: reward.name, pointsUsed: reward.pointsCost, date: new Date().toISOString() };
    setRedemptions(prev => [newRed, ...prev]);
    setSelectedRewardId(null); setCanjeError(null); window.alert(MESSAGES.ALERT_CANJE_OK);
  };

  const [historyFilterDni, setHistoryFilterDni] = useState('');
  const filteredHistory = useMemo(() => historyFilterDni.trim() ? redemptions.filter(r => r.dni.includes(historyFilterDni.trim())) : redemptions, [historyFilterDni, redemptions]);


  // --- RENDER ---
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
          {/* --- Pestaña PREMIOS (Formulario + Grid) --- */}
          {tab === 'premios' && (
            <>
              {/* Formulario (se queda aquí) */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{editing ? 'Editar Premio' : 'Crear Nuevo Premio'}</h2>
                <div className={styles.formLayout}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="name" className={styles.label}>Nombre del Premio</label>
                    <input id="name" className={styles.input} placeholder="Ej: 1/2 Pizza Muzzarella" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="cost" className={styles.label}>Puntos necesarios</label>
                    <input id="cost" className={styles.input} type="number" placeholder="Ej: 250" value={form.pointsCost} onChange={e => setForm({ ...form, pointsCost: Number(e.target.value) })} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="desc" className={styles.label}>Descripción</label>
                    <textarea id="desc" className={styles.textarea} placeholder="Ej: Canjeá tus puntos por..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="imgUrl" className={styles.label}>URL de la Imagen</label>
                    <input id="imgUrl" className={styles.input} placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <label className={styles.checkboxWrapper}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Activo
                  </label>
                  <div className={styles.formButtons}>
                    {editing && <button className={styles.buttonGhost} onClick={clearForm}>Cancelar</button>}
                    <button className={styles.buttonPrimary} onClick={handleSaveReward}>
                      {editing ? 'Guardar Cambios' : 'Crear Premio'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Grid de Premios (Refactorizado) */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Premios Existentes</h2>
                <div className={styles.grid}>
                  {rewards.length === 0 && <p className={styles.empty}>No hay premios creados.</p>}
                  
                  {rewards.map(r => (
                    <RewardCard 
                      key={r.id}
                      reward={r}
                      onEdit={handleEdit}
                      onToggleActive={toggleActive}
                      onDelete={deleteReward}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* --- Pestaña NUEVO CANJE (Sin cambios) --- */}
          {tab === 'nuevo' && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Registrar Nuevo Canje</h2>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Buscar DNI del Cliente</label>
                  <div className={styles.searchDniWrapper}>
                    <input className={styles.input} placeholder="Ingresar DNI..." value={searchDni} onChange={e => setSearchDni(e.target.value)} />
                    <button className={styles.buttonPrimary} onClick={handleSearchClient}>Buscar</button>
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
                          <option key={r.id} value={r.id} disabled={selectedClient.points < r.pointsCost}>
                            {r.name} — {r.pointsCost} pts {selectedClient.points < r.pointsCost ? '(Puntos insuficientes)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button className={styles.buttonConfirmCanje} onClick={handleRegisterCanje} disabled={!selectedRewardId}>
                      Confirmar Canje
                    </button>
                  </div>
                </div>
              )}
              {!selectedClient && !canjeError && (
                <p className={styles.empty}>Buscá al cliente por su DNI para ver sus puntos y poder canjear.</p>
              )}
            </section>
          )}

          {/* --- Pestaña HISTORIAL (Refactorizado) --- */}
          {tab === 'historial' && (
            <HistoryTable 
              filteredHistory={filteredHistory}
              historyFilterDni={historyFilterDni}
              setHistoryFilterDni={setHistoryFilterDni}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PuntosManagement;