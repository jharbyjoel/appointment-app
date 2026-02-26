import { Mail, Phone, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function formatDate(isoString) {
  if (!isoString) return "—"
  return new Date(isoString).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function CustomerCard({ customer }) {
  const { customerName, customerEmail, phone, appointmentCount, lastAppointment } = customer

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-base leading-tight">{customerName}</p>
          </div>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 whitespace-nowrap">
            {appointmentCount} {appointmentCount === 1 ? "visit" : "visits"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-4 shrink-0" />
          <span className="truncate">{customerEmail}</span>
        </div>
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span>{phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" />
          <span>Last visit: {formatDate(lastAppointment)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
