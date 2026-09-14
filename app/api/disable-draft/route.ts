import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  ;(await draftMode()).disable()
  const url = new URL(request.url)
  // Redirect back to the homepage
  return NextResponse.redirect(new URL('/', url.origin))
}
