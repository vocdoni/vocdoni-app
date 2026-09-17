import type { PageContext } from 'vike/types'

export default (pageContext: Pick<PageContext, 'routeParams'>) => pageContext.routeParams.lang
