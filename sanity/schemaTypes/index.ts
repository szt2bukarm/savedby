// ─── Objects ────────────────────────────────────────────────────────
import { navLinkType } from './objects/navLinkType'
import { navDropdownType } from './objects/navDropdownType'
import { socialPlatformType } from './objects/socialPlatformType'
import { buttonType } from './objects/buttonType'
import { imageType } from './objects/imageType'
import { seoType } from './objects/seoType'

// ─── Blocks ─────────────────────────────────────────────────────────
import { heroBlock } from './blocks/heroBlock'

// ─── Singletons ─────────────────────────────────────────────────────
import { navType } from './singletons/navType'
import { footerType } from './singletons/footerType'
import { mobileNavType } from './singletons/mobileNavType'
import { spacingType } from './singletons/SpacingType'

// ─── Documents ──────────────────────────────────────────────────────
import { pageType } from './documents/pageType'

export const schemaTypes = [
  // Objects
  navLinkType,
  navDropdownType,
  socialPlatformType,
  buttonType,
  imageType,
  seoType,

  // Blocks
  heroBlock,

  // Singletons
  navType,
  footerType,
  mobileNavType,
  spacingType,

  // Documents
  pageType,
]
