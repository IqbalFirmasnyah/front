"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })
}

function isValidDate(date: Date | undefined) {
  if (!date) return false
  return !isNaN(date.getTime())
}

interface Calendar28Props {
  value?: string
  onChange: (date: string) => void
}

export function Calendar28({ value, onChange }: Calendar28Props) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [inputValue, setInputValue] = React.useState(value || "")

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">Tanggal Layanan</Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={inputValue}
          placeholder="June 01, 2025"
          className="bg-background pr-10"
          onChange={(e) => {
            setInputValue(e.target.value)
            const newDate = new Date(e.target.value)
            if (isValidDate(newDate)) {
              setDate(newDate)
              setMonth(newDate)
              onChange(e.target.value)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button id="date-picker" variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2">
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(newDate) => {
                if(!newDate) return;
                setDate(newDate)
                const formatted = newDate.toISOString().split("T")[0] // yyyy-mm-dd
                setInputValue(formatted)
                onChange(formatted)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
