import { Header } from "@/components/dashboard/header"
import { RecordsManager } from "@/components/records/records-manager"

export default async function RecordsPage() {
  return (
    <div className="flex flex-col">
      <Header title="Farm Records" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Digital Farm Records</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Track irrigation, pesticides, fertilizers, harvest, costs, and maintenance
            </p>
          </div>
        </div>
        <RecordsManager />
      </div>
    </div>
  )
}
