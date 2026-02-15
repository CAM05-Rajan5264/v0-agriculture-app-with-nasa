"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Leaf, Upload, Loader, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

const SUPPORTED_CROPS = [
  "Apple",
  "Banana",
  "Barley",
  "Cassava",
  "Citrus",
  "Cocoa",
  "Coffee",
  "Corn",
  "Cotton",
  "Cucumber",
  "Eggplant",
  "Garlic",
  "Grapevine",
  "Oil palm",
  "Onion",
  "Potato",
  "Rice",
  "Soybean",
  "Sugarcane",
  "Tea",
  "Tobacco",
  "Tomato",
  "Wheat",
]

export default function DiseaseDetectionPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<DiseaseAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<string>("")

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file (JPEG, PNG, etc.)")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB")
        return
      }

      setSelectedImage(file)
      setError(null)
      setAnalysis(null)

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
      // Send to API for analysis with crop type for better accuracy
      const response = await fetch("/api/analyze-disease", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Image: preview,
          cropType: selectedCrop || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during analysis";
      
      // Provide helpful error messages
      if (errorMessage.includes("Unauthorized")) {
        setError("Please log in to use the disease detection feature.");
      } else if (errorMessage.includes("Image")) {
        setError("Image format error. Please ensure it's a valid image file (JPEG, PNG, or WebP) under 5MB.");
      } else {
        setError(errorMessage || "Analysis failed. Please try again with a clearer image.");
      }
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
          Upload a clear photo of an infected leaf or plant to detect diseases and get treatment recommendations using AI-powered analysis
        </p>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900">✅ Free Analysis Enabled</p>
          <p className="text-xs text-green-800 mt-1">
            This system uses advanced AI analysis completely FREE. No API keys required. All results are saved to your account for tracking.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Plant Image
            </CardTitle>
            <CardDescription>Take a clear, well-lit photo of the affected area</CardDescription>
            <div className="mt-3 text-xs bg-blue-50 border border-blue-200 rounded p-2">
              <p className="font-medium text-blue-900">💡 Free AI Analysis Active</p>
              <p className="text-blue-800 mt-1">Your analysis will be powered by advanced image recognition AI. Results are saved to your account.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900 font-medium">Tips for best results:</p>
              <ul className="text-xs text-blue-800 space-y-1 mt-2 list-disc list-inside">
                <li>Take photo in natural daylight</li>
                <li>Focus on the affected leaf or affected area</li>
                <li>Ensure the image is clear and in focus</li>
                <li>Avoid shadows and backlighting</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Crop (Optional)</label>
              <Select value={selectedCrop || "none"} onValueChange={(value) => setSelectedCrop(value === "none" ? "" : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select crop for better accuracy" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CROPS.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Selecting your crop type improves analysis accuracy</p>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect} 
                className="hidden"
                capture="environment"
              />
              <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Click to upload or take a photo</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, WebP up to 5MB</p>
              <p className="text-xs text-muted-foreground mt-2">📱 Tap to use phone camera</p>
            </div>

            {preview && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Image Preview:</p>
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-border">
                  <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                </div>
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
              {loading ? "Analyzing image with AI..." : "Analyze Image"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {!analysis.isDisease ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span>{!analysis.isDisease ? "✓ Plant Healthy" : "⚠ Disease Detected"}</span>
                </CardTitle>
                <CardDescription>Powered by Plant.id AI Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg border-2 ${analysis.isDisease ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide ${analysis.isDisease ? "text-red-700" : "text-green-700"}`}>
                    {analysis.isDisease ? "Disease Detected" : "Healthy Status"}
                  </p>
                  <p className={`text-2xl font-bold mt-2 ${analysis.isDisease ? "text-red-900" : "text-green-900"}`}>
                    {analysis.disease}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-medium">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${analysis.isDisease ? "bg-red-600" : "bg-green-600"}`}
                          style={{width: `${analysis.confidence * 100}%`}}
                        />
                      </div>
                      <span className="font-bold text-sm">{(analysis.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

              {analysis.isDisease && (
                <>
                  {/* Severity Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${getSeverityColor(analysis.severity)}`}>
                      {analysis.severity?.charAt(0).toUpperCase() + analysis.severity?.slice(1)} Severity
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${analysis.urgency === 'critical' ? 'bg-red-100 text-red-700' : analysis.urgency === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {analysis.urgency?.toUpperCase()} URGENCY
                    </span>
                  </div>

                  {/* Symptoms */}
                  {analysis.symptoms && analysis.symptoms.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-orange-900 mb-3">🔍 Symptoms Detected</p>
                      <ul className="space-y-2">
                        {analysis.symptoms.map((symptom: string, idx: number) => (
                          <li key={idx} className="text-sm text-orange-900 flex gap-2">
                            <span className="font-bold">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Treatment */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💊 Recommended Treatment</p>
                    <p className="text-sm text-blue-900 leading-relaxed">{analysis.treatment}</p>
                  </div>

                  {/* Action Items */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 mb-3">✅ Action Items (In Order of Priority)</p>
                      <ol className="space-y-2">
                        {analysis.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm text-green-900 flex gap-3">
                            <span className="font-bold flex-shrink-0 text-green-700">{idx + 1}.</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              )}

              {!analysis.isDisease && (
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                  <p className="text-lg font-bold text-green-900 mb-2">✓ Plant is Healthy!</p>
                  <p className="text-sm text-green-900 leading-relaxed">{analysis.treatment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
            </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
