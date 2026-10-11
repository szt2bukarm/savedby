import { defineType, defineField } from 'sanity'

export const navColorChangeTriggerBlock = defineType({
  name: 'navColorChangeTriggerBlock',
  title: 'Nav Color Change Trigger',
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
      title: 'From Color',
      type: 'string',
      options: {
        list: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
        layout: 'radio',
      },
      initialValue: 'light',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'to',
      title: 'To Color',
      type: 'string',
      options: {
        list: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
        layout: 'radio',
      },
      initialValue: 'dark',
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
        title: `Nav Color Trigger`,
        subtitle: `${from ? from.charAt(0).toUpperCase() + from.slice(1) : ''} → ${to ? to.charAt(0).toUpperCase() + to.slice(1) : ''}`,
      }
    },
  },
})
