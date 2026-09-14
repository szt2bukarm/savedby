import 'server-only'

import { ProfilesApi } from 'klaviyo-api'

import { config } from './config'

export const profilesClient = new ProfilesApi(config)
