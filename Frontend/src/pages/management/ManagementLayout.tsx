import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importa todos tus componentes de gestión
import VentasManagement from './ventasmanagement';
import ProductManagement from './productmanagement';
import OrdersManagement from './ordersmanagement'; // Ejemplo de otro componente
import PromoManagement from   './promomanagement'
// Este componente servirá como el "layout" para todas tus páginas de gestión.
const ManagementLayout = () => {
  return (
    <div className="management-container">
      {/* Puedes agregar una barra de navegación lateral, un encabezado,
        o cualquier otro elemento de UI que sea común a todas las
        páginas de gestión aquí.
      */}
      <h1>Panel de Gestión</h1>
      
      {/* Aquí definimos las rutas anidadas.
        Observa que los 'path' son relativos (solo el nombre de la ruta, sin el '/').
        Por ejemplo, el path "ventas" se resolverá como "/management/ventas".
      */}
      <Routes>
        <Route path="/" element={<h2>Bienvenido al panel de gestión</h2>} />
        <Route path="ventas" element={<VentasManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrdersManagement />} />
         <Route path="promos" element={<PromoManagement />} />
      </Routes>
    </div>
  );
};

export default ManagementLayout;
