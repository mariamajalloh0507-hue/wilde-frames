import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { fetchAnimalById, type ApiAnimal, type Lang } from "../api/wildeApi"

export default function AnimalDetailPage({ lang }: { lang: Lang }) {
  const { id } = useParams()
  const [animal, setAnimal] = useState<ApiAnimal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) return <main style={{ padding: 16 }}>Loading animal…</main>
  if (error) return <main style={{ padding: 16 }}>Error: {error}</main>
  if (!animal) return <main style={{ padding: 16 }}>Not found.</main>

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <Link to="/">← Back to gallery</Link>

      <h1 style={{ marginTop: 12 }}>{animal.name}</h1>
      <p style={{ color: "#4b5563" }}>{animal.description}</p>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <div><strong>Category:</strong> {animal.category}</div>
        <div><strong>Aspect Ratio:</strong> {animal.imageAspectRatio}</div>
        <div>
          <strong>Wiki:</strong>{" "}
          <a href={animal.wikiUrl} target="_blank" rel="noreferrer">
            {animal.wikiUrl}
          </a>
        </div>
      </div>
    </main>
  )
}