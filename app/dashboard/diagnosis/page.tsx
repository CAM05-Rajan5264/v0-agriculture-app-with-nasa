import { Header } from "@/components/dashboard/header"
import { PlantDiagnosis } from "@/components/diagnosis/plant-diagnosis"

export default async function DiagnosisPage() {
  return (
    <div className="flex flex-col">
      <Header title="Plant Diagnosis" />
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">AI Plant Health Analyzer</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Identify diseases, pests, and nutrient issues in seconds
            </p>
          </div>
        </div>
        <PlantDiagnosis />
      </div>
    </div>
  )
}
