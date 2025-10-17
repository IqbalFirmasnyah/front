// colors.ts
export const ZINC = {
    grid: "#E5E7EB", // gray-200
    gridDark: "#1F2937", // gray-800
    axis: "#9CA3AF",
  };
  
  export const PALETTE = {
    primary: "#7C3AED",   // violet-600
    primarySoft: "#A78BFA",
    success: "#10B981",   // emerald-500
    warning: "#F59E0B",   // amber-500
    info: "#06B6D4",      // cyan-500
    danger: "#EF4444",    // red-500
    neutral: "#64748B",   // slate-500
  };
  
  export function kFormatter(n: number) {
    if (n === null || n === undefined) return "0";
    if (Math.abs(n) < 1000) return `${n}`;
    if (Math.abs(n) < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
    if (Math.abs(n) < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
    return `${(n / 1_000_000_000).toFixed(1)}b`;
  }
  