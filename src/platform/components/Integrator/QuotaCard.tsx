import { Badge, Box, Card, HStack, Progress, Text } from '@chakra-ui/react'

type QuotaCardProps = {
  label: string
  usage: number
  limit: number
}

/** Single quota metric: usage over its limit with a progress bar, flagged when at/over the limit. */
export const QuotaCard = ({ label, usage, limit }: QuotaCardProps) => {
  const atLimit = limit > 0 && usage >= limit
  const value = limit > 0 ? Math.min(usage, limit) : 0

  return (
    <Card.Root>
      <Card.Body gap={3}>
        <Text fontSize='sm' color='fg.muted' fontWeight='medium'>
          {label}
        </Text>
        <HStack align='baseline' gap={1}>
          <Text fontSize='3xl' fontWeight='bold' lineHeight='1'>
            {usage}
          </Text>
          <Text fontSize='md' color='fg.muted'>
            / {limit}
          </Text>
        </HStack>
        <Progress.Root value={value} max={limit > 0 ? limit : 1} size='sm' colorPalette={atLimit ? 'red' : 'blue'}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
        <Box minH='22px'>
          {atLimit && (
            <Badge colorPalette='red' variant='subtle'>
              Limit reached
            </Badge>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  )
}
