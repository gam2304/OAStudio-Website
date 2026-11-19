import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dictionaries, type Dictionary, type Lang } from './translations'

const STORAGE_KEY = 'oa-lang'

function readStored(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'en' || v === 'fr' ? v : null
  } catch {
    return null // storage blocked (private mode): ask again, site still works
  }
}

type LanguageState = {
  lang: Lang
  t: Dictionary
  /** false until the visitor picks a language; drives the first-visit prompt */
  chosen: boolean
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageState | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(readStored)
  const lang: Lang = stored ?? (navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en')

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    setStored(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      // not persisted; choice still applies for this visit
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang], chosen: stored !== null, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
