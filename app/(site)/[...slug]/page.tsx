import { client } from '@/sanity/lib/client'
import { PAGE_QUERY, ALL_SLUGS_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import PageBuilder from '@/app/components/PageBuilder'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export const revalidate = 60

export async function generateStaticParams() {
  const pages = await client.fetch(ALL_SLUGS_QUERY)

  return (
    pages
      ?.map((page: { slug: string }) => ({
        slug: page.slug.split('/').filter(Boolean),
      }))
      .filter((p: { slug: string[] }) => p.slug.join('/') !== 'home') || []
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const slugString = Array.isArray(slug) ? slug.join('/') : slug

  if (slugString === 'home') {
    notFound()
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
