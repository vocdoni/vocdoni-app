import { Box, Flex, Heading, HStack, Icon, Stack } from '@chakra-ui/react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { useOrganization } from '@vocdoni/react-components'
import { getOrganizationName } from '~utils/organization'
import { useLocalizedText } from '~src/legacy/use-localized-text'
import { formatReference } from '~queries/certificateAuth/types'
import type { ErrorSpec } from './errorSpec'
import { Small, Panel, P } from './kit'
import { ReferenceLine } from './ReferenceLine'

type ErrorBlockProps = {
  spec: ErrorSpec
  headingRef: RefObject<HTMLHeadingElement | null>
  /** Raw diagnostic id string; renders a ReferenceLine when parseable. */
  reference?: string
  /** Whether the sentence contains personal data (holder name/document). Adds ph-no-capture. */
  hasHolderData?: boolean
}

/** Renders a compact error block: icon, title, sentence, actions, optional note, help, reference. */
export const ErrorBlock = ({ spec, headingRef, reference, hasHolderData }: ErrorBlockProps) => {
  const { t } = useTranslation()
  const { organization } = useOrganization()
  const localize = useLocalizedText()
  const orgName = localize(getOrganizationName(organization)) || null

  const hasRef = reference ? !!formatReference(reference) : false

  return (
    <Panel>
      <Stack gap={4} maxW='40rem'>
        <Box>
          <HStack align='start' gap={3} mb={1}>
            <Icon as={spec.icon} boxSize={6} color='fg.warning' mt='2px' flexShrink={0} aria-hidden />
            <Heading
              as='h2'
              ref={headingRef}
              tabIndex={-1}
              outline='none'
              fontSize='xl'
              fontWeight='semibold'
              lineHeight='1.3'
            >
              {spec.title}
            </Heading>
          </HStack>
          <P ps={{ base: 0, sm: 9 }} mt={{ base: 1, sm: 0 }} className={hasHolderData ? 'ph-no-capture' : undefined}>
            {spec.sentence}
          </P>
        </Box>
        <Stack gap={2} ps={{ base: 0, sm: 9 }}>
          <Flex gap={3} wrap='wrap' direction={{ base: 'column', sm: 'row' }}>
            {spec.primary}
            {spec.secondary}
          </Flex>
          {spec.note && (
            <Small fontWeight='semibold' role='note'>
              {spec.note}
            </Small>
          )}
        </Stack>
        <Stack gap={1} pt={3} ms={{ base: 0, sm: 9 }} borderTop='1px solid' borderColor='border'>
          {orgName && (
            <Small color='fg.muted'>
              {t('cert_auth.help', {
                defaultValue: 'If you keep having problems, contact {{organization}}.',
                organization: orgName,
              })}
            </Small>
          )}
          {hasRef && <ReferenceLine reference={reference!} />}
        </Stack>
      </Stack>
    </Panel>
  )
}
