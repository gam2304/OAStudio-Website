import { Link } from 'react-router-dom'
import { useLang } from '../../i18n/LanguageContext'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="page-x flex min-h-[70vh] flex-col items-center justify-center pt-40 text-center">
      <p className="label-caps mb-6 text-gold">404</p>
      <h1 className="display-xl mb-10">{t.notFound.title}</h1>
      <Link to="/" className="label-caps border-b border-ink/30 pb-1 hover:border-bronze hover:text-bronze">
        {t.notFound.home}
      </Link>
    </div>
  )
}
