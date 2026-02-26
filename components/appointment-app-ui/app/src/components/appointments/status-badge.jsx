import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "border-amber-400 text-amber-600 bg-amber-50",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "border-green-500 text-green-700 bg-green-50",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-red-400 text-red-600 bg-red-50",
  },
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "border-gray-300 text-gray-600",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
