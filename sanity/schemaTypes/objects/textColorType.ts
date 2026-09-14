import { defineType } from 'sanity'

export const textColorType = defineType({
  name: 'textColorType',
  title: 'Text Color',
  type: 'string',
  options: {
    list: [
      { title: 'Blue', value: 'text-blue' },
      { title: 'Red', value: 'text-red' },
      { title: 'White', value: 'text-white' },
    ],
  },
  initialValue: 'text-blue',
})
