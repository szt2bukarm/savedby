import { client } from '@/sanity/lib/client'
import {
  PAGE_QUERY,
  ALL_SLUGS_QUERY,
  CASE_STUDY_QUERY,
  ALL_CASE_STUDY_SLUGS_QUERY,
} from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import PageBuilder from '@/app/components/PageBuilder'
import CaseStudyPage from '@/app/components/CaseStudyPage'
import { getCaseStudyBasePath } from '@/app/utils/caseStudy'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export const revalidate = 60

// Returns the case study slug when the url is /[basePath]/[slug], otherwise null
async function getCaseStudySlug(slug: string[]) {
  if (slug.length !== 2) return null

  const basePath = await getCaseStudyBasePath()

  return slug[0] === basePath ? slug[1] : null
}

export async function generateStaticParams() {
  const [pages, caseStudies, basePath] = await Promise.all([
    client.fetch(ALL_SLUGS_QUERY),
    client.fetch(ALL_CASE_STUDY_SLUGS_QUERY),
    getCaseStudyBasePath(),
  ])

  const pageParams =
    pages
      ?.map((page: { slug: string }) => ({
        slug: page.slug.split('/').filter(Boolean),
      }))
      .filter((p: { slug: string[] }) => p.slug.join('/') !== 'home') || []

  const caseStudyParams =
    caseStudies?.map((item: { slug: string }) => ({
      slug: [basePath, item.slug],
    })) || []

  return [...pageParams, ...caseStudyParams]
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const slugString = Array.isArray(slug) ? slug.join('/') : slug

  if (slugString === 'home') {
    notFound()
  }

  const caseStudySlug = await getCaseStudySlug(slug)

  if (caseStudySlug) {
    const caseStudy = await client.fetch(
      CASE_STUDY_QUERY,
      { slug: caseStudySlug },
      { next: { revalidate: 60 } }
    )

    return {
      title: caseStudy?.metaTitle || caseStudy?.title || caseStudySlug,
      description: caseStudy?.metaDescription || caseStudy?.description || undefined,
      alternates: {
        canonical: `/${slugString}`,
      },
      openGraph: caseStudy?.ogImageUrl
        ? {
            images: [{ url: caseStudy.ogImageUrl }],
          }
        : undefined,
    }
  }

  const page = await client.fetch(
    PAGE_QUERY,
    { slug: slugString },
    { next: { revalidate: 60 } }
  )

  return {
    title: page?.metaTitle || page?.title || slugString,
    description: page?.metaDescription || undefined,
    alternates: {
      canonical: `/${slugString}`,
    },
    robots: page?.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: page?.ogImageUrl
      ? {
          images: [{ url: page.ogImageUrl }],
        }
      : undefined,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const slugString = Array.isArray(slug) ? slug.join('/') : slug

  if (slugString === 'home') {
    notFound()
  }

  const { isEnabled } = await draftMode()

  const caseStudySlug = await getCaseStudySlug(slug)

  if (caseStudySlug) {
    let caseStudy
    if (isEnabled) {
      const res = await sanityFetch({
        query: CASE_STUDY_QUERY,
        params: { slug: caseStudySlug },
      })
      caseStudy = res.data
    } else {
      caseStudy = await client.fetch(
        CASE_STUDY_QUERY,
        { slug: caseStudySlug },
        { next: { revalidate: 60 } }
      )
    }

    if (!caseStudy) return notFound()

    return <CaseStudyPage caseStudy={caseStudy} />
  }

  let page
  if (isEnabled) {
    const res = await sanityFetch({
      query: PAGE_QUERY,
      params: { slug: slugString },
    })
    page = res.data
  } else {
    page = await client.fetch(
      PAGE_QUERY,
      { slug: slugString },
      { next: { revalidate: 60 } }
    )
  }

  if (!page) return notFound()

  return (
    <main style={{ backgroundColor: page.bgColor }}>
      <h1 className="sr-only">{page.title}</h1>
      <PageBuilder blocks={page.blocks} />
    </main>
  )
}
