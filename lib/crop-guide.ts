import type { NASAWeatherData } from "./types"

export interface CropGuide {
  id: string
  name: string
  category: "grain" | "vegetable" | "fruit" | "legume" | "oilseed" | "fiber"
  description: string
  optimalConditions: {
    soilTempMin: number
    soilTempMax: number
    airTempMin: number
    airTempMax: number
    humidityMin: number
    humidityMax: number
    rainfallMin: number // mm per month
    rainfallMax: number
  }
  sowingSeasons: {
    hemisphere: "northern" | "southern" | "both"
    months: number[] // 1-12
    description: string
  }[]
  growthDuration: {
    minDays: number
    maxDays: number
    stages: {
      name: string
      durationDays: number
      description: string
      tips: string[]
    }[]
  }
  harvestIndicators: string[]
  companions: string[]
  avoid: string[]
  waterNeeds: "low" | "moderate" | "high"
  sunNeeds: "full" | "partial" | "shade"
}

export const CROP_GUIDES: CropGuide[] = [
  {
    id: "wheat",
    name: "Wheat",
    category: "grain",
    description: "A staple cereal grain widely cultivated for its seed. Adaptable to various climates.",
    optimalConditions: {
      soilTempMin: 4,
      soilTempMax: 25,
      airTempMin: 10,
      airTempMax: 24,
      humidityMin: 40,
      humidityMax: 70,
      rainfallMin: 25,
      rainfallMax: 100,
    },
    sowingSeasons: [
      { hemisphere: "northern", months: [9, 10, 11], description: "Fall sowing (Winter Wheat)" },
      { hemisphere: "northern", months: [3, 4, 5], description: "Spring sowing (Spring Wheat)" },
      { hemisphere: "southern", months: [5, 6, 7], description: "Autumn sowing" },
    ],
    growthDuration: {
      minDays: 100,
      maxDays: 150,
      stages: [
        {
          name: "Germination",
          durationDays: 10,
          description: "Seed absorbs water and sprouts",
          tips: ["Maintain consistent moisture", "Soil temp should be 4-10°C"],
        },
        {
          name: "Tillering",
          durationDays: 30,
          description: "Plant develops multiple shoots",
          tips: ["Apply nitrogen fertilizer", "Control weeds early"],
        },
        {
          name: "Stem Extension",
          durationDays: 25,
          description: "Stems elongate rapidly",
          tips: ["Monitor for lodging risk", "Scout for diseases"],
        },
        {
          name: "Heading",
          durationDays: 15,
          description: "Grain head emerges",
          tips: ["Critical water period", "Watch for aphids"],
        },
        {
          name: "Grain Fill",
          durationDays: 30,
          description: "Kernels develop and mature",
          tips: ["Maintain irrigation", "Monitor for rust"],
        },
        {
          name: "Maturity",
          durationDays: 20,
          description: "Grain dries and hardens",
          tips: ["Test moisture content", "Prepare harvest equipment"],
        },
      ],
    },
    harvestIndicators: [
      "Grain moisture below 14%",
      "Straw turns golden yellow",
      "Kernels hard and can't be dented with fingernail",
    ],
    companions: ["Clover", "Legumes", "Sunflowers"],
    avoid: ["Other cereals in rotation", "Areas with grass weed pressure"],
    waterNeeds: "moderate",
    sunNeeds: "full",
  },
  {
    id: "corn",
    name: "Corn (Maize)",
    category: "grain",
    description: "A warm-season cereal crop. Requires warm soil and frost-free growing season.",
    optimalConditions: {
      soilTempMin: 10,
      soilTempMax: 35,
      airTempMin: 18,
      airTempMax: 32,
      humidityMin: 50,
      humidityMax: 80,
      rainfallMin: 50,
      rainfallMax: 200,
    },
    sowingSeasons: [
      { hemisphere: "northern", months: [4, 5, 6], description: "Spring planting after last frost" },
      { hemisphere: "southern", months: [10, 11, 12], description: "Late spring planting" },
    ],
    growthDuration: {
      minDays: 90,
      maxDays: 120,
      stages: [
        {
          name: "Emergence",
          durationDays: 10,
          description: "Seedling breaks soil surface",
          tips: ["Check stand count", "Replant thin areas"],
        },
        {
          name: "V6 Stage",
          durationDays: 25,
          description: "Six leaves fully emerged",
          tips: ["Side-dress nitrogen", "Cultivate for weeds"],
        },
        {
          name: "Tasseling",
          durationDays: 15,
          description: "Tassel emerges from whorl",
          tips: ["Critical water stage", "No stress allowed"],
        },
        {
          name: "Silking",
          durationDays: 10,
          description: "Silks emerge for pollination",
          tips: ["Ensure pollination success", "Scout for ear worms"],
        },
        {
          name: "Grain Fill",
          durationDays: 40,
          description: "Kernels fill with starch",
          tips: ["Maintain consistent moisture", "Monitor for stalk rot"],
        },
        {
          name: "Maturity",
          durationDays: 20,
          description: "Black layer forms",
          tips: ["Test moisture regularly", "Time harvest carefully"],
        },
      ],
    },
    harvestIndicators: [
      "Black layer formed at kernel base",
      "Grain moisture 20-25% for grain corn",
      "Husks dry and brown",
    ],
    companions: ["Beans", "Squash", "Pumpkins"],
    avoid: ["Following corn (rotate)", "Waterlogged soils"],
    waterNeeds: "high",
    sunNeeds: "full",
  },
  {
    id: "rice",
    name: "Rice",
    category: "grain",
    description: "A semi-aquatic grain crop. Requires warm temperatures and abundant water.",
    optimalConditions: {
      soilTempMin: 20,
      soilTempMax: 38,
      airTempMin: 22,
      airTempMax: 35,
      humidityMin: 70,
      humidityMax: 90,
      rainfallMin: 100,
      rainfallMax: 300,
    },
    sowingSeasons: [
      { hemisphere: "northern", months: [4, 5, 6], description: "Monsoon/wet season planting" },
      { hemisphere: "southern", months: [10, 11, 12], description: "Summer planting" },
    ],
    growthDuration: {
      minDays: 100,
      maxDays: 150,
      stages: [
        {
          name: "Seedling",
          durationDays: 20,
          description: "Transplant or direct seed establishment",
          tips: ["Maintain water level 2-5cm", "Control weeds early"],
        },
        {
          name: "Tillering",
          durationDays: 30,
          description: "Multiple stems develop",
          tips: ["Apply nitrogen", "Manage water depth"],
        },
        {
          name: "Panicle Initiation",
          durationDays: 25,
          description: "Flower head begins forming",
          tips: ["Critical nutrition stage", "Drain briefly then reflood"],
        },
        {
          name: "Heading",
          durationDays: 15,
          description: "Panicle emerges",
          tips: ["Maintain shallow flooding", "Watch for blast disease"],
        },
        {
          name: "Grain Fill",
          durationDays: 25,
          description: "Grains develop and fill",
          tips: ["Gradually reduce water", "Scout for pests"],
        },
        {
          name: "Maturity",
          durationDays: 15,
          description: "Grains ripen",
          tips: ["Drain field before harvest", "Check moisture content"],
        },
      ],
    },
    harvestIndicators: ["Panicles bend with grain weight", "80% of grains turn golden", "Moisture content 20-24%"],
    companions: ["Fish (in paddies)", "Ducks", "Azolla"],
    avoid: ["Saline soils", "Areas with poor water control"],
    waterNeeds: "high",
    sunNeeds: "full",
  },
  {
    id: "soybeans",
    name: "Soybeans",
    category: "legume",
    description: "A nitrogen-fixing legume. Excellent for crop rotation and soil health.",
    optimalConditions: {
      soilTempMin: 10,
      soilTempMax: 30,
      airTempMin: 15,
      airTempMax: 30,
      humidityMin: 50,
      humidityMax: 80,
      rainfallMin: 45,
      rainfallMax: 150,
    },
    sowingSeasons: [
      { hemisphere: "northern", months: [5, 6], description: "Late spring after soil warms" },
      { hemisphere: "southern", months: [11, 12], description: "Early summer planting" },
    ],
    growthDuration: {
      minDays: 80,
      maxDays: 120,
      stages: [
        {
          name: "Emergence",
          durationDays: 10,
          description: "Cotyledons emerge",
          tips: ["Ensure good seed-soil contact", "Watch for crusting"],
        },
        {
          name: "Vegetative",
          durationDays: 35,
          description: "Leaf and stem growth",
          tips: ["Scout for defoliators", "Manage weeds"],
        },
        {
          name: "Flowering",
          durationDays: 20,
          description: "Flowers appear",
          tips: ["Critical water period", "No stress tolerance"],
        },
        {
          name: "Pod Development",
          durationDays: 25,
          description: "Pods form and fill",
          tips: ["Maintain moisture", "Watch for pod feeders"],
        },
        {
          name: "Maturity",
          durationDays: 15,
          description: "Seeds mature and dry",
          tips: ["Allow natural dry down", "Test moisture before harvest"],
        },
      ],
    },
    harvestIndicators: ["Leaves have dropped", "Pods rattle when shaken", "Seed moisture below 13%"],
    companions: ["Corn (in rotation)", "Wheat", "Cover crops"],
    avoid: ["Consecutive soybean years", "Fields with soybean cyst nematode"],
    waterNeeds: "moderate",
    sunNeeds: "full",
  },
  {
    id: "cotton",
    name: "Cotton",
    category: "fiber",
    description: "A warm-season fiber crop requiring a long frost-free period.",
    optimalConditions: {
      soilTempMin: 18,
      soilTempMax: 35,
      airTempMin: 20,
      airTempMax: 35,
      humidityMin: 40,
      humidityMax: 65,
      rainfallMin: 50,
      rainfallMax: 150,
    },
    sowingSeasons: [
      { hemisphere: "northern", months: [4, 5], description: "Spring planting when soil warm" },
      { hemisphere: "southern", months: [10, 11], description: "Late spring planting" },
    ],
    growthDuration: {
      minDays: 150,
      maxDays: 180,
      stages: [
        {
          name: "Emergence",
          durationDays: 12,
          description: "Seedling establishment",
          tips: ["Ensure warm soil", "Watch for thrips"],
        },
        {
          name: "Squaring",
          durationDays: 35,
          description: "Flower buds form",
          tips: ["Begin scouting", "Manage nitrogen carefully"],
        },
        {
          name: "Flowering",
          durationDays: 45,
          description: "Blooms appear",
          tips: ["Peak water demand", "Scout for bollworms"],
        },
        {
          name: "Boll Development",
          durationDays: 50,
          description: "Bolls mature",
          tips: ["Apply defoliants at proper time", "Monitor boll rot"],
        },
        {
          name: "Harvest",
          durationDays: 20,
          description: "Open bolls ready",
          tips: ["Apply harvest aids", "Time picking carefully"],
        },
      ],
    },
    harvestIndicators: ["60% of bolls open", "Leaves defoliated", "Fiber is fluffy white"],
    companions: ["Peanuts (in rotation)", "Corn", "Sorghum"],
    avoid: ["Continuous cotton", "Areas with high disease pressure"],
    waterNeeds: "moderate",
    sunNeeds: "full",
  },
  {
    id: "potatoes",
    name: "Potatoes",
    category: "vegetable",
    description: "A cool-season root crop. Grows best in loose, well-drained soil.",
    optimalConditions: {
      soilTempMin: 7,
      soilTempMax: 24,
      airTempMin: 15,
      airTempMax: 22,
      humidityMin: 60,
      humidityMax: 80,
      rainfallMin: 50,
      rainfallMax: 125,
    },
    sowingSeasons: [
      { hemisphere: "northern", months: [3, 4, 5], description: "Early spring, 2-4 weeks before last frost" },
      { hemisphere: "southern", months: [8, 9, 10], description: "Late winter to early spring" },
    ],
    growthDuration: {
      minDays: 70,
      maxDays: 120,
      stages: [
        {
          name: "Sprouting",
          durationDays: 15,
          description: "Eyes sprout and emerge",
          tips: ["Plant 4 inches deep", "Keep soil moist"],
        },
        {
          name: "Vegetative",
          durationDays: 30,
          description: "Foliage develops",
          tips: ["Hill soil around stems", "Begin regular watering"],
        },
        {
          name: "Tuber Initiation",
          durationDays: 15,
          description: "Tubers begin forming",
          tips: ["Critical water period", "Avoid high nitrogen"],
        },
        {
          name: "Tuber Bulking",
          durationDays: 30,
          description: "Tubers enlarge",
          tips: ["Consistent moisture vital", "Scout for blight"],
        },
        {
          name: "Maturation",
          durationDays: 20,
          description: "Vines die, skins set",
          tips: ["Stop watering", "Allow skin to toughen"],
        },
      ],
    },
    harvestIndicators: ["Vines have died back", "Skin doesn't rub off easily", "Tubers reach desired size"],
    companions: ["Beans", "Corn", "Cabbage"],
    avoid: ["Tomatoes", "Eggplant", "Peppers (same family)"],
    waterNeeds: "moderate",
    sunNeeds: "full",
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    category: "vegetable",
    description: "A warm-season fruit crop. Requires warm temperatures and consistent care.",
    optimalConditions: {
      soilTempMin: 15,
      soilTempMax: 30,
      airTempMin: 18,
      airTempMax: 29,
      humidityMin: 50,
      humidityMax: 70,
      rainfallMin: 25,
      rainfallMax: 75,
    },
    sowingSeasons: [
      { hemisphere: "northern", months: [3, 4, 5], description: "Start indoors 6-8 weeks before transplant" },
      { hemisphere: "southern", months: [9, 10, 11], description: "Spring planting" },
    ],
    growthDuration: {
      minDays: 60,
      maxDays: 100,
      stages: [
        {
          name: "Seedling",
          durationDays: 20,
          description: "Indoor start phase",
          tips: ["Provide 14-16 hours light", "Keep warm"],
        },
        {
          name: "Transplant",
          durationDays: 14,
          description: "Hardening and planting out",
          tips: ["Harden off gradually", "Plant deep"],
        },
        { name: "Vegetative", durationDays: 25, description: "Vine growth", tips: ["Stake or cage", "Remove suckers"] },
        {
          name: "Flowering",
          durationDays: 15,
          description: "Blossoms appear",
          tips: ["Ensure pollination", "Consistent watering"],
        },
        {
          name: "Fruiting",
          durationDays: 35,
          description: "Fruit develops and ripens",
          tips: ["Reduce watering slightly", "Watch for blossom end rot"],
        },
      ],
    },
    harvestIndicators: ["Fruit is fully colored", "Slightly soft when pressed", "Easily separates from vine"],
    companions: ["Basil", "Carrots", "Onions"],
    avoid: ["Brassicas", "Fennel", "Potatoes nearby"],
    waterNeeds: "moderate",
    sunNeeds: "full",
  },
  {
    id: "sunflower",
    name: "Sunflower",
    category: "oilseed",
    description: "A drought-tolerant oilseed crop with deep taproot system.",
    optimalConditions: {
      soilTempMin: 10,
      soilTempMax: 30,
      airTempMin: 18,
      airTempMax: 30,
      humidityMin: 35,
      humidityMax: 65,
      rainfallMin: 30,
      rainfallMax: 100,
    },
    sowingSeasons: [
      { hemisphere: "northern", months: [4, 5, 6], description: "After last frost" },
      { hemisphere: "southern", months: [10, 11, 12], description: "Late spring" },
    ],
    growthDuration: {
      minDays: 70,
      maxDays: 100,
      stages: [
        {
          name: "Emergence",
          durationDays: 10,
          description: "Seedling establishment",
          tips: ["Plant 1-2 inches deep", "Watch for birds"],
        },
        {
          name: "Vegetative",
          durationDays: 30,
          description: "Leaf development",
          tips: ["Control weeds early", "Side-dress nitrogen"],
        },
        {
          name: "Budding",
          durationDays: 15,
          description: "Head forms",
          tips: ["Critical water period", "Scout for head moth"],
        },
        {
          name: "Flowering",
          durationDays: 15,
          description: "Ray flowers open",
          tips: ["Bee activity important", "Watch for diseases"],
        },
        {
          name: "Maturity",
          durationDays: 25,
          description: "Seeds develop and dry",
          tips: ["Monitor for birds", "Check moisture for harvest"],
        },
      ],
    },
    harvestIndicators: ["Back of head turns brown", "Seeds are black/striped", "Moisture below 10%"],
    companions: ["Corn", "Cucumbers", "Squash"],
    avoid: ["Other sunflowers in rotation", "Areas with sclerotinia history"],
    waterNeeds: "low",
    sunNeeds: "full",
  },
]

export function getCropGuide(cropName: string): CropGuide | undefined {
  return CROP_GUIDES.find(
    (guide) => guide.name.toLowerCase().includes(cropName.toLowerCase()) || guide.id === cropName.toLowerCase(),
  )
}

export function getSowingRecommendation(
  cropGuide: CropGuide,
  weather: NASAWeatherData,
  latitude: number,
): {
  canSowNow: boolean
  suitability: "excellent" | "good" | "moderate" | "poor" | "not_recommended"
  reasons: string[]
  bestMonths: string[]
  nextWindow: string
} {
  const currentMonth = new Date().getMonth() + 1
  const isNorthernHemisphere = latitude >= 0
  const hemisphere = isNorthernHemisphere ? "northern" : "southern"

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Find applicable sowing seasons
  const applicableSeasons = cropGuide.sowingSeasons.filter(
    (s) => s.hemisphere === hemisphere || s.hemisphere === "both",
  )

  const sowingMonths = applicableSeasons.flatMap((s) => s.months)
  const isInSowingWindow = sowingMonths.includes(currentMonth)

  const bestMonths = [...new Set(sowingMonths)].sort((a, b) => a - b).map((m) => monthNames[m - 1])

  // Find next sowing window
  let nextWindow = "Now"
  if (!isInSowingWindow) {
    const futureMonths = sowingMonths.filter((m) => m > currentMonth)
    const nextMonth = futureMonths.length > 0 ? Math.min(...futureMonths) : Math.min(...sowingMonths)
    nextWindow = monthNames[nextMonth - 1]
  }

  // Check weather conditions
  const reasons: string[] = []
  let score = 0
  const maxScore = 5

  // Temperature check
  if (
    weather.temperature >= cropGuide.optimalConditions.airTempMin &&
    weather.temperature <= cropGuide.optimalConditions.airTempMax
  ) {
    score++
    reasons.push(`Temperature ${weather.temperature.toFixed(1)}°C is within optimal range`)
  } else if (weather.temperature < cropGuide.optimalConditions.airTempMin) {
    reasons.push(
      `Temperature ${weather.temperature.toFixed(1)}°C is below optimal (min ${cropGuide.optimalConditions.airTempMin}°C)`,
    )
  } else {
    reasons.push(
      `Temperature ${weather.temperature.toFixed(1)}°C is above optimal (max ${cropGuide.optimalConditions.airTempMax}°C)`,
    )
  }

  // Humidity check
  if (
    weather.humidity >= cropGuide.optimalConditions.humidityMin &&
    weather.humidity <= cropGuide.optimalConditions.humidityMax
  ) {
    score++
    reasons.push(`Humidity ${weather.humidity.toFixed(0)}% is suitable`)
  } else {
    reasons.push(
      `Humidity ${weather.humidity.toFixed(0)}% is outside optimal range (${cropGuide.optimalConditions.humidityMin}-${cropGuide.optimalConditions.humidityMax}%)`,
    )
  }

  // Rainfall check (daily to monthly estimate)
  const monthlyRainfallEstimate = weather.precipitation * 30
  if (
    monthlyRainfallEstimate >= cropGuide.optimalConditions.rainfallMin &&
    monthlyRainfallEstimate <= cropGuide.optimalConditions.rainfallMax
  ) {
    score++
    reasons.push(`Expected rainfall is adequate for establishment`)
  } else if (monthlyRainfallEstimate < cropGuide.optimalConditions.rainfallMin) {
    reasons.push(`Low rainfall expected - irrigation may be needed`)
  } else {
    reasons.push(`High rainfall may affect germination and establishment`)
  }

  // Season check
  if (isInSowingWindow) {
    score += 2
    reasons.push(`Current month is within optimal sowing window`)
  } else {
    reasons.push(`Current month is outside typical sowing window`)
  }

  // Determine suitability
  let suitability: "excellent" | "good" | "moderate" | "poor" | "not_recommended"
  if (score >= 4) {
    suitability = "excellent"
  } else if (score >= 3) {
    suitability = "good"
  } else if (score >= 2) {
    suitability = "moderate"
  } else if (score >= 1) {
    suitability = "poor"
  } else {
    suitability = "not_recommended"
  }

  return {
    canSowNow: suitability === "excellent" || suitability === "good",
    suitability,
    reasons,
    bestMonths,
    nextWindow,
  }
}

export function calculateHarvestDate(
  plantingDate: string,
  cropGuide: CropGuide,
): { minDate: Date; maxDate: Date; avgDate: Date } {
  const planted = new Date(plantingDate)
  const minDate = new Date(planted)
  minDate.setDate(minDate.getDate() + cropGuide.growthDuration.minDays)

  const maxDate = new Date(planted)
  maxDate.setDate(maxDate.getDate() + cropGuide.growthDuration.maxDays)

  const avgDays = Math.floor((cropGuide.growthDuration.minDays + cropGuide.growthDuration.maxDays) / 2)
  const avgDate = new Date(planted)
  avgDate.setDate(avgDate.getDate() + avgDays)

  return { minDate, maxDate, avgDate }
}
