import { useElection } from '@vocdoni/react-components'
import { isCertificateCensus } from '~queries/certificateAuth/census'
import { useCertificateAuthMode } from '~queries/certificateAuth/mode'

/** True when the loaded process is a certificate census and the certificate sign-in is on. */
export const useIsCertificateVote = (): boolean =>
  isCertificateCensus(useElection().election?.census, useCertificateAuthMode())
