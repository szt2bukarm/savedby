import { defineType, defineField } from 'sanity'

export const navType = defineType({
  name: 'nav',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'dropdowns',
      title: 'Dropdowns & Links',
      type: 'array',
      of: [
        { type: 'navDropdown' },
        { type: 'reference', to: [{ type: 'navLink' }] },
      ],
    }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [
        { type: 'navButton' },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Navigation' }
    },
  },
})
