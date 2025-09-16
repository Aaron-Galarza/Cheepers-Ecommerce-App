// Frontend/src/lib/generateComandaHTML.ts

import { OrderDisplay } from "../pages/management/ordersmanagement"; // Importa la interfaz OrderDisplay

/**
 * Genera una cadena HTML para una comanda de pedido con un diseño de ticket de cocina.
 * @param order Los datos del pedido a incluir en la comanda.
 * @param shippingCost El costo de envío, opcional, para pedidos a domicilio.
 * @returns Una cadena de texto HTML.
 */
export const generateComandaHTML = (order: OrderDisplay, shippingCost?: number): string => {
    // Lógica para determinar el texto del método de pago
    let paymentMethodText = '';
    if (order.paymentMethod === 'cash') {
        paymentMethodText = 'Efectivo';
    } else if (order.paymentMethod === 'card' || order.paymentMethod === 'transfer') {
        paymentMethodText = 'Mercado Pago';
    } else {
        paymentMethodText = order.paymentMethod; // Para cualquier otro método no contemplado
    }
    
    // Formatear la fecha y hora
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
    const orderTime = new Date(order.createdAt).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Formato de 24 horas
    });

    // Construir la lista de productos y adicionales
    const productsHtml = order.products.map(item => `
        <p style="margin: 0; font-weight: bold; font-size: 1.1em;"><strong>- ${item.name} x${item.quantity}</strong></p>
        ${item.addOns && item.addOns.length > 0 ? `
            <ul style="list-style: none; padding-left: 15px; margin: 5px 0;">
                ${item.addOns.map(addOn => `
                      <li style="margin: 0; font-size: 0.9em;">&#8627; ${addOn.name} x${addOn.quantity * item.quantity}</li>
                    `).join('')}
            </ul>
        ` : ''}
    `).join('');

    // Determinar la dirección de envío si aplica
    const shippingAddressHtml = order.deliveryType === 'delivery' && order.shippingAddress ? `
        <p style="margin: 5px 0;"><strong>Dirección:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
    ` : '';
    
    // Calcular el total final si hay costo de envío
    const totalFinal = shippingCost !== undefined ? order.totalAmount + shippingCost : order.totalAmount;
    
    // Crear el bloque HTML para el costo de envío si existe
    const shippingCostHtml = shippingCost !== undefined ? `
        <p style="font-size: 1.1em; font-weight: bold;"> Envío: <strong>$${shippingCost.toFixed(2)}</strong></p>
    ` : '';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comanda</title>
            <style>
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    font-size: 14px;
                    line-height: 1.2; 
                    margin: 0; 
                    padding: 10px; 
                }
                .comanda-container { 
                    width: 300px; 
                    margin: 0 auto; 
                    padding: 10px; 
                    box-sizing: border-box; 
                    border: 1px solid #000; 
                }
                h3 { text-align: center; margin: 5px 0; font-size: 1.5em; }
                .separator { border-top: 1px dashed #000; margin: 10px 0; } /* Líneas más finas */
                .details p { margin: 5px 0; font-size: 1.1em; font-weight: bold; }
                .products-section { margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="comanda-container">
                <div style="text-align: center;">
                    <h3>CHEEPERS</h3>
                </div>
                <div class="separator"></div>
                <div class="details">
                    <p><strong>Fecha:</strong> ${orderDate} | <strong>Hora:</strong> ${orderTime} </p>
                    <p><strong>Tipo:</strong> ${order.deliveryType === 'delivery' ? 'Envío' : 'Retiro'}</p>
                    <p><strong>Cliente:</strong> ${order.guestName}</p>
                    <p><strong>Teléfono:</strong> ${order.guestPhone}</p>
                    ${shippingAddressHtml}
                </div>
                <div class="separator"></div>
                <div class="products-section">
                    ${productsHtml}
                </div>
                <div class="separator"></div>
                <div style="text-align: right;">
                    <p style="font-size: 1.1em; font-weight: bold;"><strong>Pago:</strong> <strong>${paymentMethodText}</strong></p>
                    <p style="font-size: 1.1em; font-weight: bold;">Subtotal: <strong>$${order.totalAmount.toFixed(2)}</strong></p>
                    ${shippingCostHtml}
                    <p style="font-size: 1.2em;"><strong>TOTAL: $${totalFinal.toFixed(2)}</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;
};