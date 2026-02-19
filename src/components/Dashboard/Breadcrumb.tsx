import { Box, Flex, Icon, Link, Text } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronRight } from 'react-icons/lu'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { Routes } from '~routes'

export type BreadcrumbItem = {
  title: string
  route?: string
}

export type BreadcrumbProps = {
  breadcrumb: BreadcrumbItem[]
  setBreadcrumb: (items: BreadcrumbItem[]) => void
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumb, setBreadcrumb }) => {
  const { t } = useTranslation()

  return (
    <Box as='nav'>
      <Flex gap={1.5} alignItems='center'>
        {/* Dashboard link - only linked when there's breadcrumb */}
        <Box display={{ base: breadcrumb.length === 0 ? 'block' : 'none', md: 'block' }}>
          {breadcrumb.length ? (
            <Link variant='breadcrumb' fontSize='sm' onClick={() => setBreadcrumb([])} asChild>
              <ReactRouterLink to={generatePath(Routes.dashboard.base)}>{t('organization.dashboard')}</ReactRouterLink>
            </Link>
          ) : (
            <Text fontSize='sm'>{t('organization.dashboard')}</Text>
          )}
        </Box>

        {/* Breadcrumb items */}
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            {/* Chevron */}
            {(index === 0 || index > 0) && (
              <Icon
                as={LuChevronRight}
                display={{
                  base: 'none',
                  md: 'block',
                }}
                boxSize={3}
              />
            )}

            {/* Item */}
            <Box display={{ base: index === breadcrumb.length - 1 ? 'block' : 'none', md: 'block' }}>
              {item.route ? (
                <Link variant='breadcrumb' fontSize='sm' asChild>
                  <ReactRouterLink to={generatePath(item.route)}>{item.title}</ReactRouterLink>
                </Link>
              ) : (
                <Text fontSize='sm'>{item.title}</Text>
              )}
            </Box>
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  )
}

export default Breadcrumb
