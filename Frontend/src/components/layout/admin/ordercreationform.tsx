import React from 'react';
import { FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import styles from './../../../pages/management.styles/ordersmanagement.module.css';
// Importar IAddOn y Product desde el componente principal ordersmanagement
import { IAddOn, Product } from '../../../pages/management/ordersmanagement';

// Interfaces para los props del formulario
interface FormProduct {
  tempId: string;
  productId: string;
  quantity: number;
  selectedAddOns: Array<{
    addOnId: string;
    quantity: number;
  }>;
}

interface OrderCreationFormProps {
  newOrderForm: {
    guestEmail?: string;
    guestName: string;
    guestPhone: string;
    paymentMethod: 'cash' | 'card' | 'transfer';
    deliveryType: 'delivery' | 'pickup';
    shippingStreet: string;
    shippingCity: string;
    formProducts: FormProduct[];
  };
  setNewOrderForm: React.Dispatch<React.SetStateAction<OrderCreationFormProps['newOrderForm']>>;
  availableProducts: Product[];
  availableAddOns: IAddOn[];
  productMapRef: React.MutableRefObject<Map<string, string>>;
  calculateTotalAmount: () => number;
  handleSubmitNewOrder: (e: React.FormEvent) => Promise<void>;
}

const OrderCreationForm: React.FC<OrderCreationFormProps> = ({
  newOrderForm,
  setNewOrderForm,
  availableProducts,
  availableAddOns,
  productMapRef,
  calculateTotalAmount,
  handleSubmitNewOrder,
}) => {
  // Estado local: texto de búsqueda por renglón (key = tempId del producto del form)
  const [productSearch, setProductSearch] = React.useState<Record<string, string>>({});

  // Inicializamos la ciudad por defecto
  React.useEffect(() => {
    setNewOrderForm(prev => ({
      ...prev,
      shippingCity: 'Resistencia',
    }));
  }, [setNewOrderForm]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setNewOrderForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setNewOrderForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProductChange = (tempId: string, field: string, value: any) => {
    setNewOrderForm(prev => ({
      ...prev,
      formProducts: prev.formProducts.map(fp => (fp.tempId === tempId ? { ...fp, [field]: value } : fp)),
    }));
  };

  const handleAddProduct = () => {
    setNewOrderForm(prev => ({
      ...prev,
      formProducts: [
        ...prev.formProducts,
        { tempId: Date.now().toString(), productId: '', quantity: 1, selectedAddOns: [] },
      ],
    }));
  };

  const handleRemoveProduct = (tempId: string) => {
    setNewOrderForm(prev => ({
      ...prev,
      formProducts: prev.formProducts.filter(fp => fp.tempId !== tempId),
    }));
    // Limpio el texto de búsqueda para ese renglón
    setProductSearch(prev => {
      const clone = { ...prev };
      delete clone[tempId];
      return clone;
    });
  };

  const handleAddAddOn = (productTempId: string) => {
    setNewOrderForm(prev => ({
      ...prev,
      formProducts: prev.formProducts.map(fp =>
        fp.tempId === productTempId
          ? {
              ...fp,
              selectedAddOns: [...fp.selectedAddOns, { addOnId: '', quantity: 1 }],
            }
          : fp
      ),
    }));
  };

  const handleRemoveAddOn = (productTempId: string, addOnIndex: number) => {
    setNewOrderForm(prev => ({
      ...prev,
      formProducts: prev.formProducts.map(fp =>
        fp.tempId === productTempId
          ? {
              ...fp,
              selectedAddOns: fp.selectedAddOns.filter((_, idx) => idx !== addOnIndex),
            }
          : fp
      ),
    }));
  };

  const handleAddOnChange = (productTempId: string, addOnIndex: number, field: string, value: any) => {
    setNewOrderForm(prev => ({
      ...prev,
      formProducts: prev.formProducts.map(fp =>
        fp.tempId === productTempId
          ? {
              ...fp,
              selectedAddOns: fp.selectedAddOns.map((sa, idx) => (idx === addOnIndex ? { ...sa, [field]: value } : sa)),
            }
          : fp
      ),
    }));
  };

  // Utilidad para filtrar productos del select según el texto de búsqueda del renglón
  const getFilteredProductsForRow = React.useCallback(
    (rowTempId: string, currentProductId: string) => {
      const query = (productSearch[rowTempId] || '').trim().toLocaleLowerCase();
      const collator = new Intl.Collator('es', { sensitivity: 'base', usage: 'search' });

      let filtered = !query
        ? availableProducts
        : availableProducts.filter(p => collator.compare(p.name.toLocaleLowerCase(), query) === 0
            || p.name.toLocaleLowerCase().includes(query));

      // Aseguro que el ya seleccionado esté presente aunque no matchee el filtro
      if (currentProductId && !filtered.some(p => p._id === currentProductId)) {
        const selected = availableProducts.find(p => p._id === currentProductId);
        if (selected) filtered = [selected, ...filtered];
      }

      // Orden estable: primero coincidencia exacta (si la hay), luego por nombre
      filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));

      return filtered;
    },
    [availableProducts, productSearch]
  );

  return (
    <div className={styles.formSection}>
      <h2 className={styles.formTitle}>Crear Nuevo Pedido Manualmente</h2>
      <form onSubmit={handleSubmitNewOrder} className={styles.orderForm}>
        {/* Datos del Cliente */}
        <div className={styles.formGroup}>
          <label htmlFor="guestName">Nombre del Cliente:</label>
          <input
            type="text"
            id="guestName"
            name="guestName"
            value={newOrderForm.guestName}
            onChange={handleFormChange}
            className={styles.inputField}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="guestPhone">Teléfono del Cliente:</label>
          <input
            type="tel"
            id="guestPhone"
            name="guestPhone"
            value={newOrderForm.guestPhone}
            onChange={handleFormChange}
            className={styles.inputField}
            required
          />
        </div>

        {/* Tipo de Entrega y Dirección */}
        <div className={styles.formGroup}>
          <label htmlFor="deliveryType">Tipo de Entrega:</label>
          <select
            id="deliveryType"
            name="deliveryType"
            value={newOrderForm.deliveryType}
            onChange={handleFormChange}
            className={styles.selectField}
          >
            <option value="pickup">Retiro en Sucursal</option>
            <option value="delivery">Envío a Domicilio</option>
          </select>
        </div>

        {newOrderForm.deliveryType === 'delivery' && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="shippingStreet">Calle:</label>
              <input
                type="text"
                id="shippingStreet"
                name="shippingStreet"
                value={newOrderForm.shippingStreet}
                onChange={handleFormChange}
                className={styles.inputField}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="shippingCity">Ciudad:</label>
              <input
                type="text"
                id="shippingCity"
                name="shippingCity"
                value={newOrderForm.shippingCity}
                onChange={handleFormChange}
                className={styles.inputField}
                required
              />
            </div>
          </>
        )}

        {/* Método de Pago */}
        <div className={styles.formGroup}>
          <label htmlFor="paymentMethod">Método de Pago:</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={newOrderForm.paymentMethod}
            onChange={handleFormChange}
            className={styles.selectField}
          >
            <option value="cash">Efectivo</option>
            <option value="card">Mercado Pago</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>

        {/* Productos del Pedido */}
        <div className={styles.formGroup}>
          <h3>Productos:</h3>
          {newOrderForm.formProducts.map(fp => {
            const filteredProducts = getFilteredProductsForRow(fp.tempId, fp.productId);
            return (
              <div key={fp.tempId} className={styles.productItem}>
                {/* Barra de búsqueda por renglón */}
                <input
                  type="text"
                  placeholder="Buscar producto…"
                  className={styles.inputField}
                  value={productSearch[fp.tempId] || ''}
                  onChange={e =>
                    setProductSearch(prev => ({
                      ...prev,
                      [fp.tempId]: e.target.value,
                    }))
                  }
                />

                {/* Select de productos (filtrado) */}
                <select
                  value={fp.productId}
                  onChange={e => handleProductChange(fp.tempId, 'productId', e.target.value)}
                  className={styles.selectField}
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {filteredProducts.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} (${p.price.toFixed(2)})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Cantidad"
                  value={fp.quantity}
                  onChange={e => handleProductChange(fp.tempId, 'quantity', parseInt(e.target.value) || 1)}
                  className={styles.inputField}
                  min={1}
                  required
                />

                <button
                  type="button"
                  onClick={() => handleAddAddOn(fp.tempId)}
                  className={styles.addAddOnButton}
                >
                  <FaPlus /> Adicional
                </button>

                {newOrderForm.formProducts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(fp.tempId)}
                    className={styles.removeButton}
                  >
                    <FaMinus />
                  </button>
                )}

                {/* Adicionales del Producto */}
                {fp.selectedAddOns.length > 0 && (
                  <div className={styles.addOnsContainer}>
                    <h4>
                      Adicionales para {productMapRef.current.get(fp.productId) || 'este producto'}:
                    </h4>
                    {fp.selectedAddOns.map((sa, addOnIndex) => (
                      <div key={addOnIndex} className={styles.addOnItemForm}>
                        <select
                          value={sa.addOnId}
                          onChange={e => handleAddOnChange(fp.tempId, addOnIndex, 'addOnId', e.target.value)}
                          className={styles.selectField}
                          required
                        >
                          <option value="">Selecciona un adicional</option>
                          {availableAddOns.map(ao => (
                            <option key={ao._id} value={ao._id}>
                              {ao.name} (${ao.price.toFixed(2)})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveAddOn(fp.tempId, addOnIndex)}
                          className={styles.removeButton}
                        >
                          <FaMinus />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button type="button" onClick={handleAddProduct} className={styles.addProductButton}>
            <FaPlus /> Añadir Otro Producto
          </button>
        </div>

        {/* Total y Botón de Envío */}
        <div className={styles.totalAmountDisplay}>
          Total Estimado: ${calculateTotalAmount().toFixed(2)}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>
            <FaSave /> Crear Pedido
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderCreationForm;
