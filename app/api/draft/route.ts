import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/lib/client'
import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

const token = process.env.SANITY_API_READ_TOKEN

const sanityDraftModeHandler = defineEnableDraftMode({
  client: client.withConfig({ token }),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const password = url.searchParams.get('password')

  if (password && password === process.env.CUSTOM_DRAFT_PASSWORD) {
    ;(await draftMode()).enable()
    return NextResponse.redirect(new URL('/', url.origin))
  }

  return sanityDraftModeHandler.GET(request)
}
