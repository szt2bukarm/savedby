import type { PageBlock } from '@/types/sanity'
import Hero from './blocks/Hero'
import StickyText from './blocks/StickyText'
import NumberedCards from './blocks/NumberedCards'
import CustomerStory from './blocks/CustomerStory'
import FeatureCards from './blocks/FeatureCards'
import Cta from './blocks/Cta'
import RatingCards from './blocks/RatingCards'
import MerchantReviewSlide from './blocks/MerchantReviewSlide'
import LogoCarousel from './blocks/LogoCarousel'
import SavedbyComparison from './blocks/SavedbyComparison'
import NavColorChangeTrigger from './blocks/NavColorChangeTrigger'
import NavHideTrigger from './blocks/NavHideTrigger'
import ParallaxDivider from './blocks/ParallaxDivider'
import CaseStudySlider from './blocks/CaseStudySlider'
import ContactForm from './blocks/ContactForm'
import Curve from './blocks/Curve'
const components: Record<string, React.ComponentType<any>> = {
  heroBlock: Hero,
  stickyTextBlock: StickyText,
  numberedCardsBlock: NumberedCards,
  customerStoryBlock: CustomerStory,
  featureCardsBlock: FeatureCards,
  ctaBlock: Cta,
  ratingCardsBlock: RatingCards,
  merchantReviewSlideBlock: MerchantReviewSlide,
  logoCarouselBlock: LogoCarousel,
  savedbyComparisonBlock: SavedbyComparison,
  navColorChangeTriggerBlock: NavColorChangeTrigger,
  navHideTriggerBlock: NavHideTrigger,
  parallaxDividerBlock: ParallaxDivider,
  caseStudySliderBlock: CaseStudySlider,
  contactFormBlock: ContactForm,
  curveBlock: Curve,
}

export default function PageBuilder({ blocks }: { blocks: PageBlock[] }) {
  if (!blocks) return null

  return (
    <>
      {blocks.map((block, index) => {
        if (block.disabled) return null

        const Component = components[block._type]

        if (!Component) {
          if (process.env.NODE_ENV === 'development') {
            return (
              <div
                key={block._key ? `${block._key}-${index}` : index}
                style={{
                  padding: '2rem',
                  background: '#fff3f3',
                  color: '#c00',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                }}>
                Block type <strong>{block._type}</strong> is not implemented.
              </div>
            )
          }
          return null
        }

        const nextBlock = blocks.slice(index + 1).find((b) => !b.disabled)

        return <Component key={block._key ? `${block._key}-${index}` : index} block={block} nextBlockType={nextBlock?._type} />
      })}
    </>
  )
}
