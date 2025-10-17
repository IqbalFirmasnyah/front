"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { CustomComponents } from "react-day-picker"
import { enUS } from "date-fns/locale" // gunakan enUS agar label Su Mo Tu We ... seperti contoh

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/app/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** Max width kalender (default 360px). Gunakan "full" agar ikut container. */
  maxWidth?: number | "full"
}

/** Chevron (ikon nav) terketik rapi */
const CalendarChevron: NonNullable<CustomComponents["Chevron"]> = ({
  orientation,
  className,
}) => {
  const base = cn("h-4 w-4", className)
  switch (orientation) {
    case "left":
      return <ChevronLeft className={base} />
    case "right":
      return <ChevronRight className={base} />
    case "up":
      return <ChevronLeft className={cn(base, "-rotate-90")} />
    case "down":
      return <ChevronRight className={cn(base, "rotate-90")} />
    default:
      return <ChevronRight className={base} />
  }
}

/**
 * Date picker normal: 7 kolom, baris per minggu, TR header sejajar angka.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  maxWidth = 360,
  locale = enUS,            // ← pakai enUS agar header Su Mo Tu ...
  weekStartsOn = 0,         // ← Sunday first (0 = Sunday)
  ...props
}: CalendarProps) {
  const widthClass =
    maxWidth === "full" ? "max-w-full" : `max-w-[${typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth}]`

  return (
    <div className={cn("mx-auto w-full", widthClass, className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        numberOfMonths={1}
        locale={locale}
        weekStartsOn={weekStartsOn}
        // Penting: biarkan layout tabel, jangan grid/flex
        className={cn("rounded-xl border bg-background p-3 shadow-sm")}
        classNames={{
          // container
          months: "flex flex-col space-y-4",
          month: "space-y-2",

          // header
          caption: "flex justify-center items-center relative pt-1",
          caption_label: "text-sm font-semibold capitalize",
          nav: "flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "absolute h-7 w-7 p-0 bg-transparent opacity-80 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary"
          ),
          nav_button_previous: "left-1",
          nav_button_next: "right-1",

          // TABEL FIXED: kolom header PASTI sejajar dengan kolom tanggal
          table: "w-full border-collapse table-fixed",
          head_row: "", // biarkan default table-row
          head_cell:
            // samakan tinggi/ukuran agar alignment tidak jomplang
            "text-muted-foreground text-center font-medium text-[11px] leading-6 py-1",
          row: "", // default table-row
          cell: "text-center align-middle p-0", // default table-cell

          // hari (tanggal) ukuran konsisten
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 text-sm rounded-md inline-flex items-center justify-center " +
              "transition-colors hover:bg-muted aria-selected:opacity-100"
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
          day_today: "ring-1 ring-primary/50",
          day_outside: "text-muted-foreground/60",
          day_disabled: "text-muted-foreground/50 opacity-50 cursor-not-allowed",

          // range (kalau dipakai)
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",

          ...classNames,
        }}
        components={{ Chevron: CalendarChevron }}
        {...props}
      />

      {/* Legend kecil (opsional) */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded ring-1 ring-primary/50" /> Today
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded bg-muted" /> Disabled
        </div>
      </div>
    </div>
  )
}
