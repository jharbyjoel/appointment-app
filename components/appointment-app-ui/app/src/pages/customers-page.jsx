import { useState, useEffect, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/layout/page-header"
import { CustomerList } from "@/components/customers/customer-list"
import { getAppointmentsForDateRange } from "@/api/appointments"

// Derive a unique customer list from a flat list of appointments
function deriveCustomers(appointments) {
  const map = new Map()

  for (const appt of appointments) {
    const existing = map.get(appt.customerEmail)
    const apptDate = new Date(appt.startTime)

    if (!existing) {
      map.set(appt.customerEmail, {
        customerName: appt.customerName,
        customerEmail: appt.customerEmail,
        phone: appt.phone,
        appointmentCount: 1,
        lastAppointment: appt.startTime,
      })
    } else {
      existing.appointmentCount += 1
      if (apptDate > new Date(existing.lastAppointment)) {
        existing.lastAppointment = appt.startTime
      }
    }
  }

  // Sort by most recent visit
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastAppointment) - new Date(a.lastAppointment)
  )
}

function getDateRange() {
  const today = new Date()
  const past = new Date(today)
  past.setDate(today.getDate() - 90)
  const future = new Date(today)
  future.setDate(today.getDate() + 30)
  return {
    start: past.toISOString().slice(0, 10),
    end: future.toISOString().slice(0, 10),
  }
}

export default function CustomersPage() {
  const [allAppointments, setAllAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const { start, end } = getDateRange()
        const appointments = await getAppointmentsForDateRange(start, end)
        setAllAppointments(appointments)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const customers = useMemo(() => deriveCustomers(allAppointments), [allAppointments])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.customerEmail.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    )
  }, [customers, search])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description={
          !isLoading && customers.length > 0
            ? `${customers.length} unique customer${customers.length === 1 ? "" : "s"} — last 90 days`
            : "Derived from appointment history — last 90 days"
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name, email, or phone…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <CustomerList customers={filtered} isLoading={isLoading} error={error} />
    </div>
  )
}
