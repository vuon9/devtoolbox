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

// Helper to get date object shifted to target timezone
function getShiftedDate(date, timezone) {
  let year, month, day, hour, minute, second;

  if (timezone === 'local') {
    year = date.getFullYear();
    month = date.getMonth();
    day = date.getDate();
    hour = date.getHours();
    minute = date.getMinutes();
    second = date.getSeconds();
  } else {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      }).formatToParts(date);
      const p = {};
      parts.forEach(({ type, value }) => (p[type] = value));
      year = parseInt(p.year, 10);
      month = parseInt(p.month, 10) - 1;
      day = parseInt(p.day, 10);
      hour = parseInt(p.hour, 10) % 24;
      minute = parseInt(p.minute, 10);
      second = parseInt(p.second, 10);
    } catch (e) {
      return date;
    }
  }

  return new Date(Date.UTC(year, month, day, hour, minute, second, date.getMilliseconds()));
}

/**
 * Format date according to format
 * @param {Date} date - Date to format
 * @param {string} formatId - Format identifier (iso, rfc2822, sql, us, eu, compact)
 * @param {string} timezone - Timezone (local, UTC, or IANA timezone)
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatId, timezone) {
  if (!date || isNaN(date.getTime())) return '';

  const d = getShiftedDate(date, timezone);
  const pad = (n) => n.toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());

  switch (formatId) {
    case 'iso':
      return d.toISOString();
    case 'rfc2822':
      return d.toUTCString();
    case 'sql':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case 'us':
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    case 'eu':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case 'compact':
      return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    default:
      return d.toISOString();
  }
}

/**
 * Calculate relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date} date - Date to calculate relative time for
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date || isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff > 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let result = '';
  if (days > 0) result += `${days} day${days > 1 ? 's' : ''} `;
  else if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `;
  else if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''} `;
  else result += `${seconds} second${seconds > 1 ? 's' : ''} `;

  return isFuture ? `in ${result}` : `${result}ago`;
}
