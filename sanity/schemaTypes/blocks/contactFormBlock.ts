import { defineType, defineField } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const contactFormBlock = defineType({
  name: 'contactFormBlock',
  title: 'Contact Form',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Minimal', value: 'minimal' },
          { title: 'Complex', value: 'complex' },
        ],
        layout: 'radio',
      },
      initialValue: 'minimal',
    }),
    defineField({
      name: 'centerText',
      title: 'Center Text (Heading)',
      type: 'multiLineBoldInput',
      hidden: ({ parent }) => parent?.variant === 'complex',
    }),
    defineField({
      name: 'bottomText',
      title: 'Bottom Text',
      type: 'multiLineBoldInput',
      hidden: ({ parent }) => parent?.variant === 'complex',
    }),
    SpacingFields,
  ],
  preview: {
    select: {
      title: 'variant',
    },
    prepare({ title }) {
      return {
        title: 'Contact Form',
        subtitle: title ? `Variant: ${title}` : '',
      }
    },
  },
})
