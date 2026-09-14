import { defineType, defineField } from 'sanity'

export const socialPlatformType = defineType({
  name: 'socialPlatform',
  title: 'Social Platform',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'alt',
      url: 'url',
    },
    prepare({ title, url }) {
      return {
        title: title || 'Social Link',
        subtitle: url || 'No URL set',
      }
    },
  },
})
