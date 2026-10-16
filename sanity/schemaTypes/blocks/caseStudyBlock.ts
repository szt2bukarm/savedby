import { defineType, defineField } from 'sanity'
import { SpacingFields } from '../objects/spacingType'

export const caseStudyBlock = defineType({
  name: 'caseStudyBlock',
  title: 'Case Study Collection',
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
      description: 'Drag to reorder. The first one is shown as the featured "Most Recent" card.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'caseStudy' }],
        },
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
        title: 'Case Study Collection',
        subtitle: `${caseStudies?.length || 0} case studies`,
      }
    },
  },
})
