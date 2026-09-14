import { defineType, defineField } from 'sanity'

export const navLinkType = defineType({
  name: 'navLink',
  title: 'Navigation Link',
  type: 'document',
  fields: [
    defineField({
      name: 'text',
      title: 'Link Text',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'string',
      description: 'Internal path (e.g. /about) or external URL',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'text', subtitle: 'href' },
  },
})
