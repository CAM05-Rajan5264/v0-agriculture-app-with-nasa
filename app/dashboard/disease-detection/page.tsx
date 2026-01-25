"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Leaf, Upload, Loader, CheckCircle } from "lucide-react"
import Image from "next/image"

interface DiseaseAnalysisResult {
  disease: string
  confidence: number
  severity: "mild" | "moderate" | "severe" | "critical"
  symptoms: string[]
  treatment: string
  urgency: "low" | "medium" | "high" | "critical"
  recommendations: string[]
  isDisease: boolean
}

export default function DiseaseDetectionPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<DiseaseAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB")
        return
      }

      setSelectedImage(file)
      setError(null)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage || !preview) {
      setError("Please select an image first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Send to API for analysis
      const response = await fetch("/api/analyze-disease", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Image: preview,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
      console.error("[v0] Disease detection error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "text-yellow-600 bg-yellow-50"
      case "moderate":
        return "text-orange-600 bg-orange-50"
      case "severe":
        return "text-red-600 bg-red-50"
      case "critical":
        return "text-red-700 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Plant Disease Detection</h1>
        <p className="text-muted-foreground mt-2">
          Upload a leaf or plant image to detect diseases and get treatment recommendations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Plant Image
            </CardTitle>
            <CardDescription>Take a clear photo of the affected leaf or plant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
            </div>

            {preview && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            )}

            {error && (
              <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!selectedImage || loading} className="w-full" size="lg">
              {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Analyzing..." : "Analyze Image"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {!analysis.isDisease ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                AI Analysis Results
              </CardTitle>
              <CardDescription>Powered by plant.id AI detection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Detected</p>
                <p className="text-lg font-semibold">{analysis.disease}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
                <span className="text-lg font-semibold">{(analysis.confidence * 100).toFixed(1)}%</span>
              </div>

              {analysis.isDisease && (
                <>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(analysis.severity)}`}
                    >
                      {analysis.severity?.charAt(0).toUpperCase() + analysis.severity?.slice(1)} Severity
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Observed Symptoms</p>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.symptoms.map((symptom: string, idx: number) => (
                        <li key={idx} className="text-sm">
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Recommended Treatment</p>
                    <p className="text-sm text-blue-800">{analysis.treatment}</p>
                  </div>

                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Action Items</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {analysis.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm">
                            {rec}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  )
}
