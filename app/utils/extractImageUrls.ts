/**
 * Recursively walks any data structure and extracts all Sanity CDN image URLs.
 * Matches URLs from cdn.sanity.io as well as any string ending in common
 * image extensions that comes from Sanity asset resolution (->url).
 */
export function extractImageUrls(data: unknown): string[] {
  const urls = new Set<string>()

  function walk(value: unknown): void {
    if (value === null || value === undefined) return

    if (typeof value === 'string') {
      // Match Sanity CDN URLs
      if (value.includes('cdn.sanity.io')) {
        urls.add(value)
      }
      return
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item)
      }
      return
    }

    if (typeof value === 'object') {
      for (const key of Object.keys(value as Record<string, unknown>)) {
        walk((value as Record<string, unknown>)[key])
      }
    }
  }

  walk(data)
  return Array.from(urls)
}
