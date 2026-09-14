import { defineField, defineType } from 'sanity'

const spacingList = [
  { title: 'None - 0px', value: '0' },
  { title: 'Extra Small - 20px', value: 'xs' },
  { title: 'Small - 30px', value: 'sm' },
  { title: 'Medium - 40px', value: 'md' },
  { title: 'Large - 50px', value: 'lg' },
  { title: 'Extra Large - 60px', value: 'xl' },
  { title: 'Huge - 80px', value: 'huge' },
  { title: 'Massive - 100px', value: 'massive' },
]

const desktopSpacingList = [
  { title: 'None - 0px', value: '0' },
  { title: 'Extra Small - 30px', value: 'xs' },
  { title: 'Small - 40px', value: 'sm' },
  { title: 'Medium - 50px', value: 'md' },
  { title: 'Large - 60px', value: 'lg' },
  { title: 'Extra Large - 80px', value: 'xl' },
  { title: 'Huge - 100px', value: 'huge' },
  { title: 'Massive - 120px', value: 'massive' },
]

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
      name: 'mobile',
      title: 'Mobile Spacing (Overrides)',
      description:
        'Leave empty to use desktop values with default mobile scaling',
      options: { columns: 2 },
    },
  ],
  fields: [
    defineField({
      name: 'top',
      title: 'Top Spacing',
      type: 'string',
      options: { list: desktopSpacingList },
      initialValue: 'md',
      fieldset: 'desktop',
    }),
    defineField({
      name: 'bottom',
      title: 'Bottom Spacing',
      type: 'string',
      options: { list: desktopSpacingList },
      initialValue: 'md',
      fieldset: 'desktop',
    }),
    defineField({
      name: 'mobileTop',
      title: 'Top Spacing',
      type: 'string',
      options: { list: spacingList },
      fieldset: 'mobile',
    }),
    defineField({
      name: 'mobileBottom',
      title: 'Bottom Spacing',
      type: 'string',
      options: { list: spacingList },
      fieldset: 'mobile',
    }),
  ],
})
