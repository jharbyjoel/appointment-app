import { useState } from "react"
import { Phone, Clock, MapPin, Pencil, X } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "./status-badge"

function formatTime(isoString) {
  if (!isoString) return "—"
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AppointmentCard({ appointment, onEdit, onCancel }) {
  const { customerName, customerEmail, phone, startTime, endTime, status, notes, location } =
    appointment

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-base leading-tight">{customerName}</p>
          <p className="text-muted-foreground text-sm">{customerEmail}</p>
        </div>
        <StatusBadge status={status} />
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0" />
          <span>
            {formatTime(startTime)} – {formatTime(endTime)}
          </span>
        </div>

        {/* Phone */}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span>{phone}</span>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span>{location}</span>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <p className="text-sm border-t pt-2 mt-2 text-foreground">{notes}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onEdit?.(appointment)}
          >
            <Pencil className="size-3.5 mr-1" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="flex-1">
                <X className="size-3.5 mr-1" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel {customerName}'s appointment at{" "}
                  {formatTime(startTime)}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => onCancel?.(appointment)}
                >
                  Yes, cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
