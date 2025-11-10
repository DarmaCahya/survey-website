/**
 * Utility functions for quarter calculations
 * Quarters are defined as:
 * Q1: Jan 1 00:00 → Apr 1 00:00 (until Mar 31 23:59:59.999)
 * Q2: Apr 1 00:00 → Jul 1 00:00 (until Jun 30 23:59:59.999)
 * Q3: Jul 1 00:00 → Oct 1 00:00 (until Sep 30 23:59:59.999)
 * Q4: Oct 1 00:00 → Jan 1 (next year) 00:00 (until Dec 31 23:59:59.999)
 */

/**
 * Get the current quarter (1-4) based on the current date
 */
export function getCurrentQuarter(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
  
  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  return 4; // month >= 10 && month <= 12
}

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get the quarter for a specific date
 */
export function getQuarterForDate(date: Date): number {
  const month = date.getMonth() + 1;
  
  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  return 4;
}

/**
 * Get the year for a specific date
 */
export function getYearForDate(date: Date): number {
  return date.getFullYear();
}

/**
 * Get the start date of a quarter
 * @param quarter Quarter number (1-4)
 * @param year Year
 * @returns Date object representing the start of the quarter (00:00:00.000)
 */
export function getQuarterStartDate(quarter: number, year: number): Date {
  let month: number;
  
  switch (quarter) {
    case 1:
      month = 0; // January (0-indexed)
      break;
    case 2:
      month = 3; // April
      break;
    case 3:
      month = 6; // July
      break;
    case 4:
      month = 9; // October
      break;
    default:
      throw new Error(`Invalid quarter: ${quarter}. Must be 1-4.`);
  }
  
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

/**
 * Get the end date of a quarter
 * @param quarter Quarter number (1-4)
 * @param year Year
 * @returns Date object representing the end of the quarter (23:59:59.999)
 */
export function getQuarterEndDate(quarter: number, year: number): Date {
  let month: number;
  let day: number;
  
  switch (quarter) {
    case 1:
      month = 2; // March (0-indexed)
      day = 31;
      break;
    case 2:
      month = 5; // June
      day = 30;
      break;
    case 3:
      month = 8; // September
      day = 30;
      break;
    case 4:
      month = 11; // December
      day = 31;
      break;
    default:
      throw new Error(`Invalid quarter: ${quarter}. Must be 1-4.`);
  }
  
  return new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
}

/**
 * Get the start date of the next quarter
 * @returns Date object representing the start of the next quarter
 */
export function getNextQuarterStartDate(): Date {
  const currentQuarter = getCurrentQuarter();
  const currentYear = getCurrentYear();
  
  let nextQuarter: number;
  let nextYear: number;
  
  if (currentQuarter === 4) {
    nextQuarter = 1;
    nextYear = currentYear + 1;
  } else {
    nextQuarter = currentQuarter + 1;
    nextYear = currentYear;
  }
  
  return getQuarterStartDate(nextQuarter, nextYear);
}

/**
 * Check if a date falls within a specific quarter
 * @param date Date to check
 * @param quarter Quarter number (1-4)
 * @param year Year
 * @returns true if the date is within the quarter, false otherwise
 */
export function isDateInQuarter(date: Date, quarter: number, year: number): boolean {
  const dateQuarter = getQuarterForDate(date);
  const dateYear = getYearForDate(date);
  
  return dateQuarter === quarter && dateYear === year;
}

/**
 * Format date to Indonesian format for display
 * @param date Date to format
 * @returns Formatted date string in Indonesian format (e.g., "1 April 2024")
 */
export function formatDateIndonesian(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Get quarter name for display
 * @param quarter Quarter number (1-4)
 * @returns Quarter name (e.g., "Q1")
 */
export function getQuarterName(quarter: number): string {
  return `Q${quarter}`;
}

