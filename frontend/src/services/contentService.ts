import type { FAQ, Testimonial } from "../types/common"

export let faqs: FAQ[] = []
export let testimonials: Testimonial[] = []

export function configureContent(content: {
  faqs: FAQ[]
  testimonials: Testimonial[]
}) {
  faqs = content.faqs
  testimonials = content.testimonials
}
