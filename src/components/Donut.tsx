// components/Donut.tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { PALETTE } from "src/lib/colors.ts";


const RING = [
  PALETTE.success, PALETTE.warning, PALETTE.danger,
  PALETTE.primary, PALETTE.info, PALETTE.neutral,
];

export function Donut({
  data, nameKey = "name", valueKey = "value", title,
}: { data: any[]; nameKey?: string; valueKey?: string; title?: string; }) {
  const total = data.reduce((a, b) => a + (b[valueKey] ?? 0), 0);

  return (
    <div className="relative w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            strokeWidth={2}
            animationDuration={700}
          >
            {data.map((_: any, i: number) => (
              <Cell key={i} fill={RING[i % RING.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* center label */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {title && (
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {title}
            </div>
          )}
          <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {total}
          </div>
        </div>
      </div>
    </div>
  );
}
