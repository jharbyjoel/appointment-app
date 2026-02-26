const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3007"

async function handleResponse(response) {
  const json = await response.json()
  if (!response.ok) {
    throw new Error(json.message ?? "An unexpected error occurred")
  }
  return json
}

export async function getAppointmentsByDate(date) {
  const response = await fetch(`${API_BASE}/appointments/${date}`)
  return handleResponse(response)
}

export async function createAppointment(data) {
  const response = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function editAppointment(data) {
  const response = await fetch(`${API_BASE}/appointments`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteAppointment(data) {
  const response = await fetch(`${API_BASE}/appointments`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

// Generates an array of YYYY-MM-DD strings between startDate and endDate (inclusive)
function generateDateRange(startDate, endDate) {
  const dates = []
  const current = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// Fetches all appointments across a date range concurrently and returns a flat
// array of unique appointments de-duplicated by PK+SK.
export async function getAppointmentsForDateRange(startDate, endDate) {
  const dates = generateDateRange(startDate, endDate)
  const results = await Promise.allSettled(
    dates.map((date) => getAppointmentsByDate(date))
  )
  const allAppointments = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value.data?.Items ?? [])

  // De-duplicate by composite key in case dates overlap
  const seen = new Set()
  return allAppointments.filter((appt) => {
    const key = `${appt.PK}#${appt.SK}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
