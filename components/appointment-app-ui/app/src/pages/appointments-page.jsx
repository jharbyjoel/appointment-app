import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CalendarPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/layout/page-header"
import { DatePickerBar } from "@/components/appointments/date-picker-bar"
import { AppointmentList } from "@/components/appointments/appointment-list"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { useAppointments } from "@/hooks/use-appointments"
import { editAppointment, deleteAppointment } from "@/api/appointments"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export default function AppointmentsPage() {
  const [searchParams] = useSearchParams()
  const [date, setDate] = useState(
    searchParams.get("date") ?? todayDateString()
  )
  const { appointments, isLoading, error, refetch } = useAppointments(date)

  const [editTarget, setEditTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleEdit(data) {
    setIsSubmitting(true)
    try {
      await editAppointment({
        ...data,
        PK: editTarget.PK,
        SK: editTarget.SK,
      })
      toast.success("Appointment updated.")
      setEditTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message ?? "Failed to update appointment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCancel(appointment) {
    try {
      await deleteAppointment({
        PK: appointment.PK,
        SK: appointment.SK,
      })
      toast.success("Appointment cancelled.")
      refetch()
    } catch (err) {
      toast.error(err.message ?? "Failed to cancel appointment.")
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Appointments">
        <Button asChild>
          <Link to="/appointments/new">
            <CalendarPlus className="size-4 mr-2" />
            New
          </Link>
        </Button>
      </PageHeader>

      <DatePickerBar date={date} onChange={setDate} />

      <AppointmentList
        appointments={appointments}
        isLoading={isLoading}
        error={error}
        onEdit={setEditTarget}
        onCancel={handleCancel}
      />

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            initial={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
