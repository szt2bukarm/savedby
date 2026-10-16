import { groq } from 'next-sanity'

const IMAGE_ASSET = groq`{
  ...,
  "asset": {
    "_ref": asset._ref,
    "url": asset->url,
    "metadata": asset->metadata {
      lqip,
      dimensions { width, height }
    }
  }
}`

const FILE_ASSET = groq`{
  ...,
  "asset": {
    "_ref": asset._ref,
    "url": asset->url
  }
}`

// ─── Page Blocks ────────────────────────────────────────────────────

const BLOCKS_FIELDS = groq`
      _type,
      _key,
      disabled,
      spacing {
        type,
        top,
        bottom,
        tabletTop,
        tabletBottom,
        mobileTop,
        mobileBottom
      },
      _type == "heroBlock" => {
        heading,
        bottomText,
        button {
          text,
          href
        },
        logoMarquee[] {
          _key,
          alt,
          "image": image ${IMAGE_ASSET}
        },
        firstText,
        secondText,
      },
      _type == "stickyTextBlock" => {
        items[] {
          _key,
          text,
          boxIcon
        }
      },
      _type == "numberedCardsBlock" => {
        cards[] {
          _key,
          number,
          text,
          color
        }
      },
      _type == "customerStoryBlock" => {
        title,
        "brandLogo": brandLogo ${IMAGE_ASSET},
        "productImage": productImage ${IMAGE_ASSET},
        "slides": [
          slide1 {
            _key,
            heading,
            text,
            backgroundColor,
            graphicBackground,
            mobileBackgroundColor
          },
          slide2 {
            _key,
            heading,
            text,
            backgroundColor,
            graphicBackground,
            mobileBackgroundColor
          },
          slide3 {
            _key,
            heading,
            text,
            backgroundColor,
            graphicBackground,
            mobileBackgroundColor
          }
        ]
      },
      _type == "featureCardsBlock" => {
        heading,
        cards[] {
          _key,
          title,
          text,
          backgroundColor,
          mediaType,
          number,
          riveArtboard
        }
      },
      _type == "ctaBlock" => {
        text,
        button {
          text,
          href
        },
        orientation,
        textWidth
      },
      _type == "ratingCardsBlock" => {
        heading,
        ratings[] {
          _key,
          quote,
          name
        }
      },
      _type == "merchantReviewSlideBlock" => {
        topText,
        ratings[] {
          _key,
          quote,
          name,
          title
        }
      },
      _type == "logoCarouselBlock" => {
        title,
        logos[] {
          _key,
          alt,
          "image": image ${IMAGE_ASSET}
        }
      },
      _type == "savedbyComparisonBlock" => {
        heading,
        subtitle,
        savedbyOffers,
        competitionOffers,
        pricingText,
        price
      },
      _type == "navColorChangeTriggerBlock" => {
        from,
        to
      },
      _type == "parallaxDividerBlock" => {
      },
      _type == "curveBlock" => {
        color
      },
      _type == "textHeroBlock" => {
        curveColor,
        smallText,
        heading,
        subtext
      },
      _type == "richTextPageBlock" => {
        title,
        subtext,
        items[] {
          _key,
          _type,
          label,
          content[] {
            ...,
            markDefs[] { ... }
          }
        }
      },
      _type == "integrationLogoBlock" => {
        "logo": logo { alt, "image": image ${IMAGE_ASSET} },
        text,
        subtext,
        button {
          text,
          href
        }
      },
      _type == "caseStudySliderBlock" => {
        heading,
        caseStudies[] {
          _key,
          "caseStudy": caseStudy->{
            title
          },
          companyName,
          textUnder,
          "image": image ${IMAGE_ASSET}
        }
      },
      _type == "caseStudyBlock" => {
        heading,
        "basePath": *[_type == "caseStudySettings"][0].basePath,
        caseStudies[]-> {
          _id,
          title,
          "slug": slug.current,
          "logo": logo { alt, "image": image ${IMAGE_ASSET} },
          "coverImage": coverImage { alt, "image": image ${IMAGE_ASSET} }
        }
      },
      _type == "contactFormBlock" => {
        variant,
        centerText,
        bottomText
      },
`

// ─── Pages ──────────────────────────────────────────────────────────

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    blocks[] {
      ${BLOCKS_FIELDS}
    },
    metaTitle,
    metaDescription,
    "ogImageUrl": ogImage.asset->url,
    noIndex
  }
`

export const ALL_SLUGS_QUERY = groq`
  *[_type == "page" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }
`

// ─── Case Studies ───────────────────────────────────────────────────

export const CASE_STUDY_SETTINGS_QUERY = groq`
  *[_type == "caseStudySettings"][0] {
    basePath
  }
`

export const CASE_STUDY_QUERY = groq`
  *[_type == "caseStudy" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    "logo": logo { alt, "image": image ${IMAGE_ASSET} },
    "coverImage": coverImage { alt, "image": image ${IMAGE_ASSET} },
    description,
    industry,
    founded,
    hq,
    "blocks": *[_type == "caseStudySettings"][0].blocks[] {
      ${BLOCKS_FIELDS}
    },
    content[] {
      _type,
      _key,
      _type == "caseStudyHeading" => {
        heading
      },
      _type == "caseStudyText" => {
        text
      },
      _type == "caseStudyQuote" => {
        quote,
        name,
        title
      },
      _type == "caseStudyImage" => {
        "image": image { alt, "image": image ${IMAGE_ASSET} }
      },
      _type == "caseStudyNumberCard" => {
        number,
        title,
        text
      },
      _type == "caseStudyImageFootnote" => {
        "image": image { alt, "image": image ${IMAGE_ASSET} },
        footnote
      }
    },
    metaTitle,
    metaDescription,
    "ogImageUrl": coverImage.image.asset->url
  }
`

export const ALL_CASE_STUDY_SLUGS_QUERY = groq`
  *[_type == "caseStudy" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }
`

// ─── Helpers ────────────────────────────────────────────────────────

const LINK_FIELDS = groq`
  _id,
  text,
  href
`

// ─── Singletons ─────────────────────────────────────────────────────

export const FOOTER_QUERY = groq`
  *[_type == "footer"][0] {
    _id,
    copyrightText,
    cookieText,
    columns[] {
      _key,
      title,
      links[]-> {
        _id,
        text,
        href
      }
    },
    bottomLinks[]-> {
      _id,
      text,
      href
    }
  }
`

export const NAV_QUERY = groq`
  *[_type == "nav"][0] {
    _id,
    dropdowns[] {
      _type,
      _key,
      _type == "reference" => @-> {
        ${LINK_FIELDS}
      },
      _type == "navDropdown" => {
        text,
        links[]-> {
          ${LINK_FIELDS}
        }
      }
    },
    buttons[] {
      _type,
      _key,
      text,
      href,
      variant
    }
  }
`

export const MOBILE_NAV_QUERY = groq`
  *[_type == "mobileNav"][0] {
    _id,
    copyrightText,
    bigLinks[]-> {
      ${LINK_FIELDS}
    },
    gridLinks[]-> {
      ${LINK_FIELDS}
    },
    socials[] {
      _key,
      url,
      alt
    }
  }
`



export const SEO_QUERY = groq`
  *[_type == "seoSettings"][0] {
    _id,
    title,
    description,
    url,
    tags,
    "ogImageUrl": ogImage.asset->url
  }
`
