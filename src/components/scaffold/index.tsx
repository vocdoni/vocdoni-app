import { composeComponents, type ComponentsPartialDefinition } from '@vocdoni/react-components'
import { accountComponents } from './account'
import { electionComponents } from './election'
import { organizationComponents } from './organization'
import { paginationComponents } from './pagination'

export const uiScaffoldComponents: ComponentsPartialDefinition = composeComponents(
  electionComponents,
  organizationComponents,
  paginationComponents,
  accountComponents
)
