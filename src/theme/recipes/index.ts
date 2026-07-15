import { defineRecipe, RecipeDefinition, SlotRecipeDefinition } from '@chakra-ui/react'
import { Badge } from './badge'
import { Button } from './button'
import { Card } from './card'
import { checkbox } from './checkbox'
import { ConfirmModal } from './confirmModal'
import { Drawer } from './drawer'
import {
  ElectionDescription,
  ElectionQuestions,
  ElectionResults,
  ElectionSchedule,
  ElectionTitle,
  ElectionVideo,
  QuestionChoice,
  QuestionsConfirmation,
  QuestionsEmpty,
  QuestionsTip,
  QuestionsTypeBadge,
  Voted,
  VoteWeight,
} from './election'
import { formLabel, input, switchRecipe, textarea } from './form'
import { listSlotRecipe } from './list'
import { Menu } from './menu'
import { OrganizationDescription, OrganizationImage, OrganizationName } from './organization'
import { Pagination, PaginationButton } from './pagination'
import { Popover } from './popover'
import { Progress } from './progress'
import { SecurityLevelBox } from './securitylevelbox'
import { Stepper } from './stepper'
import { Table } from './table'
import { Tabs } from './tabs'
import { Tag } from './tag'
import { Tooltip } from './tooltip'
import { heading, link, text } from './typography'

export const recipes: Record<string, RecipeDefinition> = {
  badge: Badge,
  button: Button,
  formLabel,
  heading,
  input,
  link,
  text,
  icon: defineRecipe({
    base: {
      boxSize: 4,
    },
  }),
  textarea,
  ElectionDescription,
  ElectionSchedule,
  ElectionTitle,
  ElectionVideo,
  OrganizationDescription,
  OrganizationImage,
  OrganizationName,
  PaginationButton,
  SecurityLevelBox,
}

export const slotRecipes: Record<string, SlotRecipeDefinition> = {
  card: Card,
  checkbox,
  drawer: Drawer,
  list: listSlotRecipe,
  menu: Menu,
  popover: Popover,
  progress: Progress,
  switch: switchRecipe,
  table: Table,
  tabs: Tabs,
  tag: Tag,
  tooltip: Tooltip,
  ConfirmModal,
  ElectionQuestions,
  ElectionResults,
  Pagination,
  QuestionChoice,
  QuestionsConfirmation,
  QuestionsEmpty,
  QuestionsTip,
  QuestionsTypeBadge,
  steps: Stepper,
  Voted,
  VoteWeight,
}
