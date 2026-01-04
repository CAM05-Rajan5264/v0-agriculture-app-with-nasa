"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle, AlertCircle, Leaf } from "lucide-react"
import { DiagnosisResult } from "./diagnosis-result"

interface DiagnosisResponse {
  status: string
  issue?: string
  severity?: "low" | "medium" | "high"
  symptoms?: string[]
  treatment?: string[]
  prevention?: string[]
}

export function PlantDiagnosis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DiagnosisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setImagePreview(base64)
      analyzeImage(base64)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/plant-diagnosis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            image: imageData,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while analyzing the image")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const triggerCamera = () => {
    cameraInputRef.current?.click()
  }

  const resetDiagnosis = () => {
    setResult(null)
    setImagePreview(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {!imagePreview ? (
          <Card className="border-dashed p-6 md:p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">Upload a Photo of Your Crop</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Take a clear photo of the affected area for accurate diagnosis
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Button
                  onClick={triggerFileUpload}
                  className="flex-1"
                  disabled={isAnalyzing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
                <Button
                  onClick={triggerCamera}
                  variant="outline"
                  className="flex-1"
                  disabled={isAnalyzing}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Selected crop"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </Card>

            {isAnalyzing && (
              <Card className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing your plant...</p>
              </Card>
            )}

            {error && (
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Analysis Error</p>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              </Card>
            )}

            {result && <DiagnosisResult result={result} />}

            <div className="flex gap-3">
              <Button
                onClick={resetDiagnosis}
                variant="outline"
                className="flex-1"
                disabled={isAnalyzing}
              >
                Try Another Photo
              </Button>
              {result && (
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1"
                >
                  Print Results
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Card className="p-4 md:p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Tips for Best Results</h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Take a close-up photo of the affected leaf or plant part</li>
              <li>• Ensure good lighting and avoid shadows</li>
              <li>• Show clear symptoms like spots, discoloration, or damage</li>
              <li>• Include surrounding healthy leaves for comparison</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
