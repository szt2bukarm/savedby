import SmoothScroll from '../SmoothScroll'
import { ScrollReset } from '../components/ScrollReset'


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
        <div className="h-full w-full">{children}</div>
      </SmoothScroll>
    </>
  )
}
