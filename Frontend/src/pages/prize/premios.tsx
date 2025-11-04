// src/pages/premios/Premios.tsx

import React, { useState } from 'react';
import { FaSearch, FaGift, FaWhatsapp, FaAddressCard } from 'react-icons/fa';
import styles from '../css/premios.module.css';

// TODO BACKEND: Reemplazar esta interfaz con la del backend cuando esté lista
interface IPremio {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  puntos: number;
}

// TODO BACKEND: Reemplazar con llamada a API para obtener premios disponibles
const mockPremios: IPremio[] = [
  {
    id: 'p1',
    nombre: '1/2 Pizza Muzzarella',
    descripcion: 'Canjeá tus puntos por una deliciosa 1/2 pizza muzzarella.',
    imagenUrl: 'https://res.cloudinary.com/dwqxdensk/image/upload/v1757520958/cheepers_admin_gallery/WhatsApp_Image_2025-09-10_at_12.26.38_zvhx4t.jpg',
    puntos: 100,
  },
  {
    id: 'p2',
    nombre: 'Porción de Papas Cheddar',
    descripcion: 'Una porción de nuestras clásicas papas con cheddar y bacon.',
    imagenUrl: 'https://res.cloudinary.com/dwqxdensk/image/upload/v1754783607/cheepers_admin_gallery/Papas_fritas_grandes_con_cheddar_y_beacon_tw5gqz.webp',
    puntos: 250,
  },
  {
    id: 'p3',
    nombre: 'Hamburguesa Clásica',
    descripcion: 'Llevate una hamburguesa Clásica simple con queso.',
    imagenUrl: 'https://res.cloudinary.com/dwqxdensk/image/upload/v1754780182/cheepers_admin_gallery/Hamburguesa_Clasica_fnrthv.webp',
    puntos: 500,
  },
];

// TODO BACKEND: Reemplazar con el número de WhatsApp real del negocio
const WHATSAPP_NUMBER = '543624001122';

const PremiosPage: React.FC = () => {
  const [dni, setDni] = useState('');
  const [puntosUsuario, setPuntosUsuario] = useState<number | null>(null);

  // TODO BACKEND: Conectar con endpoint para consultar puntos por DNI
  const handleConsultarPuntos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim()) {
      alert('Por favor, ingresá un DNI para consultar.');
      return;
    }
    // SIMULACIÓN: Reemplazar con llamada real a la API
    // Ejemplo: const response = await axios.get(`/api/puntos/${dni}`);
    const puntosSimulados = Math.floor(Math.random() * 1000);
    setPuntosUsuario(puntosSimulados);
  };

  // TODO BACKEND: Validar con backend si el usuario tiene suficientes puntos antes de redirigir a WhatsApp
  const handleCanjear = (premio: IPremio) => {
    if (!dni.trim()) {
      alert('Por favor, ingresá tu DNI antes de canjear un premio.');
      return;
    }
    if (puntosUsuario === null || puntosUsuario < premio.puntos) {
      alert(`No tenés suficientes puntos para canjear este premio. Necesitás ${premio.puntos} puntos.`);
      return;
    }
    
    const mensaje = `Hola, ¿qué tal? Soy el cliente con el DNI: ${dni}, y me interesa canjear el siguiente premio: ${premio.nombre} (${premio.puntos} puntos)`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  };

  return (
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
        {/* Animaciones decorativas - Pueden removerse si afectan performance */}
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
            
            <button type="submit" className={styles.botonConsultar}>
              <FaSearch />
              Consultar Puntos
            </button>
          </form>

          {puntosUsuario !== null && (
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

        <div className={styles.premiosGrid}>
          {mockPremios.map((premio) => (
            <div key={premio.id} className={styles.premioCard}>
              <div className={styles.imageContainer}>
                <img 
                  src={premio.imagenUrl} 
                  alt={premio.nombre} 
                  className={styles.premioImage}
                />
              </div>
              
              <div className={styles.premioContent}>
                <h3 className={styles.premioNombre}>{premio.nombre}</h3>
                <p className={styles.premioDescripcion}>{premio.descripcion}</p>

                <div className={styles.premioFooter}>
                  <div className={styles.puntosContainer}>
                    <span className={styles.puntosText}>PUNTOS</span>
                    <span className={styles.puntosValor}>{premio.puntos}</span>
                  </div>
                  
                  <button 
                    className={styles.botonCanjear}
                    onClick={() => handleCanjear(premio)}
                    disabled={puntosUsuario !== null && puntosUsuario < premio.puntos}
                  >
                    <FaWhatsapp className={styles.whatsappIcon} />
                    Canjear
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info adicional - Sección estática, no requiere cambios del backend */}
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