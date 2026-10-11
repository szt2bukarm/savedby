// ─── Objects ────────────────────────────────────────────────────────
import { navLinkType } from './objects/navLinkType'
import { navDropdownType } from './objects/navDropdownType'
import { navButtonType } from './objects/navButtonType'
import { socialPlatformType } from './objects/socialPlatformType'
import { buttonType } from './objects/buttonType'
import { imageType } from './objects/imageType'
import { seoType } from './objects/seoType'
import { multiLineBoldInputType } from './objects/multiLineBoldInputType'
import { footerColumnType } from './objects/footerColumnType'
import { spacingType } from './objects/spacingType'

// ─── Blocks ─────────────────────────────────────────────────────────
import { heroBlock } from './blocks/heroBlock'
import { stickyTextBlock } from './blocks/stickyTextBlock'
import { numberedCardsBlock } from './blocks/numberedCardsBlock'
import { customerStoryBlock, customerStorySlideType } from './blocks/customerStoryBlock'
import { featureCardsBlock } from './blocks/featureCardsBlock'
import { ctaBlock } from './blocks/ctaBlock'
import { ratingCardsBlock } from './blocks/ratingCardsBlock'
import { merchantReviewSlideBlock } from './blocks/merchantReviewSlideBlock'
import { logoCarouselBlock } from './blocks/logoCarouselBlock'
import { savedbyComparisonBlock } from './blocks/savedbyComparisonBlock'
import { navColorChangeTriggerBlock } from './blocks/navColorChangeTriggerBlock'
import { navHideTriggerBlock } from './blocks/navHideTriggerBlock'
import { parallaxDividerBlock } from './blocks/parallaxDividerBlock'
import { caseStudySliderBlock } from './blocks/caseStudySliderBlock'
import { contactFormBlock } from './blocks/contactFormBlock'
import { curveBlock } from './blocks/curveBlock'

// ─── Singletons ─────────────────────────────────────────────────────
import { navType } from './singletons/navType'
import { footerType } from './singletons/footerType'
import { mobileNavType } from './singletons/mobileNavType'
// ─── Documents ──────────────────────────────────────────────────────
import { pageType } from './documents/pageType'
import { caseStudyType } from './documents/caseStudyType'

export const schemaTypes = [
  // Objects
  navLinkType,
  navDropdownType,
  navButtonType,
  socialPlatformType,
  buttonType,
  imageType,
  seoType,
  multiLineBoldInputType,
  footerColumnType,
  spacingType,

  // Blocks
  heroBlock,
  stickyTextBlock,
  numberedCardsBlock,
  customerStorySlideType,
  customerStoryBlock,
  featureCardsBlock,
  ctaBlock,
  ratingCardsBlock,
  merchantReviewSlideBlock,
  logoCarouselBlock,
  savedbyComparisonBlock,
  navColorChangeTriggerBlock,
  navHideTriggerBlock,
  parallaxDividerBlock,
  caseStudySliderBlock,
  contactFormBlock,
  curveBlock,

  // Singletons
  navType,
  footerType,
  mobileNavType,
  
  // Documents
  pageType,
  caseStudyType,
]
