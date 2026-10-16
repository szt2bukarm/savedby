export type PortableTextChild = {
  _key?: string
  _type: string
  text?: string
  marks?: string[]
}

export type PortableTextMarkDef = {
  _key: string
  disabled?: boolean
  _type: string
  href?: string
  openInNewTab?: boolean
  [key: string]: unknown
}

export type PortableTextBlock = {
  _key?: string
  _type: string
  children?: PortableTextChild[]
  markDefs?: PortableTextMarkDef[]
  style?: string
  [key: string]: unknown
}

export type MultiLineBoldInput = PortableTextBlock[]

export interface ButtonData {
  text?: string
  href?: string
}

export interface SanityImageData {
  _type?: string
  asset?: {
    _ref?: string
    url?: string
    metadata?: {
      lqip?: string
      dimensions?: {
        width: number
        height: number
      }
    }
  }
  hotspot?: { x: number; y: number; width: number; height: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
}

export interface SanityFileData {
  _type?: string
  asset?: {
    _ref?: string
    url?: string
  }
}

export interface NavLinkData {
  _id?: string
  text?: string
  href?: string
}

export interface FooterColumnData {
  _key?: string
  title?: string
  links?: NavLinkData[]
}

export interface FooterData {
  _id?: string
  copyrightText?: string
  cookieText?: string
  columns?: FooterColumnData[]
  bottomLinks?: NavLinkData[]
}


export interface SpacingData {
  type?: 'padding' | 'margin'
  top?: number
  bottom?: number
  tabletTop?: number
  tabletBottom?: number
  mobileTop?: number
  mobileBottom?: number
}

// ─── Block Data & Props ──────────────────────────────────────────────

export interface HeroBlockData {
  _type: 'heroBlock'
  _key: string
  disabled?: boolean
  heading?: string
  bottomText?: string
  button?: ButtonData
  logoMarquee?: {
    _key?: string
    alt?: string
    image?: SanityImageData
  }[]
  firstText?: string
  secondText?: string
  spacing?: SpacingData
}

export interface HeroBlockProps {
  block?: HeroBlockData
}

export interface StickyTextItem {
  _key?: string
  text?: MultiLineBoldInput
  boxIcon?: 'damaged' | 'intact'
}

export interface StickyTextBlockData {
  _type: 'stickyTextBlock'
  _key: string
  disabled?: boolean
  items?: StickyTextItem[]
  spacing?: SpacingData
}

export interface StickyTextBlockProps {
  block?: StickyTextBlockData
}

export interface NumberedCardItem {
  _key?: string
  number: string
  text: string
  color: '#FD4015' | '#110F0B' | '#0095EC' | string
}

export interface NumberedCardsBlockData {
  _type: 'numberedCardsBlock'
  _key: string
  disabled?: boolean
  cards?: NumberedCardItem[]
  spacing?: SpacingData
}

export interface NumberedCardsBlockProps {
  block?: NumberedCardsBlockData
}

export interface CustomerStorySlideItem {
  _key?: string
  heading?: MultiLineBoldInput
  text?: MultiLineBoldInput
  backgroundColor?: 'cream' | 'orange' | string
  graphicBackground?: 'blue' | 'gray' | string
  mobileBackgroundColor?: '#0095EC' | '#FD4015' | string
}

export interface CustomerStoryBlockData {
  _type: 'customerStoryBlock'
  _key: string
  disabled?: boolean
  title?: MultiLineBoldInput
  brandLogo?: SanityImageData
  productImage?: SanityImageData
  slides?: CustomerStorySlideItem[]
  spacing?: SpacingData
}

export interface CustomerStoryBlockProps {
  block?: CustomerStoryBlockData
}

export interface FeatureCardItem {
  _key?: string
  title: string
  text: string
  backgroundColor?: 'blue' | 'orange' | string
  mediaType?: 'number' | 'rive'
  number?: string
  riveArtboard?: string
}

export interface FeatureCardsBlockData {
  _type: 'featureCardsBlock'
  _key: string
  disabled?: boolean
  heading?: string
  cards?: FeatureCardItem[]
  spacing?: SpacingData
}

export interface FeatureCardsBlockProps {
  block?: FeatureCardsBlockData
}

export interface CtaBlockData {
  _type: 'ctaBlock'
  _key: string
  disabled?: boolean
  text?: string
  button?: ButtonData
  orientation?: 'vertical' | 'horizontal'
  textWidth?: 'narrow' | 'wider'
  spacing?: SpacingData
}

export interface CtaBlockProps {
  block?: CtaBlockData
}

export interface RatingCardItem {
  _key?: string
  quote: string
  name: string
}

export interface RatingCardsBlockData {
  _type: 'ratingCardsBlock'
  _key: string
  disabled?: boolean
  heading?: string
  ratings?: RatingCardItem[]
  spacing?: SpacingData
}

export interface RatingCardsBlockProps {
  block?: RatingCardsBlockData
}

export interface MerchantReviewSlideItem {
  _key?: string
  quote: string
  name: string
  title: string
}

export interface MerchantReviewSlideBlockData {
  _type: 'merchantReviewSlideBlock'
  _key: string
  disabled?: boolean
  topText?: string
  ratings?: MerchantReviewSlideItem[]
  spacing?: SpacingData
}

export interface MerchantReviewSlideBlockProps {
  block?: MerchantReviewSlideBlockData
}

export interface LogoCarouselBlockData {
  _type: 'logoCarouselBlock'
  _key: string
  disabled?: boolean
  title?: string
  logos?: {
    _key?: string
    alt?: string
    image?: SanityImageData
  }[]
  spacing?: SpacingData
}

export interface LogoCarouselBlockProps {
  block?: LogoCarouselBlockData
}

export interface SavedbyComparisonBlockData {
  _type: 'savedbyComparisonBlock'
  _key: string
  disabled?: boolean
  heading?: string
  subtitle?: string
  savedbyOffers?: string[]
  competitionOffers?: string[]
  pricingText?: string
  price?: string
  spacing?: SpacingData
}

export interface SavedbyComparisonBlockProps {
  block?: SavedbyComparisonBlockData
  nextBlockType?: string
}

export interface NavColorChangeTriggerBlockData {
  _type: 'navColorChangeTriggerBlock'
  _key: string
  disabled?: boolean
  from?: 'light' | 'dark'
  to?: 'light' | 'dark'
}

export interface NavColorChangeTriggerBlockProps {
  block?: NavColorChangeTriggerBlockData
}

export interface CaseStudyItemData {
  _key?: string
  caseStudy?: any
  companyName: string
  textUnder?: string
  image?: SanityImageData
}

export interface CaseStudySliderBlockData {
  _type: 'caseStudySliderBlock'
  _key: string
  disabled?: boolean
  heading?: MultiLineBoldInput
  caseStudies?: CaseStudyItemData[]
  spacing?: SpacingData
}

export interface CaseStudySliderBlockProps {
  block?: CaseStudySliderBlockData
}

export interface CaseStudyCardData {
  _id: string
  title?: string
  slug?: string
  logo?: { alt?: string; image?: SanityImageData }
  coverImage?: { alt?: string; image?: SanityImageData }
}

export interface CaseStudyBlockData {
  _type: 'caseStudyBlock'
  _key: string
  disabled?: boolean
  heading?: MultiLineBoldInput
  basePath?: string
  caseStudies?: CaseStudyCardData[]
  spacing?: SpacingData
}

export interface CaseStudyBlockProps {
  block?: CaseStudyBlockData
}

export interface CaseStudyImageData {
  alt?: string
  image?: SanityImageData
}

export type CaseStudyContentBlock =
  | { _type: 'caseStudyHeading'; _key: string; heading?: MultiLineBoldInput }
  | { _type: 'caseStudyText'; _key: string; text?: string }
  | { _type: 'caseStudyQuote'; _key: string; quote?: string; name?: string; title?: string }
  | { _type: 'caseStudyImage'; _key: string; image?: CaseStudyImageData }
  | { _type: 'caseStudyNumberCard'; _key: string; number?: string; title?: string; text?: string }
  | { _type: 'caseStudyImageFootnote'; _key: string; image?: CaseStudyImageData; footnote?: string }

export interface CaseStudyData extends CaseStudyCardData {
  description?: string
  industry?: string
  founded?: string
  hq?: string
  content?: CaseStudyContentBlock[]
  blocks?: PageBlock[]
  metaTitle?: string
  metaDescription?: string
  ogImageUrl?: string
}

export interface ContactFormBlockData {
  _type: 'contactFormBlock'
  _key: string
  disabled?: boolean
  variant?: 'minimal' | 'complex'
  centerText?: any
  bottomText?: any
  spacing?: SpacingData
}

export interface ContactFormBlockProps {
  block?: ContactFormBlockData
}

export interface CurveBlockData {
  _type: 'curveBlock'
  _key: string
  disabled?: boolean
  color?: 'offwhite' | 'orange' | 'blue' | 'brown'
  spacing?: SpacingData
}

export interface CurveBlockProps {
  block?: CurveBlockData
}

export interface TextHeroBlockData {
  _type: 'textHeroBlock'
  _key: string
  disabled?: boolean
  curveColor?: 'blue' | 'orange' | 'brown'
  smallText?: string
  heading?: string
  subtext?: string
  spacing?: SpacingData
}

export interface TextHeroBlockProps {
  block?: TextHeroBlockData
}

export interface IntegrationLogoBlockData {
  _type: 'integrationLogoBlock'
  _key: string
  disabled?: boolean
  logo?: {
    alt?: string
    image?: SanityImageData
  }
  text?: string
  subtext?: string
  button?: ButtonData
  spacing?: SpacingData
}

export interface IntegrationLogoBlockProps {
  block?: IntegrationLogoBlockData
}

export type RichTextPageItem =
  | { _type: 'richTextContent'; _key: string; content?: PortableTextBlock[] }
  | { _type: 'dropdownRichText'; _key: string; label?: string; content?: PortableTextBlock[] }

export interface RichTextPageBlockData {
  _type: 'richTextPageBlock'
  _key: string
  disabled?: boolean
  title?: string
  subtext?: string
  items?: RichTextPageItem[]
  spacing?: SpacingData
}

export interface RichTextPageBlockProps {
  block?: RichTextPageBlockData
}

export type PageBlock =
  | RichTextPageBlockData
  | HeroBlockData
  | StickyTextBlockData
  | NumberedCardsBlockData
  | CustomerStoryBlockData
  | FeatureCardsBlockData
  | CtaBlockData
  | RatingCardsBlockData
  | MerchantReviewSlideBlockData
  | LogoCarouselBlockData
  | SavedbyComparisonBlockData
  | NavColorChangeTriggerBlockData
  | CaseStudySliderBlockData
  | CaseStudyBlockData
  | ContactFormBlockData
  | CurveBlockData
  | TextHeroBlockData
  | IntegrationLogoBlockData
  | { _type: string; _key: string; spacing?: SpacingData; [key: string]: unknown }

export interface PageData {
  _id: string
  title: string
  slug: string
  blocks: PageBlock[]
  metaTitle?: string
  metaDescription?: string
  ogImageUrl?: string
  noIndex?: boolean
}