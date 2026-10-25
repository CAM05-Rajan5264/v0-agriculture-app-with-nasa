import Image from "next/image"

const cropImages: Record<string, { src: string; alt: string }> = {
  wheat: { src: "/images/crops/wheat.png", alt: "Golden wheat crop in a field" },
  rice: { src: "/images/crops/rice.png", alt: "Green rice paddy crop" },
  paddy: { src: "/images/crops/rice.png", alt: "Green rice paddy crop" },
  maize: { src: "/images/crops/maize.png", alt: "Healthy maize plants with corn ears" },
  corn: { src: "/images/crops/maize.png", alt: "Healthy maize plants with corn ears" },
  cotton: { src: "/images/crops/cotton.png", alt: "Cotton bolls growing in a field" },
  chickpea: { src: "/images/crops/pulses.png", alt: "Chickpea pulse plants" },
  pulse: { src: "/images/crops/pulses.png", alt: "Pulse crop plants" },
  soybean: { src: "/images/crops/pulses.png", alt: "Soybean crop plants" },
  vegetable: { src: "/images/crops/vegetables.png", alt: "Rows of healthy vegetable crops" },
  tomato: { src: "/images/crops/vegetables.png", alt: "Tomato and vegetable crops" },
}

export function getCropImage(cropName: string) {
  const normalized = cropName.toLowerCase()
  const key = Object.keys(cropImages).find((name) => normalized.includes(name))
  return cropImages[key ?? "vegetable"]
}

export function CropImage({ cropName, className = "", priority = false }: { cropName: string; className?: string; priority?: boolean }) {
  const image = getCropImage(cropName)
  return <Image src={image.src} alt={image.alt} width={640} height={240} priority={priority} className={`object-cover ${className}`} />
}
