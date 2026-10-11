import { defineField, defineType } from 'sanity'
import { SpacingFields, spacingType } from '../objects/spacingType'

export const logoCarouselBlock = defineType({
  name: 'logoCarouselBlock',
  title: 'Logo Carousel',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      of: [{ type: 'imageType' }],
    }),
    SpacingFields
  ],
  preview: {
    select: {
      title: 'title',
      logos: 'logos',
    },
    prepare({ title, logos }) {
      const count = Array.isArray(logos) ? logos.length : 0
      return {
        title: title || 'Logo Carousel',
        subtitle: `${count} logo${count === 1 ? '' : 's'}`,
      }
    },
  },
})
