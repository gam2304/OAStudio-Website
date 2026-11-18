import { useState, type FormEvent } from 'react'
import { Reveal } from '../../components/common/Reveal'
import { site } from '../../content/site'
import { errorMessage } from '../../services/api'
import { sendContactMessage } from '../../services/publicApi'
import type { ContactMessageRequest } from '../../types'
import { validateContact, type ContactErrors } from '../../utils/validateContact'

const empty: ContactMessageRequest = { senderName: '', senderEmail: '', subject: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = useState('')

  const set = (k: keyof ContactMessageRequest) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validateContact(form)
    setErrors(found)
    if (Object.keys(found).length) return
    setStatus('sending')
    try {
      await sendContactMessage({ ...form, senderName: form.senderName.trim(), senderEmail: form.senderEmail.trim() })
      setForm(empty)
      setStatus('sent')
    } catch (err) {
      setServerError(errorMessage(err, 'Your message could not be sent. Please try again.'))
      setStatus('error')
    }
  }

  const field = (k: keyof ContactMessageRequest, label: string, opts: { type?: string; textarea?: boolean; optional?: boolean } = {}) => (
    <div>
      <label htmlFor={k} className="label-caps mb-3 block text-ink/60">
        {label}
        {opts.optional && <span className="ml-2 normal-case tracking-normal text-ink/30">(optional)</span>}
      </label>
      {opts.textarea ? (
        <textarea
          id={k}
          rows={5}
          value={form[k]}
          onChange={set(k)}
          aria-invalid={!!errors[k]}
          aria-describedby={errors[k] ? `${k}-error` : undefined}
          className="w-full resize-y border-b border-stone/30 bg-transparent py-2 outline-none transition-colors focus:border-bronze aria-[invalid=true]:border-error"
        />
      ) : (
        <input
          id={k}
          type={opts.type ?? 'text'}
          value={form[k]}
          onChange={set(k)}
          aria-invalid={!!errors[k]}
          aria-describedby={errors[k] ? `${k}-error` : undefined}
          autoComplete={k === 'senderName' ? 'name' : k === 'senderEmail' ? 'email' : undefined}
          className="w-full border-b border-stone/30 bg-transparent py-2 outline-none transition-colors focus:border-bronze aria-[invalid=true]:border-error"
        />
      )}
      {errors[k] && (
        <p id={`${k}-error`} className="mt-2 text-sm text-error">
          {errors[k]}
        </p>
      )}
    </div>
  )

  const { contact, social } = site
  return (
    <div className="page-x mx-auto max-w-[1440px] pb-section pt-40">
      <Reveal className="mb-24 max-w-3xl">
        <p className="label-caps mb-6 text-gold">Inquire</p>
        <h1 className="display-xl mb-8">Begin the conversation.</h1>
        <p className="body-lg text-ink/60">Tell us about your site, your programme and your ambitions. We reply to every inquiry.</p>
      </Reveal>

      <div className="grid gap-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <form noValidate onSubmit={onSubmit} className="space-y-10">
            <div className="grid gap-10 md:grid-cols-2">
              {field('senderName', 'Name')}
              {field('senderEmail', 'Email', { type: 'email' })}
            </div>
            {field('subject', 'Subject', { optional: true })}
            {field('message', 'Message', { textarea: true })}

            <div aria-live="polite">
              {status === 'sent' && <p className="text-gold">Thank you. Your message has been received — we will be in touch shortly.</p>}
              {status === 'error' && <p role="alert" className="text-error">{serverError}</p>}
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="label-caps border border-transparent bg-paper px-10 py-4 text-void transition-colors duration-500 hover:border-bronze hover:text-bronze disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </Reveal>

        <Reveal className="space-y-12 lg:col-span-4 lg:col-start-9" delay={0.1}>
          <div>
            <h2 className="label-caps mb-4 text-gold">Office</h2>
            <address className="space-y-2 not-italic text-ink/70">
              <p>{contact.address}</p>
              <p>{contact.phone}</p>
              <p>{contact.email}</p>
            </address>
          </div>
          {social.some((s) => s.href) && (
            <div>
              <h2 className="label-caps mb-4 text-gold">Follow</h2>
              <ul className="space-y-2 text-ink/70">
                {social.filter((s) => s.href).map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-bronze">{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </div>

      {contact.mapEmbedUrl && (
        <Reveal className="mt-section">
          <iframe
            title="Office location"
            src={contact.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[21/9] w-full border border-stone/20 grayscale invert-[0.9]"
          />
        </Reveal>
      )}
    </div>
  )
}
