"use client"

import { useState } from "react"
import Link from "next/link"
import { Activity, BrainCircuit, Camera, CloudSun, MapPin, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { YieldPredictionPanel } from "@/components/crop-intelligence/yield-prediction-panel"
import { DiseaseScreeningPanel } from "@/components/crop-intelligence/disease-screening-panel"
import { MicroclimateAdvisoryPanel } from "@/components/crop-intelligence/microclimate-advisory-panel"

export interface CropIntelligenceCrop {
  id: string
  name: string
  variety: string | null
  status: string
  planting_date: string | null
  expected_harvest_date: string | null
}

export interface CropIntelligenceFarm {
  id: string
  name: string
  location_name: string | null
  latitude: number | null
  longitude: number | null
  crops: CropIntelligenceCrop[]
}

interface CropIntelligenceWorkspaceProps {
  farms: CropIntelligenceFarm[]
}

export function CropIntelligenceWorkspace({ farms }: CropIntelligenceWorkspaceProps) {
  const [farmId, setFarmId] = useState(farms[0]?.id ?? "")
  const selectedFarm = farms.find((farm) => farm.id === farmId) ?? null
  const [cropId, setCropId] = useState(selectedFarm?.crops[0]?.id ?? "")
  const selectedCrop = selectedFarm?.crops.find((crop) => crop.id === cropId) ?? null

  const chooseFarm = (nextFarmId: string) => {
    setFarmId(nextFarmId)
    setCropId(farms.find((farm) => farm.id === nextFarmId)?.crops[0]?.id ?? "")
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1"><BrainCircuit className="size-3.5" /> Farm-calibrated ML</Badge>
            <Badge variant="outline" className="gap-1"><Activity className="size-3.5" /> AI decision support</Badge>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Turn field signals into next steps</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
            Yield estimates learn from your harvest history. Plant screening and crop-stage guidance use AI, with uncertainty made visible.
          </p>
        </div>
        {selectedFarm && (
          <div className="grid w-full gap-3 sm:grid-cols-2 md:max-w-md">
            <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="intelligence-farm">
              Farm
              <select id="intelligence-farm" value={farmId} onChange={(event) => chooseFarm(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="intelligence-crop">
              Crop
              <select id="intelligence-crop" value={cropId} onChange={(event) => setCropId(event.target.value)} disabled={!selectedFarm.crops.length} className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                {selectedFarm.crops.length ? selectedFarm.crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}{crop.variety ? ` · ${crop.variety}` : ""}</option>) : <option value="">No crops added</option>}
              </select>
            </label>
          </div>
        )}
      </section>

      {farms.length === 0 ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sprout className="size-5 text-primary" /> Add a farm to begin</CardTitle><CardDescription>Crop Intelligence needs a farm location and crop record to personalize results.</CardDescription></CardHeader>
          <CardContent><Button asChild><Link href="/dashboard/farms"><MapPin data-icon="inline-start" />Add a farm</Link></Button></CardContent>
        </Card>
      ) : !selectedFarm || !selectedCrop ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sprout className="size-5 text-primary" /> Add a crop to this farm</CardTitle><CardDescription>Create a crop record to enable yield modeling, disease screening, and crop-stage advisories.</CardDescription></CardHeader>
          <CardContent><Button asChild variant="outline"><Link href="/dashboard/farms"><MapPin data-icon="inline-start" />Open My Farms</Link></Button></CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-primary/20 bg-primary/[0.035]">
            <CardContent className="flex flex-col gap-2 p-4 text-sm md:flex-row md:items-center md:justify-between md:p-5">
              <div className="flex items-start gap-3">
                <CloudSun className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Know the limits.</span> Yield predictions require at least 3 comparable harvest records. NASA POWER observations are coordinate-scale and typically lag by 1–2 days; they are not an on-farm sensor or forecast.</p>
              </div>
              <Badge variant="outline" className="w-fit shrink-0">{selectedFarm.location_name || selectedFarm.name}</Badge>
            </CardContent>
          </Card>

          <Tabs defaultValue="yield" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl p-1">
              <TabsTrigger value="yield" className="gap-2 py-2.5"><Sprout className="size-4" /><span className="hidden sm:inline">Yield model</span><span className="sm:hidden">Yield</span></TabsTrigger>
              <TabsTrigger value="disease" className="gap-2 py-2.5"><Camera className="size-4" /><span className="hidden sm:inline">Plant screening</span><span className="sm:hidden">Disease</span></TabsTrigger>
              <TabsTrigger value="advisory" className="gap-2 py-2.5"><CloudSun className="size-4" /><span className="hidden sm:inline">Microclimate</span><span className="sm:hidden">Advisory</span></TabsTrigger>
            </TabsList>
            <TabsContent value="yield" className="mt-5"><YieldPredictionPanel key={`${selectedFarm.id}:${selectedCrop.id}`} farm={selectedFarm} crop={selectedCrop} /></TabsContent>
            <TabsContent value="disease" className="mt-5"><DiseaseScreeningPanel key={`${selectedFarm.id}:${selectedCrop.id}`} farm={selectedFarm} crop={selectedCrop} /></TabsContent>
            <TabsContent value="advisory" className="mt-5"><MicroclimateAdvisoryPanel key={`${selectedFarm.id}:${selectedCrop.id}`} farm={selectedFarm} crop={selectedCrop} /></TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
