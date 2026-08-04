import { chakra, Flex, Icon, Progress, Separator, Table, Text, Tooltip } from '@chakra-ui/react'
import { dotobject } from '~utils/objects'
import { forwardRef, isValidElement } from 'react'
import { Trans } from 'react-i18next'
import {
  LuChartColumn,
  LuFileCheck,
  LuHeadset,
  LuInfo,
  LuPalette,
  LuShield,
  LuUsers,
  LuVote,
  LuZap,
} from 'react-icons/lu'
import { BooleanIcon } from '~components/Layout/BooleanIcon'
import { getPlanKey, PlanName } from '~constants'
import { CategorizedSpecs, CategoryTitleKeys, FeatureSpec } from './Features'
import { Plan, usePlans, usePlanTranslations } from './Plans'

type ComparisonTableProps = {}

type ComparisonSectionTableProps = {
  titleKey: string
  plans: Plan[]
  specs: FeatureSpec[]
  category: string
}

const renderValue = (value: React.ReactNode | number | boolean) => {
  if (typeof value === 'boolean') return <BooleanIcon value={value} />
  if (isValidElement(value) || typeof value === 'number') return value
  return '-'
}

const SubcategoryIcon: Record<string, React.ElementType> = {
  generalLimits: LuChartColumn,
  votingTypes: LuVote,
  memberbaseManagement: LuUsers,
  authenticationSecurity: LuShield,
  customization: LuPalette,
  extraFeatures: LuZap,
  analyticsAndReporting: LuChartColumn,
  support: LuHeadset,
  complianceAndSecurity: LuFileCheck,
}

const ComparisonSectionTable = ({ titleKey, plans, category, specs }: ComparisonSectionTableProps) => {
  return (
    <>
      <Table.Header id='section-header'>
        <Table.Row>
          <Table.ColumnHeader colSpan={4}>
            <Flex alignItems='center' gap={2}>
              <Icon boxSize={4} as={SubcategoryIcon[category]} />
              <Text as={'span'} textTransform='uppercase' fontSize='sm'>
                <Trans i18nKey={titleKey} />
              </Text>
            </Flex>
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {specs.map((spec) => {
          const rowKey = spec.kind === 'plan' ? spec.path : spec.id
          return (
            <Table.Row key={rowKey}>
              <Table.Cell fontWeight='medium'>
                <Trans i18nKey={spec.labelKey} />
                {spec.tooltip && (
                  <Tooltip.Root positioning={{ placement: 'top' }}>
                    <Tooltip.Trigger asChild>
                      <chakra.span verticalAlign='middle'>
                        <Icon as={LuInfo} ml={1} />
                      </chakra.span>
                    </Tooltip.Trigger>
                    <Tooltip.Positioner>
                      <Tooltip.Content>
                        <Trans i18nKey={spec.tooltip} />
                      </Tooltip.Content>
                    </Tooltip.Positioner>
                  </Tooltip.Root>
                )}
              </Table.Cell>

              {plans.map((plan) => {
                let cell: React.ReactNode = '-'

                if (spec.kind === 'plan') {
                  const v = dotobject(plan, spec.path)
                  cell = renderValue(v)
                } else {
                  // static
                  if (spec.render) {
                    cell = renderValue(spec.render(plan))
                  } else if (spec.available) {
                    cell = renderValue(Boolean(spec.available(plan)))
                  } else {
                    cell = '-'
                  }
                }

                return (
                  <Table.Cell key={plan.id} textAlign='center' w={40}>
                    <Flex alignItems='center' justifyContent='center'>
                      {cell}
                    </Flex>
                  </Table.Cell>
                )
              })}
            </Table.Row>
          )
        })}
      </Table.Body>
    </>
  )
}

export const ComparisonTable = forwardRef<HTMLDivElement, ComparisonTableProps>((props, ref) => {
  const { data: plans, isLoading } = usePlans()
  const translations = usePlanTranslations()

  if (isLoading) {
    return (
      <Progress.Root size='sm' value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  // The custom plan is no longer returned by the API, so all returned plans are shown.
  const filteredPlans = plans ?? []

  return (
    <Flex ref={ref} justifyContent='center' w='full' display='block'>
      <Table.ScrollArea>
        <Table.Root borderWidth={1} variant='outline'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>
                <Text as={'span'}>
                  <Trans i18nKey='features.section.features'>Features</Trans>
                </Text>
              </Table.ColumnHeader>

              {filteredPlans.map((plan) => {
                const planKey = getPlanKey(plan)
                return (
                  <Table.ColumnHeader key={plan.id} textAlign='center'>
                    <Flex flexDirection={'column'} justifyContent={'center'}>
                      <Text as={'span'} textAlign={'center'}>
                        {(planKey ? translations[planKey]?.title : undefined) ?? plan.name}
                      </Text>
                    </Flex>
                  </Table.ColumnHeader>
                )
              })}
            </Table.Row>
          </Table.Header>
          {Object.entries(CategorizedSpecs).map(([category, specs]) => (
            <ComparisonSectionTable
              key={category}
              titleKey={CategoryTitleKeys[category]}
              category={category}
              plans={filteredPlans}
              specs={specs}
            />
          ))}
        </Table.Root>
      </Table.ScrollArea>
      <Separator mt={6} mb={1} />
      <Flex textAlign='left' color='texts.subtle' flexDirection='column'>
        <Text fontSize='xs'>
          <Trans i18nKey='pricing.comparison_table.footnote_1'>
            ¹ Votes with fewer than 10 participants are treated as test runs and don't count towards your plan limits.
          </Trans>
        </Text>
        <Text fontSize='xs'>
          <Trans i18nKey='pricing.comparison_table.footnote_2'>
            ² 2FA credits are only consumed when a user actually requests verification in a voting process. You'll never
            unexpectedly run out: if you exceed your included credits during a vote, each additional code will be
            charged at €0.015 as it's sent. You can also pre-purchase extra credits in convenient packages.
          </Trans>
        </Text>
        <Text fontSize='xs'>
          <Trans i18nKey='pricing.comparison_table.footnote_on_demand'>
            * Requested features will be evaluated individually and may incur additional fees.
          </Trans>
        </Text>
      </Flex>
    </Flex>
  )
})
