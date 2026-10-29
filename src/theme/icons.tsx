import { Image } from '@chakra-ui/react'
import { BiTrash } from 'react-icons/bi'
import { BsGoogle, BsLink } from 'react-icons/bs'
import { FaCog, FaDiscord, FaEye, FaEyeSlash, FaGithub, FaGlobeAmericas } from 'react-icons/fa'
import { FaCircleCheck, FaXTwitter } from 'react-icons/fa6'
import { HiOutlineEllipsisHorizontalCircle } from 'react-icons/hi2'
import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import {
  LuArrowLeft,
  LuArrowUpRight,
  LuBold,
  LuBookOpen,
  LuBuilding,
  LuBuilding2,
  LuCalendar,
  LuChartColumn,
  LuCheck,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsUpDown,
  LuCircleAlert,
  LuCircleCheck,
  LuCircleCheckBig,
  LuCircleHelp,
  LuCirclePlay,
  LuCircleStop,
  LuClock,
  LuCopy,
  LuEllipsis,
  LuEllipsisVertical,
  LuExternalLink,
  LuEye,
  LuFileCheck,
  LuFileDown,
  LuFileSpreadsheet,
  LuGripVertical,
  LuHeadset,
  LuHouse,
  LuIdCard,
  LuInfo,
  LuItalic,
  LuKey,
  LuKeyRound,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuLink,
  LuList,
  LuListOrdered,
  LuListPlus,
  LuLock,
  LuLogOut,
  LuMail,
  LuMessageCircle,
  LuMessageSquare,
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
  LuRotateCw,
  LuSearch,
  LuSend,
  LuSettings,
  LuShield,
  LuSlidersHorizontal,
  LuSmartphone,
  LuSparkles,
  LuSquareStack,
  LuStrikethrough,
  LuSun,
  LuTerminal,
  LuText,
  LuTrash,
  LuTrash2,
  LuTriangleAlert,
  LuUnderline,
  LuUnlink,
  LuUpload,
  LuUserCheck,
  LuUserCog,
  LuUserPen,
  LuUserPlus,
  LuUserRoundCog,
  LuUsers,
  LuVote,
  LuX,
  LuZap,
} from 'react-icons/lu'
import { MdOutlineRemoveRedEye, MdOutlineWhatsapp } from 'react-icons/md'
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiBarChartBoxLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiEyeCloseLine,
  RiFileCopyLine,
  RiLock2Line,
  RiSearchEyeLine,
  RiShieldCheckLine,
} from 'react-icons/ri'

export type { IconType } from 'react-icons'

// Icons by concept: components import these names, never a react-icons pack, so a glyph changes in one place.

// Actions
export const AddIcon = LuPlus
export const AddToListIcon = LuListPlus
export const AddUserIcon = LuUserPlus
export const CloseIcon = LuX
export const CopyIcon = LuCopy
export const DeleteIcon = LuTrash2
export const TrashIcon = LuTrash
export const DownloadFileIcon = LuFileDown
export const EditIcon = LuPencil
export const ExternalLinkIcon = LuExternalLink
export const GoToIcon = LuArrowUpRight
export const LogoutIcon = LuLogOut
export const MoreIcon = LuEllipsis
export const MoreVerticalIcon = LuEllipsisVertical
export const PauseIcon = LuPause
export const RefreshIcon = LuRefreshCw
export const ResetIcon = LuRotateCcw
export const ResumeIcon = LuCirclePlay
export const RetryIcon = LuRotateCw
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
export const ChevronsUpDownIcon = LuChevronsUpDown
export const DragHandleIcon = LuGripVertical
export const SidebarIcon = LuPanelLeft

// Status and feedback
export const CheckIcon = LuCheck
export const ErrorIcon = LuCircleAlert
export const HelpIcon = LuCircleHelp
export const IncludedIcon = LuCircleCheckBig
export const InfoIcon = LuInfo
export const SuccessIcon = LuCircleCheck
export const WarningIcon = LuTriangleAlert

// Menus and sections
export const ApiKeyIcon = LuKey
export const CalendarIcon = LuCalendar
export const ChatIcon = LuMessageCircle
export const ClockIcon = LuClock
export const ComplianceIcon = LuFileCheck
export const CustomizationIcon = LuPalette
export const DashboardIcon = LuLayoutDashboard
export const DocsIcon = LuBookOpen
export const ExtraFeaturesIcon = LuZap
export const HelpCenterIcon = LuLifeBuoy
export const HomeIcon = LuHouse
export const IdCardIcon = LuIdCard
export const KeyRoundIcon = LuKeyRound
export const LinkIcon = LuLink
export const LockIcon = LuLock
export const MailIcon = LuMail
export const MessageIcon = LuMessageSquare
export const MessagesIcon = LuMessagesSquare
export const NetworkIcon = LuNetwork
export const OrganizationIcon = LuBuilding2
export const OrganizationProfileIcon = LuBuilding
export const PhoneIcon = LuSmartphone
export const PreferencesIcon = LuSlidersHorizontal
export const ResultsIcon = LuChartColumn
export const RocketIcon = LuRocket
export const SecurityIcon = LuShield
export const SettingsIcon = LuSettings
export const SparklesIcon = LuSparkles
export const SpreadsheetIcon = LuFileSpreadsheet
export const StackIcon = LuSquareStack
export const SupportIcon = LuHeadset
export const TerminalIcon = LuTerminal
export const UnlinkIcon = LuUnlink
export const UserCheckIcon = LuUserCheck
export const UserCogIcon = LuUserCog
export const UserRoundCogIcon = LuUserRoundCog
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

// Brand marks
export const DiscordIcon = FaDiscord
export const GithubIcon = FaGithub
export const GoogleIcon = BsGoogle
export const TwitterXIcon = FaXTwitter
export const WhatsappIcon = MdOutlineWhatsapp

// Non-Lucide glyphs (each one becomes its Lucide concept in the next commit)
export const LegacyChevronDownIcon = RiArrowDownSLine
export const LegacyChevronUpIcon = RiArrowUpSLine
export const LegacyCopyIcon = RiFileCopyLine
export const LegacyDarkModeIcon = IoMdMoon
export const LegacyDeleteIcon = BiTrash
export const LegacyErrorIcon = RiErrorWarningLine
export const LegacyExternalLinkIcon = RiExternalLinkLine
export const LegacyHideIcon = FaEyeSlash
export const LegacyLanguageIcon = FaGlobeAmericas
export const LegacyLightModeIcon = IoMdSunny
export const LegacyLinkIcon = BsLink
export const LegacyLockIcon = RiLock2Line
export const LegacyMoreCircleIcon = HiOutlineEllipsisHorizontalCircle
export const LegacyPasswordHideIcon = RiEyeCloseLine
export const LegacyPasswordViewIcon = MdOutlineRemoveRedEye
export const LegacyResultsIcon = RiBarChartBoxLine
export const LegacyScanEyeIcon = RiSearchEyeLine
export const LegacySettingsIcon = FaCog
export const LegacyShieldCheckIcon = RiShieldCheckLine
export const LegacySuccessIcon = FaCircleCheck
export const LegacyViewIcon = FaEye

export const Logo = () => <Image src='/assets/logo_vocdoni.png' alt='vocdoni icon' maxWidth='125px' />

export const LogoMbl = ({ ...props }) => (
  <Image src='/assets/vocdoni_icon.png' alt='vocdoni icon' maxWidth={10} {...props} />
)
