// Number Converter state management

import { INPUT_MODES, INITIAL_STATE } from './constants';

/**
 * Action types
 */
export const ACTION_TYPES = {
  SET_VALUE: 'SET_VALUE',
  TOGGLE_BIT: 'TOGGLE_BIT',
  SET_INPUT_MODE: 'SET_INPUT_MODE',
  SET_CUSTOM_BASE: 'SET_CUSTOM_BASE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  APPLY_BITWISE_OP: 'APPLY_BITWISE_OP',
  CLEAR_ALL: 'CLEAR_ALL',
};

/**
 * Reducer function for Number Converter state
 * @param {object} state - Current state
 * @param {object} action - Action to apply
 * @returns {object} New state
 */
export function numberConverterReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_VALUE:
      return {
        ...state,
        value: action.payload.value,
        errors: {}, // Clear all errors on successful value set
      };

    case ACTION_TYPES.TOGGLE_BIT: {
      const { position } = action.payload;
      // XOR with bit mask to toggle
      const newValue = (state.value ^ (1 << position)) >>> 0;
      return {
        ...state,
        value: newValue,
      };
    }

    case ACTION_TYPES.SET_INPUT_MODE:
      return {
        ...state,
        inputMode: action.payload.mode,
      };

    case ACTION_TYPES.SET_CUSTOM_BASE:
      return {
        ...state,
        customBase: action.payload.base,
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.error,
        },
      };

    case ACTION_TYPES.CLEAR_ERROR: {
      const newErrors = { ...state.errors };
      delete newErrors[action.payload.field];
      return {
        ...state,
        errors: newErrors,
      };
    }

    case ACTION_TYPES.APPLY_BITWISE_OP: {
      const { operation } = action.payload;
      let newValue = state.value;

      switch (operation) {
        case 'shiftLeft':
          newValue = (state.value << 1) >>> 0;
          break;
        case 'shiftRight':
          newValue = state.value >>> 1;
          break;
        case 'not':
          newValue = ~state.value >>> 0;
          break;
        case 'maskByte':
          newValue = (state.value & 0xff) >>> 0;
          break;
        case 'setLSB':
          newValue = (state.value | 1) >>> 0;
          break;
        default:
          break;
      }

      return {
        ...state,
        value: newValue,
      };
    }

    case ACTION_TYPES.CLEAR_ALL:
      return {
        ...INITIAL_STATE,
      };

    default:
      return state;
  }
}

/**
 * Action creator: Set the current value
 * @param {number} value - New value
 * @returns {object} Action object
 */
export function setValue(value) {
  return {
    type: ACTION_TYPES.SET_VALUE,
    payload: { value },
  };
}

/**
 * Action creator: Toggle a bit at specific position
 * @param {number} position - Bit position (0-31)
 * @returns {object} Action object
 */
export function toggleBit(position) {
  return {
    type: ACTION_TYPES.TOGGLE_BIT,
    payload: { position },
  };
}

/**
 * Action creator: Set the current input mode
 * @param {string} mode - Input mode ('bin', 'oct', 'dec', 'hex', 'custom')
 * @returns {object} Action object
 */
export function setInputMode(mode) {
  return {
    type: ACTION_TYPES.SET_INPUT_MODE,
    payload: { mode },
  };
}

/**
 * Action creator: Set custom base
 * @param {number} base - Custom base (2-36)
 * @returns {object} Action object
 */
export function setCustomBase(base) {
  return {
    type: ACTION_TYPES.SET_CUSTOM_BASE,
    payload: { base },
  };
}

/**
 * Action creator: Set an error for a specific field
 * @param {string} field - Field name (e.g., 'hex', 'binary')
 * @param {string} error - Error message
 * @returns {object} Action object
 */
export function setError(field, error) {
  return {
    type: ACTION_TYPES.SET_ERROR,
    payload: { field, error },
  };
}

/**
 * Action creator: Clear error for a specific field
 * @param {string} field - Field name
 * @returns {object} Action object
 */
export function clearError(field) {
  return {
    type: ACTION_TYPES.CLEAR_ERROR,
    payload: { field },
  };
}

/**
 * Action creator: Apply a bitwise operation
 * @param {string} operation - Operation name ('shiftLeft', 'shiftRight', 'not', 'maskByte', 'setLSB')
 * @returns {object} Action object
 */
export function applyBitwiseOp(operation) {
  return {
    type: ACTION_TYPES.APPLY_BITWISE_OP,
    payload: { operation },
  };
}

/**
 * Action creator: Clear all state (reset)
 * @returns {object} Action object
 */
export function clearAll() {
  return {
    type: ACTION_TYPES.CLEAR_ALL,
  };
}

/**
 * Hook to handle input from conversion fields
 * Parses input and dispatches appropriate actions
 * @param {function} dispatch - Dispatch function
 * @param {string} input - Raw input string
 * @param {number} base - Base of the input
 * @param {string} field - Field identifier
 * @param {function} parseFn - Parse function for this base
 */
export function handleConversionInput(dispatch, input, base, field, parseFn) {
  const result = parseFn(input);

  if (result.error) {
    // Set error but keep current value
    dispatch(setError(field, result.error));
  } else if (result.value !== null) {
    // Valid value - update and clear error
    dispatch(setValue(result.value));
    dispatch(clearError(field));
  } else {
    // Empty input - just clear error
    dispatch(clearError(field));
  }
}
