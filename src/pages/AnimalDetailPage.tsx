import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  addFrameToCart,
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


  // Step 3.2 UI choices
  const [withMat, setWithMat] = useState(true)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  // Step 3.3 selection + add-to-cart
  const [selectedFrameId, setSelectedFrameId] = useState<string>("")
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

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


    Promise.all([fetchFrameSpecs(lang), fetchFrameMaterials(lang), fetchFramePricing()])
      .then(([specs, mats, prices]) => {
        if (cancelled) return
        setFrameSpecs(specs)
        setMaterials(mats)
        setPricing(prices)
      })
      .catch(() => {
        // silently fail or handle globally if needed
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

  // Step 3.3: auto-pick defaults
  useEffect(() => {
    if (!selectedFrameId && compatibleFrames.length > 0) {
      setSelectedFrameId(compatibleFrames[0].id)
    }
    // If selection becomes invalid (e.g. toggles changed), reset to first compatible
    if (selectedFrameId && compatibleFrames.length > 0) {
      const stillValid = compatibleFrames.some((f) => f.id === selectedFrameId)
      if (!stillValid) setSelectedFrameId(compatibleFrames[0].id)
    }
    if (compatibleFrames.length === 0) {
      setSelectedFrameId("")
    }
  }, [compatibleFrames, selectedFrameId])

  useEffect(() => {
    if (!selectedMaterialId && materials.length > 0) {
      setSelectedMaterialId(materials[0].id)
    }
  }, [materials, selectedMaterialId])

  const imageSrc = animal ? `/animal-images/${animal.slug}.webp` : ""

  // Step 3.3: pricing (lecturer formula)
  const basePrice = pricing.find((p) => p.frameSpecId === selectedFrameId)?.basePrice ?? 0
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)
  const multiplier = selectedMaterial?.priceMultiplier ?? 1
  const matMultiplier = withMat ? 1.2 : 1
  const finalPrice = Math.round(basePrice * multiplier * matMultiplier * 100) / 100

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

      {/* Step 3.2 + 3.3 UI */}
      <div style={{ marginTop: 24, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Frame options</h2>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={withMat} onChange={(e) => setWithMat(e.target.checked)} />
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
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Choose frame</label>

          <select
            value={selectedFrameId}
            onChange={(e) => setSelectedFrameId(e.target.value)}
            disabled={compatibleFrames.length === 0}
            style={{ width: "100%", padding: 8 }}
          >
            {compatibleFrames.length === 0 ? (
              <option value="">No compatible frames</option>
            ) : (
              compatibleFrames.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Choose material
          </label>

          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            disabled={materials.length === 0}
            style={{ width: "100%", padding: 8 }}
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.priceMultiplier}×)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <div>
            <strong>Base price:</strong> {basePrice}
          </div>
          <div>
            <strong>Material multiplier:</strong> {multiplier}
          </div>
          <div>
            <strong>Mat multiplier:</strong> {withMat ? "1.2" : "1.0"}
          </div>
          <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>Total: {finalPrice} kr</div>
        </div>

        {addError && <p style={{ color: "crimson" }}>Add to cart failed: {addError}</p>}

        <button
          disabled={
            adding ||
            compatibleFrames.length === 0 ||
            !selectedFrameId ||
            !selectedMaterialId
          }
          onClick={async () => {
            setAdding(true)
            setAddError(null)
            try {
              await addFrameToCart({
                animalId: animal.id,
                frameSpecId: selectedFrameId,
                frameMaterialId: selectedMaterialId,
                withMat,
                quantity: 1,
              })
              alert("Added to cart!")
            } catch (e) {
              setAddError(e instanceof Error ? e.message : "Unknown error")
            } finally {
              setAdding(false)
            }
          }}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 12,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            opacity: adding ? 0.7 : 1,
          }}
        >
          {adding ? "Adding…" : "Add to cart"}
        </button>
      </div>
      {/* Preview */}
      <div style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Preview</h2>

        <div
          style={{
            maxWidth: 420,
            margin: "0 auto",
            padding: 18,
            borderRadius: 12,
            background: selectedMaterial?.cssBackground || "#222",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          }}
        >
          {/* Mat */}
          <div
            style={{
              padding: withMat ? 22 : 0,
              background: withMat ? "#f2efe8" : "transparent",
              borderRadius: 8,
              boxShadow: withMat ? "inset 0 2px 6px rgba(0,0,0,0.25)" : "none",
            }}
          >
            {/* Image opening */}
            <div
              style={{
                borderRadius: 6,
                overflow: "hidden",
                aspectRatio: orientation === "portrait"
                  ? String(animal.imageAspectRatio)
                  : String(1 / animal.imageAspectRatio),
                background: "#f3f4f6",
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={animal.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    // fallback if extension differs; hides broken icon
                    ; (e.currentTarget as HTMLImageElement).style.display = "none"
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        <p style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
          Material style comes from the API (cssBackground). Image uses /public/animal-images + slug.
        </p>
      </div>
    </main>
  )
}