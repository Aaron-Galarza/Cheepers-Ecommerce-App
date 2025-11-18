import React from 'react';
import styles from './css/puntosmanagement.module.css';
import { Reward } from './RewardCard';

type FormState = {
  name: string;
  costPoints: number;
  description: string;
  imageUrl: string;
  active: boolean;
};

type Props = {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  editing: Reward | null;
  clearForm: () => void;
  handleSaveReward: () => Promise<void> | void;
};

const RewardForm: React.FC<Props> = ({ form, setForm, editing, clearForm, handleSaveReward }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{editing ? 'Editar Premio' : 'Crear Nuevo Premio'}</h2>
      <div className={styles.formLayout}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>Nombre del Premio</label>
          <input id="name" className={styles.input} placeholder="Ej: 1/2 Pizza Muzzarella" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="cost" className={styles.label}>Puntos necesarios</label>
          <input id="cost" className={styles.input} type="number" placeholder="Ej: 250" value={form.costPoints} onChange={e => setForm({ ...form, costPoints: Number(e.target.value) })} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="desc" className={styles.label}>Descripción</label>
          <textarea id="desc" className={styles.textarea} placeholder="Descripción..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="img" className={styles.label}>URL imagen</label>
          <input id="img" className={styles.input} placeholder="URL imagen..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Activo
          </label>
        </div>

        <div className={styles.formButtons}>
          {editing && <button className={styles.buttonGhost} onClick={clearForm}>Cancelar</button>}
          <button className={styles.buttonPrimary} onClick={handleSaveReward}>{editing ? 'Guardar Cambios' : 'Crear Premio'}</button>
        </div>
      </div>
    </section>
  );
};

export default RewardForm;