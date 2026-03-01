/**
 * Datetime utilities for calculations and parsing
 */

/**
 * Get the day of year for a given date (1-366)
 * @param {Date} date - Date to get day of year for
 * @returns {number} Day of year (1-366), or null if invalid
 */
export const getDayOfYear = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date - startOfYear;
  const oneDay = 24 * 60 * 60 * 1000;
  const dayOfYear = Math.floor(diff / oneDay) + 1;

  return dayOfYear;
};

/**
 * Get the ISO week number for a given date (1-53)
 * @param {Date} date - Date to get week number for
 * @returns {number} ISO week number (1-53), or null if invalid
 */
export const getWeekOfYear = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const dayOfWeek = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayOfWeek + 3);

  const firstThursday = new Date(d.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7));

  const diff = d - firstThursday;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const weekNumber = Math.floor(diff / oneWeek) + 1;

  return weekNumber;
};

/**
 * Check if a year is a leap year
 * @param {number} year - Year to check
 * @returns {boolean} True if leap year, false otherwise
 */
export const isLeapYear = (year) => {
  if (typeof year !== 'number' || !Number.isFinite(year)) {
    return false;
  }

  if (year % 4 !== 0) {
    return false;
  }

  if (year % 100 !== 0) {
    return true;
  }

  return year % 400 === 0;
};

/**
 * Parse a math expression and return the calculated result
 * Supports: +, -, *, / operators with format: number operator number
 * @param {string} input - Math expression string
 * @returns {number|null} Calculated result or null if not a valid expression
 */
export const parseMathExpression = (input) => {
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) {
    return null;
  }

  const [, num1Str, operator, num2Str] = match;
  const num1 = parseFloat(num1Str);
  const num2 = parseFloat(num2Str);

  if (!Number.isFinite(num1) || !Number.isFinite(num2)) {
    return null;
  }

  switch (operator) {
    case '+':
      return num1 + num2;
    case '-':
      return num1 - num2;
    case '*':
      return num1 * num2;
    case '/':
      if (num2 === 0) {
        return null;
      }
      return num1 / num2;
    default:
      return null;
  }
};
