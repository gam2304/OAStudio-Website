import { useEffect, useRef } from 'react'
import { site } from '../../content/site'
import { useLang } from '../../i18n/LanguageContext'
import type { Lang } from '../../i18n/translations'

const options: { lang: Lang; label: string }[] = [
  { lang: 'fr', label: 'Français' },
  { lang: 'en', label: 'English' },
]

// First-visit language picker. Native <dialog> gives focus trapping and Escape for free.
export function LanguagePrompt() {
  const { lang, chosen, setLang } = useLang()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!chosen && d && !d.open) d.showModal()
  }, [chosen])

  if (chosen) return null

  return (
    <dialog
      ref={ref}
      aria-labelledby="lang-title"
      // Escape keeps the detected language so the prompt doesn't return every page
      onCancel={() => setLang(lang)}
      className="lang-prompt m-auto w-[calc(100%-2rem)] max-w-md border border-stone/20 bg-surface p-10 text-center text-ink backdrop:bg-void/80 backdrop:backdrop-blur-sm md:p-12"
    >
      <img src="/logo.png" alt="" className="mx-auto mb-6 h-10 w-10 invert" />
      <p className="label-caps mb-6 text-ink/50">{site.name}</p>
      <h2 id="lang-title" className="font-display text-2xl">
        Choisissez votre langue
        <span className="mt-2 block text-lg text-ink/50" lang="en">Choose your language</span>
      </h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.lang}
            type="button"
            lang={o.lang}
            autoFocus={o.lang === lang}
            onClick={() => setLang(o.lang)}
            className="label-caps border border-stone/30 px-6 py-4 press hover:border-bronze hover:text-bronze focus-visible:border-bronze"
          >
            {o.label}
          </button>
        ))}
      </div>
    </dialog>
  )
}
