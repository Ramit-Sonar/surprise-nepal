import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
  size?: "sm" | "md" | "lg" | "xl"
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0"

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-dark focus-visible:outline-primary",
    secondary:
      "bg-card text-foreground hover:text-foreground focus-visible:outline-primary",
    outline:
      "bg-card text-primary border-2 border-primary/40 hover:border-primary focus-visible:outline-primary",
    ghost:
      "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-primary shadow-none",
    danger: "bg-error text-white hover:opacity-90 focus-visible:outline-error",
    success:
      "bg-success text-white hover:opacity-90 focus-visible:outline-success",
  }

  const sizes = {
    sm: "px-4 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3 text-base gap-2",
    xl: "px-9 py-4 text-lg gap-2.5",
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
