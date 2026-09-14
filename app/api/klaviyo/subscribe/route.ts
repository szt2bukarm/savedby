import { NextRequest, NextResponse } from 'next/server'

import { subscribeProfileToList } from '@/app/utils/klaviyo/subscribe-profile'

type ApiRes<T = undefined> = {
  success: boolean
  error?: string
  message?: string
  data?: T | null
}

export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

const defaultListId = process.env.NEXT_PUBLIC_KLAVIYO_LIST_ID

export async function POST(req: NextRequest): Promise<NextResponse<ApiRes>> {
  const { email, phoneNumber, listId = defaultListId } = await req.json()

  try {
    await subscribeProfileToList({ listId, email, phoneNumber })
  } catch (err) {
    let message = 'error subscribing to newsletter'
    if (typeof err === 'string') {
      message = err
    } else if (err instanceof Error) {
      message = err.message
    }
    console.error(message)
    return NextResponse.json(
      {
        success: false,
        message: 'something went wrong, please try again later',
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { success: true, message: 'subscribed successfully' },
    { status: 200 }
  )
}
