import { Box, chakra, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { LuCoins, LuFilePlus2, LuUsersRound, LuVote } from 'react-icons/lu'
import { useParams } from 'react-router-dom'
import { defaultProcessValues, Process, TemplateConfigs, TemplateTypes } from '../common'
import { ELEVATION, SURFACE } from '../editor/surfaces'
import { useProcessTemplates } from '../TemplateProvider'
import { EASE, fadeUp } from '../VoterAuthentication/motion'

type GalleryItem = {
  id: TemplateTypes | 'blank'
  icon: IconType
  titleKey: string
  title: string
  descKey: string
  desc: string
}

const ITEMS: GalleryItem[] = [
  {
    id: TemplateTypes.AnnualGeneralMeeting,
    icon: LuUsersRound,
    titleKey: 'process.create.template.annual_general_meeting',
    title: 'Annual General Meeting',
    descKey: 'editor.template.agm_desc',
    desc: 'Approvals and board elections for your members.',
  },
  {
    id: TemplateTypes.Election,
    icon: LuVote,
    titleKey: 'process.create.template.election',
    title: 'Election',
    descKey: 'editor.template.election_desc',
    desc: 'Choose one or more candidates from a list.',
  },
  {
    id: TemplateTypes.ParticipatoryBudgeting,
    icon: LuCoins,
    titleKey: 'process.create.template.participatory_budgeting',
    title: 'Participatory Budgeting',
    descKey: 'editor.template.pb_desc',
    desc: 'Let members decide how to allocate a budget.',
  },
  {
    id: 'blank',
    icon: LuFilePlus2,
    titleKey: 'editor.template.blank_title',
    title: 'Blank ballot',
    descKey: 'editor.template.blank_desc',
    desc: 'Start with a single empty question.',
  },
]

/**
 * The document's empty state: a calm, premium way to start. Shown only while the
 * canvas is pristine; once a template is chosen (or the admin starts typing) it
 * gives way to a clean writing surface. Reuses the existing template configs.
 */
export const TemplateGallery = () => {
  const { t } = useTranslation()
  const methods = useFormContext<Process>()
  const { groupId } = useParams()
  const { setActiveTemplate } = useProcessTemplates()

  const start = (item: GalleryItem) => {
    const previous = methods.getValues()
    if (item.id === 'blank') {
      // Mark 'blank' as the active choice so the gallery dismisses (an empty title
      // wouldn't dirty the form). 'blank' has no template placeholders → generic ones show.
      setActiveTemplate('blank')
      methods.reset({ ...defaultProcessValues, groupId: groupId ?? '' })
    } else {
      setActiveTemplate(item.id)
      methods.reset({ ...defaultProcessValues, ...previous, ...TemplateConfigs[item.id], groupId: groupId ?? '' })
    }
    // Defer until after React flushes the reset — otherwise a re-rendered
    // Lexical editor or auto-focused input pulls the viewport back down.
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' })))
  }

  return (
    <VStack align='stretch' gap={4} css={{ animation: `${fadeUp} 0.3s ${EASE} both` }}>
      <Box>
        <Text fontWeight='semibold'>{t('editor.template.heading', { defaultValue: 'How do you want to start?' })}</Text>
        <Text fontSize='sm' color='texts.subtle'>
          {t('editor.template.subheading', { defaultValue: 'Pick a template to prefill the ballot, or start blank.' })}
        </Text>
      </Box>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        {ITEMS.map((item, index) => (
          <chakra.button
            type='button'
            key={item.id}
            onClick={() => start(item)}
            textAlign='start'
            display='flex'
            gap={3}
            p={4}
            borderRadius='xl'
            borderWidth='1px'
            borderColor={SURFACE.border}
            bg={SURFACE.surface}
            boxShadow={ELEVATION.rest}
            css={{
              animation: `${fadeUp} 0.3s ${EASE} both`,
              animationDelay: `${index * 0.04}s`,
              transition: `border-color 0.15s ${EASE}, transform 0.15s ${EASE}, box-shadow 0.15s ${EASE}`,
            }}
            _hover={{
              borderColor: 'gray.400',
              transform: 'translateY(-2px)',
              boxShadow: ELEVATION.hover,
            }}
          >
            <Box
              bg={SURFACE.inset}
              p={2.5}
              borderRadius='lg'
              color='texts.primary'
              lineHeight={0}
              flexShrink={0}
              h='fit-content'
            >
              <Icon as={item.icon} boxSize={5} />
            </Box>
            <VStack align='start' gap={0.5}>
              <Text fontWeight='semibold' fontSize='sm'>
                {t(item.titleKey, { defaultValue: item.title })}
              </Text>
              <Text fontSize='xs' color='texts.subtle'>
                {t(item.descKey, { defaultValue: item.desc })}
              </Text>
            </VStack>
          </chakra.button>
        ))}
      </SimpleGrid>
    </VStack>
  )
}
