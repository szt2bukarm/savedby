import { defineLive } from 'next-sanity/live'
import { client } from './client'

const token = process.env.SANITY_API_READ_TOKEN

if (!token) {
  console.warn(
    'Missing SANITY_API_READ_TOKEN. Live preview may not work for draft content.'
  )
}

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: '2026-04-10',
  }),
  serverToken: token,
  browserToken: token,
})
