import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/Cheepers-Ecommerce-App/', // Mantén esto si lo necesitas para el despliegue
  plugins: [react()],
  build: {
    // Asegura que el código se minimice. Por defecto es 'terser' en producción.
    // Esto reduce el tamaño del archivo y ofusca el código.
    minify: true, 
    
    // Opciones específicas para Terser (el minificador de JavaScript)
    terserOptions: {
      compress: {
        // Esta opción elimina todas las llamadas a console.* en el código final.
        drop_console: true,
        // Esta opción elimina todas las llamadas a debugger en el código final.
        drop_debugger: true,
      },
      // Puedes añadir más opciones si necesitas un control más fino sobre la salida
      // output: {
      //   comments: false, // Elimina todos los comentarios del código final
      // },
    },
  },
})
