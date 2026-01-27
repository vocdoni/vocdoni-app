import { Accordion } from './accordion'
import { Badge } from './badge'
import { Button } from './button'
import { Card } from './card'
import { Checkbox, DetailedCheckbox } from './checkbox'
import { ConfirmModal } from './confirmModal'
import { Drawer } from './drawer'
import { Dialog } from './dialog'
import { ElectionDescription, ElectionVideo } from './election'
import { EllipsisButton } from './ellipsisButton'
import { FormLabel } from './form'
import { ElectionSchedule, ElectionTitle, Heading } from './heading'
import { Input } from './input'
import { Link } from './link'
import { Menu } from './menu'
import { OrganizationDescription, OrganizationImage, OrganizationName } from './organization'
import { Pagination } from './pagination'
import { Popover } from './popover'
import { Progress } from './progress'
import { QuestionChoice } from './questionChoice'
import { ElectionQuestions } from './questions'
import { QuestionsConfirmation } from './questionsConfirmation'
import { QuestionsEmpty } from './questionsEmpty'
import { QuestionsTip } from './questionsTip'
import { QuestionsTypeBadge } from './questionsTypeBadge'
import { Radio } from './radio'
import { ElectionResults } from './results'
import { SecurityLevelBox } from './securitylevelbox'
import { SpreadsheetAccess } from './spreadsheetAccess'
import { Stepper } from './stepper'
import { Switch } from './switch'
import { Table } from './table'
import { Tabs } from './tabs'
import { Tag } from './tag'
import { Text } from './text'
import { Textarea } from './textarea'
import { Tooltip } from './tooltip'
import { Voted } from './voted'
import { VoteWeight } from './voteWeight'

export const recipes = {
  badge: Badge,
  button: Button,
  formLabel: FormLabel,
  heading: Heading,
  input: Input,
  link: Link,
  text: Text,
  textarea: Textarea,
  ElectionDescription,
  ElectionSchedule,
  ElectionTitle,
  ElectionVideo,
  OrganizationDescription,
  OrganizationImage,
  OrganizationName,
  SecurityLevelBox,
}

export const slotRecipes = {
  accordion: Accordion,
  card: Card,
  checkbox: Checkbox,
  dialog: Dialog,
  drawer: Drawer,
  menu: Menu,
  popover: Popover,
  progress: Progress,
  radioGroup: Radio,
  switch: Switch,
  table: Table,
  tabs: Tabs,
  tag: Tag,
  tooltip: Tooltip,
  ConfirmModal,
  DetailedCheckbox,
  ElectionQuestions,
  ElectionResults,
  EllipsisButton,
  Pagination,
  QuestionChoice,
  QuestionsConfirmation,
  QuestionsEmpty,
  QuestionsTip,
  QuestionsTypeBadge,
  SpreadsheetAccess,
  steps: Stepper,
  Voted,
  VoteWeight,
}
