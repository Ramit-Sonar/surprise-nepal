type ImageFit = "cover" | "contain"

function isCloudinaryImage(url: URL) {
  return (
    url.hostname === "res.cloudinary.com" &&
    url.pathname.includes("/image/upload/")
  )
}

export function getOptimizedImageUrl(
  source: string,
  width: number,
  height = width,
  fit: ImageFit = "cover",
) {
  if (!source || source.startsWith("data:") || source.startsWith("blob:"))
    return source

  try {
    const url = new URL(source)
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", String(width))
      url.searchParams.set("h", String(height))
      url.searchParams.set("fit", fit === "cover" ? "crop" : "max")
      url.searchParams.set("auto", "format")
      url.searchParams.set("q", width <= 640 ? "72" : "78")
      return url.toString()
    }

    if (isCloudinaryImage(url)) {
      const transformation = [
        "f_auto",
        width <= 640 ? "q_auto:eco" : "q_auto:good",
        fit === "cover" ? "c_fill" : "c_limit",
        `w_${width}`,
        `h_${height}`,
      ].join(",")
      url.pathname = url.pathname.replace(
        "/image/upload/",
        `/image/upload/${transformation}/`,
      )
      return url.toString()
    }
  } catch {
    // Keep uploaded or relative image values unchanged.
  }

  return source
}

export function getResponsiveImageSrcSet(
  source: string,
  widths: number[],
  aspectRatio = 1,
  fit: ImageFit = "cover",
) {
  let hasOptimizedCandidate = false
  const candidates = widths.map((width) => {
    const height = Math.round(width / aspectRatio)
    const candidate = getOptimizedImageUrl(source, width, height, fit)
    if (candidate !== source) hasOptimizedCandidate = true
    return `${candidate} ${width}w`
  })
  return hasOptimizedCandidate ? candidates.join(", ") : undefined
}
