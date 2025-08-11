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

export const getPaidStatus = (last: string) => {
  const today = new Date()
  const paid = new Date(last)
  return today.getMonth() === paid.getMonth() && today.getFullYear() === paid.getFullYear() ? "Paid" : "No"
}

export const getPaidColor = (st: string) =>
  st === "Paid" ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"

// Subject helpers shared across timetable views
const BASE_SUBJECT_ABBREVIATIONS: Record<string, string> = {
  Biology: "BIO",
  Fizik: "FIZ",
  Kimia: "KIM",
  "Add math": "AM",
  Matematik: "MM",
  "Bahasa Malaysia": "BM",
  "Bahasa Inggeris": "BI",
  Sejarah: "SEJ",
  Geografi: "GEO",
  Sains: "SC",
  "Prinsip Akaun": "PA",
}

const SUBJECT_COLORS: Record<string, string> = {
  BIO: "bg-green-100 text-green-900 border-green-300",
  FIZ: "bg-yellow-100 text-yellow-900 border-yellow-300",
  KIM: "bg-purple-100 text-purple-900 border-purple-300",
  AM: "bg-red-100 text-red-900 border-red-300",
  MM: "bg-pink-100 text-pink-900 border-pink-300",
  BM: "bg-amber-100 text-amber-900 border-amber-300",
  BI: "bg-sky-100 text-sky-900 border-sky-300",
  SEJ: "bg-orange-100 text-orange-900 border-orange-300",
  GEO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  SC: "bg-blue-100 text-blue-900 border-blue-300",
}

export function getAbbrev(subjectName: string): string {
  const isDlp = /\bDLP\b/i.test(subjectName)
  const baseName = subjectName.replace(/\s*DLP\b/i, "").trim()
  const override = BASE_SUBJECT_ABBREVIATIONS[baseName]
  const baseAbbrev =
    override ??
    (baseName.includes(" ")
      ? baseName
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => w[0]!.toUpperCase())
          .join("")
      : baseName.slice(0, 3).toUpperCase())
  return isDlp ? `${baseAbbrev}D` : baseAbbrev
}

export function getSubjectColor(abbrev: string): string {
  if (SUBJECT_COLORS[abbrev]) return SUBJECT_COLORS[abbrev]
  if (/D$/.test(abbrev)) {
    const base = abbrev.replace(/D$/, "")
    if (SUBJECT_COLORS[base]) return SUBJECT_COLORS[base]
  }
  return "bg-gray-100 text-gray-900 border-gray-300"
}
