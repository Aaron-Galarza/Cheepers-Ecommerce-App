// Frontend/src/lib/generateComandaHTML.ts

import { OrderDisplay } from "../pages/management/ordersmanagement"; // Importa la interfaz OrderDisplay

/**
 * Genera una cadena HTML para una comanda de pedido con un diseño de ticket de cocina.
 * @param order Los datos del pedido a incluir en la comanda.
 * @returns Una cadena de texto HTML.
 */
export const generateComandaHTML = (order: OrderDisplay): string => {
    // Formatear la fecha y hora
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const orderTime = new Date(order.createdAt).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Formato de 24 horas
    });

    // Construir la lista de productos y adicionales
    const productsHtml = order.products.map(item => `
        <div style="margin-bottom: 5px; border-bottom: 1px dotted #333; padding-bottom: 3px;">
            <p style="margin: 0; font-weight: bold;">- ${item.name} x${item.quantity}</p>
            ${item.addOns && item.addOns.length > 0 ? `
                <ul style="list-style: none; padding-left: 15px; margin: 5px 0 0 0;">
                    ${item.addOns.map(addOn => `
                        <li style="margin: 0; font-size: 0.9em;">&#8627; ${addOn.name} x${addOn.quantity} ($${addOn.price.toFixed(2)})</li>
                    `).join('')}
                </ul>
            ` : ''}
        </div>
    `).join('');

    // Determinar la dirección de envío si aplica
    const shippingAddressHtml = order.deliveryType === 'delivery' && order.shippingAddress ? `
        <p style="margin: 5px 0;"><strong>Dirección:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
    ` : '';

    // Determinar las notas si existen
    // (Asumiendo que 'notes' puede venir en OrderDisplay, aunque no esté explícitamente en la interfaz actual)
    const notesHtml = (order as any).notes ? `
        <div style="margin-top: 15px; padding-top: 5px; border-top: 1px dashed #333;">
            <p style="margin: 0; font-weight: bold;">Notas:</p>
            <p style="margin: 5px 0 0 0; font-style: italic;">${(order as any).notes}</p>
        </div>
    ` : '';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comanda - Pedido #${order._id.substring(0, 5)}</title>
            <style>
                body {
                    font-family: 'Courier New', Courier, monospace;
                    margin: 0;
                    padding: 20px;
                    color: #000;
                    background-color: #fff;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .comanda-container {
                    width: 300px; /* Ancho típico de un ticket */
                    margin: 0 auto;
                    border: 1px solid #000;
                    padding: 15px;
                    box-sizing: border-box;
                }
                h1, h2, h3 {
                    text-align: center;
                    margin: 5px 0;
                }
                .header, .footer {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .separator {
                    border-top: 1px dashed #000;
                    margin: 10px 0;
                }
                .details p {
                    margin: 3px 0;
                }
                .products-section {
                    margin: 15px 0;
                }
                .product-item {
                    margin-bottom: 5px;
                    border-bottom: 1px dotted #333;
                    padding-bottom: 3px;
                }
                .product-item p {
                    margin: 0;
                    font-weight: bold;
                }
                .addons-list {
                    list-style: none;
                    padding-left: 15px;
                    margin: 5px 0 0 0;
                }
                .addon-item {
                    margin: 0;
                    font-size: 0.9em;
                }
                .total-section {
                    text-align: right;
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-top: 15px;
                }
                /* Estilos para impresión */
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .comanda-container {
                        border: none;
                        width: auto;
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="comanda-container">
                <div class="header">
                    <h2>Cheepers Burgers</h2>
                    <h3>COMANDA DE PEDIDO</h3>
                </div>
                <div class="separator"></div>
                <div class="details">
                    <p><strong>Pedido ID:</strong> ${order._id.substring(0, 8)}</p>
                    <p><strong>Fecha:</strong> ${orderDate}</p>
                    <p><strong>Hora:</strong> ${orderTime}</p>
                    <p><strong>Cliente:</strong> ${order.guestName}</p>
                    <p><strong>Teléfono:</strong> ${order.guestPhone}</p>
                    ${shippingAddressHtml}
                    <p><strong>Tipo de Entrega:</strong> ${order.deliveryType === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Sucursal'}</p>
                </div>
                <div class="separator"></div>
                <div class="products-section">
                    <h3 style="text-align: center;">DETALLE DEL PEDIDO</h3>
                    ${productsHtml}
                </div>
                <div class="separator"></div>
                <div class="total-section">
                    <p><strong>Método de Pago:</strong> ${order.paymentMethod === 'cash' ? 'Efectivo' : order.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}</p>
                    <p>TOTAL: $${order.totalAmount.toFixed(2)}</p>
                </div>
                ${notesHtml}
                <div class="separator"></div>
                <div class="footer">
                    <p>¡Gracias por tu pedido!</p>
                </div>
            </div>
        </body>
        </html>
    `;
};