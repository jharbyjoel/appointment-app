import { BrowserRouter, Routes, Route } from "react-router-dom"
import RootLayout from "./components/layout/root-layout"
import HomePage from "./pages/home-page"
import AppointmentsPage from "./pages/appointments-page"
import NewAppointmentPage from "./pages/new-appointment-page"
import CustomersPage from "./pages/customers-page"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/appointments/new" element={<NewAppointmentPage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App