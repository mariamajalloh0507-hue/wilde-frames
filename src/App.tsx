import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { useState } from "react"
import GalleryPage from "./pages/GalleryPage.tsx"
import CartPage from "./pages/CartPage.tsx"
import AnimalDetailPage from "./pages/AnimalDetailPage.tsx"

export default function App() {
  const [lang, setLang] = useState<"en" | "no" | "sv">("en")

  return (
    <BrowserRouter>
      <nav style={{ padding: 16, display: "flex", gap: 12 }}>
        <Link to="/">Gallery</Link>
        <Link to="/cart">Cart</Link>

        <div style={{ marginLeft: "auto" }}>
          <label style={{ marginRight: 8 }}>Language</label>
          <select value={lang} onChange={(e) => setLang(e.target.value as any)}>
            <option value="en">English</option>
            <option value="no">Norwegian</option>
            <option value="sv">Swedish</option>
          </select>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<GalleryPage lang={lang} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/animal/:id" element={<AnimalDetailPage lang={lang} />} />
      </Routes>
    </BrowserRouter>
  )
}