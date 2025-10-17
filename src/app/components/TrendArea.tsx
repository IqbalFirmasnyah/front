// components/TrendArea.tsx
"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { PALETTE, ZINC, kFormatter } from "../utils/colors";

export function TrendArea({
  data,
  dataKey = "value",
  xKey = "month",
  name = "Total",
  stroke = PALETTE.primary,
  gradId = "gradArea",
}: {
  data: any[]; dataKey?: string; xKey?: string; name?: string; stroke?: string; gradId?: string;
}) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.45} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" strokeOpacity={0.4}
            stroke="url(#gridStroke)" />
          {/* optional: fallback grid color */}
          <CartesianGrid strokeDasharray="3 3" stroke="#0000" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tickFormatter={kFormatter} tick={{ fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#${gradId})`}
            animationDuration={700}
            dot={{ r: 3, strokeWidth: 1, stroke: "white" }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
