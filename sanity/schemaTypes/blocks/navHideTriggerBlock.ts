import { defineType, defineField } from 'sanity'

export const navHideTriggerBlock = defineType({
  name: 'navHideTriggerBlock',
  title: 'Nav Hide Trigger',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'from',
      title: 'From State',
      type: 'string',
      options: {
        list: [
          { title: 'Visible', value: 'visible' },
          { title: 'Hidden', value: 'hidden' },
        ],
        layout: 'radio',
      },
      initialValue: 'visible',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'to',
      title: 'To State',
      type: 'string',
      options: {
        list: [
          { title: 'Visible', value: 'visible' },
          { title: 'Hidden', value: 'hidden' },
        ],
        layout: 'radio',
      },
      initialValue: 'hidden',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      from: 'from',
      to: 'to',
    },
    prepare({ from, to }) {
      return {
        title: `Nav Hide Trigger`,
        subtitle: `${from ? from.charAt(0).toUpperCase() + from.slice(1) : ''} → ${to ? to.charAt(0).toUpperCase() + to.slice(1) : ''}`,
      }
    },
  },
})
