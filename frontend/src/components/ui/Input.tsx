import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, className = "", id, ...props },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-foreground"
          >
            {label}
            {props.required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={`
              w-full rounded-2xl text-foreground placeholder:text-muted-foreground/70
              transition-all duration-150 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? "ring-2 ring-error" : ""}
              ${leftIcon ? "pl-10" : "pl-4"}
              ${rightIcon ? "pr-10" : "pr-4"}
              py-3 text-sm
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-error flex items-center gap-1"
          >
            ⚠ {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  showCount?: boolean
  currentLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      maxLength,
      showCount,
      currentLength = 0,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-foreground"
          >
            {label}
            {props.required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={`
            w-full rounded-2xl text-foreground placeholder:text-muted-foreground/70
            transition-all duration-150 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed resize-none
            px-4 py-3 text-sm
            ${error ? "ring-2 ring-error" : ""}
            ${className}
          `}
          {...props}
        />
        <div className="flex items-center justify-between">
          <div>
            {error && (
              <p
                id={`${inputId}-error`}
                role="alert"
                className="text-xs text-error flex items-center gap-1"
              >
                ⚠ {error}
              </p>
            )}
            {hint && !error && (
              <p
                id={`${inputId}-hint`}
                className="text-xs text-muted-foreground"
              >
                {hint}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <p className="text-xs text-muted-foreground ml-auto">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  },
)
Textarea.displayName = "Textarea"
