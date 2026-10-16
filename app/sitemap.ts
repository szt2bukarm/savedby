import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { DEFAULT_CASE_STUDY_BASE_PATH, getCaseStudyBasePath } from '@/app/utils/caseStudy'
import { ALL_SLUGS_QUERY, ALL_CASE_STUDY_SLUGS_QUERY, SEO_QUERY } from '@/sanity/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let seoData
  let pages: { slug: string; _updatedAt?: string }[] = []
  let caseStudyBasePath = DEFAULT_CASE_STUDY_BASE_PATH
  let caseStudies: { slug: string; _updatedAt?: string }[] = []
  try {
    seoData = await client.fetch(SEO_QUERY, {}, { next: { revalidate: 3600 } })
    pages = await client.fetch(
      ALL_SLUGS_QUERY,
      {},
      { next: { revalidate: 3600 } }
    )
    caseStudyBasePath = await getCaseStudyBasePath()
    caseStudies = await client.fetch(
      ALL_CASE_STUDY_SLUGS_QUERY,
      {},
      { next: { revalidate: 3600 } }
    )
  } catch (e) {
    console.error('Error fetching data for sitemap:', e)
  }

  const baseUrl = seoData?.url || 'https://site.com'

  const homePage = pages.find(p => p.slug === 'home')
  const homePageUpdatedAt = homePage?._updatedAt
    ? new Date(homePage._updatedAt)
    : undefined

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: homePageUpdatedAt,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  pages.forEach(page => {
    if (page.slug && page.slug !== 'home') {
      sitemapEntries.push({
        url: `${baseUrl}/${page.slug.replace(/^\//, '')}`,
        lastModified: page._updatedAt ? new Date(page._updatedAt) : undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  })

  caseStudies.forEach(caseStudy => {
    if (caseStudy.slug) {
      sitemapEntries.push({
        url: `${baseUrl}/${caseStudyBasePath}/${caseStudy.slug}`,
        lastModified: caseStudy._updatedAt ? new Date(caseStudy._updatedAt) : undefined,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  })

  return sitemapEntries
}
