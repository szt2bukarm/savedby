import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const featureCardsBlock = defineType({
  name: 'featureCardsBlock',
  title: 'Feature Cards',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'featureCard',
          title: 'Feature Card',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              options: {
                list: [
                  { title: 'Blue', value: '#0095EC,#00A1FF' },
                  { title: 'Orange', value: '#FD4015,#FF6948' },
                  { title: 'Brown', value: '#AB5741,#FDF6E2' },
                ],
                layout: 'radio',
              },
              initialValue: 'blue',
            }),
            defineField({
              name: 'mediaType',
              title: 'Media Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Number', value: 'number' },
                  { title: 'Animation', value: 'rive' },
                ],
                layout: 'radio',
              },
              initialValue: 'number',
            }),
            defineField({
              name: 'number',
              title: 'Number',
              type: 'string',
              hidden: ({ parent }) => parent?.mediaType === 'rive',
            }),
            defineField({
              name: 'riveArtboard',
              title: 'Animation',
              type: 'string',
              options: {
                list: [
                  { title: 'Card 1', value: 'Card 1' },
                  { title: 'Card 2', value: 'Card 2' },
                  { title: 'Card 3', value: 'Card 3' },
                ],
              },
              initialValue: 'Card 1',
              hidden: ({ parent }) => parent?.mediaType === 'number',
            }),
          ],
          preview: {
            select: {
              title: 'title',
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
      title: 'heading',
      cards: 'cards',
    },
    prepare({ title, cards }) {
      const count = Array.isArray(cards) ? cards.length : 0
      return {
        title: title || 'Feature Cards',
        subtitle: `${count} card${count === 1 ? '' : 's'}`,
      }
    },
  },
})
