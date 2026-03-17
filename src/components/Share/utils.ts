export default function objectToGetParams(object: { [key: string]: string | number | undefined | null }) {
  const params = Object.entries(object)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)

  return params.length > 0 ? `?${params.join('&')}` : ''
}

export const getBrowserHref = () => {
  if (typeof document === 'undefined') {
    return ''
  }

  return document.location.href
}

export const getBrowserUserAgent = () => {
  if (typeof navigator === 'undefined') {
    return ''
  }

  return navigator.userAgent
}
