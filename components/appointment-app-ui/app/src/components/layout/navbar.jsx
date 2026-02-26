import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { navigationMenuTriggerStyle } from "@/components/ui/navbar/navigation-menu"

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/appointments", label: "Appointments" },
  { to: "/customers", label: "Customers" },
]

function isActive(pathname, to) {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(to + "/")
}

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="border-b bg-background">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="font-semibold text-sm mr-4 text-foreground tracking-tight">
          BookIt
        </span>
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              navigationMenuTriggerStyle(),
              isActive(pathname, to) && "bg-accent text-accent-foreground"
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
