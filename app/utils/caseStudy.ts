import { client } from '@/sanity/lib/client'
import { CASE_STUDY_SETTINGS_QUERY } from '@/sanity/lib/queries'

export const DEFAULT_CASE_STUDY_BASE_PATH = 'casestudies'

export function cleanBasePath(basePath?: string | null) {
  return basePath?.replace(/^\/+|\/+$/g, '') || DEFAULT_CASE_STUDY_BASE_PATH
}

export async function getCaseStudyBasePath() {
  const settings = await client.fetch(
    CASE_STUDY_SETTINGS_QUERY,
    {},
    { next: { revalidate: 60 } }
  )

  return cleanBasePath(settings?.basePath)
}
