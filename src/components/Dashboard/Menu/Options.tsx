import { Box, Flex, List, Text } from '@chakra-ui/react'
import { useContext } from 'react'
import { matchPath, useLocation } from 'react-router'
import { DashboardLayoutContext } from '~elements/DashboardLayoutContext'
import { DashboardMenuItemButton } from './Item'
import { DashboardMenuSection } from './menus'

export const DashboardMenuOptions = ({ sections }: { sections: DashboardMenuSection[] }) => {
  const location = useLocation()
  const { reduced } = useContext(DashboardLayoutContext)

  return (
    <Flex flexDirection={'column'} gap={8}>
      {sections.map((section, sectionIndex) => {
        if (reduced && section.hideWhenReduced) return null

        return (
          <Box key={sectionIndex}>
            {!reduced && section.title && (
              <Text mx={2} mb={2} fontWeight={'bold'} fontSize='xs'>
                {section.title}
              </Text>
            )}
            <List.Root display='flex' flexDirection='column' listStyleType='none' ml={0}>
              {section.items.map((item, index) => {
                const activeMatch = item.activeMatch ?? (item.route ? [{ path: item.route, end: true }] : [])
                const isActive = activeMatch.some((match) =>
                  Boolean(matchPath({ path: match.path, end: match.end ?? true }, location.pathname))
                )

                return (
                  <List.Item key={index}>
                    <DashboardMenuItemButton item={item} reduced={reduced} isActive={isActive} />
                  </List.Item>
                )
              })}
            </List.Root>
          </Box>
        )
      })}
    </Flex>
  )
}
