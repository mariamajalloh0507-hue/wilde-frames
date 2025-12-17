import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { fetchAnimals, type ApiAnimal, type Lang } from "../api/wildeApi"

export default function GalleryPage({ lang }: { lang: Lang }) {
  const [animals, setAnimals] = useState<ApiAnimal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [category, setCategory] = useState("All")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchAnimals(lang)
      .then((data) => {
        if (cancelled) return
        setAnimals(data)
        setCategory("All")
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
  }, [lang])

  const categories = useMemo(() => {
    const s = new Set<string>(["All"])
    animals.forEach((a) => s.add(a.category))
    return Array.from(s)
  }, [animals])

  const filtered = useMemo(() => {
    return category === "All" ? animals : animals.filter((a) => a.category === category)
  }, [animals, category])

  if (loading) return <main style={{ padding: 16 }}>Loading animals…</main>
  if (error) return <main style={{ padding: 16 }}>Error: {error}</main>

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Animal Gallery</h1>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginLeft: "auto" }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {filtered.map((a) => (
          <Link
            key={a.id}
            to={`/animal/${a.id}`}
            style={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid #eee",
              borderRadius: 12,
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              background: "white",
            }}
          >
            {/* Image area */}
            <div style={{ height: 140, background: "#f3f4f6", overflow: "hidden" }}>
              <img
                src={`/animal-images/${a.slug}.webp`}
                alt={a.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => {
                  ; (e.currentTarget as HTMLImageElement).style.display = "none"
                }}
              />
            </div>

            {/* Text area */}
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{a.category}</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{a.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>AR: {a.imageAspectRatio}</div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}