import { defineType } from 'sanity'

export const multiLineBoldInputType = defineType({
  name: 'multiLineBoldInput',
  title: 'Multiline Bold Input',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }], // No H1, H2, etc.
      lists: [], // No bullet points
      marks: {
        decorators: [{ title: 'Strong', value: 'strong' }],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: Rule =>
                  Rule.uri({
                    allowRelative: true,
                    scheme: ['http', 'https', 'mailto', 'tel'],
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
    },
  ],
})
