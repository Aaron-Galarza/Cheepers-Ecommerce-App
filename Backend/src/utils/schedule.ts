import schedule from 'node-schedule';

// Define el estado global del negocio
export let isStoreOpen = false;

// Define los horarios de atención
const horarios = {
    DO: { open: '20:00', close: '23:00' },
    LU: { open: '20:00', close: '23:00' },
    MA: { open: '20:00', close: '23:00' },
    MI: { open: '20:00', close: '23:00' },
    JU: { open: '22:59', close: '23:00' },
    VI: { open: '20:00', close: '23:30' },
    SA: { open: '20:00', close: '00:00' } // Nota: La hora de cierre 00:00 es del día siguiente
};

// Define un tipo para las claves del objeto 'horarios' para resolver el error de tipado
type Day = keyof typeof horarios;

// Función para inicializar los trabajos de `node-schedule`
export const setupSchedule = () => {
    console.log('Configurando horarios de atención...');

    // Días de la semana en formato `node-schedule` (0 = domingo, 1 = lunes, ..., 6 = sábado)
    const days: Day[] = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

    // Comprobar el estado inicial al iniciar el servidor
    const now = new Date();
    const currentDay = days[now.getDay()];

    const openTimeParts = horarios[currentDay].open.split(':').map(Number);
    const closeTimeParts = horarios[currentDay].close.split(':').map(Number);
    
    const openHour = openTimeParts[0];
    const openMinute = openTimeParts[1];
    const closeHour = closeTimeParts[0];
    const closeMinute = closeTimeParts[1];

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isCurrentlyOpen = 
        (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
        (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) ||
        (currentDay === 'SA' && currentHour === 0 && currentMinute === 0);

    isStoreOpen = isCurrentlyOpen;
    console.log(`El negocio está actualmente ${isStoreOpen ? 'ABIERTO' : 'CERRADO'}.`);

    // Configurar los trabajos para abrir y cerrar la tienda
    days.forEach((day, index) => {
        const openTimeParts = horarios[day].open.split(':').map(Number);
        const closeTimeParts = horarios[day].close.split(':').map(Number);

        // Trabajo para abrir la tienda
        schedule.scheduleJob({ hour: openTimeParts[0], minute: openTimeParts[1], dayOfWeek: index }, () => {
            isStoreOpen = true;
            console.log(`El negocio está ABIERTO. (${day})`);
        });

        // Trabajo para cerrar la tienda
        schedule.scheduleJob({ hour: closeTimeParts[0], minute: closeTimeParts[1], dayOfWeek: index }, () => {
            isStoreOpen = false;
            console.log(`El negocio está CERRADO. (${day})`);
        });
    });
};