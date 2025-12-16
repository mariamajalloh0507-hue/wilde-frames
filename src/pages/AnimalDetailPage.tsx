import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  fetchAnimalById,
  fetchFrameMaterials,
  fetchFramePricing,
  fetchFrameSpecs,
  type ApiAnimal,
  type ApiFrameMaterial,
  type ApiFramePricing,
  type ApiFrameSpec,
  type Lang,
} from "../api/wildeApi"

export default function AnimalDetailPage({ lang }: { lang: Lang }) {
  const { id } = useParams()

  // Animal
  const [animal, setAnimal] = useState<ApiAnimal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Frames data
  const [frameSpecs, setFrameSpecs] = useState<ApiFrameSpec[]>([])
  const [materials, setMaterials] = useState<ApiFrameMaterial[]>([])
  const [pricing, setPricing] = useState<ApiFramePricing[]>([])
  const [frameLoading, setFrameLoading] = useState(true)
  const [frameError, setFrameError] = useState<string | null>(null)

  // 1) Fetch animal by id
  useEffect(() => {
    if (!id) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchAnimalById(lang, id)
      .then((data) => {
        if (cancelled) return
        setAnimal(data)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Unknown error")
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [lang, id])

  // 2) Fetch frame specs + materials + pricing
  useEffect(() => {
    let cancelled = false
    setFrameLoading(true)
    setFrameError(null)

    Promise.all([fetchFrameSpecs(lang), fetchFrameMaterials(lang), fetchFramePricing()])
      .then(([specs, mats, prices]) => {
        if (cancelled) return
        setFrameSpecs(specs)
        setMaterials(mats)
        setPricing(prices)
      })
      .catch((e) => {
        if (cancelled) return
        setFrameError(e instanceof Error ? e.message : "Unknown frame error")
      })
      .finally(() => {
        if (cancelled) return
        setFrameLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [lang])

  // EARLY RETURNS (these must be AFTER the hooks)
  if (loading) return <main style={{ padding: 16 }}>Loading animal…</main>
  if (error) return <main style={{ padding: 16 }}>Error: {error}</main>
  if (!animal) return <main style={{ padding: 16 }}>Not found.</main>

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <Link to="/">← Back to gallery</Link>

      <h1 style={{ marginTop: 12 }}>{animal.name}</h1>
      <p style={{ color: "#4b5563" }}>{animal.description}</p>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <div>
          <strong>Category:</strong> {animal.category}
        </div>
        <div>
          <strong>Aspect Ratio:</strong> {animal.imageAspectRatio}
        </div>
        <div>
          <strong>Wiki:</strong>{" "}
          <a href={animal.wikiUrl} target="_blank" rel="noreferrer">
            {animal.wikiUrl}
          </a>
        </div>
      </div>

      {/* DEBUG BLOCK: confirms frame data loads */}
      <div style={{ marginTop: 16, padding: 12, border: "1px dashed #999", borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Loaded frame data</h2>
        {frameLoading && <div>Loading frame data…</div>}
        {frameError && <div style={{ color: "crimson" }}>Frame error: {frameError}</div>}
        <div>Frame specs: {frameSpecs.length}</div>
        <div>Materials: {materials.length}</div>
        <div>Pricing rows: {pricing.length}</div>
      </div>
    </main>
  )
}