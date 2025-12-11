/**
 * Utility functions for month-based calculations
 * Months: 1 (Jan) - 12 (Des)
 */

/**
 * Get current month (1-12)
 */
export function getCurrentMonth(): number {
  const now = new Date();
  return now.getMonth() + 1;
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get month for a specific date (1-12)
 */
export function getMonthForDate(date: Date): number {
  return date.getMonth() + 1;
}

/**
 * Get year for a specific date
 */
export function getYearForDate(date: Date): number {
  return date.getFullYear();
}

/**
 * Start date of a month (UTC)
 */
export function getMonthStartDate(month: number, year: number): Date {
  if (month < 1 || month > 12) throw new Error(`Invalid month: ${month}. Must be 1-12.`);
  const monthIndex = month - 1;
  return new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
}

/**
 * End date of a month (UTC)
 */
export function getMonthEndDate(month: number, year: number): Date {
  if (month < 1 || month > 12) throw new Error(`Invalid month: ${month}. Must be 1-12.`);
  const monthIndex = month - 1;
  const nextMonth = monthIndex + 1;
  const lastDay = new Date(Date.UTC(year, nextMonth, 0)).getDate();
  return new Date(Date.UTC(year, monthIndex, lastDay, 23, 59, 59, 999));
}

/**
 * Start date of next month (UTC)
 */
export function getNextMonthStartDate(): Date {
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  return getMonthStartDate(nextMonth, nextYear);
}

/**
 * Check if a date is within a month/year
 */
export function isDateInMonth(date: Date, month: number, year: number): boolean {
  return getMonthForDate(date) === month && getYearForDate(date) === year;
}

/**
 * Format date to Indonesian (e.g., "1 April 2024")
 */
export function formatDateIndonesian(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get month name (e.g., "Januari")
 */
export function getMonthName(month: number): string {
  if (month < 1 || month > 12) throw new Error(`Invalid month: ${month}. Must be 1-12.`);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1];
}

/**
 * Get period label for a month (e.g., "1 Januari - 31 Januari 2025")
 */
export function getMonthPeriod(month: number, year: number): string {
  if (month < 1 || month > 12) throw new Error(`Invalid month: ${month}. Must be 1-12.`);
  const monthName = getMonthName(month);
  const startDate = getMonthStartDate(month, year);
  const endDate = getMonthEndDate(month, year);
  return `${startDate.getDate()} ${monthName} - ${endDate.getDate()} ${monthName} ${year}`;
}

