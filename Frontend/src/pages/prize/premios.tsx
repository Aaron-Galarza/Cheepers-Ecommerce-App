import React, { useState, useEffect } from 'react';
import { FaSearch, FaGift, FaAddressCard } from 'react-icons/fa';
import styles from '../css/premios.module.css';
import axios from 'axios';
// Importamos el componente separado
import PremioCard from '../../components/layout/design/PremioCard';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- CORRECCIÓN AQUÍ ---
// La interfaz debe coincidir con lo que espera 'PremioCard' (y con la API)
interface IPremio {
  _id: string;
  name: string;
  description: string;
  imageUrl: string; // <-- CAMBIADO: De 'imagenUrl' a 'imageUrl'
  costPoints: number;
  isActive: boolean;
}

const WHATSAPP_NUMBER = '5493624063011';

const PremiosPage: React.FC = () => {
  const [dni, setDni] = useState('');
  const [puntosUsuario, setPuntosUsuario] = useState<number | null>(null);
  const [premios, setPremios] = useState<IPremio[]>([]);
  const [isLoadingPremios, setIsLoadingPremios] = useState(true);
  const [isLoadingPuntos, setIsLoadingPuntos] = useState(false);
  const [errorPremios, setErrorPremios] = useState<string | null>(null);

  useEffect(() => {
    const fetchPremios = async () => {
      setIsLoadingPremios(true);
      setErrorPremios(null);
      try {
        const response = await axios.get<IPremio[]>(`${API_BASE_URL}/api/rewards`);
        setPremios(response.data);
      } catch (err) {
        console.error("Error al cargar premios:", err);
        setErrorPremios("No se pudieron cargar los premios.");
      } finally {
        setIsLoadingPremios(false);
      }
    };
    fetchPremios();
  }, []);

  const handleConsultarPuntos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim()) return alert('Por favor, ingresá un DNI.');
    
    setIsLoadingPuntos(true);
    setPuntosUsuario(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/loyalty/${dni.trim()}`); 
      if (response.data) {
        setPuntosUsuario(response.data.totalPoints || 0);
      }
    } catch (err: any) {
      if (err.response?.status === 404) alert('Cliente no encontrado.');
      else alert('Error al consultar puntos.');
    } finally {
      setIsLoadingPuntos(false);
    }
  };

  const handleCanjear = (premio: IPremio) => {
    const mensaje = `Hola, soy el cliente con DNI: ${dni}, quiero canjear: ${premio.name} (${premio.costPoints} pts)`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={styles.premiosContainer}>
      
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <FaGift className={styles.heroIcon} /> CANJEÁ TUS PUNTOS
          </h1>
          <p className={styles.heroSubtitle}>Cada compra te acerca a premios increíbles</p>
        </div>
        <div className={styles.floatingGifts}>
           <div className={styles.gift} style={{ '--delay': '0s', '--x': '10%' } as React.CSSProperties}>🎁</div>
           <div className={styles.gift} style={{ '--delay': '1s', '--x': '30%' } as React.CSSProperties}>🎁</div>
           <div className={styles.gift} style={{ '--delay': '2s', '--x': '50%' } as React.CSSProperties}>🎁</div>
           <div className={styles.gift} style={{ '--delay': '4s', '--x': '90%' } as React.CSSProperties}>🎁</div>
        </div>
      </div>

      <div className={styles.disclaimerBanner}>
        <p className={styles.disclaimer}>Aclaración: El canje se valida por WhatsApp o en caja</p>
      </div>

      {/* Consulta de Puntos */}
      <div className={styles.consultaSection}>
        <div className={styles.consultaCard}>
          <div className={styles.consultaHeader}>
            <FaAddressCard className={styles.consultaIcon} />
            <h2 className={styles.consultaTitle}>Ingresa tu DNI y consulta tus puntos</h2>
          </div>
          
          <form className={styles.dniSection} onSubmit={handleConsultarPuntos}>
            <div className={styles.inputWrapper}>
              <input 
                type="tel"
                className={styles.dniInput}
                placeholder="DNI sin puntos"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.botonConsultar} disabled={isLoadingPuntos}>
              {isLoadingPuntos ? 'Cargando...' : <><FaSearch /> Consultar</>}
            </button>
          </form>

          {!isLoadingPuntos && puntosUsuario !== null && (
            <div className={styles.puntosDisplay}>
              <div className={styles.puntosBadge}>
                <span className={styles.puntosLabel}>Tus puntos</span>
                <span className={styles.puntosValor}>{puntosUsuario}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Premios */}
      <div className={styles.premiosSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>PREMIOS DISPONIBLES</h2>
        </div>

        {isLoadingPremios ? (
          <div className={styles.loadingContainer}>Cargando premios...</div>
        ) : errorPremios ? (
          <div className={styles.errorContainer}>{errorPremios}</div>
        ) : (
          <div className={styles.premiosGrid}>
            
            {/* Usamos el componente PremioCard */}
            {premios.map((premio) => (
              <PremioCard 
                key={premio._id}
                premio={premio} 
                puntosUsuario={puntosUsuario}
                onCanjear={() => handleCanjear(premio)}
              />
            ))}
            
          </div>
        )}
      </div>

      {/* Info adicional */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>¿Cómo acumular puntos?</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}><div className={styles.infoNumber}>1</div><p>Realizá pedidos en cheepers</p></div>
            <div className={styles.infoItem}><div className={styles.infoNumber}>2</div><p>Ingresa tu DNI o dictalo en caja</p></div>
            <div className={styles.infoItem}><div className={styles.infoNumber}>3</div><p>Mientras más valor de compra más puntos</p></div>
            <div className={styles.infoItem}><div className={styles.infoNumber}>4</div><p>Canjeá por premios</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiosPage;