import { Button, Menu, Portal } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { usePublicLanguageRouting } from '~i18n/usePublicLanguageRouting'
import { useLanguagesEnv } from '~src/app-env'
import { useVoterFlow } from '../flow-context'

type VoterTopActionsProps = { publicLanguageLinks?: Record<string, string> }

/**
 * The end of the top bar: the language tag ("CA") and, once identified, "Surt". The page is server-routed, so a
 * language change reloads it and the session (held in memory) is lost: after identification it asks first (audit
 * F14); before, it goes at once. "Surt" is not offered while a cast is in flight (audit F15).
 */
export const VoterTopActions = ({ publicLanguageLinks }: VoterTopActionsProps) => {
  const { t } = useTranslation()
  const { facts, signOut } = useVoterFlow()
  const languages = useLanguagesEnv()
  const { currentLanguage, navigateToLanguage } = usePublicLanguageRouting({ publicLanguageLinks })
  const [pending, setPending] = useState<string>()
  const entries = Object.entries(languages).sort(([a], [b]) => a.localeCompare(b))
  const current = (currentLanguage ?? '').toLowerCase()

  const choose = (language: string) => {
    if (language.toLowerCase() === current) return
    if (facts.connected) setPending(language)
    else void navigateToLanguage(language)
  }

  return (
    <>
      {entries.length > 1 && (
        <Menu.Root positioning={{ placement: 'bottom-end' }}>
          <Menu.Trigger asChild>
            <Button
              variant='lang-tag'
              size='tag'
              aria-label={t('voter.language.label', { language: languages[current] ?? current })}
            >
              {current.split('-')[0].toUpperCase()}
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {entries.map(([code, label]) => (
                  <Menu.Item key={code} value={code} onClick={() => choose(code)} aria-current={code === current}>
                    {label}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      )}
      {facts.connected && !facts.voting && (
        <Button variant='topbar' onClick={signOut}>
          {t('voter.sign_out')}
        </Button>
      )}
      <ConfirmDialog
        open={pending !== undefined}
        onOpenChange={({ open }) => !open && setPending(undefined)}
        title={t('voter.language.confirm_title')}
        description={t('voter.language.confirm_body')}
        confirmText={t('voter.language.confirm')}
        cancelText={t('voter.language.cancel')}
        onCancel={() => setPending(undefined)}
        onConfirm={() => {
          if (pending) void navigateToLanguage(pending)
          setPending(undefined)
        }}
      />
    </>
  )
}
