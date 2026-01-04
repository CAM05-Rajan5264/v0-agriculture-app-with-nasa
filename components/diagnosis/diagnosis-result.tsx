"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, AlertCircle, Leaf, Zap } from "lucide-react"

interface DiagnosisResponse {
  status: string
  issue?: string
  severity?: "low" | "medium" | "high"
  symptoms?: string[]
  treatment?: string[]
  prevention?: string[]
}

export function DiagnosisResult({ result }: { result: DiagnosisResponse }) {
  if (result.status === "healthy") {
    return (
      <Card className="p-6 border-green-200 bg-green-50">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Healthy Plant</h3>
            <p className="text-sm text-green-800 mt-2">
              Your plant appears to be in good health! Continue regular monitoring and follow good agricultural practices.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const severityConfig = {
    low: { color: "bg-yellow-50", borderColor: "border-yellow-200", textColor: "text-yellow-900", badge: "bg-yellow-100 text-yellow-800" },
    medium: { color: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-900", badge: "bg-orange-100 text-orange-800" },
    high: { color: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-900", badge: "bg-red-100 text-red-800" },
  }

  const config = severityConfig[result.severity || "medium"]

  return (
    <div className="space-y-4">
      <Card className={`p-6 border-2 ${config.borderColor} ${config.color}`}>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className={`h-8 w-8 ${result.severity === "high" ? "text-red-600" : result.severity === "medium" ? "text-orange-600" : "text-yellow-600"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`text-lg font-semibold ${config.textColor}`}>{result.issue}</h3>
                <p className={`text-sm ${config.textColor} opacity-90 mt-1`}>Severity: </p>
              </div>
              <Badge className={config.badge}>
                {(result.severity || "medium").toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {result.symptoms && result.symptoms.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">Symptoms Detected</h4>
          </div>
          <div className="grid gap-2">
            {result.symptoms.map((symptom, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-muted-foreground">{symptom}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.treatment && result.treatment.length > 0 && (
        <Card className="p-6 border-blue-200 bg-blue-50/50">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Treatment Options</h4>
          </div>
          <div className="grid gap-3">
            {result.treatment.map((treatment, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-sm text-foreground">{treatment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {result.prevention && result.prevention.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">Prevention Measures</h4>
          </div>
          <div className="grid gap-2">
            {result.prevention.map((measure, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-muted-foreground">{measure}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
