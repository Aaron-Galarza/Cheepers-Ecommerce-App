// src/hooks/useOrderExport.ts

import axios from 'axios';
import { toast } from 'react-toastify';
import { Order } from '../pages/management/ordersmanagement';
// Importamos los estilos del módulo CSS
import styles from '../pages/management.styles/ordersmanagement.module.css';

interface UseOrderExportProps {
    API_BASE_URL: string;
    productMapRef: React.MutableRefObject<Map<string, string>>;
    fetchOrders: (initialLoad: boolean) => Promise<void>;
}

/**
 * Custom hook for handling the export and cleanup of order history.
 * It provides separate functions to generate a CSV file and to delete
 * all orders from the database after user confirmation.
 * @param {UseOrderExportProps} props - The hook dependencies.
 * @returns {{handleExport: () => Promise<void>, handleClean: () => Promise<void>}}
 * An object with two functions: one for exporting and one for cleaning.
 */
export const useOrderExport = ({ API_BASE_URL, productMapRef, fetchOrders }: UseOrderExportProps) => {

    // Función para traducir los estados de inglés a español
    const translateStatus = (status: string): string => {
        switch (status) {
            case 'pending':
                return 'Pendiente';
            case 'processing':
                return 'En proceso';
            case 'delivered':
                return 'Entregado';
            case 'cancelled':
                return 'Cancelado';
            case 'completed':
                return 'Completado';
            default:
                return status;
        }
    };
    
    /**
     * Handles the logic for exporting all orders to a CSV file.
     * This function does NOT delete any data.
     */
    const handleExport = async () => {
        toast.info('Exportando... Por favor, espera.', { position: "top-center", autoClose: false });

        try {
            const token = localStorage.getItem('adminToken');
            const responseConfig = { headers: { Authorization: `Bearer ${token}` } };

            // Get all orders for the export
            const ordersResponse = await axios.get<Order[]>(`${API_BASE_URL}/api/orders?includeInactive=true`, responseConfig);
            const allOrders = ordersResponse.data;

            if (allOrders.length === 0) {
                toast.dismiss();
                toast.warn('No hay pedidos para exportar.', { position: "top-center" });
                return;
            }

            // Generate the CSV content
            const headers = ['Nombre', 'Email', 'Teléfono', 'Monto Total', 'Método de Pago', 'Tipo de Entrega', 'Calle', 'Ciudad', 'Productos', 'Estado', 'Fecha de Creación'];
            const csvContent = [
                headers.join(','),
                ...allOrders.map(order => {
                    const productsString = order.products.map(p => {
                        const productName = productMapRef.current.get(p.productId) || 'Desconocido';
                        const addOnsString = p.addOns?.map(a => `${a.quantity}x ${a.name}`).join(';') || '';
                        return `${p.quantity}x ${productName}${addOnsString ? ` (${addOnsString})` : ''}`;
                    }).join(' | ');

                    const paymentMethod = order.paymentMethod === 'card' ? 'MP' : order.paymentMethod;
                    const translatedStatus = translateStatus(order.status);

                    const row = [
                        order.guestName,
                        order.guestEmail,
                        order.guestPhone,
                        order.totalAmount.toString(),
                        paymentMethod,
                        order.deliveryType,
                        order.shippingAddress?.street || 'N/A',
                        order.shippingAddress?.city || 'N/A',
                        `"${productsString.replace(/"/g, '""')}"`,
                        translatedStatus,
                        new Date(order.createdAt).toLocaleString(),
                    ];
                    return row.join(',');
                })
            ].join('\n');

            // Download the CSV file
            const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `historial-pedidos-${new Date().toISOString()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success('Historial de pedidos exportado con éxito.', { position: "top-center" });

        } catch (err: any) {
            toast.dismiss();
            console.error('Error during export:', err);
            const errorMessage = axios.isAxiosError(err) && err.response
                ? err.response.data.message || err.message
                : 'Error desconocido al procesar la solicitud.';
            toast.error(`Error: ${errorMessage}`, { position: "top-center" });
        }
    };
    
    /**
     * Handles the logic for cleaning (deleting) all orders.
     * This function presents a confirmation toast before proceeding.
     */
    const handleClean = async () => {
        // Confirmation from the user, as the action is irreversible
        toast.info(
            <div className={styles.toastConfirmContent}>
                <p>¿Estás seguro de que quieres LIMPIAR el historial? Esta acción no se puede deshacer.</p>
                <div className={styles.toastButtons}>
                    <button
                        onClick={async () => {
                            toast.dismiss(); // Close the confirmation toast
                            toast.info('Limpiando... Por favor, espera.', { position: "top-center", autoClose: false });

                            try {
                                const token = localStorage.getItem('adminToken');
                                // Clean the database (Delete all orders)
                                await axios.delete(`${API_BASE_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
                                
                                // Update the UI
                                await fetchOrders(false);
                                
                                toast.dismiss();
                                toast.success('Historial de pedidos limpiado exitosamente.', { position: "top-center" });

                            } catch (err: any) {
                                toast.dismiss();
                                console.error('Error during clean:', err);
                                const errorMessage = axios.isAxiosError(err) && err.response
                                    ? err.response.data.message || err.message
                                    : 'Error desconocido al procesar la solicitud.';
                                toast.error(`Error: ${errorMessage}`, { position: "top-center" });
                            }
                        }}
                        className={styles.toastConfirmButton}
                    >
                        Sí, Limpiar
                    </button>
                    <button onClick={() => toast.dismiss()} 
                        className={styles.toastCancelButton}>
                        Cancelar
                    </button>
                </div>
            </div>,
            {
                position: "top-center",
                autoClose: false,
                closeButton: false,
                draggable: false,
                className: styles.exportCleanConfirmationToast,
            }
        );
    };

    return { handleExport, handleClean };
};
