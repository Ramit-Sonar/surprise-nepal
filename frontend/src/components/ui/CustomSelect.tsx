import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type ReactNode,
} from "react"
import { ChevronDown, Check } from "lucide-react"
import { useClickOutside } from "../../hooks/useClickOutside"

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
  icon?: ReactNode
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
}

export default function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = "Select an option",
  error,
  hint,
  disabled = false,
  required,
  className = "",
  id,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)
  const closeDropdown = useCallback(() => setOpen(false), [])
  useClickOutside(containerRef, closeDropdown, open)

  // Scroll selected option into view when opened (track open via ref to avoid stale dep warning)
  useEffect(() => {
    if (!open || !listRef.current || !selected) return
    const idx = options.findIndex((o) => o.value === value)
    const item = listRef.current.children[idx] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [open, options, selected, value])

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-foreground"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <div className="relative">
        <button
          id={inputId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className={`
            w-full flex items-center justify-between gap-2
            rounded-2xl px-4 py-3 text-sm text-left
            bg-card transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary/30
            disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-[0.99]
            ${error ? "ring-2 ring-error" : ""}
            ${open ? "ring-2 ring-primary/40" : ""}
          `}
          style={{
            boxShadow:
              "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
          }}
        >
          <span
            className={
              selected
                ? "text-foreground font-medium"
                : "text-muted-foreground/70"
            }
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            role="listbox"
            ref={listRef}
            className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-56 overflow-y-auto"
            style={{
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            {options.map((opt, i) => {
              const isActive = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseDown={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={`
                    w-full text-left px-4 py-3 flex items-center gap-3
                    transition-colors duration-100
                    ${i > 0 ? "border-t border-border" : ""}
                    ${isActive ? "bg-primary/8" : "hover:bg-muted"}
                  `}
                >
                  {opt.icon && (
                    <span className="flex-shrink-0 text-primary">
                      {opt.icon}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm truncate ${
                        isActive
                          ? "font-semibold text-primary"
                          : "font-medium text-foreground"
                      }`}
                    >
                      {opt.label}
                    </p>
                    {opt.sublabel && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {opt.sublabel}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <Check size={14} className="text-primary flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-error flex items-center gap-1">
          ⚠ {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
