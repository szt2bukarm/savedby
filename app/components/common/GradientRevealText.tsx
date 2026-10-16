import React, { forwardRef } from 'react'
import { PortableText, PortableTextComponents } from 'next-sanity'

type GradientRevealTextProps = {
  text?: string
  value?: any
  components?: PortableTextComponents
  className?: string
  dataGsap?: string
  style?: React.CSSProperties
  as?: React.ElementType
  // this puts the gradient text in an extra span since on FireFox some text got clipped off completely, and this seemed to fix it, but also seems to cause issues when paired with PortableText, so only use when needed
  fixFirefox?: boolean
  children?: React.ReactNode
}

const GradientRevealText = forwardRef<any, GradientRevealTextProps>(({ 
  text, 
  value,
  components,
  className = '', 
  dataGsap, 
  style = {},
  as,
  fixFirefox = false,
  children
}, ref) => {
  const Comp = (as ?? (value ? 'div' : 'p')) as any;

  if (fixFirefox) {
    return (
      <Comp
        ref={ref}
        {...(dataGsap ? { 'data-gsap': dataGsap } : {})}
        className={className as string}
        style={{
          '--gradient-size': '0%',
          '--gradient-position': '-14% -14%',
          '--gradient-x': '50%',
          '--gradient-y': '50%',
          '--gradient-color': 'rgb(0, 149, 236)',
          ...style,
        } as React.CSSProperties}
      >
        <span
          style={{
            backgroundImage:
              'radial-gradient(circle at var(--gradient-position, var(--gradient-x, 50%) var(--gradient-y, 50%)), var(--gradient-color, rgb(0, 0, 0)) 0%, var(--gradient-color, rgb(0, 0, 0)) var(--gradient-size, 0%), transparent calc(var(--gradient-size, 0%) + 15%))',
            backgroundSize: '100% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitBoxDecorationBreak: 'clone',
            boxDecorationBreak: 'clone',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            display: 'inline',
            paddingTop: '0.2em',
            paddingBottom: '0.2em',
            paddingLeft: '0.05em',
            paddingRight: '0.05em',
          } as React.CSSProperties}
        >
          {children || (value ? <PortableText value={value} components={components} /> : text)}
        </span>
      </Comp>
    )
  }

  return (
    <Comp
      ref={ref}
      {...(dataGsap ? { 'data-gsap': dataGsap } : {})}
      className={className as string}
      style={{
        '--gradient-size': '0%',
        '--gradient-position': '-14% -14%',
        '--gradient-x': '50%',
        '--gradient-y': '50%',
        '--gradient-color': 'rgb(0, 149, 236)',
        backgroundImage:
          'radial-gradient(circle at var(--gradient-position, var(--gradient-x, 50%) var(--gradient-y, 50%)), var(--gradient-color, rgb(0, 0, 0)) 0%, var(--gradient-color, rgb(0, 0, 0)) var(--gradient-size, 0%), transparent calc(var(--gradient-size, 0%) + 15%))',
        backgroundSize: '100% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        paddingBottom: "5px",
        ...style,
      } as React.CSSProperties}
    >
      {children || (value ? <PortableText value={value} components={components} /> : text)}
    </Comp>
  )
})

GradientRevealText.displayName = 'GradientRevealText';

export default GradientRevealText;
