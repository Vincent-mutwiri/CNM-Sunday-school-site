import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type DateValue = string | number | Date;

/**
 * Formats a date string into a readable format
 * @param date - The date to format (can be string, number, or Date object)
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export function formatDate(date: DateValue): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a time string into a 12-hour format with AM/PM
 * @param time - The time to format (can be string, number, or Date object)
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(time: DateValue): string {
  return new Date(time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
