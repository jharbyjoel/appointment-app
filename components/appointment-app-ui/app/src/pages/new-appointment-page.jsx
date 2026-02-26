import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { createAppointment } from "@/api/appointments"

export default function NewAppointmentPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data) {
    setIsSubmitting(true)
    try {
      await createAppointment(data)
      const appointmentDate = data.startTime.slice(0, 10)
      toast.success("Appointment created!")
      navigate(`/appointments?date=${appointmentDate}`)
    } catch (err) {
      toast.error(err.message ?? "Failed to create appointment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <PageHeader
        title="New Appointment"
        description="Fill in the details to book a new appointment."
      >
        <Button variant="ghost" size="sm" asChild>
          <Link to="/appointments">
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <AppointmentForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
