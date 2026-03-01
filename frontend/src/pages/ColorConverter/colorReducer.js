// Initial state
export const initialState = {
  hex: '#3DD6F5',
  rgb: { r: 61, g: 214, b: 245, a: 1 },
  hsl: { h: 191, s: 90, l: 60 },
  hsv: { h: 191, s: 75, v: 96 },
  cmyk: { c: 75, m: 13, y: 0, k: 4 },
  history: [],
  selectedTab: 0,
};

// Reducer for state management
export function colorReducer(state, action) {
  switch (action.type) {
    case 'SET_COLOR':
      return {
        ...state,
        ...action.payload,
      };
    case 'ADD_TO_HISTORY':
      const newEntry = action.payload;
      if (state.history.some((h) => h.hex === newEntry.hex)) {
        return state;
      }
      return {
        ...state,
        history: [newEntry, ...state.history].slice(0, 10),
      };
    case 'SET_SELECTED_TAB':
      return { ...state, selectedTab: action.payload };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'LOAD_FROM_HISTORY':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Action creators
export const actions = {
  setColor: (payload) => ({ type: 'SET_COLOR', payload }),
  addToHistory: (payload) => ({ type: 'ADD_TO_HISTORY', payload }),
  setSelectedTab: (payload) => ({ type: 'SET_SELECTED_TAB', payload }),
  clearHistory: () => ({ type: 'CLEAR_HISTORY' }),
  loadFromHistory: (payload) => ({ type: 'LOAD_FROM_HISTORY', payload }),
};
