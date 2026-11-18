import type { Category, ContactMessageRequest, Project, ProjectImage } from '../types'
import { api } from './api'

export const getProjects = () => api.get<Project[]>('/public/projects').then((r) => r.data)

export const getProject = (slug: string) =>
  api.get<Project>(`/public/projects/${encodeURIComponent(slug)}`).then((r) => r.data)

export const getProjectImages = (slug: string) =>
  api.get<ProjectImage[]>(`/public/projects/${encodeURIComponent(slug)}/images`).then((r) => r.data)

export const getCategories = () => api.get<Category[]>('/public/categories').then((r) => r.data)

export const sendContactMessage = (body: ContactMessageRequest) =>
  api.post('/contact-messages', body).then((r) => r.data)
