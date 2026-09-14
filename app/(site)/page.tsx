import { PAGE_QUERY, SEO_QUERY } from '@/sanity/lib/queries'
import PageBuilder from '@/app/components/PageBuilder'
import { client } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/live'

export const revalidate = 60

export async function generateMetadata() {
  let seoData
  try {
    seoData = await client.fetch(SEO_QUERY, {}, { next: { revalidate: 60 } })
  } catch (e) {
    console.error('Error fetching SEO settings:', e)
  }

  const siteTitle = seoData?.title || undefined
  const siteDescription = seoData?.description || undefined

  return {
    metadataBase: new URL(seoData?.url || 'https://example.com'),
    title: 'Home',
    description: siteDescription,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: seoData?.url || undefined,
      type: 'website',
      images: seoData?.ogImageUrl ? [{ url: seoData.ogImageUrl }] : undefined,
    },
    alternates: {
      canonical: './',
    },
  }
}

import { draftMode } from 'next/headers'

export default async function HomePage() {
  const { isEnabled } = await draftMode()
  let page
  if (isEnabled) {
    const res = await sanityFetch({
      query: PAGE_QUERY,
      params: { slug: 'home' },
    })
    page = res.data
  } else {
    page = await client.fetch(
      PAGE_QUERY,
      { slug: 'home' },
      { next: { revalidate: 60 } }
    )
  }

  return (
    <main style={{ backgroundColor: page?.bgColor }}>
      <PageBuilder blocks={page?.blocks ?? []} />
    </main>
  )
}
