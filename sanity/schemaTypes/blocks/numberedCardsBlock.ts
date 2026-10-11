import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const numberedCardsBlock = defineType({
  name: 'numberedCardsBlock',
  title: 'Numbered Cards',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'numberedCard',
          title: 'Numbered Card',
          fields: [
            defineField({
              name: 'number',
              title: 'Number',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'color',
              title: 'Color',
              type: 'string',
              options: {
                list: [
                  { title: 'Orange (#FD4015)', value: '#FD4015' },
                  { title: 'Black (#110F0B)', value: '#110F0B' },
                  { title: 'Blue (#0095EC)', value: '#0095EC' },
                ],
                layout: 'radio',
              },
              initialValue: '#FD4015',
            }),
          ],
          preview: {
            select: {
              title: 'number',
              subtitle: 'text',
            },
          },
        },
      ],
    }),
    SpacingFields
  ],
  preview: {
    select: {
      cards: 'cards',
    },
    prepare({ cards }) {
      const count = Array.isArray(cards) ? cards.length : 0
      return {
        title: 'Numbered Cards',
        subtitle: `${count} card${count === 1 ? '' : 's'}`,
      }
    },
  },
})
