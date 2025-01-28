import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateSparklineData = (
  length: number,
  min: number,
  max: number
): number[] => {
  const result: number[] = [];
  let currentValue = min + Math.random() * (max - min);

  for (let i = 0; i < length; i++) {
    // Add some random walk to make the data look more realistic
    const change = (Math.random() - 0.5) * (max - min) * 0.05;
    currentValue = Math.max(min, Math.min(max, currentValue + change));
    result.push(currentValue);
  }

  return result;
};
