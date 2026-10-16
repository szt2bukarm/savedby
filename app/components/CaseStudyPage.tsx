import SanityImage from '@/app/components/common/SanityImage'
import CaseStudyContent from './CaseStudyContent'
import PageBuilder from './PageBuilder'
import type { CaseStudyData } from '@/types/sanity'

export default function CaseStudyPage({ caseStudy }: { caseStudy: CaseStudyData }) {
  const facts = [
    { label: 'Industry', value: caseStudy.industry },
    { label: 'Founded', value: caseStudy.founded },
    { label: 'HQ', value: caseStudy.hq },
  ].filter(fact => fact.value)

  return (
    <>
    <main className="w-full bg-background pt-[120px] sm:pt-[160px] pb-[80px] sm:pb-[120px] px-[20px] sm:px-[40px] lg:px-[60px] xl:px-[110px]">
      <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[80px]">
        <div className="flex flex-col gap-[30px] lg:w-[40%] shrink-0">
          {caseStudy.logo?.image && (
            <SanityImage
              image={caseStudy.logo}
              alt={caseStudy.logo?.alt || caseStudy.title || ''}
              className="w-auto h-[50px] sm:h-[70px] max-w-[260px] object-contain object-left"
              sizes="300px"
              priority
            />
          )}
          <h1 className="text-mobile-h1 sm:text-tablet-h2 lg:text-desktop-h3 text-black font-riforma-bold tracking-[-4%] leading-[90%]">
            {caseStudy.title}
          </h1>
          {caseStudy.description && (
            <p className="text-mobile-p2 sm:text-desktop-p1 text-black font-riforma-regular tracking-[-2%] leading-[120%] whitespace-pre-line">
              {caseStudy.description}
            </p>
          )}
          {facts.length > 0 && (
            <dl className="flex flex-col border-t border-black">
              {facts.map(fact => (
                <div key={fact.label} className="flex justify-between gap-[20px] py-[14px] border-b border-black">
                  <dt className="text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-bold tracking-[-2%]">{fact.label}</dt>
                  <dd className="text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-regular tracking-[-2%] text-right">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="flex flex-col grow">
          {caseStudy.coverImage?.image && (
            <SanityImage
              image={caseStudy.coverImage}
              alt={caseStudy.coverImage?.alt || caseStudy.title || ''}
              className="w-full h-auto rounded-[10px] mb-[40px]"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          )}
          <CaseStudyContent content={caseStudy.content} />
        </div>
      </div>
    </main>
    <PageBuilder blocks={caseStudy.blocks || []} />
    </>
  )
}
