import { createContext, useContext } from 'react'

export type LanguageRoutingContextValue = {
  /** The currently active language driving i18n and the router basename. */
  language: string
  /**
   * Switches the language without a full page reload. Used on client-rendered
   * (react-router) routes: it changes i18n, updates the URL language prefix via
   * the history API and swaps the router basename in place. Vike SSR public
   * pages keep navigating (reloading) because the server renders the localized
   * content — see usePublicLanguageRouting.
   */
  setLanguage: (language: string) => void
}

export const LanguageRoutingContext = createContext<LanguageRoutingContextValue | null>(null)

export const useLanguageRouting = () => useContext(LanguageRoutingContext)
