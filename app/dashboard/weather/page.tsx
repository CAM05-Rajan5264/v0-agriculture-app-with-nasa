import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { WeatherCard } from "@/components/dashboard/weather-card"
import { WeatherHistoryCard } from "@/components/weather/weather-history-card"
import { WeatherForecastCard } from "@/components/weather/weather-forecast-card"
import { getWeatherData, getWeatherHistory, getWeatherForecast } from "@/lib/nasa-api"
import { Cloud, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function WeatherPage() {
  const supabase = await createClient()

  const { data: farms } = await supabase.from("farms").select("*").order("created_at", { ascending: false })
  const { count: unreadAlerts } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  const weatherData = await Promise.all(
    (farms || []).map(async (farm) => ({
      farm,
      weather: await getWeatherData(farm.latitude, farm.longitude),
      history: await getWeatherHistory(farm.latitude, farm.longitude, 14),
      forecast: await getWeatherForecast(farm.latitude, farm.longitude),
    })),
  )

  return (
    <div className="flex flex-col">
      <Header title="Weather" unreadAlerts={unreadAlerts || 0} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Weather Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time weather data, 14-day history, and 7-day forecast from NASA POWER
          </p>
        </div>

        {farms && farms.length > 0 ? (
          <div className="space-y-8">
            {weatherData.map(({ farm, weather, history, forecast }) => (
              <div key={farm.id} className="space-y-4">
                {/* Current Weather */}
                <WeatherCard weather={weather} locationName={farm.location_name} />

                {/* 7-Day Forecast */}
                <WeatherForecastCard forecast={forecast} farmName={farm.name} />

                {/* 14-Day History */}
                <WeatherHistoryCard history={history} farmName={farm.name} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Cloud className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No farms to monitor</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Add a farm to start viewing weather data from NASA.
            </p>
            <Button asChild>
              <Link href="/dashboard/farms">
                <MapPin className="mr-2 h-4 w-4" />
                Add Farm
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
