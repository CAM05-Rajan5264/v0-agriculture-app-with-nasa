"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecordDetailProps {
  record: any
}

export function RecordDetail({ record }: RecordDetailProps) {
  if (!record) return null

  const renderDetails = () => {
    switch (record.record_type) {
      case "irrigation":
        return (
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Water Amount:</span>
              <span className="font-medium">{record.water_amount_mm || "N/A"} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method:</span>
              <span className="font-medium capitalize">{record.irrigation_method || "N/A"}</span>
            </div>
            {record.duration_minutes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{record.duration_minutes} min</span>
              </div>
            )}
          </div>
        )
      case "pesticide":
        return (
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product:</span>
              <span className="font-medium">{record.product_name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{record.chemical_type || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium">{record.quantity_applied || "N/A"} {record.unit}</span>
            </div>
          </div>
        )
      case "fertilizer":
        return (
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product:</span>
              <span className="font-medium">{record.product_name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{record.fertilizer_type || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium">{record.quantity_applied || "N/A"} {record.unit}</span>
            </div>
            {record.npk_ratio && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">NPK Ratio:</span>
                <span className="font-medium">{record.npk_ratio}</span>
              </div>
            )}
          </div>
        )
      case "harvest":
        return (
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium">{record.quantity_harvested || "N/A"} {record.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quality Grade:</span>
              <Badge variant="outline" className="capitalize">{record.quality_grade || "N/A"}</Badge>
            </div>
            {record.yield_per_hectare && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yield/Hectare:</span>
                <span className="font-medium">{record.yield_per_hectare} {record.unit}</span>
              </div>
            )}
            {record.total_revenue && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue:</span>
                <span className="font-medium">${record.total_revenue.toFixed(2)}</span>
              </div>
            )}
          </div>
        )
      case "cost":
        return (
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expense Type:</span>
              <span className="font-medium capitalize">{record.expense_type || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{record.currency} {record.amount?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{record.category || "N/A"}</span>
            </div>
          </div>
        )
      case "maintenance":
        return (
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Equipment:</span>
              <span className="font-medium">{record.equipment_name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{record.maintenance_type || "N/A"}</span>
            </div>
            {record.cost && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost:</span>
                <span className="font-medium">${record.cost.toFixed(2)}</span>
              </div>
            )}
            {record.next_service_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Service:</span>
                <span className="font-medium">{new Date(record.next_service_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )
      default:
        return <p className="text-sm text-muted-foreground">{record.description}</p>
    }
  }

  return (
    <Card className="p-3 bg-accent/30 border-accent">
      <div className="space-y-3">{renderDetails()}</div>
      {record.description && record.record_type !== "cost" && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground font-medium mb-1">Notes:</p>
          <p className="text-sm text-muted-foreground">{record.description}</p>
        </div>
      )}
    </Card>
  )
}
