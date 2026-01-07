"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { RecordDetail } from "./record-detail"

interface RecordsListProps {
  recordType?: string
  refreshKey: number
}

export function RecordsList({ recordType, refreshKey }: RecordsListProps) {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  useEffect(() => {
    loadRecords()
  }, [recordType, refreshKey])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase.from("farm_records").select("*").order("recorded_date", { ascending: false })

      if (recordType && recordType !== "all") {
        query = query.eq("record_type", recordType)
      }

      const { data, error } = await query
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error("[v0] Error loading records:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("farm_records").delete().eq("id", id)
      if (error) throw error
      setRecords(records.filter((r) => r.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting record:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <h3 className="font-semibold text-foreground mb-1">No records found</h3>
        <p className="text-sm text-muted-foreground">Start by adding your first farm record</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div key={record.id}>
          <Card
            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground truncate">{record.title}</h4>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {record.record_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(record.recorded_date), "MMM d, yyyy")}
                </div>
                {record.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{record.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(record.id)
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          {expandedRecord === record.id && (
            <div className="mt-2 ml-2">
              <RecordDetail record={record} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
