import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import { useToastState } from "../../context/useApp"
import type { Toast as ToastType } from "../../types/index"

function ToastItem({ toast }: { toast: ToastType }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const icons = {
    success: <CheckCircle size={18} className="text-success shrink-0" />,
    error: <XCircle size={18} className="text-error shrink-0" />,
    warning: <AlertCircle size={18} className="text-warning shrink-0" />,
    info: <Info size={18} className="text-primary shrink-0" />,
  }

  const bg = {
    success: "border-success/20 bg-green-50",
    error: "border-error/20 bg-red-50",
    warning: "border-amber-200 bg-amber-50",
    info: "border-primary/20 bg-primary-light",
  }

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg w-full sm:max-w-sm
        transition-all duration-300
        ${bg[toast.type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      {icons[toast.type]}
      <p className="text-sm text-foreground font-medium flex-1 leading-snug">
        {toast.message}
      </p>
    </div>
  )
}

export default function ToastContainer({
  customerHeader = false,
}: {
  customerHeader?: boolean
}) {
  const { toasts } = useToastState()

  if (toasts.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
      className={`fixed ${
        customerHeader ? "top-28" : "top-20"
      } left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-[9999] flex flex-col gap-2 pointer-events-none`}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slideInRight"
        >
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}
