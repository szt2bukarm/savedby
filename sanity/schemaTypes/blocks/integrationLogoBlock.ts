import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const integrationLogoBlock = defineType({
  name: 'integrationLogoBlock',
  title: 'Integration Logo',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'imageType',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'string',
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'buttonType',
    }),
    SpacingFields,
  ],
  preview: {
    select: { text: 'text', subtext: 'subtext' },
    prepare({ text, subtext }) {
      return {
        title: 'Integration Logo',
        subtitle: text || subtext,
      }
    },
  },
})
