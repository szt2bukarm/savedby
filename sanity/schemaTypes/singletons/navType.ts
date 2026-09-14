import { defineType, defineField } from 'sanity'

export const navType = defineType({
  name: 'nav',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'announcement',
      title: 'Announcement',
      type: 'string',
      description: 'Text that displays at the top of the site.',
      validation: rule =>
        rule.required().max(120).warning('Keep it short and sweet!'),
    }),
    defineField({
      name: 'leftItems',
      title: 'Left Items',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'navLink' }] },
        { type: 'navDropdown' },
      ],
    }),
    defineField({
      name: 'rightItems',
      title: 'Right Items',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'navLink' }] },
        { type: 'navDropdown' },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Navigation' }
    },
  },
})
