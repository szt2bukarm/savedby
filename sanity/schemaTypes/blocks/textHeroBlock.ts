import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const textHeroBlock = defineType({
  name: 'textHeroBlock',
  title: 'Text Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'curveColor',
      title: 'Curve Color',
      type: 'string',
      options: {
        list: [
          { title: 'Blue', value: 'blue' },
          { title: 'Brown', value: 'brown' },
          { title: 'Orange', value: 'orange' },
        ],
        layout: 'radio',
      },
      initialValue: 'blue',
    }),
    defineField({
      name: 'smallText',
      title: 'Small Text',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      type: 'text',
      rows: 3,
    }),
    SpacingFields,
  ],
  preview: {
    select: { smallText: 'smallText', curveColor: 'curveColor' },
    prepare({ smallText, curveColor }) {
      return {
        title: 'Text Hero',
        subtitle: [smallText, curveColor].filter(Boolean).join(' · '),
      }
    },
  },
})
