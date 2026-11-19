import { en } from '../i18n/translations.ts'
import type { ContactMessageRequest } from '../types/index.ts'

export type ContactErrors = Partial<Record<keyof ContactMessageRequest, string>>

// Mirrors the backend ContactMessageRequest constraints
export function validateContact(f: ContactMessageRequest, msg = en.contact.errors): ContactErrors {
  const e: ContactErrors = {}
  if (!f.senderName.trim()) e.senderName = msg.nameRequired
  else if (f.senderName.length > 150) e.senderName = msg.nameLong
  if (!f.senderEmail.trim()) e.senderEmail = msg.emailRequired
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.senderEmail.trim())) e.senderEmail = msg.emailInvalid
  else if (f.senderEmail.length > 200) e.senderEmail = msg.emailLong
  if (f.subject.length > 255) e.subject = msg.subjectLong
  if (!f.message.trim()) e.message = msg.messageRequired
  return e
}
