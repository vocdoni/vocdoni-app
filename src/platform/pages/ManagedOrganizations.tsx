import { Alert, ButtonGroup, Center, Flex, IconButton, Spinner, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { getApiErrorMessage } from '~platform/api/client'
import { ManagedOrganizationsTable } from '~platform/components/Integrator/ManagedOrganizationsTable'
import { usePaginatedManagedOrganizations } from '~platform/queries/integrator'

const LIMIT = 10

const ManagedOrganizationsPage = () => {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = usePaginatedManagedOrganizations(page, LIMIT)

  const pagination = data?.pagination
  const organizations = data?.organizations ?? []

  return (
    <Stack gap={5}>
      <Flex justify='space-between' align='flex-start' gap={4} wrap='wrap'>
        <Stack gap={1}>
          <Text fontSize='2xl' fontWeight='bold'>
            Managed organizations
          </Text>
          <Text color='fg.muted' fontSize='sm'>
            Organizations you manage on behalf of your customers.
          </Text>
        </Stack>
      </Flex>

      {isLoading ? (
        <Center py={16}>
          <Spinner />
        </Center>
      ) : error ? (
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unable to load organizations</Alert.Title>
            <Alert.Description>{getApiErrorMessage(error)}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : organizations.length === 0 ? (
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>No managed organizations yet</Alert.Title>
            <Alert.Description>Organizations you provision for your customers will appear here.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <>
          <ManagedOrganizationsTable organizations={organizations} />
          {pagination && pagination.lastPage > 0 && (
            <Flex justify='space-between' align='center' gap={4}>
              <Text fontSize='sm' color='fg.muted'>
                Page {pagination.currentPage} of {pagination.lastPage} · {pagination.totalItems} total
              </Text>
              <ButtonGroup size='sm' variant='outline' attached>
                <IconButton
                  aria-label='Previous page'
                  disabled={pagination.previousPage === null}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <LuChevronLeft />
                </IconButton>
                <IconButton
                  aria-label='Next page'
                  disabled={pagination.nextPage === null}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <LuChevronRight />
                </IconButton>
              </ButtonGroup>
            </Flex>
          )}
        </>
      )}
    </Stack>
  )
}

export default ManagedOrganizationsPage
