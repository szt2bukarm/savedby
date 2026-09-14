import 'server-only'

import { ConfigWrapper } from 'klaviyo-api'

export const config = ConfigWrapper(process.env.KLAVIYO_PRIVATE_KEY as string)
