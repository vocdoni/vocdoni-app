import { AlertRoot as Alert, AlertDescription, AlertIndicator, Button, Flex, Spinner, Text } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink, useNavigate, useOutletContext } from 'react-router'
import { api, ApiEndpoints, ApiError, ErrorCode } from '~components/Auth/api'
import SignUp, { InviteFields } from '~components/Auth/SignUp'
import { useToast } from '~components/Toast'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~src/router/routes'

const Error = ({ error }: { error: ReactNode }) => (
  <Alert status='error'>
    <AlertIndicator />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)

const AcceptInvitation: React.FC<InviteFields> = ({ address, code, email }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  const acceptInvitationMutation = useMutation({
    mutationFn: ({ code, address }: { code: string; address: string }) =>
      api(ApiEndpoints.InviteAccept.replace('{address}', address), {
        method: 'POST',
        body: { code },
      }),
  })

  // Accept the invitation
  useEffect(() => {
    if (
      !code ||
      !address ||
      acceptInvitationMutation.isPending ||
      acceptInvitationMutation.isError ||
      acceptInvitationMutation.isSuccess
    )
      return

    acceptInvitationMutation.mutate({ code, address })
  }, [code, address, acceptInvitationMutation])

  // Redirect on success
  useEffect(() => {
    if (!acceptInvitationMutation.isSuccess) return

    toast({
      title: t('invite.success_title', { defaultValue: 'Invitation accepted' }),
      description: t('invite.success_description', { defaultValue: 'You can now sign in' }),
      type: 'success',
    })
    navigate(Routes.auth.signIn)
  }, [acceptInvitationMutation.isSuccess])

  // Change layout title and subtitle
  useEffect(() => {
    if (!acceptInvitationMutation.isError || !(acceptInvitationMutation.error instanceof ApiError)) return
    const error = (acceptInvitationMutation.error as ApiError).apiError
    if (error?.code !== ErrorCode.MalformedJSONBody) return

    setTitle(t('invite.create_account_title', { defaultValue: 'Create your account' }))
    setSubtitle(
      t('invite.create_account_subtitle', { defaultValue: 'You need an account first, in order to accept your invite' })
    )
  }, [acceptInvitationMutation.isError])

  if (!code || !address || !email) {
    return <Error error={<Trans i18nKey='invite.invalid_link'>Invalid invite link received</Trans>} />
  }

  if (acceptInvitationMutation.isPending) {
    return (
      <Flex justify='center' p={4} gap={3}>
        <Spinner />
        <Text>
          <Trans i18nKey='invite.processing'>Processing your invitation...</Trans>
        </Text>
      </Flex>
    )
  }

  if (acceptInvitationMutation.isError) {
    const error = (acceptInvitationMutation.error as ApiError)?.apiError
    if (error?.code === ErrorCode.MalformedJSONBody) {
      return <SignUp invite={{ address, code, email }} />
    }

    if (error?.code === ErrorCode.UserNotVerified) {
      return (
        <Flex direction='column' justify='center' p={4} gap={4}>
          <Text>
            <Trans i18nKey='invite.account_not_verified'>
              Your account is not verified. Please verify your account to continue.
            </Trans>
          </Text>
          <Button asChild>
            <RouterLink to={generatePath(Routes.auth.verify)}>
              <Trans i18nKey='invite.go_to_verify'>Verify Account</Trans>
            </RouterLink>
          </Button>
        </Flex>
      )
    }

    return <Error error={error?.error || t('invite.unexpected_error', 'Unexpected error')} />
  }

  return <Spinner />
}

export default AcceptInvitation
