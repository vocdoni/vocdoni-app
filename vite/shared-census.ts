import type { PluginOption } from 'vite'

type SharedCensusPluginOptions = {
  defaultLanguage: string
}

const resolveSharedCensusText = (
  rawValue: string | undefined,
  variableName: string,
  defaultLanguage: string
): Record<string, string> | undefined => {
  if (!rawValue) {
    return undefined
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawValue)
  } catch (error: any) {
    throw new Error(`${variableName} must be valid JSON. ${error.message}`)
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${variableName} must be a JSON object mapping language codes to markdown strings.`)
  }

  const hasDefaultLanguage = Object.prototype.hasOwnProperty.call(parsed, defaultLanguage)
  if (!hasDefaultLanguage) {
    throw new Error(`${variableName} must include the default language "${defaultLanguage}".`)
  }

  for (const [lang, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      throw new Error(`${variableName} values must be strings. Invalid value for "${lang}".`)
    }
  }

  return parsed as Record<string, string>
}

const resolveBoolean = (value: string | undefined) => value === 'true' || value === '1'

const resolveStreamUrl = (value: string | undefined) => {
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('STREAM_URL must use http or https.')
    }
    return url.toString()
  } catch (error: any) {
    throw new Error(`Invalid STREAM_URL: ${error.message}`)
  }
}

export const sharedCensusPlugin = ({ defaultLanguage }: SharedCensusPluginOptions): PluginOption => {
  const sharedCensusAlways = resolveSharedCensusText(
    process.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT,
    'SHARED_CENSUS_ALWAYS_VISIBLE_TEXT',
    defaultLanguage
  )
  const sharedCensusDisconnected = resolveSharedCensusText(
    process.env.SHARED_CENSUS_DISCONNECTED_TEXT,
    'SHARED_CENSUS_DISCONNECTED_TEXT',
    defaultLanguage
  )
  const sharedCensusConnected = resolveSharedCensusText(
    process.env.SHARED_CENSUS_CONNECTED_TEXT,
    'SHARED_CENSUS_CONNECTED_TEXT',
    defaultLanguage
  )
  const sharedCensusPostText = resolveSharedCensusText(
    process.env.SHARED_CENSUS_POST_TEXT,
    'SHARED_CENSUS_POST_TEXT',
    defaultLanguage
  )
  const streamUrl = resolveStreamUrl(process.env.STREAM_URL)
  const autoRedirect = resolveBoolean(process.env.SHARED_CENSUS_AUTOREDIRECT)

  const define: Record<string, string> = {}

  if (autoRedirect) {
    define['import.meta.env.SHARED_CENSUS_AUTOREDIRECT'] = JSON.stringify(autoRedirect)
  }

  if (typeof sharedCensusAlways !== 'undefined') {
    define['import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT'] = JSON.stringify(sharedCensusAlways)
  }

  if (typeof sharedCensusDisconnected !== 'undefined') {
    define['import.meta.env.SHARED_CENSUS_DISCONNECTED_TEXT'] = JSON.stringify(sharedCensusDisconnected)
  }

  if (typeof sharedCensusConnected !== 'undefined') {
    define['import.meta.env.SHARED_CENSUS_CONNECTED_TEXT'] = JSON.stringify(sharedCensusConnected)
  }

  if (typeof streamUrl !== 'undefined') {
    define['import.meta.env.STREAM_URL'] = JSON.stringify(streamUrl)
  }

  if (typeof sharedCensusPostText !== 'undefined') {
    define['import.meta.env.SHARED_CENSUS_POST_TEXT'] = JSON.stringify(sharedCensusPostText)
  }

  return {
    name: 'shared-census',
    config: () => ({
      define,
    }),
  }
}
