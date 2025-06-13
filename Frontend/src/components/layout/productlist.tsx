// C:\Users\Usuario\Desktop\Aaron\front-facu\Cheepers-Ecommerce-App\Frontend\src\components\layout\productlist.tsx

export interface Product {
  _id: string; // El ID que viene de MongoDB es un string
  name: string;
  description?: string; // Hacemos la descripci\u00F3n opcional
  price: number;
  imageUrl?: string; // Usamos imageUrl para coincidir con el backend
  category: string; // La categor\u00EDa puede ser cualquier string que devuelva tu backend
  // Si tu backend devuelve otros campos como 'createdAt', 'updatedAt', '__v', etc.,
  // y no los necesitas en el frontend, no es necesario a\u00F1adirlos aqu\u00ED.
}