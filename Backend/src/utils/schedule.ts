import schedule from 'node-schedule';

// Estado global del negocio
export let isStoreOpen = false;

// Horarios de atención
const horarios = {
    DO: { open: '20:00', close: '23:00' },
    LU: { open: '20:00', close: '23:00' },
    MA: { open: '20:00', close: '23:00' },
    MI: { open: '20:00', close: '23:00' },
    JU: { open: '20:00', close: '23:00' },
    VI: { open: '20:00', close: '23:30' },
    SA: { open: '20:00', close: '23:59' } // sábado cierra a las 23:59
};

type Day = keyof typeof horarios;

export const setupSchedule = () => {
    console.log('Configurando horarios de atención...');

    const days: Day[] = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

    // --- 1. Calcular el estado inicial al iniciar ---
    const now = new Date();
    const currentDay = days[now.getDay()];

    const openParts = horarios[currentDay].open.split(':').map(Number);
    const closeParts = horarios[currentDay].close.split(':').map(Number);

    const openHour = openParts[0];
    const openMinute = openParts[1];
    const closeHour = closeParts[0];
    const closeMinute = closeParts[1];

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const estaDentroHorario =
        (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
        (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute));

    isStoreOpen = estaDentroHorario;
    console.log(`El negocio está actualmente ${isStoreOpen ? 'ABIERTO' : 'CERRADO'} (inicialización).`);

    // --- 2. Programar aperturas y cierres ---
    days.forEach((day, index) => {
        const openTimeParts = horarios[day].open.split(':').map(Number);
        const closeTimeParts = horarios[day].close.split(':').map(Number);

        // Apertura
        schedule.scheduleJob({ hour: openTimeParts[0], minute: openTimeParts[1], dayOfWeek: index }, () => {
            isStoreOpen = true;
            console.log(`El negocio está ABIERTO. (${day})`);
        });

        // Cierre
        schedule.scheduleJob({ hour: closeTimeParts[0], minute: closeTimeParts[1], dayOfWeek: index }, () => {
            isStoreOpen = false;
            console.log(`El negocio está CERRADO. (${day})`);
        });
    });
};
