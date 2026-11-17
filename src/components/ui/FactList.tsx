import { chakra, DataList, type DataListRootProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Tooltip } from './Tooltip'

export type Fact = { id: string; label: ReactNode; value: ReactNode; tooltip?: string }

/** Label and value rows (a vote's census, schedule, settings), as a real `dl`. */
export const FactList = ({
  facts,
  layout = 'rows',
  ...props
}: {
  facts: Fact[]
  /** `rows` (label left, value right), or `ruled`: the rows of a card, each under a rule and padded to its edge. */
  layout?: 'rows' | 'ruled'
} & Omit<DataListRootProps, 'variant' | 'orientation'>) => (
  <DataList.Root orientation='horizontal' variant={layout === 'rows' ? 'facts' : layout} {...props}>
    {facts.map((fact) => (
      <DataList.Item key={fact.id}>
        <DataList.ItemLabel>{fact.label}</DataList.ItemLabel>
        <DataList.ItemValue>
          {fact.tooltip ? (
            <Tooltip portalled={false} content={fact.tooltip}>
              <chakra.span tabIndex={0}>{fact.value}</chakra.span>
            </Tooltip>
          ) : (
            fact.value
          )}
        </DataList.ItemValue>
      </DataList.Item>
    ))}
  </DataList.Root>
)
