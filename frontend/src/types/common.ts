export interface RecipientInfo {
  name: string
  phone: string
  message: string
  senderName: string
  senderPhone: string
}

export interface Testimonial {
  id: string
  name: string
  location: string
  text: string
  rating: number
  avatar: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
}
