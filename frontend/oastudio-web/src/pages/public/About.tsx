import { Reveal } from '../../components/common/Reveal'
import { OfficeMap } from '../../components/public/OfficeMap'
import { site } from '../../content/site'
import { useLang } from '../../i18n/LanguageContext'

export default function About() {
  const { t } = useLang()
  const { about, services } = t
  return (
    <div className="pt-40">
      <section className="page-x mx-auto max-w-[1440px]">
        <Reveal className="max-w-4xl">
          <p className="label-caps mb-6 text-gold">{t.aboutPage.theStudio}</p>
          <h1 className="display-xl mb-10">{about.headline}</h1>
          <p className="body-lg max-w-2xl text-ink/70">{about.presentation}</p>
        </Reveal>
      </section>

      <section className="page-x mx-auto mt-section grid max-w-[1440px] items-center gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <img src={site.images.aboutPortrait} alt={t.aboutPage.portraitAlt} loading="lazy" className="aspect-[3/4] w-full object-cover grayscale" />
        </Reveal>
        <div className="space-y-16 md:col-span-6 md:col-start-7">
          <Reveal>
            <h2 className="label-caps mb-4 text-gold">{t.aboutPage.history}</h2>
            <p className="body-lg text-ink/70">{about.history}</p>
          </Reveal>
          <Reveal>
            <h2 className="label-caps mb-4 text-gold">{t.aboutPage.philosophy}</h2>
            <p className="headline-md italic">{about.philosophy}</p>
          </Reveal>
        </div>
      </section>

      <section className="mt-section bg-void py-24 md:py-section">
        <div className="page-x mx-auto max-w-[1440px]">
          <Reveal className="mb-16">
            <p className="label-caps mb-4 text-gold">{t.aboutPage.approach}</p>
            <h2 className="headline-lg">{t.aboutPage.howWeWork}</h2>
          </Reveal>
          <div className="grid gap-12 md:grid-cols-3">
            {about.approach.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.1} className="border-t border-stone/20 pt-8">
                <p className="mb-4 font-display text-3xl italic text-ink/30">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="label-caps mb-4">{a.title}</h3>
                <p className="text-ink/60">{a.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-x mx-auto mt-section max-w-[1440px]">
        <Reveal className="mb-16">
          <p className="label-caps mb-4 text-gold">{t.aboutPage.expertise}</p>
          <h2 className="headline-lg">{t.aboutPage.services}</h2>
        </Reveal>
        <div className="grid gap-x-gutter gap-y-12 md:grid-cols-2">
          {services.map((s) => (
            <Reveal key={s.title} className="border-t border-stone/20 pt-8">
              <h3 className="mb-4 font-display text-2xl">{s.title}</h3>
              <p className="text-ink/60">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {!!about.team.length && (
        <section className="page-x mx-auto mt-section max-w-[1440px]">
          <Reveal className="mb-16">
            <p className="label-caps mb-4 text-gold">{t.aboutPage.people}</p>
            <h2 className="headline-lg">{t.aboutPage.team}</h2>
          </Reveal>
          <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {about.team.map((m) => (
              <Reveal key={m.name}>
                {m.photoUrl && <img src={m.photoUrl} alt={m.name} loading="lazy" className="mb-6 aspect-[3/4] w-full object-cover grayscale" />}
                <h3 className="font-display text-xl">{m.name}</h3>
                <p className="label-caps mt-2 text-ink/40">{m.role}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="page-x mx-auto my-section max-w-[1440px]">
        <OfficeMap />
      </section>
    </div>
  )
}
