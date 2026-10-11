import { defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const customerStorySlideType = defineType({
  name: 'customerStorySlide',
  title: 'Slide',
  type: 'object',
  fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'multiLineBoldInput',
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'multiLineBoldInput',
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              type: 'string',
              options: {
                list: [
                  { title: 'Default page color', value: '#FDF6E2' },
                  { title: 'Orange', value: '#FD4015' },
                ],
                layout: 'radio',
              },
              initialValue: '#FDF6E2',
            }),
            defineField({
              name: 'graphicBackground',
              title: 'Graphic Background',
              type: 'string',
              options: {
                list: [
                  { title: 'Blue', value: '#0095EC,#00A1FF' },
                  { title: 'Gray', value: '#E7E3DC' },
                ],
                layout: 'radio',
              },
              initialValue: '#0095EC,#00A1FF',
            }),
            defineField({
              name: 'mobileBackgroundColor',
              title: 'Mobile Background Color',
              description: 'Background color of the stacked slide shown below the lg breakpoint',
              type: 'string',
              options: {
                list: [
                  { title: 'Blue', value: '#0095EC' },
                  { title: 'Orange', value: '#FD4015' },
                ],
                layout: 'radio',
              },
              initialValue: '#0095EC',
            }),
          ],
          preview: {
          select: {
            blocks: 'heading',
            bg: 'backgroundColor',
          },
          prepare({ blocks, bg }) {
            const block = (blocks || []).find((b: any) => b._type === 'block')
            const headingText = block
              ? block.children
                  ?.filter((c: any) => c._type === 'span')
                  ?.map((c: any) => c.text)
                  ?.join('')
              : 'Slide'
            return {
              title: headingText,
              subtitle: `Background: ${bg || '#FDF6E2'}`,
            }
          },
        },
})

export const customerStoryBlock = defineType({
  name: 'customerStoryBlock',
  title: 'Customer Story',
  type: 'object',
  fields: [
    defineField({
      name: 'disabled',
      title: 'Disabled (Do not render)',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'multiLineBoldInput',
    }),
    defineField({
      name: 'brandLogo',
      title: 'Brand Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'productImage',
      title: 'Product Image',
      type: 'image',
      options: { hotspot: true },
    }),
    ...[1, 2, 3].map((n) =>
      defineField({
        name: `slide${n}`,
        title: `Slide ${n}`,
        type: 'customerStorySlide',
      })
    ),
    SpacingFields
  ],
  preview: {
    select: {
      blocks: 'title',
    },
    prepare({ blocks }) {
      const block = (blocks || []).find((b: any) => b._type === 'block')
      const titleText = block
        ? block.children
            ?.filter((c: any) => c._type === 'span')
            ?.map((c: any) => c.text)
            ?.join('')
        : 'Customer Story'
      return {
        title: titleText,
        subtitle: '3 slides',
      }
    },
  },
})
