"use client"

import * as React from "react"
import { format, setMonth, setYear, startOfDecade, endOfDecade, addYears, subYears, addMonths, subMonths } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  value?: string
  onChange: (date: string | undefined) => void
  disabled?: boolean
  maxDate?: Date
}

type Mode = "days" | "months" | "years"

export function DatePicker({ value, onChange, disabled, maxDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<Mode>("days")
  
  // viewDate tracks the month/year currently being viewed (not necessarily selected)
  const [viewDate, setViewDate] = React.useState<Date>(
    value ? new Date(value) : new Date()
  )

  // Reset view to days when popover opens
  React.useEffect(() => {
    if (open) {
      setMode("days")
      if (value) setViewDate(new Date(value))
    }
  }, [open, value])

  const selectedDate = value ? new Date(value) : undefined

  // Navigation handlers
  const handlePrev = () => {
    if (mode === "days") setViewDate(subMonths(viewDate, 1))
    if (mode === "months") setViewDate(subYears(viewDate, 1))
    if (mode === "years") setViewDate(subYears(viewDate, 12)) // 12 years per view
  }

  const handleNext = () => {
    if (mode === "days") setViewDate(addMonths(viewDate, 1))
    if (mode === "months") setViewDate(addYears(viewDate, 1))
    if (mode === "years") setViewDate(addYears(viewDate, 12))
  }

  // Month Names
  const months = Array.from({ length: 12 }, (_, i) => {
    return format(setMonth(new Date(), i), "MMM", { locale: localeId })
  })

  // Year Range (12 years grid)
  const currentYear = viewDate.getFullYear()
  const decadeStart = startOfDecade(viewDate).getFullYear()
  // Adjust to show a 12-year grid e.g. 2020-2031
  const yearStart = Math.floor(currentYear / 12) * 12
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal rounded-xl h-12 px-4",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), "PPP", { locale: localeId }) : <span>Pilih tanggal...</span>}
          </Button>
        }
      />
      <PopoverContent className="w-[280px] p-3 rounded-2xl shadow-xl" align="start">
        {/* Custom Header Navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handlePrev}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          
          {mode === "days" && (
            <Button 
              variant="ghost" 
              className="h-7 rounded-lg font-semibold text-sm hover:bg-muted"
              onClick={() => setMode("months")}
            >
              {format(viewDate, "MMMM yyyy", { locale: localeId })}
            </Button>
          )}

          {mode === "months" && (
            <Button 
              variant="ghost" 
              className="h-7 rounded-lg font-semibold text-sm hover:bg-muted"
              onClick={() => setMode("years")}
            >
              {format(viewDate, "yyyy")}
            </Button>
          )}

          {mode === "years" && (
            <div className="text-sm font-semibold px-2">
              {years[0]} - {years[years.length - 1]}
            </div>
          )}

          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handleNext}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Views */}
        {mode === "days" && (
          <Calendar
            mode="single"
            month={viewDate}
            onMonthChange={setViewDate}
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange(date.toISOString())
                setOpen(false)
              } else {
                onChange(undefined)
              }
            }}
            disabled={maxDate ? (date) => date > maxDate : undefined}
            classNames={{
              nav: "hidden", // Hide native navigation
              month_caption: "hidden", // Hide native caption
              month: "w-full space-y-4",
              table: "w-full border-collapse space-y-1",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1",
              row: "flex w-full mt-2",
              cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal mx-auto flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors",
              ),
            }}
          />
        )}

        {mode === "months" && (
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, i) => (
              <Button
                key={month}
                variant={viewDate.getMonth() === i ? "default" : "ghost"}
                className={cn("h-12 rounded-xl text-sm", viewDate.getMonth() === i && "shadow-md shadow-primary/20")}
                onClick={() => {
                  setViewDate(setMonth(viewDate, i))
                  setMode("days")
                }}
              >
                {month}
              </Button>
            ))}
          </div>
        )}

        {mode === "years" && (
          <div className="grid grid-cols-3 gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={viewDate.getFullYear() === year ? "default" : "ghost"}
                className={cn("h-12 rounded-xl text-sm", viewDate.getFullYear() === year && "shadow-md shadow-primary/20")}
                onClick={() => {
                  setViewDate(setYear(viewDate, year))
                  setMode("months")
                }}
              >
                {year}
              </Button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
