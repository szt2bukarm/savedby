export const getData = async <T>({
  url,
  data,
}: {
  url: string
  data?: unknown
}): Promise<T> => {
  const res: Response = await fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    console.error('error fetching data', { url, data, res })
    throw Error(res.statusText)
  }
  return res.json() as T
}

export const postData = async <T>({
  url,
  data,
}: {
  url: string
  data?: unknown
}): Promise<T> => {
  const res: Response = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    console.error('error in postData', { url, data, res })
    throw Error(res.statusText)
  }
  return res.json() as T
}
