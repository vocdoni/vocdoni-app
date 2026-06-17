import { chakra, HStack, Icon, Text } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { createContext, ReactNode, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LuColumns2, LuLayoutPanelLeft } from 'react-icons/lu'
import { EASE } from '../VoterAuthentication/motion'

/**
 * Three candidate editor layouts the user is evaluating. Once one is chosen the
 * other two shells and this switcher get removed.
 */
export type EditorVariant = 'two-pane' | 'focused'

type EditorVariantContextValue = {
  variant: EditorVariant
  setVariant: (v: EditorVariant) => void
}

const EditorVariantContext = createContext<EditorVariantContextValue | null>(null)

export const EditorVariantProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariant] = useLocalStorage<EditorVariant>('editor-variant', 'two-pane')
  return <EditorVariantContext.Provider value={{ variant, setVariant }}>{children}</EditorVariantContext.Provider>
}

export const useEditorVariant = () => {
  const ctx = useContext(EditorVariantContext)
  if (!ctx) throw new Error('useEditorVariant must be used within EditorVariantProvider')
  return ctx
}

/**
 * Floating control to preview the three layout candidates side by side. Purely a
 * decision aid — removed once a direction is picked.
 */
export const VariantSwitcher = () => {
  const { t } = useTranslation()
  const { variant, setVariant } = useEditorVariant()

  const options: { value: EditorVariant; label: string; icon: typeof LuColumns2 }[] = [
    { value: 'two-pane', label: t('editor.variant.two_pane', { defaultValue: 'Two-pane' }), icon: LuColumns2 },
    { value: 'focused', label: t('editor.variant.focused', { defaultValue: 'Focused' }), icon: LuLayoutPanelLeft },
  ]

  return (
    <HStack
      position='fixed'
      bottom={4}
      left='50%'
      transform='translateX(-50%)'
      zIndex='top'
      gap={1}
      p={1}
      borderRadius='full'
      bg='auth.card.bg'
      borderWidth='1px'
      borderColor='table.border'
      boxShadow='0 8px 30px -12px rgba(0,0,0,0.35)'
    >
      <Text fontSize='xs' color='texts.subtle' pl={2} pr={1}>
        {t('editor.variant.label', { defaultValue: 'Layout' })}
      </Text>
      {options.map((opt) => {
        const active = variant === opt.value
        return (
          <chakra.button
            type='button'
            key={opt.value}
            onClick={() => setVariant(opt.value)}
            display='inline-flex'
            alignItems='center'
            gap={1.5}
            px={3}
            py={1.5}
            borderRadius='full'
            fontSize='xs'
            fontWeight='medium'
            bg={active ? 'brand.500' : 'transparent'}
            color={active ? 'white' : 'texts.subtle'}
            css={{ transition: `background-color 0.2s ${EASE}, color 0.2s ${EASE}` }}
            _hover={!active ? { bg: 'auth.bg' } : undefined}
          >
            <Icon as={opt.icon} boxSize={3.5} />
            {opt.label}
          </chakra.button>
        )
      })}
    </HStack>
  )
}
