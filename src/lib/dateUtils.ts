/**
 * Utility functions for consistent date formatting across the application
 */

/**
 * Formats date to dd/mm/yyyy format
 * @param dateInput - Date object, ISO string, or date string
 * @returns formatted date string in dd/mm/yyyy format or 'N/A' if invalid
 */
export function formatDateShort(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return 'N/A';
  
  let date: Date;
  try {
    date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'N/A';
  } catch {
    return 'N/A';
  }
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
}

/**
 * Formats date to dd MMM yyyy format (e.g., 03 Apr 2025)
 * @param dateInput - Date object, ISO string, or date string
 * @returns formatted date string in dd MMM yyyy format or 'N/A' if invalid
 */
export function formatDateMedium(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return 'N/A';
  
  let date: Date;
  try {
    date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'N/A';
  } catch {
    return 'N/A';
  }
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formats date and time to dd MMM yyyy at HH:MM AM/PM format
 * @param dateInput - Date object, ISO string, or date string
 * @returns formatted datetime string or 'N/A' if invalid
 */
export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return 'N/A';
  
  let date: Date;
  try {
    date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'N/A';
  } catch {
    return 'N/A';
  }
  
  const dateStr = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const timeStr = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return `${dateStr} at ${timeStr}`;
}

/**
 * Parses various date formats and converts to dd/mm/yyyy
 * Handles formats like: 25.07.2025, 23 JANUARY 2024, 2024-01-23, etc.
 * @param dateInput - Date string in any format
 * @returns formatted date string in dd/mm/yyyy format or 'N/A' if invalid
 */
export function parseAndFormatDate(dateInput: string | null | undefined): string {
  if (!dateInput || typeof dateInput !== 'string') return 'N/A';
  
  const trimmed = dateInput.trim();
  if (!trimmed) return 'N/A';
  
  try {
    // Handle dot-separated dates (25.07.2025)
    if (trimmed.includes('.')) {
      const parts = trimmed.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      }
    }
    
    // Handle space-separated dates with month names (23 JANUARY 2024)
    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    
    const upperInput = trimmed.toUpperCase();
    for (const monthName of monthNames) {
      if (upperInput.includes(monthName)) {
        const parts = upperInput.split(/\s+/);
        const monthIndex = monthNames.indexOf(monthName);
        const actualMonthIndex = monthIndex >= 12 ? monthIndex - 12 : monthIndex;
        
        // Find day and year in the parts
        let day = '', year = '';
        for (const part of parts) {
          if (part === monthName) continue;
          if (/^\d{1,2}$/.test(part) && !day) {
            day = part;
          } else if (/^\d{4}$/.test(part) && !year) {
            year = part;
          }
        }
        
        if (day && year) {
          const date = new Date(parseInt(year), actualMonthIndex, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
        }
        break;
      }
    }
    
    // Fallback to native Date parsing for other formats
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    return 'N/A';
  } catch {
    return 'N/A';
  }
}

/**
 * Formats timestamp for audit trail display
 * @param timestamp - ISO timestamp string
 * @returns object with separate date and time strings
 */
export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }),
    time: date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }),
  };
}
