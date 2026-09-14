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

// ─── Pages ──────────────────────────────────────────────────────────

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    blocks[] {
      _type,
      _key,
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

// ─── Helpers ────────────────────────────────────────────────────────

const LINK_FIELDS = groq`
  _id,
  text,
  href
`

// ─── Singletons ─────────────────────────────────────────────────────

export const NAV_QUERY = groq`
  *[_type == "nav"][0] {
    _id,
    announcement,
    leftItems[] {
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
    rightItems[] {
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

export const FOOTER_QUERY = groq`
  *[_type == "footer"][0] {
    _id,
    copyrightText,
    "footerImage": footerImage ${IMAGE_ASSET},
    "footerLogo": footerLogo ${IMAGE_ASSET}
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
