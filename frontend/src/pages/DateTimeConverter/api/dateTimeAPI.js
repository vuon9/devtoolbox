import * as wailsDateTime from '../../../generated/wails/dateTimeService';
import * as httpDateTime from '../../../generated/http/dateTimeService';

/**
 * Universal API client that works in both Wails (desktop) and Web (browser) environments
 */
export const dateTimeAPI = {
  async GetAvailableTimezones() {
    // Check if we're in Wails environment (desktop app)
    const isWails = typeof window !== 'undefined' && 
                    window.go && 
                    typeof window.go.main !== 'undefined';
    
    console.log('Environment check - isWails:', isWails);
    console.log('Window.go:', typeof window !== 'undefined' ? window.go : 'undefined');
    
    if (isWails) {
      try {
        console.log('Trying Wails API...');
        const result = await wailsDateTime.GetAvailableTimezones();
        console.log('Wails API success:', result);
        return result;
      } catch (e) {
        console.error('Wails API failed:', e);
        console.log('Falling back to HTTP API...');
      }
    }
    
    // Fallback to HTTP API (web app)
    try {
      console.log('Trying HTTP API...');
      const result = await httpDateTime.GetAvailableTimezones();
      console.log('HTTP API success:', result);
      return result;
    } catch (e) {
      console.error('HTTP API failed:', e);
      throw e;
    }
  }
};

// Expose for debugging
if (typeof window !== 'undefined') {
  window.debugDateTimeAPI = dateTimeAPI;
}
