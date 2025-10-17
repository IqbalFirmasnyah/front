
import { kFormatter } from "../utils/colors"

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-white/80 backdrop-blur px-3 py-2 text-sm shadow-md dark:bg-gray-900/70 dark:border-gray-800">
      {label && <div className="mb-1 font-medium">{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-gray-600 dark:text-gray-300">{p.name ?? p.dataKey}</span>
          <span className="ml-auto font-semibold text-gray-900 dark:text-gray-100">
            {kFormatter(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
