export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  category: 'dieta' | 'ejercicio' | 'sueño' | 'mental' | 'tecnologia';
  points: number;
}

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'wc-hidratacion',
    title: 'Desafío de Súper Hidratación',
    description: 'Toma al menos 2 litros de agua todos los días y regístralo en tu agenda.',
    category: 'dieta',
    points: 100
  },
  {
    id: 'wc-pantallas',
    title: 'Noches sin Pantallas',
    description: 'Apaga todas tus pantallas (móvil, tablet, TV) 1 hora antes de dormir para mejorar tu sueño.',
    category: 'tecnologia',
    points: 120
  },
  {
    id: 'wc-movimiento',
    title: 'Movimiento Diario Activo',
    description: 'Realiza al menos 20 minutos de ejercicio o camina a paso ligero diariamente.',
    category: 'ejercicio',
    points: 100
  },
  {
    id: 'wc-lectura',
    title: 'Biblioteca de Sabiduría',
    description: 'Dedica 15 minutos diarios a leer capítulos de tu biblioteca en la app.',
    category: 'mental',
    points: 100
  }
];

export function getChallengeForCurrentWeek(): WeeklyChallenge {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  // Determinar la semana del año
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  
  const index = weekNumber % WEEKLY_CHALLENGES.length;
  return WEEKLY_CHALLENGES[index];
}
