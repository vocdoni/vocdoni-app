import { Image } from '@chakra-ui/react'
import { BsGoogle } from 'react-icons/bs'
import { FaDiscord, FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import {
  LuArrowLeft,
  LuArrowUpRight,
  LuBold,
  LuBookOpen,
  LuBuilding2,
  LuCalendar,
  LuChartColumn,
  LuCheck,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuChevronUp,
  LuChevronsUpDown,
  LuCircleAlert,
  LuCircleCheckBig,
  LuCircleHelp,
  LuCirclePlay,
  LuCircleStop,
  LuClock,
  LuCopy,
  LuEllipsis,
  LuExternalLink,
  LuEye,
  LuEyeOff,
  LuFileCheck,
  LuFileDown,
  LuFileSpreadsheet,
  LuGlobe,
  LuGripVertical,
  LuHeadset,
  LuHouse,
  LuIdCard,
  LuInfo,
  LuItalic,
  LuKeyRound,
  LuLayoutDashboard,
  LuLink,
  LuList,
  LuListOrdered,
  LuListPlus,
  LuLock,
  LuLogOut,
  LuMail,
  LuMessageCircle,
  LuMessagesSquare,
  LuMonitor,
  LuMoon,
  LuNetwork,
  LuPalette,
  LuPanelLeft,
  LuPause,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuRocket,
  LuRotateCcw,
  LuScanEye,
  LuSearch,
  LuSend,
  LuSettings,
  LuShield,
  LuSmartphone,
  LuSparkles,
  LuStrikethrough,
  LuSun,
  LuTerminal,
  LuText,
  LuTrash2,
  LuTriangleAlert,
  LuUnderline,
  LuUnlink,
  LuUpload,
  LuUserCheck,
  LuUserCog,
  LuUserPen,
  LuUserPlus,
  LuUsers,
  LuVote,
  LuX,
  LuZap,
} from 'react-icons/lu'
import { MdOutlineWhatsapp } from 'react-icons/md'

export type { IconType } from 'react-icons'

// Icons by concept: components import these names, never a react-icons pack, so a glyph changes in one place.

// Actions
export const AddIcon = LuPlus
export const AddToListIcon = LuListPlus
export const AddUserIcon = LuUserPlus
export const CloseIcon = LuX
export const CopyIcon = LuCopy
export const DeleteIcon = LuTrash2
export const DownloadFileIcon = LuFileDown
export const EditIcon = LuPencil
export const ExternalLinkIcon = LuExternalLink
export const GoToIcon = LuArrowUpRight
export const HideIcon = LuEyeOff
export const LogoutIcon = LuLogOut
export const MoreIcon = LuEllipsis
export const PauseIcon = LuPause
export const RefreshIcon = LuRefreshCw
export const ResetIcon = LuRotateCcw
export const ResumeIcon = LuCirclePlay
export const SearchIcon = LuSearch
export const SendIcon = LuSend
export const StopIcon = LuCircleStop
export const UploadIcon = LuUpload
export const ViewIcon = LuEye

// Navigation
export const BackIcon = LuArrowLeft
export const ChevronDownIcon = LuChevronDown
export const ChevronLeftIcon = LuChevronLeft
export const ChevronRightIcon = LuChevronRight
export const ChevronUpIcon = LuChevronUp
export const ChevronsUpDownIcon = LuChevronsUpDown
export const DragHandleIcon = LuGripVertical
export const SidebarIcon = LuPanelLeft

// Status and feedback
export const CheckIcon = LuCheck
export const ErrorIcon = LuCircleAlert
export const HelpIcon = LuCircleHelp
export const InfoIcon = LuInfo
export const SuccessIcon = LuCircleCheckBig
export const WarningIcon = LuTriangleAlert

// Menus and sections
export const CalendarIcon = LuCalendar
export const ChatIcon = LuMessageCircle
export const ClockIcon = LuClock
export const ComplianceIcon = LuFileCheck
export const CustomizationIcon = LuPalette
export const DashboardIcon = LuLayoutDashboard
export const DocsIcon = LuBookOpen
export const ExtraFeaturesIcon = LuZap
export const HomeIcon = LuHouse
export const IdCardIcon = LuIdCard
export const KeyIcon = LuKeyRound
export const LanguageIcon = LuGlobe
export const LinkIcon = LuLink
export const LockIcon = LuLock
export const MailIcon = LuMail
export const MessagesIcon = LuMessagesSquare
export const NetworkIcon = LuNetwork
export const OrganizationIcon = LuBuilding2
export const SmsIcon = LuSmartphone
export const ResultsIcon = LuChartColumn
export const RocketIcon = LuRocket
export const ScanEyeIcon = LuScanEye
export const SecurityIcon = LuShield
export const SettingsIcon = LuSettings
export const SparklesIcon = LuSparkles
export const SpreadsheetIcon = LuFileSpreadsheet
export const SupportIcon = LuHeadset
export const TerminalIcon = LuTerminal
export const UnlinkIcon = LuUnlink
export const UserCheckIcon = LuUserCheck
export const UserCogIcon = LuUserCog
export const UsersIcon = LuUsers
export const VoteIcon = LuVote
export const ProfileIcon = LuUserPen

// Color mode
export const DarkModeIcon = LuMoon
export const LightModeIcon = LuSun
export const SystemModeIcon = LuMonitor

// Text editor
export const BoldIcon = LuBold
export const BulletListIcon = LuList
export const ItalicIcon = LuItalic
export const NumberedListIcon = LuListOrdered
export const ParagraphIcon = LuText
export const StrikethroughIcon = LuStrikethrough
export const UnderlineIcon = LuUnderline

// Brand marks: Lucide ships none, so they keep their packs
export const DiscordIcon = FaDiscord
export const GithubIcon = FaGithub
export const GoogleIcon = BsGoogle
export const TwitterXIcon = FaXTwitter
export const WhatsappIcon = MdOutlineWhatsapp

export const Logo = () => <Image src='/assets/logo_vocdoni.png' alt='vocdoni icon' maxWidth='wordmark' />

export const LogoMbl = ({ ...props }) => (
  <Image src='/assets/vocdoni_icon.png' alt='vocdoni icon' maxWidth='10' {...props} />
)
