import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const savedbyComparisonBlock = defineType({
  name: 'savedbyComparisonBlock',
  title: 'Savedby Comparison',
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
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Text displayed on the right side'
    }),
    defineField({
      name: 'savedbyOffers',
      title: 'What Savedby Offers',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'competitionOffers',
      title: 'What the Competition Offers',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'pricingText',
      title: 'Pricing Text',
      type: 'text',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
    }),
    SpacingFields 
  ],
  preview: {
    select: {
      title: 'heading',
      price: 'price',
    },
    prepare({ title, price }) {
      return {
        title: title || 'Savedby Comparison',
        subtitle: price ? `Price: ${price}` : undefined,
      }
    },
  },
})
