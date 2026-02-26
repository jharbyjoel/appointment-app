import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"]

// Generate time options in 15-min increments, e.g. "09:00", "09:15", ...
function generateTimeOptions() {
  const times = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, "0")
      const mm = String(m).padStart(2, "0")
      times.push(`${hh}:${mm}`)
    }
  }
  return times
}

const TIME_OPTIONS = generateTimeOptions()

function toDateInput(isoString) {
  if (!isoString) return ""
  return isoString.slice(0, 10)
}

function toTimeInput(isoString) {
  if (!isoString) return ""
  return isoString.slice(11, 16)
}

function combineDateAndTime(date, time) {
  if (!date || !time) return ""
  return `${date}T${time}:00`
}

const EMPTY_FORM = {
  customerName: "",
  customerEmail: "",
  phone: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "09:30",
  notes: "",
  location: "",
  status: "PENDING",
}

export function AppointmentForm({ initial, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM
    return {
      customerName: initial.customerName ?? "",
      customerEmail: initial.customerEmail ?? "",
      phone: initial.phone ?? "",
      date: toDateInput(initial.startTime),
      startTime: toTimeInput(initial.startTime),
      endTime: toTimeInput(initial.endTime),
      notes: initial.notes ?? "",
      location: initial.location ?? "",
      status: initial.status ?? "PENDING",
    }
  })

  const [errors, setErrors] = useState({})
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    if (!initial) return
    setForm({
      customerName: initial.customerName ?? "",
      customerEmail: initial.customerEmail ?? "",
      phone: initial.phone ?? "",
      date: toDateInput(initial.startTime),
      startTime: toTimeInput(initial.startTime),
      endTime: toTimeInput(initial.endTime),
      notes: initial.notes ?? "",
      location: initial.location ?? "",
      status: initial.status ?? "PENDING",
    })
  }, [initial])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.customerName.trim()) e.customerName = "Required"
    if (!form.customerEmail.trim()) e.customerEmail = "Required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      e.customerEmail = "Invalid email"
    if (!form.phone.trim()) e.phone = "Required"
    if (!form.date) e.date = "Required"
    if (!form.startTime) e.startTime = "Required"
    if (!form.endTime) e.endTime = "Required"
    else if (form.endTime <= form.startTime) e.endTime = "Must be after start time"
    if (!form.notes.trim()) e.notes = "Required"
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) {
      setErrors(e2)
      return
    }
    onSubmit({
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      phone: form.phone,
      startTime: combineDateAndTime(form.date, form.startTime),
      endTime: combineDateAndTime(form.date, form.endTime),
      notes: form.notes,
      location: form.location,
      status: form.status,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Name */}
      <div className="grid gap-1.5">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={form.customerName}
          onChange={(e) => set("customerName", e.target.value)}
          placeholder="Jane Smith"
          aria-invalid={!!errors.customerName}
        />
        {errors.customerName && (
          <p className="text-xs text-destructive">{errors.customerName}</p>
        )}
      </div>

      {/* Email */}
      <div className="grid gap-1.5">
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          value={form.customerEmail}
          onChange={(e) => set("customerEmail", e.target.value)}
          placeholder="jane@example.com"
          aria-invalid={!!errors.customerEmail}
        />
        {errors.customerEmail && (
          <p className="text-xs text-destructive">{errors.customerEmail}</p>
        )}
      </div>

      {/* Phone */}
      <div className="grid gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="(555) 000-0000"
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      {/* Date */}
      <div className="grid gap-1.5">
        <Label>Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !form.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {form.date || "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.date ? new Date(form.date + "T00:00:00") : undefined}
              onSelect={(d) => {
                if (d) set("date", d.toISOString().slice(0, 10))
                setCalendarOpen(false)
              }}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
      </div>

      {/* Start / End time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="startTime">Start Time</Label>
          <Select value={form.startTime} onValueChange={(v) => set("startTime", v)}>
            <SelectTrigger id="startTime" aria-invalid={!!errors.startTime}>
              <SelectValue placeholder="Start" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.startTime && (
            <p className="text-xs text-destructive">{errors.startTime}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="endTime">End Time</Label>
          <Select value={form.endTime} onValueChange={(v) => set("endTime", v)}>
            <SelectTrigger id="endTime" aria-invalid={!!errors.endTime}>
              <SelectValue placeholder="End" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.endTime && (
            <p className="text-xs text-destructive">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Notes / Service */}
      <div className="grid gap-1.5">
        <Label htmlFor="notes">Service / Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="e.g. Haircut + Beard trim"
          rows={3}
          aria-invalid={!!errors.notes}
        />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
      </div>

      {/* Location */}
      <div className="grid gap-1.5">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="e.g. Station 3"
        />
      </div>

      {/* Status */}
      <div className="grid gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select value={form.status} onValueChange={(v) => set("status", v)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPOINTMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Appointment"}
        </Button>
      </div>
    </form>
  )
}
