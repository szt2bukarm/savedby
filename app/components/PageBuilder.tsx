import type { PageBlock } from '@/types/sanity'
import Hero from './blocks/Hero'


const components: Record<string, React.ComponentType<any>> = {
  heroBlock: Hero,
}

export default function PageBuilder({ blocks }: { blocks: PageBlock[] }) {
  if (!blocks) return null

  return (
    <>
      {blocks.map(block => {
        const Component = components[block._type]

        if (!Component) {
          if (process.env.NODE_ENV === 'development') {
            return (
              <div
                key={block._key}
                style={{
                  padding: '2rem',
                  background: '#fff3f3',
                  color: '#c00',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                }}>
                Block type <strong>{block._type}</strong> is not implemented.
              </div>
            )
          }
          return null
        }

        return <Component key={block._key} block={block} />
      })}
    </>
  )
}
