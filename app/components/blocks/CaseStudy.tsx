import { getSpacingClasses } from '@/app/utils/spacing'
import type { CaseStudyBlockProps, CaseStudyCardData } from '@/types/sanity'
import { PortableText, PortableTextComponents } from 'next-sanity'
import { Link } from 'next-view-transitions'
import SanityImage from '../common/SanityImage'
import { cleanBasePath } from '@/app/utils/caseStudy'

const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <h2 className="text-mobile-h1 sm:text-tablet-h1 lg:text-desktop-h2 text-brand-orange font-riforma-regular tracking-[-4%] leading-[85%]">
        {children}
      </h2>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-riforma-bold">{children}</strong>
    ),
  },
}

const Arrow = ({ className }: { className: string }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 54" fill="none">
      <path d="M38.8672 51.1191L62.7301 26.7139L38.8672 2.3086" stroke="currentColor" strokeWidth="6.60322" strokeMiterlimit="10"/>
      <path d="M61.3164 26.5925L0.000813127 26.5925" stroke="currentColor" strokeWidth="6.60322"/>
    </svg>
  )
}

const FeaturedCard = ({ item, basePath }: { item: CaseStudyCardData, basePath: string }) => {
  return (
    <Link href={`/${basePath}/${item.slug}`} className="group relative flex flex-col lg:flex-row w-full bg-darkbg rounded-[10px] overflow-hidden">
      <div className="relative w-full lg:w-[50%] h-[240px] sm:h-[340px] lg:h-auto lg:min-h-[380px] shrink-0">
        <SanityImage
          image={item.coverImage}
          alt={item.coverImage?.alt || item.title || ''}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col justify-between gap-[40px] p-[20px] sm:p-[30px] lg:p-[40px] grow">
        <div className="flex flex-col gap-[10px]">
          <p className="text-mobile-caption sm:text-desktop-caption text-black font-riforma-bold tracking-[-2%] uppercase">Most recent</p>
          <p className="text-mobile-h3 sm:text-tablet-h4 lg:text-desktop-h4 text-black font-riforma-regular tracking-[-4%] leading-[100%]">{item.title}</p>
        </div>
        <div className="flex items-end justify-between gap-[20px]">
          {item.logo?.image && (
            <SanityImage
              image={item.logo}
              alt={item.logo?.alt || item.title || ''}
              className="w-auto h-[40px] sm:h-[55px] lg:h-[70px] max-w-[60%] object-contain object-left"
              sizes="300px"
            />
          )}
          <span className="flex items-center gap-[10px] px-[20px] sm:px-[40px] py-[10px] sm:py-[14px] border border-black rounded-[10px] text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-regular tracking-[-2%] transition-colors group-hover:bg-black group-hover:text-background">
            Read
            <Arrow className="w-[16px]" />
          </span>
        </div>
      </div>
    </Link>
  )
}

const GridCard = ({ item, basePath }: { item: CaseStudyCardData, basePath: string }) => {
  return (
    <Link href={`/${basePath}/${item.slug}`} className="group relative block aspect-[4/5] w-full bg-darkbg rounded-[10px] overflow-hidden">
      <SanityImage
        image={item.coverImage}
        alt={item.coverImage?.alt || item.title || ''}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 640px) 100vw, 33vw"
      />
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-[20px] p-[20px] sm:p-[24px]">
        {item.logo?.image && (
          <SanityImage
            image={item.logo}
            alt={item.logo?.alt || item.title || ''}
            className="w-auto h-[30px] sm:h-[40px] max-w-[70%] object-contain object-left"
            sizes="300px"
          />
        )}
        <Arrow className="w-[28px] sm:w-[34px] shrink-0 text-black transition-transform duration-300 group-hover:translate-x-[6px]" />
      </div>
    </Link>
  )
}

export default function CaseStudy({ block }: CaseStudyBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing)
  const caseStudies = block?.caseStudies?.filter(item => item?.slug) || []
  const [featured, ...rest] = caseStudies
  const basePath = cleanBasePath(block?.basePath)

  return (
    <section className={`relative w-full ${spacingClasses} px-[20px] sm:px-[40px] lg:px-[60px] xl:px-[110px] bg-background`}>
      {block?.heading && (
        <div className="mb-[40px] sm:mb-[60px] lg:mb-[70px]">
          <PortableText value={block.heading} components={headingComponents} />
        </div>
      )}
      <div className="flex flex-col gap-[10px]">
        {featured && <FeaturedCard item={featured} basePath={basePath} />}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[10px]">
            {rest.map(item => (
              <GridCard key={item._id} item={item} basePath={basePath} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
