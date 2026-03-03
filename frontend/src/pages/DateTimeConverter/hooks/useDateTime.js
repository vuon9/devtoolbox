import { useState, useEffect } from 'react';
import storage from '../../../utils/storage';
import { dateTimeAPI } from '../api/dateTimeAPI';
import { parseMathExpression } from '../datetimeHelpers';
import { STORAGE_KEY } from '../constants';

/**
 * Custom hook for DateTime Converter logic
 */
export function useDateTime() {
  const [input, setInput] = useState('');
  const [timezone, setTimezone] = useState('local');
  const [parsedDate, setParsedDate] = useState(null);
  const [error, setError] = useState(null);
  const [customTimezones, setCustomTimezones] = useState([]);
  const [selectedNewTimezone, setSelectedNewTimezone] = useState(null);
  const [allTimezones, setAllTimezones] = useState([]);

  // Load custom timezones from storage and fetch all timezones from backend
  useEffect(() => {
    const saved = storage.getArray(STORAGE_KEY);
    setCustomTimezones(saved);

    // Fetch timezones from backend
    console.log('Fetching timezones from backend...');
    console.log('Window.go available:', typeof window !== 'undefined' && !!window.go);

    dateTimeAPI
      .GetAvailableTimezones()
      .then((response) => {
        console.log('Timezones response:', response);
        if (response.timezones && response.timezones.length > 0) {
          // Transform backend format to frontend format
          const tzList = response.timezones.map((tz) => ({
            id: tz.timezone,
            label: tz.label || tz.timezone,
          }));

          // Add 'local' as the first option
          const allTimezonesList = [{ id: 'local', label: 'Local Time' }, ...tzList];

          console.log(`Loaded ${allTimezonesList.length} timezones from backend`);
          setAllTimezones(allTimezonesList);
        } else {
          console.warn('No timezones returned from backend');
          // Only provide local as fallback
          setAllTimezones([{ id: 'local', label: 'Local Time' }]);
        }
      })
      .catch((err) => {
        console.error('Failed to load timezones:', err);
        console.error('Error details:', err.message || err);
        setAllTimezones([{ id: 'local', label: 'Local Time' }]);
      });
  }, []);

  // Parse input
  useEffect(() => {
    const date = parseInput(input);
    if (date && !isNaN(date.getTime())) {
      setParsedDate(date);
      setError(null);
    } else if (input.trim()) {
      setError('Invalid date or timestamp');
      setParsedDate(null);
    } else {
      setError(null);
      setParsedDate(null);
    }
  }, [input]);

  const addTimezone = () => {
    if (selectedNewTimezone && !customTimezones.includes(selectedNewTimezone.id)) {
      const newTimezones = [...customTimezones, selectedNewTimezone.id];
      setCustomTimezones(newTimezones);
      storage.setArray(STORAGE_KEY, newTimezones);
      setSelectedNewTimezone(null);
    }
  };

  const removeTimezone = (tzId) => {
    const newTimezones = customTimezones.filter((id) => id !== tzId);
    setCustomTimezones(newTimezones);
    storage.setArray(STORAGE_KEY, newTimezones);
  };

  // Get available timezones for dropdown (exclude already added only)
  const availableTimezones = allTimezones.filter((tz) => !customTimezones.includes(tz.id));

  // Get timezone label by ID
  const getTimezoneLabel = (tzId) => {
    if (tzId === 'local') return 'Local Time';
    const tz = allTimezones.find((t) => t.id === tzId);
    return tz?.label || tzId;
  };

  return {
    input,
    setInput,
    timezone,
    setTimezone,
    parsedDate,
    error,
    customTimezones,
    selectedNewTimezone,
    setSelectedNewTimezone,
    allTimezones,
    availableTimezones,
    addTimezone,
    removeTimezone,
    getTimezoneLabel,
  };
}

// Parse input to Date object (handles math expressions)
function parseInput(input) {
  if (!input || !input.trim()) return null;

  const trimmed = input.trim();

  // Try math expression first
  const mathResult = parseMathExpression(trimmed);
  if (mathResult !== null) {
    // Treat as timestamp (seconds) and convert to date
    return new Date(mathResult * 1000);
  }

  // Try as timestamp (numeric)
  if (/^\d+$/.test(trimmed)) {
    const ts = parseInt(trimmed, 10);
    const len = trimmed.length;

    if (len === 10) {
      return new Date(ts * 1000);
    } else if (len === 13) {
      return new Date(ts);
    } else if (len === 16) {
      return new Date(ts / 1000);
    } else if (len === 19) {
      return new Date(ts / 1000000);
    } else if (ts > 1000000000) {
      return new Date(ts * 1000);
    }
  }

  // Try as date string
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}
