import { defineRecipe, RecipeDefinition, SlotRecipeDefinition } from '@chakra-ui/react'
import { Alert } from './alert'
import { Avatar } from './avatar'
import { Badge, Code } from './badge'
import { BallotAside } from './ballotAside'
import { BallotDescription } from './ballotDescription'
import { BallotPaper } from './ballotPaper'
import { Button } from './button'
import { Card } from './card'
import { ChromeBar } from './chrome'
import { checkbox } from './checkbox'
import { CensusRuler } from './censusRuler'
import { Dialog } from './dialog'
import { DataList } from './dataList'
import { Drawer } from './drawer'
import {
  ElectionDescription,
  ElectionQuestions,
  ElectionResults,
  ElectionSchedule,
  ElectionTitle,
  ElectionHeader,
  ElectionVideo,
  QuestionChoice,
  QuestionsConfirmation,
  QuestionsEmpty,
  QuestionsTip,
  QuestionsTypeBadge,
  Voted,
  VoteWeight,
} from './election'
import { EmptyState } from './emptyState'
import { Field } from './field'
import { Footnote } from './footnote'
import { input, switchRecipe, textarea } from './form'
import { listSlotRecipe } from './list'
import { Menu } from './menu'
import { NativeSelect } from './nativeSelect'
import { OrganizationDescription, OrganizationImage, OrganizationName } from './organization'
import { Pagination, PaginationButton } from './pagination'
import { PinInput } from './pinInput'
import { Popover } from './popover'
import { Progress } from './progress'
import { PublishReview } from './publishReview'
import { QuestionDock } from './questionDock'
import { RadioCard } from './radioCard'
import { RadioGroup } from './radioGroup'
import { DashedRule } from './rule'
import { SegmentGroup } from './segmentGroup'
import { Stat } from './stat'
import { Status } from './status'
import { StepMark } from './stepMark'
import { Table } from './table'
import { Tabs } from './tabs'
import { Tag } from './tag'
import { TimelineMark, TimelineThread } from './timeline'
import { Toast } from './toast'
import { Tooltip } from './tooltip'
import { heading, link, text } from './typography'

export const recipes: Record<string, RecipeDefinition> = {
  badge: Badge,
  ballotAside: BallotAside,
  ballotDescription: BallotDescription,
  button: Button,
  code: Code,
  heading,
  input,
  link,
  text,
  icon: defineRecipe({
    base: {
      boxSize: 'icon.sm',
    },
  }),
  textarea,
  ElectionDescription,
  ElectionSchedule,
  ElectionTitle,
  ElectionHeader,
  ElectionVideo,
  OrganizationDescription,
  OrganizationImage,
  OrganizationName,
  PaginationButton,
  stepMark: StepMark,
  chromeBar: ChromeBar,
  dashedRule: DashedRule,
  footnote: Footnote,
  timelineMark: TimelineMark,
  timelineThread: TimelineThread,
}

export const slotRecipes: Record<string, SlotRecipeDefinition> = {
  alert: Alert,
  avatar: Avatar,
  ballotPaper: BallotPaper,
  card: Card,
  censusRuler: CensusRuler,
  checkbox,
  dataList: DataList,
  dialog: Dialog,
  drawer: Drawer,
  emptyState: EmptyState,
  field: Field,
  list: listSlotRecipe,
  menu: Menu,
  nativeSelect: NativeSelect,
  pinInput: PinInput,
  popover: Popover,
  progress: Progress,
  publishReview: PublishReview,
  questionDock: QuestionDock,
  radioCard: RadioCard,
  radioGroup: RadioGroup,
  segmentGroup: SegmentGroup,
  stat: Stat,
  status: Status,
  switch: switchRecipe,
  table: Table,
  tabs: Tabs,
  tag: Tag,
  toast: Toast,
  tooltip: Tooltip,
  ElectionQuestions,
  ElectionResults,
  Pagination,
  QuestionChoice,
  QuestionsConfirmation,
  QuestionsEmpty,
  QuestionsTip,
  QuestionsTypeBadge,
  Voted,
  VoteWeight,
}
