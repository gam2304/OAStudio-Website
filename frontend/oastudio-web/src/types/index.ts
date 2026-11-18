// Mirrors backend DTOs in com.oastudio.api.dto.response

export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Category {
  id: number
  categoryName: string
  slug: string
  description: string | null
  createdAt: string
}

export interface Project {
  id: number
  title: string
  slug: string
  location: string | null
  year: number | null
  description: string | null
  architecturalConcept: string | null
  area: number | null
  coverImageUrl: string | null
  status: ProjectStatus
  category: Category | null
  createdAt: string
  updatedAt: string
}

export interface ProjectImage {
  id: number
  imageUrl: string
  altText: string | null
  displayOrder: number
  createdAt: string
}

export interface ContactMessageRequest {
  senderName: string
  senderEmail: string
  subject: string
  message: string
}
