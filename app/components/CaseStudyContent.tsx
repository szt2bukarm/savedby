import { PortableText, PortableTextComponents } from 'next-sanity'
import type { CaseStudyContentBlock } from '@/types/sanity'
import SanityImage from './common/SanityImage'

const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <h2 className="text-mobile-h2 sm:text-tablet-h4 lg:text-desktop-h5 text-black font-riforma-bold tracking-[-4%] leading-[100%]">
        {children}
      </h2>
    ),
  },
  marks: {
    orange: ({ children }) => (
      <span className="text-brand-orange">{children}</span>
    ),
  },
}

const renderBlock = (block: CaseStudyContentBlock) => {
  switch (block._type) {
    case 'caseStudyHeading':
      return block.heading && (
        <div className="mt-[30px] sm:mt-[50px] first:mt-0">
          <PortableText value={block.heading} components={headingComponents} />
        </div>
      )

    case 'caseStudyText':
      return block.text && (
        <p className="text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-regular tracking-[-2%] leading-[120%] whitespace-pre-line">
          {block.text}
        </p>
      )

    case 'caseStudyQuote':
      return block.quote && (
        <figure className="flex flex-col gap-[20px] sm:gap-[30px] my-[10px] sm:my-[20px]">
          <blockquote className="text-mobile-p2 sm:text-tablet-h6 lg:text-desktop-h6 text-black font-riforma-regular tracking-[-2%] leading-[110%]">
            “{block.quote}”
          </blockquote>
          <figcaption className="flex flex-col">
            {block.name && (
              <span className="text-mobile-caption sm:text-desktop-subtitle text-black font-riforma-bold tracking-[-2%]">— {block.name}</span>
            )}
            {block.title && (
              <span className="text-mobile-caption sm:text-desktop-subtitle text-black font-riforma-regular tracking-[-2%]">{block.title}</span>
            )}
          </figcaption>
        </figure>
      )

    case 'caseStudyImage':
      return block.image?.image && (
        <SanityImage
          image={block.image}
          alt={block.image.alt || ''}
          className="w-full h-auto rounded-[10px]"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      )

    case 'caseStudyNumberCard':
      return (
        <div className="flex flex-col sm:flex-row w-full bg-darkbg rounded-[10px] overflow-hidden">
          <div className="flex items-center justify-center sm:w-[35%] shrink-0 py-[30px] sm:py-[60px] bg-brand-orange">
            <span className="text-mobile-h1 sm:text-tablet-h3 lg:text-desktop-h3 text-background font-riforma-bold tracking-[-4%] leading-[100%]">{block.number}</span>
          </div>
          <div className="flex flex-col justify-between gap-[30px] sm:gap-[60px] p-[20px] sm:p-[30px] grow">
            <p className="text-mobile-h4 sm:text-tablet-h6 lg:text-desktop-h6 text-black font-riforma-bold tracking-[-4%] leading-[100%]">{block.title}</p>
            {block.text && (
              <p className="text-mobile-caption sm:text-desktop-subtitle text-black font-riforma-regular tracking-[-2%] leading-[120%] whitespace-pre-line">{block.text}</p>
            )}
          </div>
        </div>
      )

    case 'caseStudyImageFootnote':
      return block.image?.image && (
        <figure className="flex flex-col gap-[10px]">
          <SanityImage
            image={block.image}
            alt={block.image.alt || ''}
            className="w-full h-auto rounded-[10px]"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          {block.footnote && (
            <figcaption className="text-mobile-caption sm:text-desktop-caption text-black font-riforma-regular tracking-[-2%]">{block.footnote}</figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}

export default function CaseStudyContent({ content }: { content?: CaseStudyContentBlock[] }) {
  if (!content?.length) return null

  return (
    <div className="flex flex-col gap-[20px] sm:gap-[30px]">
      {content.map(block => (
        <div key={block._key}>{renderBlock(block)}</div>
      ))}
    </div>
  )
}
