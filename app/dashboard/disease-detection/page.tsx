"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Upload, Zap } from "lucide-react"
import Image from "next/image"

interface DiseaseAnalysis {
  disease: string
  confidence: number
  severity: "mild" | "moderate" | "severe" | "critical"
  symptoms: string[]
  treatment: string
  urgency: "low" | "medium" | "high" | "critical"
  recommendations: string[]
  isDisease: boolean
  cropType?: string
}

export default function DiseaseDetectionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setSelectedImage(result)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please select an image first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Sending image for disease detection analysis")
      console.log("[v0] Image data length:", selectedImage.length)
      const response = await fetch("/api/detect-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage })
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const { analysis: result } = await response.json()
      console.log("[v0] Analysis result received:", result.disease, "Confidence:", result.confidence)
      setAnalysis(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze image"
      console.error("[v0] Disease detection error:", message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setAnalysis(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Clear the file input
    }
  }

  const severityColors = {
    mild: "text-green-600 bg-green-50",
    moderate: "text-yellow-600 bg-yellow-50",
    severe: "text-orange-600 bg-orange-50",
    critical: "text-red-600 bg-red-50"
  }

  const urgencyColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Plant Disease Detection</h1>
        <p className="text-muted-foreground mt-2">
          Upload a plant image to analyze for diseases and get treatment recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Plant Image
            </CardTitle>
            <CardDescription>JPG, PNG up to 5MB. Good lighting recommended.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {selectedImage ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Image selected</p>
                  <p className="text-xs text-muted-foreground">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Drag and drop image here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </div>
              )}
            </div>

            {selectedImage && (
              <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Selected plant"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || loading}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze Image
                  </>
                )}
              </Button>
              {selectedImage && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  disabled={loading}
                >
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-foreground">1. Upload Photo</p>
              <p className="text-muted-foreground">Take a clear photo of the affected plant part</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">2. AI Analysis</p>
              <p className="text-muted-foreground">Free local AI analyzes the image for disease signs</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">3. Get Results</p>
              <p className="text-muted-foreground">Receive diagnosis and treatment recommendations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {!analysis.isDisease ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                Analysis Results
              </CardTitle>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-lg font-bold text-primary">
                  {Math.round(analysis.confidence * 100)}%
                </p>
              </div>
            </div>
            <CardDescription>
              Based on local free AI image analysis
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="disease" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="disease">Disease</TabsTrigger>
                <TabsTrigger value="crop">Crop</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="nutrients">Nutrients</TabsTrigger>
                <TabsTrigger value="recommendations">Actions</TabsTrigger>
              </TabsList>

              {/* Disease Tab */}
              <TabsContent value="disease" className="space-y-4">
                <div className={`p-4 rounded-lg ${severityColors[analysis.severity]}`}>
                  <p className="text-xs font-medium mb-1">DETECTED ISSUE</p>
                  <p className="text-2xl font-bold">{analysis.disease}</p>
                  <p className="text-xs mt-2 opacity-75">
                    Severity: {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
                  </p>
                </div>

                {analysis.symptoms.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Symptoms Detected:</p>
                    <ul className="space-y-1">
                      {analysis.symptoms.map((symptom, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${urgencyColors[analysis.urgency]}`}>
                  Urgency: {analysis.urgency.charAt(0).toUpperCase() + analysis.urgency.slice(1)}
                </div>
              </TabsContent>

              {/* Crop Tab */}
              <TabsContent value="crop" className="space-y-4">
                {analysis.cropIdentification ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <p className="font-medium text-foreground">Probable Crop Types:</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.cropIdentification.probable_crops.map((crop, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {crop}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-blue-700">
                        Identification Confidence: {Math.round(analysis.cropIdentification.confidence * 100)}%
                      </p>
                    </div>
                    {analysis.colorAnalysisDetails && (
                      <div className="space-y-3 text-sm">
                        <p className="font-medium text-foreground">Color Analysis Details:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-muted-foreground">Green Coverage</p>
                            <p className="text-lg font-bold text-green-700">{analysis.colorAnalysisDetails.green_coverage.toFixed(1)}%</p>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded">
                            <p className="text-xs text-muted-foreground">Yellow Tones</p>
                            <p className="text-lg font-bold text-yellow-700">{analysis.colorAnalysisDetails.yellow_tones.toFixed(1)}%</p>
                          </div>
                          <div className="bg-amber-50 p-3 rounded">
                            <p className="text-xs text-muted-foreground">Brown Spots</p>
                            <p className="text-lg font-bold text-amber-700">{analysis.colorAnalysisDetails.brown_spots.toFixed(1)}%</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-muted-foreground">White Coating</p>
                            <p className="text-lg font-bold text-gray-700">{analysis.colorAnalysisDetails.white_coating.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Crop identification data not available</p>
                )}
              </TabsContent>

              {/* Health Status Tab */}
              <TabsContent value="health" className="space-y-4">
                {analysis.healthStatus ? (
                  <>
                    <div className="space-y-3">
                      <div className={`p-4 rounded-lg ${
                        analysis.healthStatus.overall_health === 'excellent' ? 'bg-green-50 border border-green-200' :
                        analysis.healthStatus.overall_health === 'good' ? 'bg-blue-50 border border-blue-200' :
                        analysis.healthStatus.overall_health === 'fair' ? 'bg-yellow-50 border border-yellow-200' :
                        analysis.healthStatus.overall_health === 'poor' ? 'bg-orange-50 border border-orange-200' :
                        'bg-red-50 border border-red-200'
                      }`}>
                        <p className="text-xs font-medium mb-1">OVERALL HEALTH STATUS</p>
                        <p className="text-2xl font-bold capitalize">{analysis.healthStatus.overall_health}</p>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              analysis.healthStatus.health_score >= 80 ? 'bg-green-600' :
                              analysis.healthStatus.health_score >= 60 ? 'bg-blue-600' :
                              analysis.healthStatus.health_score >= 40 ? 'bg-yellow-600' :
                              analysis.healthStatus.health_score >= 20 ? 'bg-orange-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${analysis.healthStatus.health_score}%` }}
                          />
                        </div>
                        <p className="text-sm font-medium mt-2">Health Score: {analysis.healthStatus.health_score}/100</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Health Indicators:</p>
                        <ul className="space-y-1">
                          {analysis.healthStatus.status_indicators.map((indicator, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-1">•</span>
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Health status data not available</p>
                )}
              </TabsContent>

              {/* Nutrient Tab */}
              <TabsContent value="nutrients" className="space-y-4">
                {analysis.nutrientAnalysis ? (
                  <>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                      <p className="font-medium text-foreground">Nutrient Analysis:</p>
                      <p className="text-sm font-medium text-purple-900">{analysis.nutrientAnalysis.status}</p>
                      
                      {analysis.nutrientAnalysis.deficiencies.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Detected Issues:</p>
                          <ul className="space-y-1">
                            {analysis.nutrientAnalysis.deficiencies.map((deficiency, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className={`text-base mt-0.5 ${
                                  deficiency === "No obvious nutrient deficiencies" ? '✓' : '⚠'
                                } ${deficiency === "No obvious nutrient deficiencies" ? 'text-green-600' : 'text-orange-600'}`}>
                                </span>
                                <span className="text-muted-foreground">{deficiency}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Nutrient analysis data not available</p>
                )}
              </TabsContent>

              {/* Treatment Tab */}
              <TabsContent value="treatment" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium text-foreground">Recommended Treatment:</p>
                  <p className="text-sm text-muted-foreground">{analysis.treatment}</p>
                </div>

                {!analysis.isDisease && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Your plant looks healthy! Continue regular care and monitoring.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Action Items:</p>
                  <ol className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {idx + 1}
                        </span>
                        <span className="text-muted-foreground pt-0.5">{rec}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={() => setAnalysis(null)} variant="outline" className="w-full">
              Analyze Another Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
