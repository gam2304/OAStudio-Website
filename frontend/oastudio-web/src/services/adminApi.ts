import type { HomeContent } from '../content/homeContent'
import type { AdminAccount, AuthResponse, Category, CategoryInput, ContactMessage, MessageStatus, Project, ProjectImage, ProjectImageInput, ProjectInput, ProjectStatus } from '../types'
import { api } from './api'

export const login = (username: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data)

export const changeOwnPassword = (currentPassword: string, newPassword: string) =>
  api.put('/admin/account/password', { currentPassword, newPassword })

// Main admin only (403 for other admins)
export const listAdmins = () => api.get<AdminAccount[]>('/admin/admins').then((r) => r.data)

export const createAdmin = (body: { username: string; email: string; password: string }) =>
  api.post<AdminAccount>('/admin/admins', body).then((r) => r.data)

export const deleteAdmin = (id: number) => api.delete(`/admin/admins/${id}`)

export const resetAdminPassword = (id: number, newPassword: string) =>
  api.put(`/admin/admins/${id}/password`, { newPassword })

// ---- Projects
const data = <T,>(r: { data: T }) => r.data

export const adminProjects = {
  list: () => api.get<Project[]>('/admin/projects').then(data),
  get: (id: number) => api.get<Project>(`/admin/projects/${id}`).then(data),
  create: (body: ProjectInput) => api.post<Project>('/admin/projects', body).then(data),
  update: (id: number, body: ProjectInput) => api.put<Project>(`/admin/projects/${id}`, body).then(data),
  remove: (id: number) => api.delete(`/admin/projects/${id}`),
  setStatus: (id: number, status: ProjectStatus) =>
    api.patch<Project>(`/admin/projects/${id}/status`, null, { params: { status } }).then(data),
  uploadCover: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<Project>(`/admin/projects/${id}/cover`, form).then(data)
  },
  coverFromGallery: (id: number, imageId: number) =>
    api.put<Project>(`/admin/projects/${id}/cover/${imageId}`).then(data),
  removeCover: (id: number) => api.delete(`/admin/projects/${id}/cover`),
}

// ---- Project gallery
export const adminImages = {
  list: (projectId: number) => api.get<ProjectImage[]>(`/admin/projects/${projectId}/images`).then(data),
  upload: (projectId: number, file: File, altText: string, displayOrder: number) => {
    const form = new FormData()
    form.append('file', file)
    if (altText) form.append('altText', altText)
    form.append('displayOrder', String(displayOrder))
    return api.post<ProjectImage>(`/admin/projects/${projectId}/images/upload`, form).then(data)
  },
  update: (imageId: number, body: ProjectImageInput) =>
    api.put<ProjectImage>(`/admin/project-images/${imageId}`, body).then(data),
  remove: (imageId: number) => api.delete(`/admin/project-images/${imageId}`),
}

// ---- Categories
export const adminCategories = {
  list: () => api.get<Category[]>('/admin/categories').then(data),
  create: (body: CategoryInput) => api.post<Category>('/admin/categories', body).then(data),
  update: (id: number, body: CategoryInput) => api.put<Category>(`/admin/categories/${id}`, body).then(data),
  remove: (id: number) => api.delete(`/admin/categories/${id}`),
}

// ---- Contact messages
export const adminMessages = {
  list: () => api.get<ContactMessage[]>('/admin/contact-messages').then(data),
  countNew: () => api.get<number>('/admin/contact-messages/count/new').then(data),
  setStatus: (id: number, status: MessageStatus) =>
    api.patch<ContactMessage>(`/admin/contact-messages/${id}/status`, null, { params: { status } }).then(data),
  remove: (id: number) => api.delete(`/admin/contact-messages/${id}`),
}

// ---- Landing page
export const adminSite = {
  saveHome: (content: HomeContent) => api.put<HomeContent>('/admin/site/home', content).then(data),
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ url: string }>('/admin/site/images', form).then((r) => r.data.url)
  },
}
