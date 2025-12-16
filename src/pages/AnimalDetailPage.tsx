import { useEffect, useMemo, useState } from "react"
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

// --- helpers (compatibility) ---
function aspectRatio(width: number, height: number) {
  return width / height
}

// Simple tolerance-based matching (good enough for exam; you can tighten later)
function isCompatible(animalAR: number, frameAR: number) {
  const tolerance = 0.25 // forgiving on purpose
  return Math.abs(animalAR - frameAR) <= tolerance
}

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

  // Step 3.2 UI choices
  const [withMat, setWithMat] = useState(true)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

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

  // Step 3.2: Compute compatible frames
  const compatibleFrames = useMemo(() => {
    if (!animal) return []

    return frameSpecs.filter((spec) => {
      // choose opening based on mat/no-mat
      let w = withMat ? spec.matOpeningWidthCm : spec.imageAreaWidthCm
      let h = withMat ? spec.matOpeningHeightCm : spec.imageAreaHeightCm

      // rotate if landscape
      if (orientation === "landscape") {
        ;[w, h] = [h, w]
      }

      const frameAR = aspectRatio(w, h)
      return isCompatible(animal.imageAspectRatio, frameAR)
    })
  }, [animal, frameSpecs, withMat, orientation])

  // EARLY RETURNS (must be after hooks)
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

      {/* Step 3.2 UI */}
      <div style={{ marginTop: 24, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Frame options</h2>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={withMat}
            onChange={(e) => setWithMat(e.target.checked)}
          />
          With mat
        </label>

        <div style={{ marginTop: 8 }}>
          <label style={{ marginRight: 12 }}>
            <input
              type="radio"
              checked={orientation === "portrait"}
              onChange={() => setOrientation("portrait")}
            />{" "}
            Portrait
          </label>

          <label>
            <input
              type="radio"
              checked={orientation === "landscape"}
              onChange={() => setOrientation("landscape")}
            />{" "}
            Landscape
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Compatible frames:</strong>
          {compatibleFrames.length === 0 ? (
            <p style={{ marginTop: 8 }}>No compatible frames for this configuration.</p>
          ) : (
            <ul style={{ marginTop: 8 }}>
              {compatibleFrames.map((f) => (
                <li key={f.id}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* DEBUG: confirms frame data loads */}
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