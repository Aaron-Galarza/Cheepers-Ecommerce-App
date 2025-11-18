// src/pages/premios/Premios.tsx

import React, { useState, useEffect } from 'react'; // 1. Añadimos useEffect
import { FaSearch, FaGift, FaWhatsapp, FaAddressCard } from 'react-icons/fa';
import styles from '../css/premios.module.css';
import axios from 'axios'; // 2. Importamos axios

// --- 3. Definimos la URL base de la API ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- 4. El 'type' ahora debe coincidir con la API ---
// (Tu API usa '_id' y 'costPoints')
interface IPremio {
  _id: string; // ID de MongoDB
  name: string; // <-- Corregido (antes 'nombre')
  description: string; // <-- Corregido (antes 'descripcion')
  imageUrl: string; // <-- Corregido (antes 'imagenUrl')
  costPoints: number; // Dato real de la API
  isActive: boolean;
}

const WHATSAPP_NUMBER = '543624001122'; // Reemplazá con tu número

const PremiosPage: React.FC = () => {
  const [dni, setDni] = useState('');
  const [puntosUsuario, setPuntosUsuario] = useState<number | null>(null);

  // --- 5. Estados para manejar la carga de la API ---
  const [premios, setPremios] = useState<IPremio[]>([]);
  const [isLoadingPremios, setIsLoadingPremios] = useState(true);
  const [isLoadingPuntos, setIsLoadingPuntos] = useState(false);
  const [errorPremios, setErrorPremios] = useState<string | null>(null);

  // --- 6. useEffect para cargar los premios ACTIVOS al montar ---
  useEffect(() => {
    const fetchPremios = async () => {
      setIsLoadingPremios(true);
      setErrorPremios(null);
      try {
        // Llamamos a GET /api/rewards (trae solo los activos para clientes)
        const response = await axios.get<IPremio[]>(`${API_BASE_URL}/api/rewards`);
        setPremios(response.data); // Guarda los datos tal como vienen de la API
      } catch (err) {
        console.error("Error al cargar premios:", err);
        setErrorPremios("No se pudieron cargar los premios. Intenta de nuevo más tarde.");
      } finally {
        setIsLoadingPremios(false);
      }
    };

    fetchPremios();
  }, []); // El array vacío asegura que se ejecute solo una vez


  // --- 7. Conectamos handleConsultarPuntos a la API ---
  const handleConsultarPuntos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim()) {
      alert('Por favor, ingresá un DNI para consultar.');
      return;
    }
    
    setIsLoadingPuntos(true);
    setPuntosUsuario(null); // Reseteamos puntos anteriores
    
    try {
      // ========================================================================
      // === BACKEND DEBE CREAR ESTE ENDPOINT PÚBLICO (sin /admin) ===
      // ========================================================================
      const response = await axios.get(`${API_BASE_URL}/api/loyalty/${dni.trim()}`); 
      
      if (response.data && response.data.totalPoints !== undefined) {
        setPuntosUsuario(response.data.totalPoints);
      } else {
        setPuntosUsuario(0); // Si el cliente existe pero no tiene puntos
      }
    } catch (err: any) {
      console.error("Error al consultar puntos:", err);
      if (err.response && (err.response.status === 404 || err.response.status === 400)) {
        alert('Cliente no encontrado. Asegurate de estar registrado.');
      } else if (err.response && err.response.status === 401) {
         alert('Error de autenticación. Esta función es solo para admins.');
      } else {
        alert('Error al consultar puntos. Intenta de nuevo.');
      }
      setPuntosUsuario(null);
    } finally {
      setIsLoadingPuntos(false);
    }
  };

  // --- 8. Lógica de Canjear (ajustada a costPoints) ---
  const handleCanjear = (premio: IPremio) => {
    if (!dni.trim()) {
      alert('Por favor, ingresá tu DNI antes de canjear un premio.');
      return;
    }
    if (puntosUsuario === null) {
      alert('Por favor, consultá tus puntos primero.');
      return;
    }
    // Usamos costPoints
    if (puntosUsuario < premio.costPoints) {
      alert(`No tenés suficientes puntos para canjear este premio. Necesitás ${premio.costPoints} puntos.`);
      return;
    }
    
    // Usamos 'name' (de la API)
    const mensaje = `Hola, ¿qué tal? Soy el cliente con el DNI: ${dni}, y me interesa canjear el siguiente premio: ${premio.name} (${premio.costPoints} puntos)`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  };

  return (
    // TU DISEÑO ORIGINAL (Sin cambios de clases)
    <div className={styles.premiosContainer}>
      {/* Header con efecto visual */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <FaGift className={styles.heroIcon} />
            CANJEÁ TUS PUNTOS
          </h1>
          <p className={styles.heroSubtitle}>
            Cada compra te acerca a premios increíbles
          </p>
        </div>
        <div className={styles.floatingGifts}>
          <div className={styles.gift} style={{ '--delay': '0s', '--x': '10%' } as React.CSSProperties}>🎁</div>
          <div className={styles.gift} style={{ '--delay': '1s', '--x': '30%' } as React.CSSProperties}>🎁</div>
          <div className={styles.gift} style={{ '--delay': '2s', '--x': '50%' } as React.CSSProperties}>🎁</div>
          <div className={styles.gift} style={{ '--delay': '3s', '--x': '70%' } as React.CSSProperties}>🎁</div>
          <div className={styles.gift} style={{ '--delay': '4s', '--x': '90%' } as React.CSSProperties}>🎁</div>
        </div>
      </div>

      <div className={styles.disclaimerBanner}>
        <p className={styles.disclaimer}>
          💫 Aclaración: El canje será validado por WhatsApp o en caja
        </p>
      </div>

      {/* Sección de consulta de puntos */}
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
                placeholder="Ingresá tu DNI sin puntos"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                pattern="[0-9]{7,9}"
                title="Ingresá solo números, sin puntos."
              />
            </div>
            
            <button type="submit" className={styles.botonConsultar} disabled={isLoadingPuntos}>
              {isLoadingPuntos ? (
                <div className={styles.spinner}></div> 
              ) : (
                <>
                  <FaSearch />
                  Consultar Puntos
                </>
              )}
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

      {/* Sección de premios */}
      <div className={styles.premiosSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FaGift className={styles.sectionIcon} />
            PREMIOS DISPONIBLES
          </h2>
          <p className={styles.sectionSubtitle}>
            Canjeá tus puntos por estas deliciosas recompensas
          </p>
        </div>

        {/* ============================================================== */}
        {/* === CAMBIO 9: Manejamos Carga, Error y mapeo de 'premios' === */}
        {/* ============================================================== */}
        {isLoadingPremios ? (
          <div className={styles.loadingContainer}>Cargando premios...</div>
        ) : errorPremios ? (
          <div className={styles.errorContainer}>{errorPremios}</div>
        ) : (
          <div className={styles.premiosGrid}>
            {/* Ahora mapeamos 'premios' del estado */}
            {premios.map((premio) => (
              <div key={premio._id} className={styles.premioCard}>
                <div className={styles.imageContainer}>
                  <img 
                    // Usamos 'imageUrl' (de la API)
                    src={premio.imageUrl || 'https://via.placeholder.com/400x300.png?text=Premio'}
                    alt={premio.name} // Usamos 'name' (de la API)
                    className={styles.premioImage}
                  />
                </div>
                
                <div className={styles.premioContent}>
                  {/* Usamos 'name' (de la API) */}
                  <h3 className={styles.premioNombre}>{premio.name}</h3>
                  {/* Usamos 'description' (de la API) */}
                  <p className={styles.premioDescripcion}>{premio.description}</p>

                  <div className={styles.premioFooter}>
                    <div className={styles.puntosContainer}>
                      <span className={styles.puntosText}>PUNTOS</span>
                      {/* Usamos 'costPoints' (de la API) */}
                      <span className={styles.puntosValor}>{premio.costPoints}</span>
                    </div>
                    
                    <button 
                      className={styles.botonCanjear}
                      onClick={() => handleCanjear(premio)}
                      // Usamos 'costPoints'
                      disabled={puntosUsuario === null || puntosUsuario < premio.costPoints}
                    >
                      <FaWhatsapp className={styles.whatsappIcon} />
                      Canjear
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info adicional (Sin cambios) */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>¿Cómo acumular puntos?</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoNumber}>1</div>
              <p>Realizá pedidos en nuestro local</p>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoNumber}>2</div>
              <p>Presentá tu DNI al hacer el pedido</p>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoNumber}>3</div>
              <p>Acumulá puntos con cada compra</p>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoNumber}>4</div>
              <p>Canjeá por premios increíbles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiosPage;