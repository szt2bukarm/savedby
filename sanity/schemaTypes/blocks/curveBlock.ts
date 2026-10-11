import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const curveBlock = defineType({
  name: 'curveBlock',
  title: 'Curve',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: [
          { title: 'Off-white', value: 'offwhite' },
          { title: 'Orange', value: 'orange' },
          { title: 'Blue', value: 'blue' },
        ],
        layout: 'radio',
      },
      initialValue: 'orange',
    }),
    SpacingFields,
  ],
  preview: {
    select: { color: 'color' },
    prepare({ color }) {
      return {
        title: 'Curve',
        subtitle: color || 'orange',
      }
    },
  },
})
