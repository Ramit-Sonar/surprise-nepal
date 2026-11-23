import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Gift,
} from "lucide-react"
import logo from "../../../assets/logo.webp"
import { useAppActions } from "../../../context/useApp"
import { useCartState } from "../../cart/hooks/useCartState"
import { useSessionState } from "../../auth/hooks/useSessionState"
import { getOptimizedImageUrl } from "../../../utils/image"

export default function Navbar() {
  const { cartCount } = useCartState()
  const { user, isMenuOpen } = useSessionState()
  const { logout, setMenuOpen } = useAppActions()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => {
    setProfileOpen(false)
  }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/gifts?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/gifts", label: "Gifts" },
    { to: "/about", label: "About" },
    { to: "/help", label: "Help" },
  ]

  return (
    <>
      <header
        className="sticky top-0 z-[100] bg-card transition-all duration-300"
        style={{
          boxShadow: scrolled
            ? "0 6px 20px var(--nm-dark), 0 -2px 8px var(--nm-light)"
            : "0 4px 14px var(--nm-dark), 0 -1px 6px var(--nm-light)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="GiftSurprise Home"
            >
              <img
                src={logo}
                alt="GiftSurprise"
                className="w-9 h-9 object-contain flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              <span
                className="font-bold text-foreground text-base sm:text-lg leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Gift<span className="text-primary">Surprise</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-2"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={
                    location.pathname === link.to ? "page" : undefined
                  }
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {location.pathname === link.to && (
                    <span className="absolute inset-0 bg-primary/8 rounded-xl" />
                  )}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-1.5">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95"
                aria-label="Search"
                style={{
                  boxShadow: searchOpen
                    ? "inset 3px 3px 8px var(--nm-dark), inset -2px -2px 6px var(--nm-light)"
                    : "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                }}
              >
                <Search size={20} />
              </button>

              {/* Wishlist — desktop only */}
              <Link
                to="/profile?tab=wishlist"
                className="hidden sm:flex p-2 rounded-xl hover:bg-black/5 text-muted-foreground hover:text-foreground transition-all duration-200"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>

              {/* Cart — desktop only; mobile uses bottom nav */}
              <Link
                to="/cart"
                className="relative hidden lg:flex p-2 rounded-xl hover:bg-black/5 text-muted-foreground hover:text-foreground transition-all duration-200"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none px-0.5 shadow-sm shadow-primary/40 animate-cartBounce">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Profile / Auth — desktop */}
              <div className="hidden lg:block relative ml-1">
                {user ? (
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-label="Profile menu"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{
                      boxShadow: profileOpen
                        ? "inset 3px 3px 8px var(--nm-dark), inset -2px -2px 6px var(--nm-light)"
                        : "5px 5px 12px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                    }}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 overflow-hidden border border-primary/20 shadow-sm">
                      {user.avatar ? (
                        <img
                          src={getOptimizedImageUrl(user.avatar, 56)}
                          alt={user.name}
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                          decoding="async"
                        />
                      ) : (
                        <User size={16} className="m-auto text-primary mt-1" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-muted-foreground transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-px"
                  >
                    <User size={15} />
                    Sign in
                  </Link>
                )}

                {/* Profile dropdown */}
                {profileOpen && user && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-2 animate-scaleIn"
                    style={{
                      maxWidth: "calc(100vw - 16px)",
                      zIndex: 200,
                      background: "#F0EDE9",
                      boxShadow:
                        "10px 10px 24px #BEBAB5, -5px -5px 14px #FFFFFF",
                    }}
                  >
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="font-semibold text-sm text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 text-sm text-foreground transition-colors"
                    >
                      <User size={16} className="text-muted-foreground" /> My
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 text-sm text-foreground transition-colors"
                    >
                      <Gift size={16} className="text-muted-foreground" /> My
                      Orders
                    </Link>
                    <div className="border-t border-border/60 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout()
                          setProfileOpen(false)
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 text-sm text-error w-full text-left transition-colors"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95"
                onClick={() => setMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                style={{
                  boxShadow: isMenuOpen
                    ? "inset 3px 3px 8px var(--nm-dark), inset -2px -2px 6px var(--nm-light)"
                    : "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
                }}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search bar expandable */}
          {searchOpen && (
            <div className="pb-4 animate-slideUp">
              <form onSubmit={handleSearch} className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gifts, flowers, cakes..."
                  className="w-full pl-10 pr-16 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent shadow-sm placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu — secondary links only (primary nav lives in bottom bar) */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card animate-slideUp">
            <nav className="px-4 py-3 space-y-1">
              {/* Secondary links: About & Help */}
              {navLinks
                .filter((l) => l.to === "/about" || l.to === "/help")
                .map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? "text-primary bg-primary/8"
                        : "text-foreground hover:bg-black/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              <div className="border-t border-border/50 pt-3 mt-3 space-y-1">
                {user ? (
                  <button
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-error hover:bg-black/5"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold text-primary bg-primary/8"
                  >
                    Sign in / Create account
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Click outside to close profile dropdown */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-[99]"
          onClick={() => setProfileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
