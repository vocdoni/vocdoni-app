import { Badge, Box, Card, HStack, Progress, Text } from '@chakra-ui/react'

type QuotaCardProps = {
  label: string
  // Both optional: the integrator endpoint omits a metric entirely when the backend can't supply
  // it yet, and reports 0 as "unlimited" for the pooled caps (votes/SMS/emails).
  usage?: number
  limit?: number
}

/** Single quota metric: usage over its limit with a progress bar, flagged when at/over the limit. */
export const QuotaCard = ({ label, usage, limit }: QuotaCardProps) => {
  const used = usage ?? 0
  const hasLimit = typeof limit === 'number' && limit > 0
  const atLimit = hasLimit && used >= limit
  // limit absent -> just count it ("used"); limit 0 -> documented "unlimited"; limit > 0 -> "/ N".
  const denominator = limit === undefined ? 'used' : hasLimit ? `/ ${limit}` : 'Unlimited'

  return (
    <Card.Root>
      <Card.Body gap={3}>
        <Text fontSize='sm' color='fg.muted' fontWeight='medium'>
          {label}
        </Text>
        <HStack align='baseline' gap={1}>
          <Text fontSize='3xl' fontWeight='bold' lineHeight='1'>
            {used}
          </Text>
          <Text fontSize='md' color='fg.muted'>
            {denominator}
          </Text>
        </HStack>
        <Progress.Root
          value={hasLimit ? Math.min(used, limit) : 0}
          max={hasLimit ? limit : 1}
          size='sm'
          colorPalette={atLimit ? 'red' : 'blue'}
        >
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
