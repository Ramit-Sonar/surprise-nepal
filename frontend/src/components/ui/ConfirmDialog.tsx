import { useEffect } from "react"
import { AlertTriangle, ShieldCheck, ShieldX, Trash2, X } from "lucide-react"
import Button from "./Button"

export type ConfirmVariant = "danger" | "warning" | "success" | "info"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  icon?: React.ReactNode
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const VARIANT_STYLES: Record<ConfirmVariant, {
  iconBg: string
  iconColor: string
  btn: string
}> = {
  danger: { iconBg: "bg-error/10", iconColor: "text-error", btn: "danger" },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    btn: "warning",
  },
  success: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
    btn: "primary",
  },
  info: {
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
    btn: "primary",
  },
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [loading, open, onCancel])

  if (!open) return null

  const styles = VARIANT_STYLES[variant]

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/45 backdrop-blur-xs animate-fadeIn"
        onClick={() => {
          if (!loading) onCancel()
        }}
      />

      {/* Panel */}
      <div className="dialog-surface relative bg-card rounded-3xl border border-border/70 w-full max-w-sm animate-scaleIn">
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X size={15} />
        </button>

        <div className="p-7 space-y-5">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${styles.iconBg}`}
          >
            <span className={styles.iconColor}>
              {icon ??
                (variant === "danger" ? (
                  <Trash2 size={26} />
                ) : (
                  <AlertTriangle size={26} />
                ))}
            </span>
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h2
              id="confirm-title"
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h2>
            <p
              id="confirm-desc"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
            <Button
              variant="outline"
              fullWidth
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={styles.btn as any}
              fullWidth
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
