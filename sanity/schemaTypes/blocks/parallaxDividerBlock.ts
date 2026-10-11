import { defineType, defineField } from 'sanity'

export const parallaxDividerBlock = defineType({
  name: 'parallaxDividerBlock',
  title: 'Parallax Divider',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Parallax Divider',
      }
    },
  },
})
