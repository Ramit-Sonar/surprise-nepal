import { useState } from "react"
import { ChevronLeft, ChevronRight, Sun, Cloud, Moon } from "lucide-react"

interface DateTimePickerProps {
  selectedDate: string
  selectedTime: "morning" | "afternoon" | "evening"
  onDateChange: (date: string) => void
  onTimeChange: (time: "morning" | "afternoon" | "evening") => void
}

const TIME_SLOTS = [
  {
    id: "morning" as const,
    label: "Morning",
    time: "9 AM – 12 PM",
    icon: Sun,
    available: true,
  },
  {
    id: "afternoon" as const,
    label: "Afternoon",
    time: "12 PM – 5 PM",
    icon: Cloud,
    available: true,
  },
  {
    id: "evening" as const,
    label: "Evening",
    time: "5 PM – 8 PM",
    icon: Moon,
    available: true,
  },
]

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthName = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  // Days in view
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = Array.from({ length: firstDay })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const isPast = (day: number) => {
    const d = new Date(year, month, day)
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return d < t
  }

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return isSameDay(new Date(year, month, day), new Date(selectedDate))
  }

  const isToday = (day: number) => isSameDay(new Date(year, month, day), today)

  const handleDayClick = (day: number) => {
    if (isPast(day)) return
    const date = new Date(year, month, day)
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    onDateChange(formatted)
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const canGoPrev =
    new Date(year, month, 1) >
    new Date(today.getFullYear(), today.getMonth(), 1)

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-card border border-border rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-semibold text-foreground">{monthName}</h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {dayLabels.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {blanks.map((_, i) => (
            <div key={`b${i}`} />
          ))}
          {days.map((day) => {
            const past = isPast(day)
            const selected = isSelected(day)
            const today_ = isToday(day)

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={past}
                className={`
                  aspect-square rounded-xl text-sm font-medium transition-all duration-150
                  ${selected ? "bg-primary text-white shadow-md scale-105" : ""}
                  ${
                    today_ && !selected
                      ? "border-2 border-primary text-primary"
                      : ""
                  }
                  ${
                    !selected && !today_ && !past
                      ? "hover:bg-muted text-foreground"
                      : ""
                  }
                  ${
                    past
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Choose time slot
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {TIME_SLOTS.map((slot) => {
            const Icon = slot.icon
            const selected = selectedTime === slot.id
            return (
              <button
                key={slot.id}
                onClick={() => onTimeChange(slot.id)}
                className={`
                  flex flex-col items-center gap-1 sm:gap-1.5 p-2.5 sm:p-3 rounded-2xl border-2 transition-all duration-150
                  ${
                    selected
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted"
                  }
                `}
              >
                <Icon size={18} />
                <span className="text-xs font-semibold">{slot.label}</span>
                <span className="text-[9px] sm:text-[10px] leading-tight text-center opacity-75">
                  {slot.time}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      {selectedDate && (
        <div className="bg-primary-light border border-primary/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-1">
            Delivery scheduled for
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-primary font-medium mt-0.5">
            {TIME_SLOTS.find((s) => s.id === selectedTime)?.label} ·{" "}
            {TIME_SLOTS.find((s) => s.id === selectedTime)?.time}
          </p>
        </div>
      )}
    </div>
  )
}
