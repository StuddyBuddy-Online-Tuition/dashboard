import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (st: string) =>
  ({
    active: "bg-secondary/20 text-secondary-foreground border-secondary/30",
    pending: "bg-accent/20 text-accent-foreground border-accent/30",
    trial: "bg-blue-100 text-blue-800 border-blue-300",
    inactive: "bg-destructive/20 text-destructive-foreground border-destructive/30",
  })[st] || "bg-muted text-muted-foreground"

export const getGradeColor = (g: string) =>
  g.startsWith("S")
    ? "bg-green-100 text-green-800 border-green-300"
    : g.startsWith("F")
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : g === "CP"
        ? "bg-purple-100 text-purple-800 border-purple-300"
        : "bg-gray-100 text-gray-800 border-gray-300"

export const getModeColor = (m: string) =>
  m === "1 to 1" ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-gray-100 text-gray-800 border-gray-300"

export const getDlpColor = (d: string) =>
  d === "DLP" ? "bg-purple-100 text-purple-800 border-purple-300" : "bg-gray-100 text-gray-800 border-gray-300"

export const formatDate = (ds: string) =>
  new Date(ds).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
