import { Link } from "react-router-dom"
import { CalendarPlus, CalendarCheck2, Clock4, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAppointments } from "@/hooks/use-appointments"
import { AppointmentList } from "@/components/appointments/appointment-list"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function formatDisplayDate(dateString) {
  return new Date(dateString + "T00:00:00").toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`size-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const today = todayDateString()
  const { appointments, isLoading, error, refetch } = useAppointments(today)

  const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length
  const pending = appointments.filter((a) => a.status === "PENDING").length

  // Sort by startTime and show the next 5 upcoming
  const upcoming = [...appointments]
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's your schedule for{" "}
            <span className="text-foreground font-medium">
              {formatDisplayDate(today)}
            </span>
          </p>
        </div>
        <Button asChild>
          <Link to="/appointments/new">
            <CalendarPlus className="size-4 mr-2" />
            New Appointment
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-3">
        <StatsCard
          icon={CalendarDays}
          label="Total Today"
          value={isLoading ? "—" : appointments.length}
          color="text-muted-foreground"
        />
        <StatsCard
          icon={CalendarCheck2}
          label="Confirmed"
          value={isLoading ? "—" : confirmed}
          color="text-green-600"
        />
        <StatsCard
          icon={Clock4}
          label="Pending"
          value={isLoading ? "—" : pending}
          color="text-amber-500"
        />
      </div>

      <Separator />

      {/* Upcoming appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {appointments.length > 5 ? "Next 5 Appointments" : "Today's Appointments"}
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/appointments">View all</Link>
          </Button>
        </div>

        <AppointmentList
          appointments={upcoming}
          isLoading={isLoading}
          error={error}
          onEdit={() => {}}
          onCancel={() => refetch()}
        />

        {!isLoading && appointments.length === 0 && !error && (
          <div className="text-center pt-2">
            <Button asChild variant="outline">
              <Link to="/appointments/new">
                <CalendarPlus className="size-4 mr-2" />
                Book the first appointment of the day
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
