import { defineType, defineField } from 'sanity'

export const caseStudyType = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Page will live at /[base path]/[slug]. The base path is set in Case Study Settings.',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'imageType',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'imageType',
      description: 'Used as the card background on the case studies overview',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
    }),
    defineField({
      name: 'founded',
      title: 'Founded',
      type: 'string',
    }),
    defineField({
      name: 'hq',
      title: 'HQ',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Article',
      type: 'array',
      of: [
        { type: 'caseStudyHeading' },
        { type: 'caseStudyText' },
        { type: 'caseStudyQuote' },
        { type: 'caseStudyImage' },
        { type: 'caseStudyNumberCard' },
        { type: 'caseStudyImageFootnote' },
      ],
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Optional override for search engines (defaults to Title)',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 2,
      description: 'Snippet for search engines (defaults to Description)',
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', media: 'logo.image' },
    prepare({ title, slug, media }) {
      return {
        title: title || 'Untitled Case Study',
        subtitle: slug ? `…/${slug}` : 'No slug',
        media,
      }
    },
  },
})
