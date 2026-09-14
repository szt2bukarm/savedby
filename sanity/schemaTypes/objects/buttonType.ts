import { defineField, defineType } from 'sanity'

export const buttonType = defineType({
  name: 'buttonType',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'text', subtitle: 'href' },
  },
})
