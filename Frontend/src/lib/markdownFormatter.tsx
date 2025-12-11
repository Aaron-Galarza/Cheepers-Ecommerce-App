import React from 'react';

// Define el componente funcional que procesará el string
interface PromoFormatterProps {
    text: string;
    // Opcional: para usar los estilos de tu CSS Module
    className?: string; 
}

/**
 * Procesa un string de promoción aplicando formato simple (tachado, negrita, resaltado)
 * y lo convierte a JSX.
 */
export const PromoFormatter: React.FC<PromoFormatterProps> = ({ text, className }) => {
    if (!text) return null;

    let processedText = text;
    
    // --- 1. PROCESAR TACHADO (~~Texto~~) ---
    // Busca: ~~texto~~ y lo reemplaza con un span con estilo tachado.
    processedText = processedText.replace(/~~(.*?)~~/g, (match, content) => {
        // Usamos un estilo inline simple para el tachado
        return `<span style="text-decoration: line-through; color: #888;">${content}</span>`;
    });

    // --- 2. PROCESAR NEGRITA (**Texto**) ---
    // Busca: **texto** y lo reemplaza con un strong (negrita).
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        return `<strong>${content}</strong>`;
    });

    // --- 3. PROCESAR RESALTADO (##Texto##) ---
    // Busca: ##texto## y lo reemplaza con un span con un color de oferta (rojo/naranja).
    processedText = processedText.replace(/##(.*?)##/g, (match, content) => {
        // Usamos un color de promoción (deberías definirlo en tu CSS)
        return `<span style="color: #e74c3c; font-weight: bold;">${content}</span>`;
    });

    /* ⚠️ ADVERTENCIA CRÍTICA: 
       Estamos insertando HTML generado por el usuario/Admin en el DOM.
       Esto requiere usar dangerouslySetInnerHTML, lo cual es inseguro si el input no fuera confiable.
       Dado que solo lo usa Ricky (un Admin confiable), el riesgo es bajo, 
       pero es la única forma de renderizar el HTML generado.
    */
    
    return (
        <div 
            className={className} 
            dangerouslySetInnerHTML={{ __html: processedText }} 
        />
    );
};