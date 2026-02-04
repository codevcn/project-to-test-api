import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./styles/fonts.scss"
import "./styles/app.scss"
import ConsolePage from "./pages/ConsolePage"
import { NotFound } from "./pages/NotFound"
import { Showcase } from "./pages/Showcase"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsolePage />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
