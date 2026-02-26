import { Link } from "react-router-dom"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AppointmentCard } from "./appointment-card"

function AppointmentCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function AppointmentList({ appointments, isLoading, error, onEdit, onCancel }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <AppointmentCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load appointments</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center space-y-3">
        <p className="text-muted-foreground text-sm">No appointments for this day.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/appointments/new">
            <CalendarPlus className="size-4 mr-2" />
            Book one now
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {appointments.map((appt) => (
        <AppointmentCard
          key={`${appt.PK}-${appt.SK}`}
          appointment={appt}
          onEdit={onEdit}
          onCancel={onCancel}
        />
      ))}
    </div>
  )
}
