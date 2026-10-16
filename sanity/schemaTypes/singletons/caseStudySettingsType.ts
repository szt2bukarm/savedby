import { defineType, defineField } from 'sanity'
import { pageBlocks } from '../blocks/pageBlocks'

export const caseStudySettingsType = defineType({
  name: 'caseStudySettings',
  title: 'Case Study Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'basePath',
      title: 'URL Base Path',
      type: 'string',
      description: 'Case studies live at /[base path]/[slug], e.g. "casestudy" gives /casestudy/aloha. Defaults to "casestudies".',
      initialValue: 'casestudies',
      validation: Rule =>
        Rule.required().custom(value =>
          !value || /^[a-z0-9-]+$/.test(value)
            ? true
            : 'Use only lowercase letters, numbers and dashes (no slashes)'
        ),
    }),
    defineField({
      name: 'blocks',
      title: 'Blocks After Case Study',
      description: 'These blocks load below the article on every case study page',
      type: 'array',
      of: pageBlocks,
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Case Study Settings' }
    },
  },
})
