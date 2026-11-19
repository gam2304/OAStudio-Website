// Mirrors backend DTOs in com.oastudio.api.dto.response

export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Category {
  id: number
  categoryName: string
  slug: string
  description: string | null
  createdAt: string | null
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
  createdAt: string | null
  updatedAt: string | null
}

export interface ProjectImage {
  id: number
  imageUrl: string
  altText: string | null
  displayOrder: number
  createdAt: string | null
}

export interface ContactMessageRequest {
  senderName: string
  senderEmail: string
  senderPhone: string
  projectType: string
  subject: string
  message: string
}

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN'

export interface AdminAccount {
  id: number
  username: string
  email: string
  role: AdminRole
  createdAt: string | null
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export type MessageStatus = 'NEW' | 'READ' | 'ARCHIVED'

export interface ContactMessage {
  id: number
  senderName: string
  senderEmail: string
  senderPhone: string | null
  projectType: string | null
  subject: string | null
  message: string
  status: MessageStatus
  createdAt: string | null
}

// Request bodies for the admin API (mirror com.oastudio.api.dto.request)
export interface CategoryInput {
  categoryName: string
  slug: string
  description: string | null
}

export interface ProjectInput {
  title: string
  slug: string
  location: string | null
  year: number | null
  description: string | null
  architecturalConcept: string | null
  area: number | null
  coverImageUrl: string | null
  status: ProjectStatus
  categoryId: number
}

export interface ProjectImageInput {
  imageUrl: string
  altText: string | null
  displayOrder: number
}
