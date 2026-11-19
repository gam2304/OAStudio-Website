import { useState, type FormEvent } from 'react'
import { Reveal } from '../../components/common/Reveal'
import { OfficeMap } from '../../components/public/OfficeMap'
import { site } from '../../content/site'
import { errorMessage } from '../../services/api'
import { sendContactMessage } from '../../services/publicApi'
import { useLang } from '../../i18n/LanguageContext'
import type { ContactMessageRequest } from '../../types'
import { validateContact, type ContactErrors } from '../../utils/validateContact'

const empty: ContactMessageRequest = { senderName: '', senderEmail: '', senderPhone: '', projectType: '', subject: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = useState('')
  const { t } = useLang()

  const set = (k: keyof ContactMessageRequest) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validateContact(form, t.contact.errors)
    setErrors(found)
    if (Object.keys(found).length) return
    setStatus('sending')
    try {
      await sendContactMessage({ ...form, senderName: form.senderName.trim(), senderEmail: form.senderEmail.trim(), senderPhone: form.senderPhone.trim() })
      setForm(empty)
      setStatus('sent')
    } catch (err) {
      setServerError(errorMessage(err, t.contact.sendError))
      setStatus('error')
    }
  }

  const field = (k: keyof ContactMessageRequest, label: string, opts: { type?: string; textarea?: boolean; optional?: boolean } = {}) => (
    <div>
      <label htmlFor={k} className="label-caps mb-3 block text-ink/60">
        {label}
        {opts.optional && <span className="ml-2 normal-case tracking-normal text-ink/30">{t.contact.optional}</span>}
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
          autoComplete={k === 'senderName' ? 'name' : k === 'senderEmail' ? 'email' : k === 'senderPhone' ? 'tel' : undefined}
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
        <p className="label-caps mb-6 text-gold">{t.contact.inquire}</p>
        <h1 className="display-xl mb-8">{t.contact.title}</h1>
        <p className="body-lg text-ink/60">{t.contact.intro}</p>
      </Reveal>

      <div className="grid gap-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <form noValidate onSubmit={onSubmit} className="space-y-10">
            <div className="grid gap-10 md:grid-cols-2">
              {field('senderName', t.contact.name)}
              {field('senderEmail', t.contact.email, { type: 'email' })}
            </div>
            <div className="grid gap-10 md:grid-cols-2">
              {field('senderPhone', t.contact.phone, { type: 'tel', optional: true })}
              <div>
                <label htmlFor="projectType" className="label-caps mb-3 block text-ink/60">
                  {t.contact.projectType}
                  <span className="ml-2 normal-case tracking-normal text-ink/30">{t.contact.optional}</span>
                </label>
                <select
                  id="projectType"
                  value={form.projectType}
                  onChange={set('projectType')}
                  className="w-full border-b border-stone/30 bg-transparent py-2 outline-none transition-colors focus:border-bronze"
                >
                  <option value="" className="bg-surface">{t.contact.choose}</option>
                  {[...t.services.map((s) => s.title), t.contact.other].map((title) => (
                    <option key={title} value={title} className="bg-surface">{title}</option>
                  ))}
                </select>
              </div>
            </div>
            {field('subject', t.contact.subject, { optional: true })}
            {field('message', t.contact.message, { textarea: true })}

            <div aria-live="polite">
              {status === 'sent' && <p className="text-gold">{t.contact.sent}</p>}
              {status === 'error' && <p role="alert" className="text-error">{serverError}</p>}
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="label-caps border border-transparent bg-paper px-10 py-4 text-void transition-colors duration-500 hover:border-bronze hover:text-bronze disabled:opacity-50"
            >
              {status === 'sending' ? t.contact.sending : t.contact.send}
            </button>
          </form>
        </Reveal>

        <Reveal className="space-y-12 lg:col-span-4 lg:col-start-9" delay={0.1}>
          <div>
            <h2 className="label-caps mb-4 text-gold">{t.contact.office}</h2>
            <address className="space-y-2 not-italic text-ink/70">
              <p>{contact.address}</p>
              <p><a href={`tel:${contact.tel}`} className="hover:text-bronze">{contact.phone}</a></p>
              <p><a href={`mailto:${contact.email}`} className="hover:text-bronze">{contact.email}</a></p>
            </address>
          </div>
          <div>
            <h2 className="label-caps mb-4 text-gold">{t.contact.hoursLabel}</h2>
            <ul className="space-y-2 text-ink/70">
              {t.contact.hours.map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
          {social.some((s) => s.href) && (
            <div>
              <h2 className="label-caps mb-4 text-gold">{t.contact.follow}</h2>
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

      <OfficeMap className="mt-section" />
    </div>
  )
}
