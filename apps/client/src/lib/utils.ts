import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export date utilities
export { formatDate, formatTime, calculateAge } from './dateUtils';

/**
 * Format a date string to a more readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export function formatDisplayDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a time string to 12-hour format
 * @param timeString - Time string in 24-hour format (e.g., "14:30")
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatDisplayTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get the first letter of each word in a string
 * @param str - Input string
 * @returns First letters of each word (e.g., "John Doe" -> "JD")
 */
export function getInitials(str: string): string {
  return str
    .split(' ')
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');
}

/**
 * Truncate text with an ellipsis if it exceeds the max length
 * @param text - Input text
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Convert a string to title case
 * @param str - Input string
 * @returns String in title case (e.g., "hello world" -> "Hello World")
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Generate a unique ID
 * @returns A unique ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param value - The value to check
 * @returns True if the value is empty, false otherwise
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}
