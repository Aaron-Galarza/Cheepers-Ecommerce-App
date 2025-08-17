import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // useLocation es un hook de React Router que nos da acceso a la ubicación actual
  const { pathname } = useLocation();

  // useEffect se ejecuta cada vez que el pathname cambia (es decir, cada vez que navegas)
  useEffect(() => {
    // Desplaza la ventana a la posición (0, 0)
    window.scrollTo(0, 0);
  }, [pathname]); // El array de dependencias asegura que el efecto se ejecute solo cuando la ruta cambia

  return null; // Este componente no renderiza nada, solo maneja el efecto secundario
};

export default ScrollToTop;