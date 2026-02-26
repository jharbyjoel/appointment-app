import { useState, useEffect, useCallback } from "react"
import { getAppointmentsByDate } from "@/api/appointments"

export function useAppointments(date) {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    if (!date) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAppointmentsByDate(date)
      setAppointments(result.data?.Items ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return { appointments, isLoading, error, refetch: fetchAppointments }
}
