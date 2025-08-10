import schedule from 'node-schedule';

// Estado global del negocio
export let isStoreOpen = false;

// Horarios de atención (sábado hasta las 23:59)
const horarios = {
  DO: { open: '20:00', close: '23:00' },
  LU: { open: '20:00', close: '23:00' },
  MA: { open: '20:00', close: '23:00' },
  MI: { open: '20:00', close: '23:00' },
  JU: { open: '20:00', close: '23:00' },
  VI: { open: '20:00', close: '23:30' },
  SA: { open: '20:00', close: '23:59' }
};

type Day = keyof typeof horarios;
const days: Day[] = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

// Función auxiliar para dividir horas y minutos
function parseTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  return { hour: h, minute: m };
}

export const setupSchedule = () => {
  console.log('Configurando horarios de atención...');

  // Estado inicial al iniciar el servidor
  const now = new Date();
  const currentDay = days[now.getDay()];
  const { hour: openHour, minute: openMinute } = parseTime(horarios[currentDay].open);
  const { hour: closeHour, minute: closeMinute } = parseTime(horarios[currentDay].close);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  isStoreOpen =
    (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
    (currentHour < closeHour || (currentHour === closeHour && currentMinute <= closeMinute));

  console.log(`El negocio está actualmente ${isStoreOpen ? 'ABIERTO' : 'CERRADO'}.`);

  // Programar apertura y cierre cada día
  days.forEach((day, index) => {
    const { hour: openH, minute: openM } = parseTime(horarios[day].open);
    const { hour: closeH, minute: closeM } = parseTime(horarios[day].close);

    // Abrir
    schedule.scheduleJob({ hour: openH, minute: openM, dayOfWeek: index }, () => {
      isStoreOpen = true;
      console.log(`El negocio está ABIERTO. (${day})`);
    });

    // Cerrar
    schedule.scheduleJob({ hour: closeH, minute: closeM, dayOfWeek: index }, () => {
      isStoreOpen = false;
      console.log(`El negocio está CERRADO. (${day})`);
    });
  });
};
