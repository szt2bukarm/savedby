import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const ratingCardsBlock = defineType({
  name: 'ratingCardsBlock',
  title: 'Rating Cards',
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
      name: 'ratings',
      title: 'Ratings',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'ratingCard',
          title: 'Rating Card',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 3,
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'quote',
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
      ratings: 'ratings',
    },
    prepare({ title, ratings }) {
      const count = Array.isArray(ratings) ? ratings.length : 0
      return {
        title: title || 'Rating Cards',
        subtitle: `${count} rating${count === 1 ? '' : 's'}`,
      }
    },
  },
})
