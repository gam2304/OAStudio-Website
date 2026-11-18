import type { ContactMessageRequest } from '../types/index.ts'

export type ContactErrors = Partial<Record<keyof ContactMessageRequest, string>>

// Mirrors the backend ContactMessageRequest constraints
export function validateContact(f: ContactMessageRequest): ContactErrors {
  const e: ContactErrors = {}
  if (!f.senderName.trim()) e.senderName = 'Name is required.'
  else if (f.senderName.length > 150) e.senderName = 'Name must be 150 characters or fewer.'
  if (!f.senderEmail.trim()) e.senderEmail = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.senderEmail.trim())) e.senderEmail = 'Enter a valid email address.'
  else if (f.senderEmail.length > 200) e.senderEmail = 'Email must be 200 characters or fewer.'
  if (f.subject.length > 255) e.subject = 'Subject must be 255 characters or fewer.'
  if (!f.message.trim()) e.message = 'Message is required.'
  return e
}
