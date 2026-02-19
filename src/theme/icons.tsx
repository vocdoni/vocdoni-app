import { Image } from '@chakra-ui/react'
import { AiFillCheckCircle } from 'react-icons/ai'
import { IoCloseOutline } from 'react-icons/io5'

export const Close = IoCloseOutline

export const Check = AiFillCheckCircle

export const Logo = () => <Image src='/assets/logo_vocdoni.png' alt='vocdoni icon' maxWidth='125px' />

export const LogoMbl = ({ ...props }) => (
  <Image src='/assets/vocdoni_icon.png' alt='vocdoni icon' maxWidth={10} {...props} />
)
