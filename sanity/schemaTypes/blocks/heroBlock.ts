import { defineField, defineType } from 'sanity'
import TextAreaInput from '../../components/TextAreaInput'

export const heroBlock = defineType({
  name: 'heroBlock',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: Rule => Rule.required(),
      components: {
        input: TextAreaInput,
      },
    }),
    defineField({
      name: 'bottomText',
      title: 'Bottom Text',
      type: 'string',
      validation: Rule => Rule.required(),
      components: {
        input: TextAreaInput,
      },
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'buttonType',
    }),
    defineField({
      name: "logoMarquee",
      title: "Logo Marquee",
      type: "array",
      of: [{ type: "imageType" }],
    }),
    defineField({
        name: "firstText",
        title: "First Text",
        type: "string",
        validation: Rule => Rule.required(),
        components: {
            input: TextAreaInput,
        },
    }),
    defineField({
        name: "secondText",
        title: "Second Text",
        type: "string",
        validation: Rule => Rule.required(),
        components: {
            input: TextAreaInput,
        },
    })
  ],
  preview: {
    select: {
      title: 'heading',
    },
    prepare({ title }) {
      return {
        title: title || 'Hero',
        subtitle: 'Hero Block',
      }
    },
  },
})
