import { defineArrayMember, defineField, defineType } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

const richTextOf = () => [
  defineArrayMember({
    type: 'block',
    styles: [{ title: 'Normal', value: 'normal' }],
    lists: [{ title: 'Numbered', value: 'number' }],
    marks: {
      decorators: [{ title: 'Bold', value: 'strong' }],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link / Email',
          fields: [
            {
              name: 'href',
              type: 'url',
              title: 'URL',
              description: 'Use https://… for external links, /[slug] (e.g. /about) for internal pages, or mailto:someone@example.com for email',
              validation: (Rule) =>
                Rule.required().uri({
                  allowRelative: true,
                  scheme: ['http', 'https', 'mailto'],
                }),
            },
            {
              name: 'openInNewTab',
              type: 'boolean',
              title: 'Open in new tab',
              initialValue: false,
            },
          ],
        },
      ],
    },
  }),
]

export const richTextContentType = defineType({
  name: 'richTextContent',
  title: 'Rich Text',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: richTextOf(),
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      const text = content?.[0]?.children?.map((c: any) => c.text).join('') || ''
      return { title: 'Rich Text', subtitle: text.slice(0, 80) }
    },
  },
})

export const dropdownRichTextType = defineType({
  name: 'dropdownRichText',
  title: 'Dropdown Rich Text',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: richTextOf(),
    }),
  ],
  preview: {
    select: { title: 'label' },
    prepare({ title }) {
      return { title: title || 'Dropdown', subtitle: 'Dropdown Rich Text' }
    },
  },
})

export const richTextPageBlock = defineType({
  name: 'richTextPageBlock',
  title: 'Rich Text Page',
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
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Content',
      type: 'array',
      of: [{ type: 'richTextContent' }, { type: 'dropdownRichText' }],
    }),
    SpacingFields,
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: 'Rich Text Page', subtitle: title }
    },
  },
})
