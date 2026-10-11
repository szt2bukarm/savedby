import { defineType, defineField } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const caseStudySliderBlock = defineType({
  name: 'caseStudySliderBlock',
  title: 'Case Study Slider',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'multiLineBoldInput',
    }),
    defineField({
      name: 'caseStudies',
      title: 'Case Studies',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'caseStudyItem',
          fields: [
            defineField({
              name: 'caseStudy',
              title: 'Case Study Document',
              type: 'reference',
              to: [{ type: 'caseStudy' }],
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'companyName',
              title: 'Company Name',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'textUnder',
              title: 'Text Under Company Name',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'image',
              title: 'Card Image',
              type: 'imageType',
            }),
          ],
          preview: {
            select: {
              title: 'companyName',
              subtitle: 'textUnder',
              media: 'image',
            }
          }
        }
      ],
    }),
    defineField({
      name: 'disabled',
      title: 'Disabled',
      type: 'boolean',
      initialValue: false,
    }),
    SpacingFields,
  ],
  preview: {
    select: {
      caseStudies: 'caseStudies',
    },
    prepare({ caseStudies }) {
      return {
        title: 'Case Study Slider',
        subtitle: `${caseStudies?.length || 0} case studies`,
      }
    },
  },
})
