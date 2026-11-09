"use client"

import { useMemo, useRef, useState } from "react"
import type { Group } from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html, OrbitControls, Sparkles, Text } from "@react-three/drei"
import { ArrowLeft, Maximize2, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const featureLinks = [
  { title: "My Farms", subtitle: "Fields & locations", metric: "4 active fields", href: "/dashboard/farms", color: "#78b96a", position: [-4.4, 2.1, -2] as [number, number, number] },
  { title: "Crop Monitoring", subtitle: "Satellite health", metric: "NDVI layers", href: "/dashboard/crop-monitoring", color: "#e2ad55", position: [-1.5, 2.1, -2] as [number, number, number] },
  { title: "Weather", subtitle: "NASA observations", metric: "Live conditions", href: "/dashboard/weather", color: "#6eb6d4", position: [1.5, 2.1, -2] as [number, number, number] },
  { title: "Irrigation", subtitle: "Water planning", metric: "Next best action", href: "/dashboard/irrigation", color: "#5e9ed1", position: [4.4, 2.1, -2] as [number, number, number] },
  { title: "Phenology", subtitle: "Crop calendar", metric: "Growth stages", href: "/dashboard/phenology", color: "#d78982", position: [-2.8, -0.4, -2] as [number, number, number] },
  { title: "Alerts", subtitle: "Field signals", metric: "Priority signals", href: "/dashboard/alerts", color: "#e07c57", position: [0, -0.4, -2] as [number, number, number] },
  { title: "Field School", subtitle: "Learn & grow", metric: "Practical guidance", href: "/dashboard/field-school", color: "#af9bda", position: [2.8, -0.4, -2] as [number, number, number] },
]

function LinkPanel({ feature, onSelect }: { feature: typeof featureLinks[number]; onSelect: (feature: typeof featureLinks[number]) => void }) {
  const ref = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  useFrame(({ clock }) => { if (ref.current) { ref.current.position.y = feature.position[1] + Math.sin(clock.elapsedTime * 1.4 + feature.position[0]) * 0.045; ref.current.scale.lerp(hovered ? 1.06 : 1, 0.12) } })
  return <group ref={ref} position={feature.position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={(event) => { event.stopPropagation(); onSelect(feature) }}>
    <mesh><boxGeometry args={[2.25, 1.35, 0.12]} /><meshStandardMaterial color="#f8f4e8" roughness={0.72} /></mesh>
    <mesh position={[0, 0.46, 0.08]}><boxGeometry args={[2.25, 0.08, 0.03]} /><meshStandardMaterial color={feature.color} /></mesh>
    <Text position={[0, 0.12, 0.1]} fontSize={0.19} color="#294b35" anchorX="center" anchorY="middle" maxWidth={2}>{feature.title}</Text>
    <Text position={[0, -0.18, 0.1]} fontSize={0.11} color="#607267" anchorX="center" anchorY="middle" maxWidth={2}>{feature.subtitle}</Text>
    <Text position={[0, -0.36, 0.1]} fontSize={0.095} color="#294b35" anchorX="center" anchorY="middle" maxWidth={2}>{feature.metric}</Text>
    <Text position={[0, -0.56, 0.1]} fontSize={0.1} color={feature.color} anchorX="center" anchorY="middle">CLICK TO EXPLORE</Text>
    <mesh position={[0, 0, -0.08]}><boxGeometry args={[2.45, 1.55, 0.04]} /><meshStandardMaterial color={feature.color} transparent opacity={0.12} /></mesh>
  </group>
}

function Room({ onSelect }: { onSelect: (feature: typeof featureLinks[number]) => void }) {
  return <>
    <ambientLight intensity={1.8} />
    <directionalLight position={[3, 7, 4]} intensity={3} color="#fff4d7" castShadow />
    <pointLight position={[-4, 2, 2]} intensity={8} distance={12} color="#9dd493" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}><planeGeometry args={[18, 14]} /><meshStandardMaterial color="#c7d6b5" roughness={1} /></mesh>
    <mesh position={[0, 3.2, -3.4]}><boxGeometry args={[15, 7, 0.15]} /><meshStandardMaterial color="#e5eee0" roughness={1} /></mesh>
    <mesh position={[-7.4, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[7, 14]} /><meshStandardMaterial color="#d2e2ce" roughness={1} /></mesh>
    <mesh position={[7.4, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[7, 14]} /><meshStandardMaterial color="#d2e2ce" roughness={1} /></mesh>
    <Text position={[0, 3.55, -3.25]} fontSize={0.45} color="#294b35" anchorX="center">FARMPULSE FIELD ROOM</Text>
    <Text position={[0, 3.05, -3.25]} fontSize={0.16} color="#607267" anchorX="center">Explore your farm intelligence workspace</Text>
    <mesh position={[0, -1.85, -1.25]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5.8, 2.2]} /><meshStandardMaterial color="#78a95e" roughness={1} /></mesh>
    {[-2.1, -1.05, 0, 1.05, 2.1].map((x) => <mesh key={x} position={[x, -1.65, -1.25]} rotation={[0, 0, -0.18]}><boxGeometry args={[0.12, 0.6, 0.12]} /><meshStandardMaterial color="#3d713f" /></mesh>)}
    <mesh position={[0, 0.65, -1.1]}><sphereGeometry args={[0.42, 24, 16]} /><meshStandardMaterial color="#91c5de" emissive="#315d70" emissiveIntensity={0.25} transparent opacity={0.85} /></mesh>
    <Text position={[0, 0.08, -1.05]} fontSize={0.12} color="#294b35" anchorX="center">LIVE FIELD SIGNALS</Text>
    {featureLinks.map((feature) => <LinkPanel key={feature.href} feature={feature} onSelect={onSelect} />)}
    <Sparkles count={90} scale={[14, 6, 4]} size={2} speed={0.2} color="#dfeebf" />
  </>
}

export function FarmVRRoom() {
  const [selected, setSelected] = useState<typeof featureLinks[number] | null>(null)
  const [immersive, setImmersive] = useState(false)
  const camera = useMemo(() => ({ position: [0, 1.4, 9] as [number, number, number], fov: 48 }), [])
  const enterImmersive = async () => { const canvas = document.querySelector("canvas"); if (canvas?.requestFullscreen) await canvas.requestFullscreen(); setImmersive(true) }
  return <div className={cn("relative h-screen w-full overflow-hidden bg-[#dfead7]", immersive && "fixed inset-0 z-50")}>
    <Canvas shadows camera={camera} dpr={[1, 1.5]} gl={{ antialias: true }}>
      <color attach="background" args={["#dfead7"]} />
      <fog attach="fog" args={["#dfead7", 9, 20]} />
      <Room onSelect={setSelected} />
      <OrbitControls enablePan={false} minDistance={5} maxDistance={13} target={[0, 0.6, -1]} />
    </Canvas>
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-5"><div className="pointer-events-auto rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-lg backdrop-blur"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">Smart farming VR</p><p className="mt-1 text-sm text-slate-600">Drag to look around · Click a panel to navigate</p></div><div className="pointer-events-auto flex gap-2"><Button variant="secondary" size="icon" onClick={() => window.location.href = "/dashboard"} aria-label="Back to dashboard"><ArrowLeft className="size-4" /></Button><Button variant="secondary" size="icon" onClick={enterImmersive} aria-label="Enter immersive view"><Maximize2 className="size-4" /></Button></div></div>
    {selected && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 p-6 backdrop-blur-[2px]"><div className="w-full max-w-sm rounded-3xl border border-white/70 bg-[#f8f4e8] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Room waypoint</p><h2 className="mt-2 text-2xl font-semibold text-slate-900">{selected.title}</h2><p className="mt-1 text-sm text-slate-600">{selected.subtitle}</p></div><Button variant="ghost" size="icon" onClick={() => setSelected(null)} aria-label="Close feature dialog"><X className="size-4" /></Button></div><Button className="mt-6 w-full" onClick={() => window.location.href = selected.href}>Open {selected.title}</Button></div></div>}
    {immersive && <Button className="absolute bottom-5 left-1/2 -translate-x-1/2" onClick={() => { document.exitFullscreen?.(); setImmersive(false) }}><RotateCcw className="mr-2 size-4" />Exit immersive view</Button>}
  </div>
}
