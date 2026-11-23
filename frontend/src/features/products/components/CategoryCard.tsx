import { useNavigate } from "react-router-dom"
import type { Category } from "../types"
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../../../utils/image"

interface CategoryCardProps {
  category: Category
  className?: string
}

export default function CategoryCard({
  category,
  className = "",
}: CategoryCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/gifts?category=${category.id}`)}
      className={`group relative overflow-hidden rounded-2xl aspect-square bg-muted hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left ${className}`}
    >
      <img
        src={getOptimizedImageUrl(category.image, 320)}
        srcSet={getResponsiveImageSrcSet(category.image, [120, 180, 240, 320])}
        sizes="(max-width: 639px) 33vw, (max-width: 1023px) 20vw, 12vw"
        alt={category.name}
        width={320}
        height={320}
        className="w-full h-full object-cover sm:group-hover:scale-110 transition-transform duration-300 sm:duration-500 brightness-75 sm:group-hover:brightness-60"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="text-2xl mb-1" role="img" aria-label={category.name}>
          {category.icon}
        </span>
        <span className="text-white font-semibold text-sm leading-tight">
          {category.name}
        </span>
        <span className="text-white/70 text-xs mt-0.5">
          {category.giftCount} gifts
        </span>
      </div>
    </button>
  )
}
