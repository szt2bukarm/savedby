import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'Call to Action (CTA)',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'text',
      title: 'Text',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'buttonType',
    }),
    defineField({
      name: 'orientation',
      title: 'Orientation',
      type: 'string',
      options: {
        list: [
          { title: 'Vertical', value: 'vertical' },
          { title: 'Horizontal', value: 'horizontal' },
        ],
        layout: 'radio',
      },
      initialValue: 'horizontal',
    }),
    defineField({
      name: 'textWidth',
      title: 'Text Width (below large screens)',
      type: 'string',
      description: 'Used below the lg breakpoint, where the CTA is always vertical.',
      options: {
        list: [
          { title: 'Narrow', value: 'narrow' },
          { title: 'Wider', value: 'wider' },
        ],
        layout: 'radio',
      },
      initialValue: 'narrow',
    }),
    SpacingFields,
  ],
  preview: {
    select: {
      title: 'text',
      subtitle: 'orientation',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'CTA Block',
        subtitle: `Orientation: ${subtitle || 'horizontal'}`,
      }
    },
  },
})
