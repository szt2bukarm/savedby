import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const merchantReviewSlideBlock = defineType({
  name: 'merchantReviewSlideBlock',
  title: 'Merchant Review Slide',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'topText',
      title: 'Top Text',
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
          name: 'merchantReview',
          title: 'Merchant Review',
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
            defineField({
              name: 'title',
              title: 'Title / Role',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'title',
            },
          },
        },
      ],
    }),
    SpacingFields
  ],
  preview: {
    select: {
      title: 'topText',
      ratings: 'ratings',
    },
    prepare({ title, ratings }) {
      const count = Array.isArray(ratings) ? ratings.length : 0
      return {
        title: title || 'Merchant Reviews',
        subtitle: `${count} review${count === 1 ? '' : 's'}`,
      }
    },
  },
})
