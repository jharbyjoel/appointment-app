import { Skeleton } from "@/components/ui/skeleton"
import { CustomerCard } from "./customer-card"

function CustomerCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-40" />
    </div>
  )
}

export function CustomerList({ customers, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CustomerCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load customers</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">No customers found.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Customers will appear here once appointments are booked.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <CustomerCard key={customer.customerEmail} customer={customer} />
      ))}
    </div>
  )
}
