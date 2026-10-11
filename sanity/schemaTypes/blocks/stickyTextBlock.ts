import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const stickyTextBlock = defineType({
  name: 'stickyTextBlock',
  title: 'Sticky Text',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'stickyTextItem',
          title: 'Item',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'multiLineBoldInput',
            }),
            defineField({
              name: 'boxIcon',
              title: 'Box Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Damaged', value: 'damaged' },
                  { title: 'Intact', value: 'intact' },
                ],
                layout: 'radio',
              },
              initialValue: 'intact',
            }),
          ],
          preview: {
            select: {
              blocks: 'text',
              boxIcon: 'boxIcon',
            },
            prepare({ blocks, boxIcon }) {
              const block = (blocks || []).find((b: any) => b._type === 'block')
              const textContent = block
                ? block.children
                    ?.filter((c: any) => c._type === 'span')
                    ?.map((c: any) => c.text)
                    ?.join('')
                : 'Text Item'
              return {
                title: textContent,
                subtitle: `Icon: ${boxIcon || 'intact'}`,
              }
            },
          },
        },
      ],
    }),
    SpacingFields
  ],
  preview: {
    select: {
      items: 'items',
    },
    prepare({ items }) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: 'Sticky Text',
        subtitle: `${count} item${count === 1 ? '' : 's'}`,
      }
    },
  },
})
