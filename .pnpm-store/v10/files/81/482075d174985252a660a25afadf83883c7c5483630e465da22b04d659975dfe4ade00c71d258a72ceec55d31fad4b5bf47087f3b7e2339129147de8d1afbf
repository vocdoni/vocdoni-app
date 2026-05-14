export const APP_URL = {
  dev: 'https://app-dev.vocdoni.io',
  stg: 'https://app-stg.vocdoni.io',
  prod: 'https://app.vocdoni.io',
};

export const API_URL = {
  dev: 'https://api-dev.vocdoni.net/v2',
  stg: 'https://api-stg.vocdoni.net/v2',
  prod: 'https://api.vocdoni.io/v2',
};

export const EXPLORER_URL = {
  dev: 'https://dev.explorer.vote',
  stg: 'https://stg.explorer.vote',
  prod: 'https://explorer.vote',
};

export const CENSUS3_URL = {
  dev: 'https://census3-dev.vocdoni.net/api',
  stg: 'https://census3-stg.vocdoni.net/api',
  prod: 'https://census3.vocdoni.io/api',
};

export const FAUCET_URL = {
  dev: 'https://api-dev.faucet.vocdoni.net/v2',
  stg: 'https://api-stg.faucet.vocdoni.net/v2',
  prod: 'https://api-faucet.vocdoni.io/v2',
};

export const TX_WAIT_OPTIONS = {
  retry_time: 5000,
  attempts: 6,
};

export const QUEUE_WAIT_OPTIONS = {
  retry_time: 2000,
  attempts: 10,
};

export const VOCDONI_SIK_SIGNATURE_LENGTH = 64;
export const VOCDONI_SIK_PAYLOAD =
  'This signature request is used to create your own secret identity key (SIK) for the Vocdoni protocol and generate your anonymous account.\n' +
  'Only accept this signature request if you fully trust the application. This request will not trigger a blockchain transaction or cost any gas fees.';

export const CENSUS_CHUNK_SIZE = 8192;
export const CENSUS_ASYNC = true;
export const CENSUS_ASYNC_WAIT_TIME = 5000;

export enum TxMessage {
  REGISTER_SIK = 'You are signing a Vocdoni transaction of type REGISTER_SIK for secret identity key {sik}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  SET_ACCOUNT = 'You are signing a Vocdoni transaction of type SET_ACCOUNT/{type}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  CREATE_ACCOUNT = 'You are signing a Vocdoni transaction of type CREATE_ACCOUNT for address {address}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  UPDATE_ACCOUNT = 'You are signing a Vocdoni transaction of type SET_ACCOUNT_INFO_URI for address {address} with URI {uri}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  COLLECT_FAUCET = 'You are signing a Vocdoni transaction of type COLLECT_FAUCET.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  SEND_TOKENS = 'You are signing a Vocdoni transaction of type SEND_TOKENS for an amount of {amount} VOC tokens to destination address {to}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  NEW_PROCESS = 'You are signing a Vocdoni transaction of type NEW_PROCESS.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  SET_PROCESS = 'You are signing a Vocdoni transaction of type SET_PROCESS/{type} with process ID {processId}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  SET_PROCESS_CENSUS = 'You are signing a Vocdoni transaction of type SET_PROCESS_CENSUS for process ID {processId} and census {censusId}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  SET_PROCESS_STATUS = 'You are signing a Vocdoni transaction of type SET_PROCESS_STATUS for process ID {processId} and status {status}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
  VOTE = 'You are signing a Vocdoni transaction of type VOTE for process ID {processId}.\n\nThe hash of this transaction is {hash} and the destination chain is {chainId}.',
}
