import axios, { AxiosError } from 'axios';
import {
  ErrAccountAlreadyExists,
  ErrAccountNotFound,
  ErrAddressMalformed,
  ErrBlockNotFound,
  ErrCantABIEncodeResults,
  ErrCantAddKeyAndValueToTree,
  ErrCantAddKeyToTree,
  ErrCantCheckTxType,
  ErrCantComputeKeyHash,
  ErrCantCountVotes,
  ErrCantEstimateBlockHeight,
  ErrCantExtractMetadataURI,
  ErrCantFetchElection,
  ErrCantFetchEnvelope,
  ErrCantFetchEnvelopeHeight,
  ErrCantFetchTokenFees,
  ErrCantFetchTokenTransfers,
  ErrCantGenerateFaucetPkg,
  ErrCantGetCircomSiblings,
  ErrCantMarshalMetadata,
  ErrCantParseAccountID,
  ErrCantParseBearerToken,
  ErrCantParseBoolean,
  ErrCantParseDataAsJSON,
  ErrCantParseElectionID,
  ErrCantParseHexString,
  ErrCantParseMetadataAsJSON,
  ErrCantParseNumber,
  ErrCantParseOrgID,
  ErrCantParsePayloadAsJSON,
  ErrCantParseVoteID,
  ErrCantPublishMetadata,
  ErrCensusBuild,
  ErrCensusIDLengthInvalid,
  ErrCensusIndexedFlagMismatch,
  ErrCensusNotFound,
  ErrCensusProofVerificationFailed,
  ErrCensusRootHashMismatch,
  ErrCensusRootIsNil,
  ErrCensusTypeMismatch,
  ErrCensusTypeUnknown,
  ErrDstAccountUnknown,
  ErrDstAddressMalformed,
  ErrElectionEndDateBeforeStart,
  ErrElectionEndDateInThePast,
  ErrElectionFinished,
  ErrElectionIsNil,
  ErrElectionNotFound,
  ErrElectionNotStarted,
  ErrElectionResultsIsNil,
  ErrElectionResultsMismatch,
  ErrElectionResultsNotYetAvailable,
  ErrFaucetAlreadyFunded,
  ErrFileSizeTooBig,
  ErrGettingSIK,
  ErrIndexedCensusCantUseWeight,
  ErrIndexerQueryFailed,
  ErrInvalidCensusKeyLength,
  ErrInvalidStatus,
  ErrKeyNotFoundInCensus,
  ErrMarshalingJSONFailed,
  ErrMarshalingServerJSONFailed,
  ErrMarshalingServerProto,
  ErrMetadataProvidedButNoURI,
  ErrMetadataURINotMatchContent,
  ErrMissingParameter,
  ErrNoElectionKeys,
  ErrOrgNotFound,
  ErrPageNotFound,
  ErrParamDumpOrRootMissing,
  ErrParamKeyOrProofMissing,
  ErrParamNetworkInvalid,
  ErrParamParticipantsMissing,
  ErrParamParticipantsTooBig,
  ErrParamRootInvalid,
  ErrParamStatusInvalid,
  ErrParamToInvalid,
  ErrParticipantKeyMissing,
  ErrSIKNotFound,
  ErrTransactionNotFound,
  ErrTxTypeMismatch,
  ErrUnmarshalingServerProto,
  ErrVochainEmptyReply,
  ErrVochainGetTxFailed,
  ErrVochainOverloaded,
  ErrVochainReturnedErrorCode,
  ErrVochainReturnedInvalidElectionID,
  ErrVochainReturnedWrongMetadataCID,
  ErrVochainSendTxFailed,
  ErrVoteIDMalformed,
  ErrVoteNotFound,
  ErrWalletNotFound,
  ErrWalletPrivKeyAlreadyExists,
} from './errors';
import {
  CouldNotCreateFaucetPackageError,
  CouldNotSignTransactionError,
  DuplicateConflictError,
  EmailMalformedError,
  GenericInternalServerError,
  InvalidTxFormatError,
  InvalidUserDataError,
  MalformedBodyError,
  MalformedURLParamError,
  MarshalingServerJSONFailedError,
  NoOrganizationProvidedError,
  NoOrganizationsError,
  OrganizationNotFoundError,
  PasswordTooShortError,
  TxTypeNotAllowedError,
  UnauthorizedError,
} from './saas';

export class ErrAPI extends Error {
  public raw: AxiosError;

  constructor(message?: string, error?: AxiosError) {
    super(message ? message : 'api error');
    this.raw = error;
  }
}

export type PaginationRequest = {
  page: number;
  limit: number;
};

export interface PaginationResponse {
  pagination: {
    totalItems: number;
    previousPage: number | null;
    currentPage: number;
    nextPage: number | null;
    lastPage: number;
  };
}

export abstract class API {
  /**
   * Cannot be constructed.
   */
  protected constructor() {}

  protected static isApiError(error: AxiosError): never {
    if (!axios.isAxiosError(error)) throw error;
    const err = error?.response?.data;
    if (err && err['code'] && !isNaN(Number(err['code']))) {
      switch (err['code']) {
        case 4000:
          throw new ErrAddressMalformed(err['error']);
        case 4001:
          throw new ErrDstAddressMalformed(err['error']);
        case 4002:
          throw new ErrDstAccountUnknown(err['error']);
        case 4003:
          throw new ErrAccountNotFound(err['error']);
        case 4004:
          throw new ErrAccountAlreadyExists(err['error']);
        case 4006:
          throw new ErrOrgNotFound(err['error']);
        case 4007:
          throw new ErrTransactionNotFound(err['error']);
        case 4008:
          throw new ErrBlockNotFound(err['error']);
        case 4009:
          throw new ErrMetadataProvidedButNoURI(err['error']);
        case 4010:
          throw new ErrMetadataURINotMatchContent(err['error']);
        case 4011:
          throw new ErrMarshalingJSONFailed(err['error']);
        case 4012:
          throw new ErrFileSizeTooBig(err['error']);
        case 4013:
          throw new ErrCantParseOrgID(err['error']);
        case 4014:
          throw new ErrCantParseAccountID(err['error']);
        case 4015:
          throw new ErrCantParseBearerToken(err['error']);
        case 4016:
          throw new ErrCantParseDataAsJSON(err['error']);
        case 4017:
          throw new ErrCantParseElectionID(err['error']);
        case 4018:
          throw new ErrCantParseMetadataAsJSON(err['error']);
        case 4019:
          throw new ErrCantParseNumber(err['error']);
        case 4020:
          throw new ErrCantParsePayloadAsJSON(err['error']);
        case 4021:
          throw new ErrCantParseVoteID(err['error']);
        case 4022:
          throw new ErrCantExtractMetadataURI(err['error']);
        case 4023:
          throw new ErrVoteIDMalformed(err['error']);
        case 4024:
          throw new ErrVoteNotFound(err['error']);
        case 4025:
          throw new ErrCensusIDLengthInvalid(err['error']);
        case 4026:
          throw new ErrCensusRootIsNil(err['error']);
        case 4027:
          throw new ErrCensusTypeUnknown(err['error']);
        case 4028:
          throw new ErrCensusTypeMismatch(err['error']);
        case 4029:
          throw new ErrCensusIndexedFlagMismatch(err['error']);
        case 4030:
          throw new ErrCensusRootHashMismatch(err['error']);
        case 4031:
          throw new ErrParamStatusInvalid(err['error']);
        case 4032:
          throw new ErrParamParticipantsMissing(err['error']);
        case 4033:
          throw new ErrParamParticipantsTooBig(err['error']);
        case 4034:
          throw new ErrParamDumpOrRootMissing(err['error']);
        case 4035:
          throw new ErrParamKeyOrProofMissing(err['error']);
        case 4036:
          throw new ErrParamRootInvalid(err['error']);
        case 4037:
          throw new ErrParamNetworkInvalid(err['error']);
        case 4038:
          throw new ErrParamToInvalid(err['error']);
        case 4039:
          throw new ErrParticipantKeyMissing(err['error']);
        case 4040:
          throw new ErrIndexedCensusCantUseWeight(err['error']);
        case 4041:
          throw new ErrWalletNotFound(err['error']);
        case 4042:
          throw new ErrWalletPrivKeyAlreadyExists(err['error']);
        case 4043:
          throw new ErrElectionEndDateInThePast(err['error']);
        case 4044:
          throw new ErrElectionEndDateBeforeStart(err['error']);
        case 4045:
          throw new ErrElectionNotFound(err['error']);
        case 4046:
          throw new ErrCensusNotFound(err['error']);
        case 4047:
          throw new ErrNoElectionKeys(err['error']);
        case 4048:
          throw new ErrMissingParameter(err['error']);
        case 4049:
          throw new ErrKeyNotFoundInCensus(err['error']);
        case 4050:
          throw new ErrInvalidStatus(err['error']);
        case 4051:
          throw new ErrInvalidCensusKeyLength(err['error']);
        case 4052:
          throw new ErrUnmarshalingServerProto(err['error']);
        case 4053:
          throw new ErrMarshalingServerProto(err['error']);
        case 4054:
          throw new ErrSIKNotFound(err['error']);
        case 4055:
          throw new ErrCantParseBoolean(err['error']);
        case 4056:
          throw new ErrCantParseHexString(err['error']);
        case 4057:
          throw new ErrPageNotFound(err['error']);
        case 5000:
          throw new ErrVochainEmptyReply(err['error']);
        case 5001:
          try {
            return API.isVochainError(err['error']);
          } catch (e) {
            if (!(e instanceof ErrVochainReturnedErrorCode)) {
              throw e;
            }
          }
          throw new ErrVochainSendTxFailed(err['error']);
        case 5002:
          throw new ErrVochainGetTxFailed(err['error']);
        case 5003:
          return API.isVochainError(err['error']);
        case 5004:
          throw new ErrVochainReturnedInvalidElectionID(err['error']);
        case 5005:
          throw new ErrVochainReturnedWrongMetadataCID(err['error']);
        case 5006:
          throw new ErrMarshalingServerJSONFailed(err['error']);
        case 5008:
          throw new ErrCantFetchElection(err['error']);
        case 5010:
          throw new ErrCantFetchTokenTransfers(err['error']);
        case 5011:
          throw new ErrCantFetchEnvelopeHeight(err['error']);
        case 5012:
          throw new ErrCantFetchEnvelope(err['error']);
        case 5013:
          throw new ErrCantCheckTxType(err['error']);
        case 5014:
          throw new ErrCantABIEncodeResults(err['error']);
        case 5015:
          throw new ErrCantComputeKeyHash(err['error']);
        case 5016:
          throw new ErrCantAddKeyAndValueToTree(err['error']);
        case 5017:
          throw new ErrCantAddKeyToTree(err['error']);
        case 5018:
          throw new ErrCantGenerateFaucetPkg(err['error']);
        case 5019:
          throw new ErrCantEstimateBlockHeight(err['error']);
        case 5020:
          throw new ErrCantMarshalMetadata(err['error']);
        case 5021:
          throw new ErrCantPublishMetadata(err['error']);
        case 5022:
          throw new ErrTxTypeMismatch(err['error']);
        case 5023:
          throw new ErrElectionIsNil(err['error']);
        case 5024:
          throw new ErrElectionResultsNotYetAvailable(err['error']);
        case 5025:
          throw new ErrElectionResultsIsNil(err['error']);
        case 5026:
          throw new ErrElectionResultsMismatch(err['error']);
        case 5027:
          throw new ErrCantGetCircomSiblings(err['error']);
        case 5028:
          throw new ErrCensusProofVerificationFailed(err['error']);
        case 5029:
          throw new ErrCantCountVotes(err['error']);
        case 5030:
          throw new ErrVochainOverloaded(err['error']);
        case 5031:
          throw new ErrGettingSIK(err['error']);
        case 5032:
          throw new ErrCensusBuild(err['error']);
        case 5033:
          throw new ErrIndexerQueryFailed(err['error']);
        case 5034:
          throw new ErrCantFetchTokenFees(err['error']);
        case 40001:
          throw new UnauthorizedError(err['error']);
        case 40002:
          throw new EmailMalformedError(err['error']);
        case 40003:
          throw new PasswordTooShortError(err['error']);
        case 40004:
          throw new MalformedBodyError(err['error']);
        case 40901:
          throw new DuplicateConflictError(err['error']);
        case 40005:
          throw new InvalidUserDataError(err['error']);
        case 40006:
          throw new CouldNotSignTransactionError(err['error']);
        case 40007:
          throw new InvalidTxFormatError(err['error']);
        case 40008:
          throw new TxTypeNotAllowedError(err['error']);
        case 40009:
          throw new OrganizationNotFoundError(err['error']);
        case 40010:
          throw new MalformedURLParamError(err['error']);
        case 40011:
          throw new NoOrganizationProvidedError(err['error']);
        case 40012:
          throw new NoOrganizationsError(err['error']);
        case 50001:
          throw new MarshalingServerJSONFailedError(err['error']);
        case 50002:
          throw new GenericInternalServerError(err['error']);
        case 50003:
          throw new CouldNotCreateFaucetPackageError(err['error']);
        default:
          return API.isUndefinedError(error, err['error']);
      }
    } else if (err) {
      const errorMessage = err['error'] ? (err['error'] as string) : (err as string);
      return API.isUndefinedError(error, errorMessage);
    }
    return API.isUndefinedError(error);
  }

  private static isVochainError(error: string): never {
    switch (true) {
      case error.includes('starts at') && error.includes('current'):
        throw new ErrElectionNotStarted(error);
      case error.includes('finished at') && error.includes('current'):
        throw new ErrElectionFinished(error);
      case error.includes('current state: ENDED'):
        throw new ErrElectionFinished(error);
      default:
        throw new ErrVochainReturnedErrorCode(error);
    }
  }

  protected static isUndefinedError(error: AxiosError, message?: string): never {
    API.isFaucetError(message);
    switch (true) {
      case error.response?.status != null && error.response?.statusText != null:
        throw new ErrAPI(error.response.status + ' ' + error.response.statusText + ': ' + message, error);
      case error.response?.status != null:
        throw new ErrAPI(error.response.status + ': ' + message, error);
      case message != null:
        throw new ErrAPI(message, error);
      default:
        throw new ErrAPI('Undefined API error', error);
    }
  }

  private static isFaucetError(message?: string) {
    switch (true) {
      case message && message.includes('already funded') && message.includes('wait until'):
        throw new ErrFaucetAlreadyFunded(message);
    }
  }

  protected static createQueryParams(params: Record<string, any>): string {
    return params
      ? Object.entries(params)
          .filter(([_, val]) => val != null)
          .map(([key, val]) => `${key}=${val}`)
          .join('&')
      : null;
  }
}
