import { lazy } from 'react'
// These aren't lazy loaded since they are main layouts and related components
import LayoutAuth from '~elements/LayoutAuth'
import { Routes } from '.'
import AccountProtectedRoute from '../AccountProtectedRoute'
import NonLoggedRoute from '../NonLoggedRoute'
import { SuspenseLoader } from '../SuspenseLoader'

const AcceptInvite = lazy(() => import('~elements/account/invite'))
const Signin = lazy(() => import('~elements/account/signin'))
const SignUp = lazy(() => import('~elements/account/signup'))
const Verify = lazy(() => import('~elements/account/verify'))
const PasswordForgot = lazy(() => import('~elements/account/password'))
const PasswordReset = lazy(() => import('~elements/account/password/reset'))
const CreateOrganization = lazy(() => import('~elements/account/create-organization'))

const AuthElements = [
  {
    element: <NonLoggedRoute />,
    children: [
      {
        children: [
          {
            path: Routes.auth.signIn,
            element: (
              <SuspenseLoader>
                <Signin />
              </SuspenseLoader>
            ),
          },
          {
            path: Routes.auth.signUp,
            element: (
              <SuspenseLoader>
                <SignUp />
              </SuspenseLoader>
            ),
          },
          {
            path: Routes.auth.verify,
            element: (
              <SuspenseLoader>
                <Verify />
              </SuspenseLoader>
            ),
          },
          {
            path: Routes.auth.recovery,
            element: (
              <SuspenseLoader>
                <PasswordForgot />
              </SuspenseLoader>
            ),
          },
          {
            path: Routes.auth.passwordReset,
            element: (
              <SuspenseLoader>
                <PasswordReset />
              </SuspenseLoader>
            ),
          },
        ],
      },
    ],
  },
  {
    path: Routes.auth.acceptInvite,
    element: (
      <SuspenseLoader>
        <AcceptInvite />
      </SuspenseLoader>
    ),
  },
]

export const useAuthRoutes = () => {
  return {
    element: <LayoutAuth />,
    children: AuthElements,
  }
}

export const useCreateOrganizationRoutes = () => {
  return {
    element: (
      <SuspenseLoader>
        <AccountProtectedRoute />
      </SuspenseLoader>
    ),
    children: [
      {
        element: <LayoutAuth />,
        children: [
          {
            path: Routes.auth.organizationCreate,
            element: (
              <SuspenseLoader>
                <CreateOrganization />
              </SuspenseLoader>
            ),
          },
        ],
      },
    ],
  }
}
