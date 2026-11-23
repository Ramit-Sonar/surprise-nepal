import { Link } from "react-router-dom"
import {
  ArrowRight,
  BadgeCheck,
  Handshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react"
import logo from "../../../assets/logo.webp"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-background/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={logo}
                alt="GiftSurprise"
                className="w-10 h-10 object-contain"
              />
              <span
                className="font-bold text-background text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                GiftSurprise
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-70 mb-6 max-w-xs">
              Making moments unforgettable — one surprise at a time. Send joy
              anywhere in Nepal.
            </p>
            <Link
              to="/partner"
              className="group mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Handshake size={17} aria-hidden="true" />
              Partner With Us
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-background/80"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-background/80"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-background/80"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.77a4.85 4.85 0 01-1-.08z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: "/gifts", label: "All Gifts" },
                { to: "/gifts?category=birthday", label: "Birthday Gifts" },
                { to: "/gifts?category=anniversary", label: "Anniversary" },
                { to: "/gifts?category=flowers", label: "Flowers" },
                { to: "/gifts?category=cakes", label: "Cakes" },
                { to: "/gifts?category=chocolates", label: "Chocolates" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-background transition-colors opacity-70 hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: "/about", label: "About Us" },
                { to: "/about", label: "How It Works" },
                { to: "/partner", label: "Partner With Us" },
                { to: "/help", label: "Help & FAQ" },
                { to: "/help", label: "Delivery Info" },
                { to: "/help", label: "Refund Policy" },
                { to: "/help", label: "Privacy Policy" },
                { to: "/help", label: "Terms & Conditions" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-background transition-colors opacity-70 hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+977980000000"
                  className="flex items-start gap-2.5 text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Phone size={15} className="mt-0.5 flex-shrink-0" />
                  <span>+977 980-000-0000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@giftsurprise.com.np"
                  className="flex items-start gap-2.5 text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Mail size={15} className="mt-0.5 flex-shrink-0" />
                  <span>hello@giftsurprise.com.np</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-sm opacity-70">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0" />
                  <span>
                    Thamel, Kathmandu
                    <br />
                    Nepal
                  </span>
                </div>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-white/5 rounded-xl">
              <p className="text-xs font-semibold text-background mb-1">
                Customer Support
              </p>
              <p className="text-xs opacity-60">Daily: 8 AM – 9 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-50">
            © {year} GiftSurprise. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs opacity-50">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} /> Secure checkout
            </span>
            <span className="flex items-center gap-1">
              <Truck size={12} /> On-time delivery
            </span>
            <span className="flex items-center gap-1">
              <BadgeCheck size={12} /> Verified products
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
