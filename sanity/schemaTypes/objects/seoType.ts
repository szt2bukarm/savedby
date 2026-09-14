import { defineField, defineType } from 'sanity'
import { SearchIcon } from '@sanity/icons'

export const seoType = defineType({
  name: 'seoSettings',
  title: 'SEO Settings',
  type: 'document',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'Default title for the website',
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
      description: 'Default description for search engines',
    }),
    defineField({
      name: 'url',
      title: 'Site URL',
      type: 'url',
      description: 'Production base URL (e.g. https://example.com)',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image (OG Image)',
      type: 'image',
      description: 'Fallback image shown when sharing links on social media',
    }),
    defineField({
      name: 'tags',
      title: 'Keywords / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'SEO Settings',
      }
    },
  },
})
