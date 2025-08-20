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
