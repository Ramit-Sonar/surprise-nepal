import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import AnnouncementBar from "./AnnouncementBar"
import Footer from "./Footer"
import MobileBottomNav from "./MobileBottomNav"
import WhatsAppSupportButton from "./WhatsAppSupportButton"
import ToastContainer from "../../../components/ui/Toast"

interface CustomerLayoutProps {
  children: ReactNode
  noFooter?: boolean
}

export default function CustomerLayout({
  children,
  noFooter = false,
}: CustomerLayoutProps) {
  const { pathname } = useLocation()
  const isHome = pathname === "/"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <AnnouncementBar />
      <Navbar />

      {/* pb-14 on mobile reserves space above the fixed bottom nav (56px).
          noFooter pages (Auth, Checkout) hide the bottom nav so no padding needed. */}
      <main
        id="main-content"
        className={`flex-1${noFooter ? "" : " pb-14 lg:pb-0"}`}
      >
        {children}
      </main>

      {!noFooter && (
        <>
          {/* Footer: always visible on desktop; on mobile only on the home page */}
          <div className={isHome ? "" : "hidden lg:block"}>
            <Footer />
          </div>
          {/* Spacer so the fixed bottom nav never covers the last line of footer (home only) */}
          {isHome && (
            <div
              className="lg:hidden"
              style={{ height: "calc(3.5rem + var(--sab))" }}
              aria-hidden="true"
            />
          )}
        </>
      )}

      {/* Bottom navigation — hidden on focused flows (auth / checkout) */}
      {!noFooter && <MobileBottomNav />}

      <WhatsAppSupportButton avoidMobileNavigation={!noFooter} />
      <ToastContainer customerHeader />
    </div>
  )
}
