'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'

interface YieldPrediction {
  estimatedYield: number
  confidence: number
  factors: Array<{
    name: string
    impact: number
    description: string
  }>
  recommendations: string[]
  riskFactors: string[]
  bestCaseYield: number
  worstCaseYield: number
}

export default function YieldForecastPage() {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<YieldPrediction | null>(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    cropId: 'wheat-field-1',
    farmId: 'farm-1',
    soilMoisture: 65,
    temperature: 22,
    rainfall: 50,
    sunlight: 8,
    nitrogen: 250,
    phosphorus: 50,
    potassium: 200,
    cropAge: 45,
    growthStage: 'vegetative',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'growthStage' ? value : parseFloat(value) || value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePredict = async () => {
    setLoading(true)
    setError('')
    setPrediction(null)

    try {
      console.log('[v0] Sending forecast request with data:', formData)

      const response = await fetch('/api/predict-yield', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate prediction')
      }

      const data = await response.json()
      console.log('[v0] Prediction received:', data.prediction)
      setPrediction(data.prediction)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('[v0] Forecast error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crop Yield Forecasting</h1>
        <p className="text-muted-foreground mt-2">
          Use machine learning to predict crop yields based on historical data and current growing conditions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Forecast Parameters
            </CardTitle>
            <CardDescription>Enter current growing conditions to generate yield prediction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Crop Selection */}
              <div>
                <Label htmlFor="cropId">Crop</Label>
                <Input
                  id="cropId"
                  name="cropId"
                  value={formData.cropId}
                  onChange={handleInputChange}
                  placeholder="e.g., wheat-field-1"
                  className="mt-1"
                />
              </div>

              {/* Farm Selection */}
              <div>
                <Label htmlFor="farmId">Farm</Label>
                <Input
                  id="farmId"
                  name="farmId"
                  value={formData.farmId}
                  onChange={handleInputChange}
                  placeholder="e.g., farm-1"
                  className="mt-1"
                />
              </div>

              {/* Growth Stage */}
              <div>
                <Label>Growth Stage</Label>
                <Select value={formData.growthStage} onValueChange={val => handleSelectChange('growthStage', val)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seedling">Seedling</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="maturity">Maturity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold mb-3">Environmental Conditions</p>
              </div>

              {/* Temperature */}
              <div>
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1"
                />
              </div>

              {/* Soil Moisture */}
              <div>
                <Label htmlFor="soilMoisture">Soil Moisture (%)</Label>
                <Input
                  id="soilMoisture"
                  name="soilMoisture"
                  type="number"
                  value={formData.soilMoisture}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="1"
                  className="mt-1"
                />
              </div>

              {/* Rainfall */}
              <div>
                <Label htmlFor="rainfall">Rainfall (mm)</Label>
                <Input
                  id="rainfall"
                  name="rainfall"
                  type="number"
                  value={formData.rainfall}
                  onChange={handleInputChange}
                  step="1"
                  className="mt-1"
                />
              </div>

              {/* Sunlight */}
              <div>
                <Label htmlFor="sunlight">Daily Sunlight (hours)</Label>
                <Input
                  id="sunlight"
                  name="sunlight"
                  type="number"
                  value={formData.sunlight}
                  onChange={handleInputChange}
                  step="0.5"
                  className="mt-1"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold mb-3">Soil Nutrients (ppm)</p>
              </div>

              {/* Nitrogen */}
              <div>
                <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                <Input
                  id="nitrogen"
                  name="nitrogen"
                  type="number"
                  value={formData.nitrogen}
                  onChange={handleInputChange}
                  step="10"
                  className="mt-1"
                />
              </div>

              {/* Phosphorus */}
              <div>
                <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                <Input
                  id="phosphorus"
                  name="phosphorus"
                  type="number"
                  value={formData.phosphorus}
                  onChange={handleInputChange}
                  step="5"
                  className="mt-1"
                />
              </div>

              {/* Potassium */}
              <div>
                <Label htmlFor="potassium">Potassium (K)</Label>
                <Input
                  id="potassium"
                  name="potassium"
                  type="number"
                  value={formData.potassium}
                  onChange={handleInputChange}
                  step="10"
                  className="mt-1"
                />
              </div>

              {/* Crop Age */}
              <div>
                <Label htmlFor="cropAge">Days Since Planting</Label>
                <Input
                  id="cropAge"
                  name="cropAge"
                  type="number"
                  value={formData.cropAge}
                  onChange={handleInputChange}
                  step="1"
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Button onClick={handlePredict} disabled={loading} className="w-full" size="lg">
              {loading ? 'Generating Prediction...' : 'Generate Forecast'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {prediction && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Yield Forecast Results
              </CardTitle>
              <CardDescription>ML-generated prediction based on current conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Main Prediction */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Estimated Yield</p>
                <p className="text-4xl font-bold text-green-900 mt-1">{prediction.estimatedYield.toLocaleString()} kg/ha</p>
                <p className="text-sm text-green-800 mt-2">
                  <span className="font-semibold">Confidence:</span> {(prediction.confidence * 100).toFixed(0)}%
                </p>
              </div>

              {/* Yield Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900">Best Case</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">{prediction.bestCaseYield.toLocaleString()}</p>
                  <p className="text-xs text-blue-800">kg/ha</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-xs font-semibold text-orange-900">Worst Case</p>
                  <p className="text-xl font-bold text-orange-900 mt-1">{prediction.worstCaseYield.toLocaleString()}</p>
                  <p className="text-xs text-orange-800">kg/ha</p>
                </div>
              </div>

              {/* Key Factors */}
              <div>
                <p className="text-sm font-semibold mb-3">Key Influencing Factors</p>
                <div className="space-y-2">
                  {prediction.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{factor.name}</p>
                        <p className="text-xs text-muted-foreground">{factor.description}</p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          factor.impact > 0
                            ? 'bg-green-100 text-green-800'
                            : factor.impact < 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {prediction.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Recommendations</p>
                  <ul className="text-sm text-blue-900 space-y-1">
                    {prediction.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {prediction.riskFactors.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Factors
                  </p>
                  <ul className="text-sm text-red-900 space-y-1">
                    {prediction.riskFactors.map((risk, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-semibold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
