import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
} from 'sanity/presentation'
import { schemaTypes } from './sanity/schemaTypes'
import { colorInput } from '@sanity/color-input'
import { muxInput } from 'sanity-plugin-mux-input'

// Singleton document types that should not appear in the "new document" menu
const singletonTypes = new Set([
  'nav',
  'footer',
  'mobileNav',
  'seoSettings',
])

export default defineConfig({
  name: 'default',
  title: 'SavedBy',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  basePath: '/studio',

  plugins: [
    structureTool({
      structure: S =>
        S.list()
          .title('Content')
          .items([
            // ─── Pages ───────────────────────────────────────────
            S.documentTypeListItem('page').title('Pages'),

            S.divider(),

            // ─── Global Settings (singletons) ────────────────────
            S.listItem()
              .title('Desktop Navigation')
              .child(S.document().schemaType('nav').documentId('nav')),
            S.listItem()
              .title('Mobile Navigation')
              .child(
                S.document().schemaType('mobileNav').documentId('mobileNav')
              ),
            S.listItem()
              .title('Footer Settings')
              .child(S.document().schemaType('footer').documentId('footer')),
            S.listItem()
              .title('SEO Settings')
              .child(
                S.document().schemaType('seoSettings').documentId('seoSettings')
              ),
            S.documentTypeListItem('navLink').title('Navigation Links'),
          ]),
    }),
    presentationTool({
      previewUrl: {
        origin:
          typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        draftMode: {
          enable: '/api/draft',
        },
      },
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: '/:slug',
            filter: `_type == "page" && slug.current == $slug || _id == $slug`,
          },
        ]),
        locations: {
          page: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: doc => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/${doc?.slug === 'home' ? '' : doc?.slug || ''}`,
                },
              ],
            }),
          }),
          nav: defineLocations({
            message: 'This document affects all pages',
            locations: [{ title: 'Global Navigation', href: '/' }],
            tone: 'positive',
          }),
          mobileNav: defineLocations({
            message: 'This document affects all pages',
            locations: [{ title: 'Mobile Navigation', href: '/' }],
            tone: 'positive',
          }),
        },
      },
    }),
    colorInput(),
    muxInput(),
  ],
  schema: {
    types: schemaTypes,
    templates: templates =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
})
