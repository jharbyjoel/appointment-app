import { useState, useEffect, useCallback } from "react"
import { getAppointmentsByDate, TENANT_ID } from "@/api/appointments"

// tenantId defaults to the value read from VITE_TENANT_ID at startup.
export function useAppointments(date, tenantId = TENANT_ID) {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    if (!date) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAppointmentsByDate(date, tenantId)
      setAppointments(result.data?.Items ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [date, tenantId])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return { appointments, isLoading, error, refetch: fetchAppointments }
}
