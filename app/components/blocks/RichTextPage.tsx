'use client'  
import { PortableText, PortableTextComponents } from 'next-sanity'
import { Link } from 'next-view-transitions'
import type { RichTextPageBlockProps } from '@/types/sanity'
import { getSpacingClasses } from '@/app/utils/spacing'
import gsap, { ScrollTrigger } from 'gsap/all'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger);

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-desktop-p3 font-riforma-regular tracking-[-2%] leading-[130%] mb-[20px] last:mb-0 whitespace-pre-line">
        {children}
      </p>
    ),
  },
  list: {
    number: ({ children }) => <ol className="list-decimal">{children}</ol>,
  },
  listItem: {
    number: ({ children }) => (
      <li className="text-desktop-p3 font-riforma-regular">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-riforma-bold">{children}</strong>,
    link: ({ children, value }) => {
      const href: string = value?.href || ''
      const external = /^https?:\/\//.test(href)
      const newTab = value?.openInNewTab
      const isInternal = href.startsWith('/') && !href.startsWith('//')
      if (isInternal) {
        return (
          <Link
            href={href}
            target={newTab ? '_blank' : undefined}
            className="underline underline-offset-2 hover:opacity-50 transition-opacity">
            {children}
          </Link>
        )
      }
      return (
        <a
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab || external ? 'noopener noreferrer' : undefined}
          className="underline underline-offset-2 hover:opacity-50 transition-opacity">
          {children}
        </a>
      )
    },
  },
}

export default function RichTextPage({ block }: RichTextPageBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing)

  useEffect(() => {
    ScrollTrigger.refresh();
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [])

  return (
    <div className={`w-full flex flex-col items-center ${spacingClasses}`}>
      {block?.title && (
        <h2 className="whitespace-pre-line text-center text-brand-orange text-desktop-h1 tracking-[-6%] leading-[85%] font-riforma-bold mb-[20px]">
          {block.title}
        </h2>
      )}
      {block?.subtext && (
        <p className="text-center text-black text-desktop-p3 font-riforma-bold tracking-[-3%] leading-[110%] mb-[50px]">{block.subtext}</p>
      )}

      <div className="w-full max-w-[1000px] flex flex-col">
        {block?.items?.map((item) => {
          if (item._type === 'dropdownRichText') {
            return (
              <details key={item._key} className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden text-desktop-h4 font-riforma-regular tracking-[-4%] border-b border-black/20 py-[20px] hover:opacity-50 transition-opacity">
                  <span>{item.label}</span>
                  <svg className="transition-transform group-open:rotate-0 rotate-180" xmlns="http://www.w3.org/2000/svg" width="25" height="16" viewBox="0 0 25 16" fill="none">
                    <path d="M23.418 13.8921L12.4375 2.91162L1.45703 13.8921" stroke="#110F0B" stroke-width="4.11768"/>
                  </svg>
                </summary>
                <div className="pt-[30px]">
                  {item.content && <PortableText value={item.content as any} components={components} />}
                </div>
              </details>
            )
          }
          return (
            <div key={item._key} className="py-[50px]">
              {item.content && <PortableText value={item.content as any} components={components} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
