// components/RoundedBar.tsx
"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { PALETTE, kFormatter } from "../colors";

export function RoundedBar({
  data, xKey = "month", yKey = "value", name = "Refunds",
}: { data: any[]; xKey?: string; yKey?: string; name?: string; }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 6" strokeOpacity={0.4} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tickFormatter={kFormatter} tick={{ fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey={yKey}
            name={name}
            fill={PALETTE.info}
            radius={[10, 10, 0, 0]}
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
