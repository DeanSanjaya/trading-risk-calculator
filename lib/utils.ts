import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatIDR = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
};

export const formatDecimal = (value: number, decimalPlaces: number = 2): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};
