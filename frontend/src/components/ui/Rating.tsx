import { Star } from "lucide-react"

interface RatingProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  count?: number
  className?: string
}

export default function Rating({
  value,
  max = 5,
  size = "sm",
  showCount = false,
  count,
  className = "",
}: RatingProps) {
  const sizes = { sm: 12, md: 16, lg: 20 }
  const px = sizes[size]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value)
          const partial = !filled && i < value
          return (
            <span key={i} className="relative inline-block">
              <Star size={px} className="text-border" fill="currentColor" />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : `${(value % 1) * 100}%` }}
                >
                  <Star size={px} className="text-accent" fill="currentColor" />
                </span>
              )}
            </span>
          )
        })}
      </div>
      <span
        className={`font-semibold text-foreground ${
          size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
        }`}
      >
        {value.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span
          className={`text-muted-foreground ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}
