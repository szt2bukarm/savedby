import { defineType, defineField } from 'sanity'

export const navDropdownType = defineType({
  name: 'navDropdown',
  title: 'Dropdown',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Label',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'navLink' }] }],
      validation: Rule => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'text' },
    prepare({ title }) {
      return { title: title || 'Dropdown', subtitle: 'Dropdown' }
    },
  },
})
