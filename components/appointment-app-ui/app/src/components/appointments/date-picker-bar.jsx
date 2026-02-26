import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

function addDays(dateString, days) {
  const d = new Date(dateString + "T00:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDisplayDate(dateString) {
  const d = new Date(dateString + "T00:00:00")
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = addDays(today, 1)
  const yesterday = addDays(today, -1)

  if (dateString === today) return "Today"
  if (dateString === tomorrow) return "Tomorrow"
  if (dateString === yesterday) return "Yesterday"

  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function DatePickerBar({ date, onChange }) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  function handleCalendarSelect(selected) {
    if (!selected) return
    onChange(selected.toISOString().slice(0, 10))
    setCalendarOpen(false)
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(addDays(date, -1))}
        aria-label="Previous day"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="gap-2 font-medium min-w-40 justify-center">
            <CalendarIcon className="size-4 text-muted-foreground" />
            {formatDisplayDate(date)}
            <span className="text-muted-foreground font-normal text-xs">({date})</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={new Date(date + "T00:00:00")}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(addDays(date, 1))}
        aria-label="Next day"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
