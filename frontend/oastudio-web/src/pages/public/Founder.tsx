import { Link } from 'react-router-dom'
import { Reveal } from '../../components/common/Reveal'
import { defaultHomeContent, tr } from '../../content/homeContent'
import { useHomeContent } from '../../hooks/useHomeContent'
import { useLang } from '../../i18n/LanguageContext'

export default function Founder() {
  const { t, lang } = useLang()
  // Same founder block the admin edits on the landing page
  const founder = (useHomeContent() ?? defaultHomeContent).founder
  const f = t.founderPage
  return (
    <div className="pt-40">
      <section className="page-x mx-auto grid max-w-[1440px] items-center gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <img src={founder.photoUrl} alt={founder.name} className="aspect-[3/4] w-full object-cover grayscale" />
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7" delay={0.1}>
          <p className="label-caps mb-6 text-ink/50">{f.label}</p>
          <h1 className="display-xl">{founder.name}</h1>
          <p className="label-caps mb-10 mt-4 text-ink/50">{tr(founder.role, lang)}</p>
          <p className="body-lg whitespace-pre-line text-ink/70">{tr(founder.bio, lang)}</p>
        </Reveal>
      </section>

      <section className="mt-section bg-void py-24 md:py-section">
        <div className="page-x mx-auto max-w-[1440px]">
          <Reveal className="mb-16">
            <p className="label-caps mb-4 text-ink/50">{f.pathLabel}</p>
            <h2 className="headline-lg">{f.pathTitle}</h2>
          </Reveal>
          <ol className="border-t border-stone/20">
            {f.timeline.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.05}>
                <li className="grid gap-4 border-b border-stone/20 py-10 md:grid-cols-12">
                  <span className="font-display text-3xl tabular-nums text-ink/50 md:col-span-2">{step.year}</span>
                  <h3 className="font-display text-2xl md:col-span-4">{step.title}</h3>
                  <p className="text-ink/60 md:col-span-6">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-x mx-auto mt-section max-w-[1440px]">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="label-caps mb-8 text-ink/50">{f.visionLabel}</p>
          <p className="headline-lg italic">“{f.vision}”</p>
        </Reveal>
      </section>

      <section className="page-x mx-auto my-section max-w-[1440px] text-center">
        <Reveal>
          <h2 className="display-xl mx-auto mb-12 max-w-3xl">{f.ctaTitle}</h2>
          <Link
            to="/contact"
            className="label-caps inline-block border border-transparent bg-paper px-10 py-4 text-void press hover:border-bronze hover:text-bronze"
          >
            {t.home.startProject}
          </Link>
        </Reveal>
      </section>
    </div>
  )
}
