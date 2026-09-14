import { defineType, defineField } from 'sanity'

export const mobileNavType = defineType({
  name: 'mobileNav',
  title: 'Mobile Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'bigLinks',
      title: 'Main Links (Big)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'navLink' }] }],
      description: 'The primary large links that appear at the top.',
    }),
    defineField({
      name: 'gridLinks',
      title: 'Grid Links (Small, 2-column)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'navLink' }] }],
      description: 'The secondary smaller links that appear in a grid format.',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
    }),
    defineField({
      name: 'socials',
      title: 'Social Links',
      type: 'array',
      of: [{ type: 'socialPlatform' }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Mobile Navigation' }
    },
  },
})
