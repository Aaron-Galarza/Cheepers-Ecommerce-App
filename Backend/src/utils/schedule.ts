import schedule from 'node-schedule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configuración de dayjs para manejar timezones
dayjs.extend(utc);
dayjs.extend(timezone);

export let isStoreOpen = false;

const horarios = {
    DO: { open: '20:00', close: '23:00' },
    LU: { open: '20:00', close: '23:00' },
    MA: { open: '20:00', close: '23:00' },
    MI: { open: '00:00', close: '23:00' },
    JU: { open: '20:00', close: '23:00' },
    VI: { open: '20:00', close: '23:30' },
    SA: { open: '20:00', close: '23:59' }
};

type Day = keyof typeof horarios;

export const setupSchedule = () => {
    console.log('Configurando horarios de atención...');

    const days: Day[] = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

    // Obtener hora actual en Buenos Aires
    const now = dayjs().tz("America/Argentina/Buenos_Aires");
    const currentDay = days[now.day()];

    const openTimeParts = horarios[currentDay].open.split(':').map(Number);
    const closeTimeParts = horarios[currentDay].close.split(':').map(Number);

    const openHour = openTimeParts[0];
    const openMinute = openTimeParts[1];
    const closeHour = closeTimeParts[0];
    const closeMinute = closeTimeParts[1];

    const currentHour = now.hour();
    const currentMinute = now.minute();

    const isCurrentlyOpen =
        (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
        (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute));

    isStoreOpen = isCurrentlyOpen;
    console.log(`El negocio está actualmente ${isStoreOpen ? 'ABIERTO' : 'CERRADO'} (hora Argentina).`);

    days.forEach((day, index) => {
        const openTimeParts = horarios[day].open.split(':').map(Number);
        const closeTimeParts = horarios[day].close.split(':').map(Number);

        schedule.scheduleJob({ hour: openTimeParts[0], minute: openTimeParts[1], dayOfWeek: index, tz: 'America/Argentina/Buenos_Aires' }, () => {
            isStoreOpen = true;
            console.log(`El negocio está ABIERTO. (${day})`);
        });

        schedule.scheduleJob({ hour: closeTimeParts[0], minute: closeTimeParts[1], dayOfWeek: index, tz: 'America/Argentina/Buenos_Aires' }, () => {
            isStoreOpen = false;
            console.log(`El negocio está CERRADO. (${day})`);
        });
    });
};
