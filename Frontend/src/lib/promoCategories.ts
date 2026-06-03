export const PROMO_CATEGORIES = ['Promos Solo en Efectivo', 'Promos del patio'] as const;

export const isPromoCategory = (category: string) => PROMO_CATEGORIES.includes(category as typeof PROMO_CATEGORIES[number]);
