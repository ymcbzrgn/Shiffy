// Test week calculation
const today = new Date('2025-10-26'); // 26 Ekim 2025

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeeksToLoad(weeksBack: number, weeksForward: number): string[] {
  const currentWeekStart = getWeekStart(today);
  const weeks: string[] = [];

  for (let i = -weeksBack; i <= weeksForward; i++) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + i * 7);
    weeks.push(formatDateISO(weekStart));
  }

  return weeks;
}

console.log('Today:', formatDateISO(today));
console.log('Current Week Start:', formatDateISO(getWeekStart(today)));
console.log('\nWeeks to Load (4 past + current + 3 future):');
const weeks = getWeeksToLoad(4, 3);
weeks.forEach((week, idx) => {
  console.log(`  ${idx + 1}. ${week}`);
});

console.log('\n✅ Should include 2025-10-27');
console.log('Does it?', weeks.includes('2025-10-27') ? '✅ YES' : '❌ NO');
