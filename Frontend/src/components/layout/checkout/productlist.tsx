// C:\Users\Usuario\Desktop\Aaron\front-facu\Cheepers-Ecommerce-App\Frontend\src\components\layout\checkout\productlist.tsx

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string; // Ej. "Hamburguesas", "Pizzas", "Papas Fritas"
    isActive: boolean; // Para saber si está disponible
    tags?: string[]; // <-- ¡VERIFICA QUE ESTA LÍNEA ESTÉ TAL CUAL, CON EL '?'!
}

// Interfaz para un Adicional (AddOn) tal como viene del backend
export interface IAddOn {
    _id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category: string; // Ej. "AdicionalHamburguesa", "AdicionalBebida"
    isActive: boolean;
    associatedProductCategories: string[]; // Ej. ["Hamburguesas"]
}

// Interfaz para un adicional seleccionado que se guarda en el carrito
export interface SelectedAddOn {
    _id: string;
    name: string;
    price: number;
    quantity: number; // Cantidad de este adicional para un producto específico
}

// Nueva interfaz para un item en el carrito, que ahora puede incluir adicionales
export interface CartItem extends Product {
    quantity: number;
    addOns?: SelectedAddOn[]; // Array de adicionales seleccionados para este producto
    cartItemId: string; // Nuevo ID único para el ítem del carrito (producto + adicionales)
}