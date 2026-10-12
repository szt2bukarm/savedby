"use client"
import type { FooterData } from '@/types/sanity'
import SavedByLogo from './SavedByLogo'
import Box from './Box'
import { CURVE_CLIP, CURVE_VARS } from '@/app/utils/curve'
import { Link } from 'next-view-transitions'
import { useRef } from 'react'
import { useAppContext } from '@/app/AppContext'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface FooterProps {
  data?: FooterData | null
}

const DayJob = () => {
  return (
    <svg className='inline' xmlns="http://www.w3.org/2000/svg" width="62" height="17" viewBox="0 0 62 17" fill="none">
  <path d="M0 13.005V12.665H0.442857C0.974286 12.665 1.41714 12.495 1.59429 12.155C1.77143 11.9 1.86 11.475 1.86 10.795V2.805C1.86 2.04 1.77143 1.53 1.59429 1.36C1.32857 1.105 0.974286 0.935 0.442857 0.935H0V0.595H5.22571C7.17429 0.595 8.59143 0.765 9.65429 1.19C10.7171 1.615 11.4257 2.295 12.0457 3.315C12.6657 4.335 12.9314 5.44 12.9314 6.715C12.9314 8.415 12.4 9.86 11.3371 11.05C10.0971 12.325 8.23714 13.005 5.75714 13.005H0ZM3.63143 12.07C4.42857 12.24 5.13714 12.325 5.66857 12.325C7.17429 12.325 8.32571 11.815 9.3 10.88C10.2743 9.945 10.8057 8.5 10.8057 6.8C10.8057 5.1 10.3629 3.74 9.38857 2.72C8.41429 1.7 7.17429 1.275 5.58 1.275C5.04857 1.275 4.42857 1.36 3.63143 1.53V12.07ZM19.22 11.73C18.3343 12.41 17.8029 12.75 17.5371 12.92C17.1829 13.09 16.8286 13.175 16.4743 13.175C15.8543 13.175 15.4114 13.005 14.9686 12.58C14.6143 12.155 14.3486 11.645 14.3486 11.05C14.3486 10.625 14.4371 10.285 14.6143 10.03C14.88 9.605 15.3229 9.265 15.9429 8.84C16.5629 8.5 17.6257 7.99 19.1314 7.48V7.14C19.1314 6.29 18.9543 5.695 18.6886 5.44C18.6 5.1 18.1571 4.93 17.6257 4.93C17.1829 4.93 16.9171 5.015 16.6514 5.27C16.3857 5.44 16.2971 5.695 16.2971 5.95V6.46C16.2971 6.715 16.2086 6.97 16.0314 7.14C15.8543 7.31 15.6771 7.395 15.4114 7.395C15.1457 7.395 14.9686 7.31 14.88 7.14C14.7029 6.97 14.6143 6.8 14.6143 6.46C14.6143 5.95 14.88 5.44 15.4114 5.015C15.9429 4.59 16.74 4.335 17.7143 4.335C18.5114 4.335 19.1314 4.42 19.5743 4.675C19.9286 4.845 20.1943 5.185 20.3714 5.525C20.46 5.78 20.5486 6.29 20.5486 7.14V9.945C20.5486 10.71 20.5486 11.22 20.6371 11.39C20.6371 11.56 20.7257 11.73 20.8143 11.73C20.9029 11.815 20.9914 11.815 21.08 11.815C21.1686 11.815 21.2571 11.815 21.3457 11.73C21.5229 11.645 21.7 11.39 22.1429 11.05V11.56C21.4343 12.495 20.7257 12.92 20.1057 12.92C19.7514 12.92 19.5743 12.835 19.3971 12.58C19.3971 12.58 19.22 12.24 19.22 11.73ZM19.22 11.135V7.99C18.2457 8.33 17.6257 8.585 17.36 8.755C16.8286 9.01 16.4743 9.265 16.2971 9.605C16.12 9.86 15.9429 10.2 15.9429 10.54C15.9429 10.965 16.12 11.305 16.3857 11.645C16.6514 11.985 17.0057 12.07 17.36 12.07C17.8029 12.07 18.4229 11.815 19.22 11.135ZM22.4971 4.59H26.5714V4.93H26.3943C26.1286 4.93 25.8629 5.015 25.7743 5.1C25.5971 5.185 25.5971 5.355 25.5971 5.525C25.5971 5.78 25.6857 6.12 25.9514 6.545L28.0771 10.795L30.0257 6.205C30.1143 5.95 30.2029 5.695 30.2029 5.44C30.2029 5.355 30.2029 5.27 30.1143 5.185C30.0257 5.1 30.0257 5.1 29.8486 5.015C29.76 5.015 29.5829 4.93 29.3171 4.93V4.59H32.1514V4.93C31.8857 4.93 31.7086 5.015 31.62 5.1C31.5314 5.185 31.3543 5.27 31.1771 5.525C31.0886 5.61 31 5.865 30.8229 6.205L27.28 14.535C26.9257 15.385 26.4829 15.98 25.9514 16.405C25.42 16.83 24.8886 17 24.3571 17C24.0029 17 23.6486 16.915 23.4714 16.66C23.2057 16.49 23.1171 16.235 23.1171 15.98C23.1171 15.725 23.2057 15.555 23.3829 15.385C23.56 15.215 23.8257 15.13 24.0914 15.13C24.2686 15.13 24.6229 15.215 24.9771 15.3C25.2429 15.385 25.42 15.47 25.42 15.47C25.5971 15.47 25.7743 15.385 26.04 15.215C26.3057 15.045 26.4829 14.62 26.7486 14.11L27.3686 12.665L24.2686 6.375C23.9143 6.12 23.7371 5.95 23.56 5.61C23.3829 5.355 23.2943 5.27 23.2057 5.185C23.0286 5.1 22.7629 5.015 22.4971 4.93V4.59ZM38.8829 0.935V0.595H44.3743V0.935H43.9314C43.4 0.935 43.0457 1.105 42.78 1.36C42.6029 1.615 42.5143 2.04 42.5143 2.805V8.84C42.5143 9.775 42.4257 10.54 42.16 11.135C41.9829 11.73 41.54 12.24 41.0971 12.665C40.5657 13.09 39.9457 13.345 39.2371 13.345C38.6171 13.345 38.1743 13.175 37.82 12.92C37.4657 12.665 37.2886 12.325 37.2886 11.985C37.2886 11.645 37.3771 11.475 37.5543 11.305C37.7314 11.135 37.9971 11.05 38.2629 11.05C38.44 11.05 38.6171 11.135 38.7943 11.22C38.9714 11.39 39.1486 11.73 39.4143 12.24C39.5914 12.58 39.7686 12.75 39.9457 12.75C40.1229 12.75 40.3 12.665 40.3886 12.41C40.4771 12.155 40.6543 11.815 40.6543 11.305V2.805C40.6543 2.21 40.6543 1.785 40.5657 1.53C40.4771 1.36 40.3886 1.275 40.1229 1.105C39.8571 0.935 39.5914 0.85 39.2371 0.85H38.8829V0.935ZM48.7143 4.335C50.0429 4.335 51.1057 4.845 51.9029 5.78C52.6114 6.63 52.8771 7.565 52.8771 8.585C52.8771 9.35 52.7 10.115 52.3457 10.88C51.9914 11.645 51.46 12.24 50.84 12.58C50.22 13.005 49.4229 13.175 48.6257 13.175C47.2971 13.175 46.2343 12.665 45.5257 11.645C44.9057 10.795 44.5514 9.86 44.5514 8.84C44.5514 8.075 44.7286 7.31 45.1714 6.545C45.5257 5.78 46.0571 5.27 46.7657 4.845C47.2971 4.59 48.0057 4.335 48.7143 4.335ZM48.4486 4.93C48.0943 4.93 47.74 5.015 47.4743 5.185C47.12 5.355 46.8543 5.695 46.6771 6.205C46.5 6.715 46.3229 7.31 46.3229 8.075C46.3229 9.265 46.5886 10.37 47.12 11.22C47.6514 12.07 48.2714 12.58 49.0686 12.58C49.6886 12.58 50.22 12.325 50.5743 11.815C51.0171 11.305 51.1943 10.455 51.1943 9.265C51.1943 7.82 50.84 6.63 50.22 5.78C49.6886 5.27 49.1571 4.93 48.4486 4.93ZM55.9771 6.035C56.8629 4.93 57.7486 4.335 58.7229 4.335C59.6086 4.335 60.4057 4.675 61.0257 5.44C61.6457 6.205 62 7.225 62 8.5C62 9.945 61.4686 11.22 60.4943 12.07C59.6086 12.835 58.6343 13.26 57.5714 13.26C57.04 13.26 56.5086 13.175 56.0657 13.005C55.5343 12.835 55.0029 12.58 54.4714 12.24V3.485C54.4714 2.55 54.4714 1.955 54.3829 1.7C54.2943 1.445 54.2943 1.36 54.1171 1.275C54.0286 1.19 53.8514 1.19 53.7629 1.19C53.5857 1.19 53.32 1.275 53.0543 1.36L52.8771 1.02L55.5343 0H55.9771V6.035ZM55.9771 6.63V11.645C56.3314 11.985 56.5971 12.155 56.9514 12.325C57.3057 12.495 57.66 12.58 58.0143 12.58C58.6343 12.58 59.1657 12.24 59.6086 11.645C60.14 11.05 60.3171 10.115 60.3171 9.01C60.3171 7.905 60.0514 7.14 59.6086 6.545C59.1657 5.95 58.5457 5.695 57.9257 5.695C57.5714 5.695 57.2171 5.78 56.9514 5.95C56.6857 6.035 56.3314 6.29 55.9771 6.63Z" fill="#FDF6E2"/>
</svg>
  )
}

export default function Footer({ data }: FooterProps) {
  const ref = useRef<HTMLElement>(null)
  const { setNavHidden } = useAppContext()

  useGSAP(() => {
    if (!ref.current) return
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top-=400 5%',
      end: 'max',
      onEnter: () => setNavHidden(true),
      onLeaveBack: () => setNavHidden(false),
      onRefresh: (self) => setNavHidden(self.progress > 0),
    })
    return () => {
      st.kill()
      setNavHidden(false)
    }
  }, { dependencies: [data], scope: ref })

  if (!data) return null
  return (
    <footer
      ref={ref}
      style={{ clipPath: CURVE_CLIP }}
      className={`${CURVE_VARS} mt-[-100px] overflow-x-clip w-full bg-brand-blue relative overflow-hidden sm:min-h-[1000px] lg:min-h-[800px] flex flex-col justify-between pt-[120px] sm:pt-[180px] pb-[60px] px-[20px] sm:px-[40px] lg:px-[60px] xl:px-[110px]`}>

      <SavedByLogo color='#FDF6E2' className='mb-[40px] w-[130px] sm:w-[220px] z-10' />

      <div className='flex flex-col mb-[100px] gap-[50px] sm:flex-row sm:gap-[100px] lg:gap-[50px] z-10'>
        {data.columns?.map((col, index) => (
          <div key={index} className='flex flex-col gap-[30px] w-fit'>
            <p className='text-background text-desktop-h6 font-riforma-bold'>{col.title}</p>
            <div className='flex flex-col gap-[10px]'>
              {col.links?.map((l, lIndex) => (
                <Link className='leading-[100%] tracking-[-1%] font-riforma-regular text-background hover:opacity-50 duration-150' key={lIndex} href={`${l.href || '#'}`}>
                  {l.text}
                </Link>
              ))}
            </div>
          </div>
        ))}
        
      </div>

      <p className='text-desktop-caption tracking-[-1%] mb-[40px] w-[85%] sm:w-[350px] lg:w-[450px] text-white leading-[110%] z-10'>{data.cookieText}</p>

      <div className='w-full flex gap-[100px] lg:gap-0 lg:justify-between flex-col lg:flex-row lg:items-end'>
        <div className='flex flex-col lg:flex-row gap-[20px] lg:gap-[30px]'>
          {data.bottomLinks?.map((link, index) => (
            <Link key={link._id || index} href={link.href || '#'} className='text-white text-desktop-p2 hover:opacity-50 duration-150 leading-[110%] font-riforma-regular tracking-[-1%]'>{link.text}</Link>
          ))}
        </div>

        <div className='flex flex-col md:flex-row justify-between lg:justify-normal lg:flex-col xl:flex-row gap-[10px] sm:gap-0 xl:gap-[20px] z-10'>
          <p className='text-white text-mobile-subtitle sm:text-desktop-p2 leading-[110%] font-riforma-regular tracking-[-1%] text-center sm:text-left lg:text-right'>{data.copyrightText}</p>
          <p className='text-white text-mobile-subtitle sm:text-desktop-p2 leading-[110%] font-riforma-regular tracking-[-1%] text-center sm:text-left lg:text-right'>Branding and Website By&nbsp; <span className='inline'><DayJob /></span></p>
        </div>
      </div>


      <Box className='absolute right-[-30vw] w-[80vw] top-[200px] sm:-translate-y-0 sm:right-[-150px] sm:top-[calc(100%-600px)] sm:w-[500px]  lg:right-[-150px] lg:top-[-50px] lg:w-[700px] z-0' />
    </footer>
  )
}
