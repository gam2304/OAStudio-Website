import { Reveal } from '../common/Reveal'
import { site } from '../../content/site'
import { useLang } from '../../i18n/LanguageContext'

export function OfficeMap({ className = '' }: { className?: string }) {
  const { t } = useLang()
  if (!site.contact.mapEmbedUrl) return null
  return (
    <Reveal className={className}>
      <iframe
        title={t.contact.map}
        src={site.contact.mapEmbedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full border border-stone/20 grayscale invert-[0.9] md:aspect-[21/9]"
      />
    </Reveal>
  )
}
