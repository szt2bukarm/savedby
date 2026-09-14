import './globals.css'

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { AppProvider } from './AppContext'
import { SanityLive } from '@/sanity/lib/live'
import { SanityLiveWrapper } from './components/SanityLiveWrapper'
import { draftMode } from 'next/headers'
import { ViewTransitions } from 'next-view-transitions'
import { client } from '@/sanity/lib/client'
import { SEO_QUERY } from '@/sanity/lib/queries'
import DraftModeIndicator from './components/DraftModeIndicator'

const riformaBold = localFont({
  src: '../public/fonts/riforma-bold.woff2',
  variable: '--font-riforma-bold',
})

const riformaRegular = localFont({
  src: '../public/fonts/riforma-regular.woff2',
  variable: '--font-riforma-regular',
})

const riformaMedium = localFont({
  src: '../public/fonts/riforma-medium.woff2',
  variable: '--font-riforma-medium',
})



export async function generateMetadata(): Promise<Metadata> {
  let seoData
  try {
    seoData = await client.fetch(SEO_QUERY, {}, { next: { revalidate: 60 } })
  } catch (e) {
    console.error('Error fetching SEO settings:', e)
  }

  const siteTitle = seoData?.title
  const siteDescription = seoData?.description
  const siteKeywords = seoData?.tags

  return {
    metadataBase: new URL(seoData?.url || 'https://example.com'),
    title: siteTitle
      ? {
          template: `%s | ${siteTitle}`,
          default: siteTitle,
        }
      : 'Brand',
    description: siteDescription || undefined,
    keywords: siteKeywords || undefined,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: './',
    },
    openGraph: {
      title: siteTitle || 'Brand',
      description: siteDescription || undefined,
      url: seoData?.url,
      images: seoData?.ogImageUrl ? [{ url: seoData.ogImageUrl }] : undefined,
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isEnabled } = await draftMode()

  let seoData
  try {
    seoData = await client.fetch(SEO_QUERY, {}, { next: { revalidate: 60 } })
  } catch (e) {
    console.error('Error fetching SEO settings in RootLayout:', e)
  }

  const siteTitle = seoData?.title || 'Brand'
  const siteUrl = seoData?.url || ''
  const siteDescription = seoData?.description || ''

  const jsonLdData = siteUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteTitle,
        url: siteUrl,
        description: siteDescription,
      }
    : null

  return (
    <ViewTransitions>
      <html
        lang="en"
        suppressHydrationWarning className={`${riformaBold.variable} ${riformaRegular.variable} ${riformaMedium.variable}`}>
        <head>
          {jsonLdData && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
            />
          )}
        </head>
        <body>
          <AppProvider isDraftMode={isEnabled}>{children}</AppProvider>
          {isEnabled && <DraftModeIndicator />}
          {isEnabled && (
            <SanityLiveWrapper>
              <SanityLive />
            </SanityLiveWrapper>
          )}
        </body>
      </html>
    </ViewTransitions>
  )
}
