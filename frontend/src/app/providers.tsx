import type { ReactNode } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppProvider } from "../context/AppProvider"

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </AppProvider>
  )
}
