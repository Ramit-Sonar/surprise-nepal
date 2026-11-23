import { useState, useRef } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  Save,
  Link,
  ImagePlus,
  Star,
} from "lucide-react"
import AdminLayout from "../../admin/components/AdminLayout"
import ShopLayout from "../../shops/components/ShopLayout"
import { Input, Textarea } from "../../../components/ui/Input"
import CustomSelect from "../../../components/ui/CustomSelect"
import Button from "../../../components/ui/Button"
import { useAppActions } from "../../../context/useApp"
import { categories, OCCASIONS } from "../services/productService"
import { getProduct, saveProduct } from "../services/productService"
import { getCurrentShop } from "../../shops/services/shopService"
import type { Gift } from "../types"
import { getImageValidationError } from "../../../utils/format"

export default function AddProduct() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useAppActions()
  const isShop = location.pathname.startsWith("/shop/")
  const shop = getCurrentShop()
  const foundProduct = id ? getProduct(id) : null
  const existing =
    isShop && foundProduct?.shopId !== shop?.id ? null : foundProduct
  const isEditing = Boolean(existing)
  const expectedUpdatedAtRef = useRef(
    existing ? (existing.updatedAt ?? null) : undefined,
  )

  const [name, setName] = useState(existing?.name ?? "")
  const [category, setCategory] = useState(existing?.category ?? "birthday")
  const [price, setPrice] = useState(String(existing?.price ?? ""))
  const [discountPrice, setDiscountPrice] = useState(
    String(existing?.discountPrice ?? ""),
  )
  const [discountPercent, setDiscountPercent] = useState(
    existing?.discountPrice
      ? String(
          Math.round(
            ((existing.price - existing.discountPrice) / existing.price) * 100,
          ),
        )
      : "",
  )
  const [stock, setStock] = useState(String(existing?.stockCount ?? ""))
  const [description, setDescription] = useState(existing?.description ?? "")
  const [shortDesc, setShortDesc] = useState(existing?.shortDescription ?? "")
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    existing?.occasions ?? [],
  )
  const [tags, setTags] = useState(existing?.tags.join(", ") ?? "")
  // Multi-image state — first item is the primary/cover image
  const [images, setImages] = useState<string[]>(
    existing?.images?.length
      ? existing.images
      : existing?.image
        ? [existing.image]
        : [],
  )
  const [urlInput, setUrlInput] = useState("")
  const [urlError, setUrlError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleOccasion = (occ: string) =>
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ],
    )

  const addImageFromUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    if (!/^https?:\/\/.+/.test(url)) {
      setUrlError("Please enter a valid URL starting with http:// or https://")
      return
    }
    if (images.includes(url)) {
      setUrlError("This image is already added")
      return
    }
    setImages((prev) => [...prev, url])
    setUrlInput("")
    setUrlError("")
  }

  const addImagesFromFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const error = getImageValidationError(file)
      if (error) {
        setErrors((current) => ({ ...current, images: error }))
        return
      }
      setErrors((current) => ({ ...current, images: "" }))
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) setImages((prev) => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx))

  const setAsPrimary = (idx: number) =>
    setImages((prev) => {
      const next = [...prev]
      const [picked] = next.splice(idx, 1)
      return [picked, ...next]
    })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Name is required"
    if (!price || !Number.isFinite(Number(price)) || Number(price) <= 0)
      e.price = "Price must be greater than 0"
    if (stock === "" || !Number.isInteger(Number(stock)) || Number(stock) < 0)
      e.stock = "Stock must be a whole number of 0 or more"
    if (!shortDesc.trim()) e.shortDesc = "Short description is required"
    if (images.length === 0) e.images = "Add at least one product image"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const updatePrice = (value: string) => {
    setPrice(value)
    const mrp = Number(value)
    const discount = Number(discountPercent)
    setDiscountPrice(
      mrp > 0 && discount > 0
        ? String(Math.round(mrp * (1 - discount / 100)))
        : "",
    )
  }

  const updateDiscount = (value: string) => {
    const normalized = Math.min(100, Math.max(0, Number(value) || 0))
    setDiscountPercent(value === "" ? "" : String(normalized))
    const mrp = Number(price)
    setDiscountPrice(
      mrp > 0 && normalized > 0
        ? String(Math.round(mrp * (1 - normalized / 100)))
        : "",
    )
  }

  const handleSave = async (submitForReview: boolean) => {
    if (saving) return
    if (!validate()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    const product: Gift = {
      id: existing?.id ?? `gift_${Date.now()}`,
      name: name.trim(),
      shortDescription: shortDesc.trim(),
      description: description.trim(),
      includes: existing?.includes ?? [],
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      occasions: selectedOccasions,
      rating: existing?.rating ?? 0,
      reviewCount: existing?.reviewCount ?? 0,
      image: images[0] ?? "",
      images,
      inStock: Number(stock) > 0,
      stockCount: Number(stock),
      featured: existing?.featured ?? false,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
      status: isShop
        ? submitForReview
          ? "pending"
          : "draft"
        : (existing?.status ?? "draft"),
      shopId: existing?.shopId ?? shop?.id,
      shopName: existing?.shopName ?? shop?.name,
      submittedAt: submitForReview
        ? new Date().toISOString()
        : existing?.submittedAt,
    }
    const saved = saveProduct(product, expectedUpdatedAtRef.current)
    if (!saved) {
      setSaving(false)
      showToast(
        "This gift changed elsewhere. Reopen it before saving your edits.",
        "warning",
      )
      return
    }
    showToast(
      isShop
        ? submitForReview
          ? "Your gift has been submitted for Admin review."
          : "Draft saved!"
        : "Gift changes saved.",
    )
    navigate(isShop ? "/shop/products" : "/admin/products")
    setSaving(false)
  }

  const formContent = (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() =>
              navigate(isShop ? "/shop/products" : "/admin/products")
            }
            className={`${
              isShop ? "" : "hidden lg:flex"
            } p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95 shrink-0`}
            style={{
              boxShadow:
                "4px 4px 10px var(--nm-dark), -3px -3px 8px var(--nm-light)",
            }}
            aria-label="Back to products"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {isEditing ? "Edit Gift" : "Add New Gift"}
            </h1>
            {!isShop && existing?.shopName && (
              <p className="text-xs text-muted-foreground">
                Shop: {existing.shopName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic info */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-sm">
              Basic Information
            </h2>
            <Input
              label="Gift Name"
              placeholder="e.g. Romantic Rose Bouquet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />
            <Textarea
              label="Short Description"
              placeholder="A brief, enticing description (shown in cards)"
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              error={errors.shortDesc}
              maxLength={120}
              showCount
              currentLength={shortDesc.length}
              required
            />
            <Textarea
              label="Full Description"
              placeholder="Detailed description of the gift..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              label="Tags (comma-separated)"
              placeholder="e.g. roses, romantic, flowers, anniversary"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              hint="Used for search and filtering"
            />
          </div>

          {/* Pricing & Stock */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-sm">
              Pricing & Inventory
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="MRP (रु)"
                type="number"
                placeholder="3500"
                value={price}
                onChange={(e) => updatePrice(e.target.value)}
                error={errors.price}
                required
              />
              <Input
                label="Discount %"
                type="number"
                placeholder="20"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => updateDiscount(e.target.value)}
                hint="Leave blank for no discount"
              />
              <Input
                label="Selling Price (रु)"
                type="number"
                value={discountPrice || price}
                readOnly
                hint="Calculated automatically"
              />
              <Input
                label="Stock Count"
                type="number"
                placeholder="100"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                error={errors.stock}
                required
              />
            </div>
          </div>

          {/* Occasions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-sm font-medium text-foreground mb-3">
              Suitable Occasions
            </p>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => toggleOccasion(occ)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                    selectedOccasions.includes(occ)
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Category */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <h2 className="font-semibold text-foreground text-sm">Category</h2>
            <CustomSelect
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={category}
              onChange={setCategory}
            />
          </div>

          {/* Images */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-sm">
                Product Images
              </h2>
              <span className="text-xs text-muted-foreground">
                {images.length} added
              </span>
            </div>

            {/* Main preview */}
            {images.length > 0 ? (
              <div className="relative rounded-xl overflow-hidden aspect-square bg-muted">
                <img
                  src={images[0]}
                  alt="Primary"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary text-white text-2xs font-bold px-2 py-0.5 rounded-full">
                  <Star size={9} className="fill-white" /> Cover
                </div>
                <button
                  onClick={() => removeImage(0)}
                  className="absolute top-2 right-2 p-1 bg-foreground/60 text-white rounded-lg hover:bg-foreground/80 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  addImagesFromFiles(e.dataTransfer.files)
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Upload
                  size={24}
                  className="text-muted-foreground mx-auto mb-2"
                />
                <p className="text-xs font-medium text-foreground mb-0.5">
                  Add Product Photos
                </p>
                <p className="text-xs text-muted-foreground">
                  Drop images or choose from your device
                </p>
              </div>
            )}

            {/* Thumbnails row */}
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-border shrink-0"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-foreground/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        onClick={() => setAsPrimary(i + 1)}
                        title="Set as cover"
                        className="p-1 bg-white/20 rounded-md hover:bg-primary transition-colors"
                      >
                        <Star size={10} className="text-white" />
                      </button>
                      <button
                        onClick={() => removeImage(i + 1)}
                        title="Remove"
                        className="p-1 bg-white/20 rounded-md hover:bg-error transition-colors"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add more button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    addImagesFromFiles(e.dataTransfer.files)
                  }}
                  className={`w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 shrink-0 transition-colors ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <ImagePlus size={16} className="text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Add</span>
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addImagesFromFiles(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => addImagesFromFiles(e.target.files)}
            />
            {errors.images && (
              <p role="alert" className="text-xs text-error">
                {errors.images}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                leftIcon={<Camera size={15} />}
              >
                Take Photo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<ImagePlus size={15} />}
              >
                Gallery
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-2xs text-muted-foreground uppercase tracking-wider">
                or add by URL
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* URL input */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value)
                    setUrlError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addImageFromUrl()
                    }
                  }}
                  className="w-full text-sm rounded-xl px-3 py-2 focus:outline-none"
                />
                {urlError && (
                  <p className="text-xs text-error mt-1">{urlError}</p>
                )}
              </div>
              <button
                onClick={addImageFromUrl}
                className="shrink-0 px-3 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center gap-1"
              >
                <Link size={12} /> Add
              </button>
            </div>

            <p className="text-2xs text-muted-foreground">
              First image is the cover. Hover a thumbnail and click ★ to promote
              it. Supports JPG, PNG, WebP.
            </p>
          </div>

          {/* Final review and submission */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            {isShop && (
              <>
                <h2 className="font-semibold text-foreground text-sm">
                  Review & Submit
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Check the product details, pricing, category, and photos
                  above. Gifts are reviewed by Admin before they appear in the
                  public catalog.
                </p>
              </>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                size="md"
                fullWidth
                loading={saving}
                onClick={() => handleSave(isShop)}
                leftIcon={<Save size={15} />}
              >
                {saving
                  ? "Saving..."
                  : isShop
                    ? "Submit for Review"
                    : "Save Changes"}
              </Button>
              <Button
                size="md"
                fullWidth
                variant="ghost"
                onClick={() =>
                  navigate(isShop ? "/shop/products" : "/admin/products")
                }
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isShop) return <ShopLayout>{formContent}</ShopLayout>

  return (
    <AdminLayout
      breadcrumb={[
        { label: "Dashboard", to: "/admin" },
        { label: "Products", to: "/admin/products" },
        { label: "Edit Gift" },
      ]}
    >
      {formContent}
    </AdminLayout>
  )
}
