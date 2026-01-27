import { Image, TooltipContent, TooltipPositioner, TooltipRoot, TooltipTrigger } from '@chakra-ui/react'
import fallback from '/assets/default-avatar.png'

interface StampIconProps {
  iconURI: string | undefined
  alt?: string
  size?: number
  tooltip?: string
}

export const StampIcon = ({ iconURI, alt, size = 5, tooltip }: StampIconProps) => {
  const image = <Image src={iconURI || fallback} alt={alt} w={size} h={size} />

  if (!tooltip) {
    return image
  }

  return (
    <TooltipRoot positioning={{ placement: 'top-start' }}>
      <TooltipTrigger asChild>{image}</TooltipTrigger>
      <TooltipPositioner>
        <TooltipContent>{tooltip}</TooltipContent>
      </TooltipPositioner>
    </TooltipRoot>
  )
}
