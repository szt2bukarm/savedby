import SmoothScroll from '../SmoothScroll'
import { ScrollReset } from '../components/ScrollReset'
import Nav from '../components/common/Nav'


export const revalidate = 60

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {


  return (
    <>
      <SmoothScroll>
        <ScrollReset />
        <div className="relative h-full w-full">
          <Nav />
          {children}
        </div>
      </SmoothScroll>
    </>
  )
}
