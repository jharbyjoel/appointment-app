import { Outlet } from "react-router-dom"
import { Navbar } from "./navbar"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Toaster richColors />
    </div>
  )
}
