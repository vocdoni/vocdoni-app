import { DataList, type DataListRootProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export type Fact = { id: string; label: ReactNode; value: ReactNode }

/**
 * Label and value rows (a vote's census, schedule, settings), as a real `dl`: the rows of a card, each under a rule
 * and padded to its edge.
 */
export const FactList = ({
  facts,
  ...props
}: { facts: Fact[] } & Omit<DataListRootProps, 'variant' | 'orientation'>) => (
  <DataList.Root orientation='horizontal' variant='ruled' {...props}>
    {facts.map((fact) => (
      <DataList.Item key={fact.id}>
        <DataList.ItemLabel>{fact.label}</DataList.ItemLabel>
        <DataList.ItemValue>{fact.value}</DataList.ItemValue>
      </DataList.Item>
    ))}
  </DataList.Root>
)
