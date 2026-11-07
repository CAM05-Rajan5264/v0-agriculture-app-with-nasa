import Image from "next/image"

const cropImages: Record<string, { src: string; alt: string }> = {
  wheat: { src: "/images/crops/wheat-cutout.png", alt: "Golden wheat ears" },
  rice: { src: "/images/crops/rice-cutout.png", alt: "Green rice panicle and leaves" },
  paddy: { src: "/images/crops/rice-cutout.png", alt: "Green rice panicle and leaves" },
  maize: { src: "/images/crops/maize-cutout.png", alt: "Maize plant with a corn ear" },
  corn: { src: "/images/crops/maize-cutout.png", alt: "Maize plant with a corn ear" },
  cotton: { src: "/images/crops/cotton-cutout.png", alt: "Cotton branch with white bolls" },
  chickpea: { src: "/images/crops/pulses-cutout.png", alt: "Chickpea plant with pods" },
  pulse: { src: "/images/crops/pulses-cutout.png", alt: "Pulse plant with pods" },
  soybean: { src: "/images/crops/soybean-cutout.png", alt: "Soybean plant with pods" },
  mustard: { src: "/images/crops/mustard-cutout.png", alt: "Mustard plant with yellow flowers" },
  groundnut: { src: "/images/crops/groundnut-cutout.png", alt: "Groundnut plant with peanuts" },
  turmeric: { src: "/images/crops/turmeric-cutout.png", alt: "Fresh turmeric rhizomes" },
  vegetable: { src: "/images/crops/vegetables-cutout.png", alt: "Vegetable plants" },
  tomato: { src: "/images/crops/vegetables-cutout.png", alt: "Tomato plant with red fruit" },
  onion: { src: "/images/crops/onion-cutout.png", alt: "Red onion bulb with leaves" },
  potato: { src: "/images/crops/potato-cutout.png", alt: "Potatoes with plant leaves" },
}

export function getCropImage(cropName: string) {
  const normalized = cropName.toLowerCase()
  const key = Object.keys(cropImages).find((name) => normalized.includes(name))
  return cropImages[key ?? "vegetable"]
}

export function CropImage({ cropName, className = "", priority = false }: { cropName: string; className?: string; priority?: boolean }) {
  const image = getCropImage(cropName)
  return <Image src={image.src} alt={image.alt} width={640} height={240} priority={priority} className={`object-contain drop-shadow-[0_10px_14px_rgba(49,83,54,0.16)] ${className}`} />
}
