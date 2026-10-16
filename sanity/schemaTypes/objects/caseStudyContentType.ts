import { defineType, defineField } from 'sanity'

export const caseStudyHeadingType = defineType({
  name: 'caseStudyHeading',
  title: 'Heading',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'Text is black by default. Select text and apply "Orange" to color it.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [{ title: 'Orange', value: 'orange' }],
            annotations: [],
          },
        },
      ],
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }) {
      return {
        title: heading?.[0]?.children?.map((c: { text: string }) => c.text).join('') || 'Heading',
        subtitle: 'Heading',
      }
    },
  },
})

export const caseStudyTextType = defineType({
  name: 'caseStudyText',
  title: 'Text',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      description: 'Use line breaks for new paragraphs',
      type: 'text',
      rows: 6,
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'text' },
    prepare({ title }) {
      return { title: title || 'Text', subtitle: 'Text' }
    },
  },
})

export const caseStudyQuoteType = defineType({
  name: 'caseStudyQuote',
  title: 'Quote',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'quote', subtitle: 'name' },
    prepare({ title, subtitle }) {
      return { title: title || 'Quote', subtitle: `Quote — ${subtitle || ''}` }
    },
  },
})

export const caseStudyImageType = defineType({
  name: 'caseStudyImage',
  title: 'Full Width Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageType',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'image.alt', media: 'image.image' },
    prepare({ title, media }) {
      return { title: title || 'Image', subtitle: 'Full Width Image', media }
    },
  },
})

export const caseStudyNumberCardType = defineType({
  name: 'caseStudyNumberCard',
  title: 'Number Card',
  type: 'object',
  fields: [
    defineField({
      name: 'number',
      title: 'Number',
      description: 'e.g. 82%',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: { title: 'number', subtitle: 'title' },
    prepare({ title, subtitle }) {
      return { title: title || 'Number Card', subtitle: `Number Card — ${subtitle || ''}` }
    },
  },
})

export const caseStudyImageFootnoteType = defineType({
  name: 'caseStudyImageFootnote',
  title: 'Image with Footnote',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageType',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'footnote',
      title: 'Footnote',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'footnote', media: 'image.image' },
    prepare({ title, media }) {
      return { title: title || 'Image', subtitle: 'Image with Footnote', media }
    },
  },
})

export const caseStudyContentTypes = [
  caseStudyHeadingType,
  caseStudyTextType,
  caseStudyQuoteType,
  caseStudyImageType,
  caseStudyNumberCardType,
  caseStudyImageFootnoteType,
]
