import { useEffect, useState } from "react"
import {
  fetchCart,
  updateCartLine,
  removeCartLine,
  clearCart,
} from "../api/wildeApi"
type CartLine =
  | {
    itemType: "ITEM"
    orderLineId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    withMat: number
    animalName: string
    animalSlug: string
    category: string
    frameSpecName: string
    frameWidthCm: number
    frameHeightCm: number
    materialName: string
    material: string
    color: string
    style: string
    cssBackground: string
  }
  | {
    itemType: "TOTAL"
    orderId: number
    quantity: number
    totalPrice: number
  }

export default function CartPage() {
  const [cart, setCart] = useState<CartLine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCart()
      setCart(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <main style={{ padding: 16 }}>Loading cart…</main>
  if (error) return <main style={{ padding: 16 }}>Error: {error}</main>

  const items = cart.filter((x) => x.itemType === "ITEM") as Extract<CartLine, { itemType: "ITEM" }>[]
  const total = cart.find((x) => x.itemType === "TOTAL") as Extract<CartLine, { itemType: "TOTAL" }> | undefined

  if (items.length === 0) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Cart</h1>
        <p>Your cart is empty.</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Cart</h1>

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {items.map((i) => (
          <li
            key={i.orderLineId}
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{i.animalName}</div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{i.category}</div>
                <div style={{ marginTop: 6 }}>
                  <strong>{i.frameSpecName}</strong> · {i.frameWidthCm}×{i.frameHeightCm}cm ·{" "}
                  {i.withMat ? "Mat" : "No mat"}
                </div>
                <div style={{ marginTop: 6 }}>
                  Material: <strong>{i.materialName}</strong> ({i.material}, {i.color})
                </div>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>
                    Qty: <strong>{i.quantity}</strong>
                  </span>

                  <button
                    onClick={async () => {
                      await updateCartLine({
                        orderLineId: i.orderLineId,
                        quantity: i.quantity + 1,
                      })
                      load()
                    }}
                  >
                    +
                  </button>

                  <button
                    disabled={i.quantity <= 1}
                    onClick={async () => {
                      await updateCartLine({
                        orderLineId: i.orderLineId,
                        quantity: Math.max(1, i.quantity - 1),
                      })
                      load()
                    }}
                  >
                    –
                  </button>

                  <button
                    onClick={async () => {
                      await removeCartLine(i.orderLineId)
                      load()
                    }}
                    style={{ color: "crimson" }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div>Unit: {i.unitPrice} kr</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Line: {i.totalPrice} kr</div>
                <div
                  title="Material preview"
                  style={{
                    marginTop: 8,
                    width: 80,
                    height: 24,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    background: i.cssBackground,
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load}>Refresh</button>

          <button
            onClick={async () => {
              await clearCart()
              load()
            }}
            style={{ color: "crimson" }}
          >
            Empty cart
          </button>
        </div>

        <div style={{ fontSize: 20, fontWeight: 900 }}>
          Total: {total?.totalPrice ?? 0} kr
        </div>
      </div>
    </main>
  )
}