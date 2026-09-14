import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'
import { SEO_QUERY } from '@/sanity/lib/queries'

export default async function robots(): Promise<MetadataRoute.Robots> {
  let seoData
  try {
    seoData = await client.fetch(SEO_QUERY, {}, { next: { revalidate: 3600 } })
  } catch (e) {
    console.error('Error fetching SEO settings for robots.ts:', e)
  }

  const baseUrl = seoData?.url || 'https://site.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
