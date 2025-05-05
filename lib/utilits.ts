import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import stc from "string-to-color";

/**
 * Merge Tailwind classes conditionally and intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/**
 * Generate consistent hex color from a given string.
 */
export function stringToColor(str: string): string {
  return stc(str);
}
