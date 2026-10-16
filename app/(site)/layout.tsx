import SmoothScroll from '../SmoothScroll'
import { ScrollReset } from '../components/ScrollReset'
import HeroSceneProvider from '../components/blocks/Hero/HeroSceneProvider'
import Loader from '../components/common/Loader'
import Nav from '../components/common/Nav'
import { client } from '@/sanity/lib/client'
import Footer from '../components/common/Footer'
import { FOOTER_QUERY, NAV_QUERY } from '@/sanity/lib/queries'

export const revalidate = 60

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [navData, footerData] = await Promise.all([
    client.fetch(NAV_QUERY),
    client.fetch(FOOTER_QUERY),
  ])

  return (
      <SmoothScroll>
        <HeroSceneProvider>
          <Loader />
          <ScrollReset />
          <div className="relative h-full w-full overflow-x-clip">
            <Nav data={navData} />
            {children}
            <Footer data={footerData} />
          </div>
        </HeroSceneProvider>
      </SmoothScroll>
  )
}
