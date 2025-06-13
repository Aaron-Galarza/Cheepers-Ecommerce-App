import cheddarImage from '../../assets/images/cheddar.jpg';
import baconcheepImage from '../../assets/images/baconcheep.jpg';
import americanaImage from '../../assets/images/americana.jpg';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'hamburguesa' | 'papas';
}
function getImageForProduct(name: string): string {
  switch (name.toLowerCase()) {
    case 'hamburguesa cheddar':
      return cheddarImage;
    case 'hamburguesa americana':
      return americanaImage;
          case 'hamburguesa bacon cheep':
      return baconcheepImage;
    default:
      return cheddarImage; 
  }
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Hamburguesa Con Queso',
    description: 'Ketchup, mostaza, cebolla picada y cheddar. Medallón de carne 100% casero.',
    price: 3500,
    image: getImageForProduct('Hamburguesa Con Queso'),
    category: 'hamburguesa',
  },
  {
    id: 2,
    name: 'Hamburguesa Cheddar',
    description: 'Ketchup, cebolla picada, cheddar. Medallón de carne 100% casero.',
    price: 3500,
    image: getImageForProduct('Hamburguesa Cheddar'),
    category: 'hamburguesa',
  },
  {
    id: 3,
    name: 'Hamburguesa Barbacue',
    description: 'Salsa barbacoa, cebolla caramelizada, cheddar. Medallón 100% picada.',
    price: 3600,
    image: getImageForProduct('Hamburguesa Barbacue'),
    category: 'hamburguesa',
  },
  {
    id: 4,
    name: 'Hamburguesa Cheepers',
    description: 'Medallón de carne, salsa texana, lechuga, tomate, cheddar y cebollita picada.',
    price: 4500,
    image: getImageForProduct('Hamburguesa Cheepers'),
    category: 'hamburguesa',
  },
  {
    id: 5,
    name: 'Hamburguesa Danys',
    description: 'Mayonesa, ketchup, cebolla caramelizada y Muzzarella.',
    price: 3600,
    image: getImageForProduct('Hamburguesa Danys'),
    category: 'hamburguesa',
  },
  {
    id: 6,
    name: 'Hamburguesa Clásica',
    description: 'Mayonesa, lechuga, tomate, 1 huevo entero a la plancha, jamón, muzzarella.',
    price: 5500,
    image: getImageForProduct('Hamburguesa Clásica'),
    category: 'hamburguesa',
  },
  {
    id: 7,
    name: 'Hamburguesa Bacon Cheep',
    description: 'Mayonesa, lechuga, tomate, panceta a la plancha, cheddar.',
    price: 5500,
    image: getImageForProduct('Hamburguesa Bacon Cheep'),
    category: 'hamburguesa',
  },
  {
    id: 8,
    name: 'Hamburguesa Americana',
    description: 'Salsa barbacoa, cebolla caramelizada, huevos revueltos, panceta a la plancha, cheddar.',
    price: 5500,
    image: getImageForProduct('Hamburguesa Americana'),
    category: 'hamburguesa',
  },
  {
    id: 9,
    name: 'Hamburguesa Texana 2.0',
    description: '2 medallones, salsa texana, panceta a la plancha, doble cheddar.',
    price: 7000,
    image: getImageForProduct('Hamburguesa Texana 2.0'),
    category: 'hamburguesa',
  },
  {
    id: 10,
    name: 'Hamburguesa Texana 3.0',
    description: '3 medallones, salsa texana, doble panceta a la plancha, triple cheddar.',
    price: 8000,
    image: getImageForProduct('Hamburguesa Texana 3.0'),
    category: 'hamburguesa',
  },
  {
    id: 11,
    name: 'Hamburguesa Texana 4.0',
    description: '4 medallones, salsa texana, doble panceta a la plancha, cheddar x 4.',
    price: 9000,
    image: getImageForProduct('Hamburguesa Texana 4.0'),
    category: 'hamburguesa',
  },
  {
    id: 12,
    name: 'Papas Clásicas',
    description: 'Porción de papas fritas tradicionales.',
    price: 1500,
    image: getImageForProduct('Papas Clásicas'),
    category: 'papas',
  },
  {
    id: 13,
    name: 'Papas con Cheddar',
    description: 'Papas fritas con cheddar fundido.',
    price: 1800,
    image: getImageForProduct('Papas con Cheddar'),
    category: 'papas',
  },
  {
    id: 14,
    name: 'Papas con Panceta',
    description: 'Papas fritas con panceta crujiente.',
    price: 2000,
    image: getImageForProduct('Papas con Panceta'),
    category: 'papas',
  },
  {
    id: 15,
    name: 'Papas Cheepers',
    description: 'Nuestra versión especial con salsas.',
    price: 2200,
    image: getImageForProduct('Papas Cheepers'),
    category: 'papas',
  },
  {
    id: 16,
    name: 'Papas Supreme',
    description: 'Con cheddar, panceta, verdeo y salsas.',
    price: 2500,
    image: getImageForProduct('Papas Supreme'),
    category: 'papas',
  },
  {
    id: 17,
    name: 'Papas Cheddar Bacon',
    description: 'Papas con cheddar fundido y panceta.',
    price: 2700,
    image: getImageForProduct('Papas Cheddar Bacon'),
    category: 'papas',
  },
];
