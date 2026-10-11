import { defineField, defineType } from 'sanity'

const spacingOptions = Array.from({ length: 41 }, (_, i) => {
  const val = i * 10
  return { title: `${val}px`, value: val }
})

export const spacingType = defineType({
  name: 'spacingType',
  title: 'Spacing',
  type: 'object',
  fieldsets: [
    {
      name: 'desktop',
      title: 'Desktop Spacing',
      options: { columns: 2 },
    },
    {
      name: 'tablet',
      title: 'Tablet Spacing (Overrides)',
      description: 'Leave empty to use desktop values',
      options: { columns: 2 },
    },
    {
      name: 'mobile',
      title: 'Mobile Spacing (Overrides)',
      description: 'Leave empty to use desktop / tablet values',
      options: { columns: 2 },
    },
  ],
  fields: [
    defineField({
      name: 'type',
      title: 'Spacing Type',
      type: 'string',
      options: {
        list: [
          { title: 'Padding', value: 'padding' },
          { title: 'Margin', value: 'margin' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'padding',
    }),
    defineField({
      name: 'top',
      title: 'Top Spacing (Desktop)',
      type: 'number',
      options: { list: spacingOptions },
      validation: Rule => Rule.min(0).max(400),
      initialValue: 0,
      fieldset: 'desktop',
    }),
    defineField({
      name: 'bottom',
      title: 'Bottom Spacing (Desktop)',
      type: 'number',
      options: { list: spacingOptions },
      validation: Rule => Rule.min(0).max(400),
      initialValue: 0,
      fieldset: 'desktop',
    }),
    defineField({
      name: 'tabletTop',
      title: 'Top Spacing (Tablet)',
      type: 'number',
      options: { list: spacingOptions },
      validation: Rule => Rule.min(0).max(400),
      fieldset: 'tablet',
    }),
    defineField({
      name: 'tabletBottom',
      title: 'Bottom Spacing (Tablet)',
      type: 'number',
      options: { list: spacingOptions },
      validation: Rule => Rule.min(0).max(400),
      fieldset: 'tablet',
    }),
    defineField({
      name: 'mobileTop',
      title: 'Top Spacing (Mobile)',
      type: 'number',
      options: { list: spacingOptions },
      validation: Rule => Rule.min(0).max(400),
      fieldset: 'mobile',
    }),
    defineField({
      name: 'mobileBottom',
      title: 'Bottom Spacing (Mobile)',
      type: 'number',
      options: { list: spacingOptions },
      validation: Rule => Rule.min(0).max(400),
      fieldset: 'mobile',
    }),
  ],
  preview: {
    select: {
      type: 'type',
      top: 'top',
      bottom: 'bottom',
    },
    prepare({ type, top, bottom }) {
      return {
        title: `Spacing (${type || 'padding'})`,
        subtitle: `Top: ${top ?? 0}px · Bottom: ${bottom ?? 0}px`,
      }
    },
  },
})

export const SpacingFields = defineField({
  name: 'spacing',
  title: 'Spacing',
  type: 'spacingType',
})