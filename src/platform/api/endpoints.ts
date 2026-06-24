export enum ApiEndpoints {
  // Auth
  Login = 'auth/login',
  Refresh = 'auth/refresh',
  Register = 'users',
  Me = 'users/me',
  Verify = 'users/verify',
  VerifyCode = 'users/verify/code',
  PasswordRecovery = 'users/password/recovery',
  PasswordReset = 'users/password/reset',
  // Organizations
  Organizations = 'organizations',
  Organization = 'organizations/{address}',
  OrganizationTypes = 'organizations/types',
  OrganizationRoles = 'organizations/roles',
  // Team (organization users & pending invitations)
  OrganizationUsers = 'organizations/{address}/users',
  OrganizationUser = 'organizations/{address}/users/{userid}',
  OrganizationPendingUsers = 'organizations/{address}/users/pending',
  OrganizationPendingUser = 'organizations/{address}/users/pending/{invitationID}',
  // Support
  OrganizationTicket = 'organizations/{address}/ticket',
  // Plans & subscriptions
  Plans = 'plans',
  SubscriptionCheckout = 'subscriptions/checkout',
  OrganizationSubscription = 'organizations/{address}/subscription',
  SubscriptionPortal = 'subscriptions/{address}/portal',
  // Integrator (saas-backend#525)
  Integrator = 'organizations/{address}/integrator',
  ManagedOrganizations = 'organizations/{address}/managed',
  // API keys (saas-backend#535)
  APIKeys = 'organizations/{address}/apikeys',
  APIKey = 'organizations/{address}/apikeys/{keyID}',
}

export enum ErrorCode {
  // HTTP
  BadRequest = 400,
  Unauthorized = 401,
  // Custom API error codes
  MalformedJSONBody = 40004,
  UserNotVerified = 40014,
  UserAlreadyVerified = 40015,
  NotAnIntegrator = 40153,
  MaxManagedOrgsReached = 40154,
  IntegratorQuotaExceeded = 40155,
}
