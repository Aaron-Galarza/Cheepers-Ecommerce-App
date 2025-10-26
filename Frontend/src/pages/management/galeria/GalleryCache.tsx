// src/utils/galleryCache.ts

interface CachedPage {
    images: any[];
    nextCursor?: string;
    timestamp: number;
}

class GalleryCache {
    private cache: Map<string, CachedPage> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

    setPage(cursor: string | undefined, data: { images: any[], nextCursor?: string }) {
        const key = cursor || 'first_page';
        this.cache.set(key, {
            images: data.images,
            nextCursor: data.nextCursor,
            timestamp: Date.now()
        });
    }

    getPage(cursor: string | undefined): CachedPage | null {
        const key = cursor || 'first_page';
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Verificar si el cache expiró
        if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }
        
        return cached;
    }

    clear() {
        this.cache.clear();
    }

    // Invalidar cache cuando se sube o elimina una imagen
    invalidate() {
        this.clear();
    }
}

export const galleryCache = new GalleryCache();