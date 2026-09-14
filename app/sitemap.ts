import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_SLUGS_QUERY, SEO_QUERY } from '@/sanity/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let seoData
  let pages: { slug: string; _updatedAt?: string }[] = []
  try {
    seoData = await client.fetch(SEO_QUERY, {}, { next: { revalidate: 3600 } })
    pages = await client.fetch(
      ALL_SLUGS_QUERY,
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

  return sitemapEntries
}
