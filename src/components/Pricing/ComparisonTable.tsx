import {
  chakra,
  Separator,
  Flex,
  Icon,
  ProgressRange,
  ProgressRoot,
  ProgressTrack,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHeader,
  TableRoot,
  TableRow,
  TableScrollArea,
  Text,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from '@chakra-ui/react'
import { dotobject } from '@vocdoni/sdk'
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
import { PlanId } from '~constants'
import { BooleanIcon } from '~shared/Layout/BooleanIcon'
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
      <TableHeader id='section-header'>
        <TableRow>
          <TableColumnHeader colSpan={4}>
            <Flex alignItems='center' gap={2}>
              <Icon boxSize={4} as={SubcategoryIcon[category]} />
              <Text as={'span'} textTransform='uppercase' fontSize='sm'>
                <Trans i18nKey={titleKey} />
              </Text>
            </Flex>
          </TableColumnHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {specs.map((spec) => {
          const rowKey = spec.kind === 'plan' ? spec.path : spec.id
          return (
            <TableRow key={rowKey}>
              <TableCell fontWeight='medium'>
                <Trans i18nKey={spec.labelKey} />
                {spec.tooltip && (
                  <TooltipRoot positioning={{ placement: 'top' }}>
                    <TooltipTrigger asChild>
                      <chakra.span verticalAlign='middle'>
                        <Icon as={LuInfo} ml={1} />
                      </chakra.span>
                    </TooltipTrigger>
                    <TooltipPositioner>
                      <TooltipContent>
                        <Trans i18nKey={spec.tooltip} />
                      </TooltipContent>
                    </TooltipPositioner>
                  </TooltipRoot>
                )}
              </TableCell>

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
                  <TableCell key={plan.id} textAlign='center' w={40}>
                    <Flex alignItems='center' justifyContent='center'>
                      {cell}
                    </Flex>
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </>
  )
}

export const ComparisonTable = forwardRef<HTMLDivElement, ComparisonTableProps>((props, ref) => {
  const { data: plans, isLoading } = usePlans()
  const translations = usePlanTranslations()

  if (isLoading) {
    return (
      <ProgressRoot size='sm' value={null}>
        <ProgressTrack>
          <ProgressRange />
        </ProgressTrack>
      </ProgressRoot>
    )
  }

  const filteredPlans = plans.filter((plan) => !(plan?.organization?.customPlan || plan.id === PlanId.Custom))

  return (
    <Flex ref={ref} justifyContent='center' w='full' display='block'>
      <TableScrollArea>
        <TableRoot borderWidth={1} variant='simple'>
          <TableHeader>
            <TableRow>
              <TableColumnHeader>
                <Text as={'span'}>
                  <Trans i18nKey='features.section.features'>Features</Trans>
                </Text>
              </TableColumnHeader>

              {filteredPlans.map((plan) => {
                return (
                  <TableColumnHeader key={plan.id} textAlign='center'>
                    <Flex flexDirection={'column'} justifyContent={'center'}>
                      <Text as={'span'} textAlign={'center'}>
                        {translations[plan.id].title}
                      </Text>
                    </Flex>
                  </TableColumnHeader>
                )
              })}
            </TableRow>
          </TableHeader>
          {Object.entries(CategorizedSpecs).map(([category, specs]) => (
            <ComparisonSectionTable
              key={category}
              titleKey={CategoryTitleKeys[category]}
              category={category}
              plans={filteredPlans}
              specs={specs}
            />
          ))}
        </TableRoot>
      </TableScrollArea>
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
