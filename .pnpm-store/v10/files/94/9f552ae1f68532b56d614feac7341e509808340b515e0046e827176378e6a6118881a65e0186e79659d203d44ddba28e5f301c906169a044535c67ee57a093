import { IChainTxReference } from '../chain';

export interface Tx {
  tx?:
    | {
        $case: 'vote';
        vote: VoteEnvelope;
      }
    | {
        $case: 'newProcess';
        newProcess: NewProcessTx;
      }
    | {
        $case: 'admin';
        admin: AdminTx;
      }
    | {
        $case: 'setProcess';
        setProcess: SetProcessTx;
      }
    | {
        $case: 'registerKey';
        registerKey: RegisterKeyTx;
      }
    | {
        $case: 'mintTokens';
        mintTokens: MintTokensTx;
      }
    | {
        $case: 'sendTokens';
        sendTokens: SendTokensTx;
      }
    | {
        $case: 'setTransactionCosts';
        setTransactionCosts: SetTransactionCostsTx;
      }
    | {
        $case: 'setAccount';
        setAccountInfo: SetAccountTx;
      }
    // | {
    //     $case: 'setAccountDelegateTx';
    //     setAccountDelegateTx: SetAccountDelegateTx;
    //   }
    | {
        $case: 'collectFaucet';
        collectFaucet: CollectFaucetTx;
      };
  // | {
  //     $case: 'setKeykeeper';
  //     collectFaucet: SetKeyKeeperTx;
  //   };
  txInfo: IChainTxReference;
  signature: string;
}

export interface VoteEnvelope {
  /**
   * Unique number per vote attempt, so that replay attacks can't reuse this payload
   * */
  nonce: string;
  /**
   * The process for which the vote is casted
   * */
  processId: string;
  /**
   * Franchise proof
   * */
  proof: Proof | undefined;
  /**
   * JSON string of the Vote Package (potentially encrypted), encoded as bytes.
   * */
  votePackage: string;
  /**
   * Hash of the private key + processId
   * */
  nullifier: string;
  /**
   * On encrypted votes, contains the (sorted) indexes of the keys used to encrypt
   * */
  encryptionKeyIndexes: number[];
}

export interface NewProcessTx {
  txtype: TxType;
  nonce: number;
  process: Process | undefined;
}

export interface AdminTx {
  txtype: TxType;
  processId: Uint8Array;
  address?: Uint8Array | undefined;
  encryptionPrivateKey?: Uint8Array | undefined;
  encryptionPublicKey?: Uint8Array | undefined;
  keyIndex?: number | undefined;
  power?: number | undefined;
  publicKey?: Uint8Array | undefined;
  nonce: number;
}

export interface SetProcessTx {
  txtype: TxType;
  nonce: number;
  processId: Uint8Array;
  status?: ProcessStatus | undefined;
  questionIndex?: number | undefined;
  censusRoot?: Uint8Array | undefined;
  censusURI?: string | undefined;
  proof?: Proof | undefined;
  results?: ProcessResult | undefined;
}

export interface RegisterKeyTx {
  /** Unique number per vote attempt, so that replay attacks can't reuse this payload */
  nonce: number;
  /** The process for which the vote is casted */
  processId: Uint8Array;
  /** Franchise proof */
  proof: Proof | undefined;
  /** New key to register */
  newKey: Uint8Array;
  /** Weight to delegate to newKey */
  weight: string;
}

export interface MintTokensTx {
  txtype: TxType;
  nonce: number;
  to: Uint8Array;
  value: number;
}

export interface SendTokensTx {
  txtype: TxType;
  nonce: number;
  from: Uint8Array;
  to: Uint8Array;
  value: number;
}

export interface SetTransactionCostsTx {
  txtype: TxType;
  nonce: number;
  value: number;
}

export interface SetAccountTx {
  txtype: TxType;
  nonce?: number | undefined;
  infoURI?: string | undefined;
  account?: Uint8Array | undefined;
  faucetPackage?: FaucetPackage | undefined;
  delegates: Uint8Array[];
}

export interface CollectFaucetTx {
  txType: TxType;
  faucetPackage: FaucetPackage | undefined;
  nonce: number;
}

interface FaucetPackage {
  payload: Uint8Array;
  signature: Uint8Array;
}

export interface Process {
  processId: Uint8Array;
  /** EntityId identifies unequivocally an entity */
  entityId: Uint8Array;
  /** StartBlock represents the tendermint block where the process goes from scheduled to active */
  startBlock: number;
  /** BlockCount represents the amount of tendermint blocks that the process will last */
  blockCount: number;
  /** CensusRoot merkle root of all the census in the process */
  censusRoot: Uint8Array;
  /** CensusURI where to find the census */
  censusURI?: string | undefined;
  /** EncryptionPrivateKeys are the keys required to decrypt the votes */
  encryptionPrivateKeys: string[];
  /** EncryptionPublicKeys are the keys required to encrypt the votes */
  encryptionPublicKeys: string[];
  keyIndex?: number | undefined;
  status: ProcessStatus;
  paramsSignature?: Uint8Array | undefined;
  namespace: number;
  envelopeType: EnvelopeType | undefined;
  mode: ProcessMode | undefined;
  questionIndex?: number | undefined;
  questionCount?: number | undefined;
  voteOptions: ProcessVoteOptions | undefined;
  censusOrigin: CensusOrigin;
  results: ProcessResult[];
  resultsSignatures: Uint8Array[];
  ethIndexSlot?: number | undefined;
  /** SourceBlockHeight is the block height of the origin blockchain (if any) */
  sourceBlockHeight?: number | undefined;
  /** Owner is the creator of a process (if any) otherwise is assumed the creator is the entityId */
  owner?: Uint8Array | undefined;
  /** Metadata is the content hashed URI of the JSON meta data (See Data Origins) */
  metadata?: string | undefined;
  /** SourceNetworkId is the identifier of the network origin (where the process have been created) */
  sourceNetworkId: SourceNetworkId;
  /** MaxCensusSize is set by the Process creator. */
  maxCensusSize?: number | undefined;
  /**
   * RollingCensusRoot merkle root of the rolling census.  Set by the
   * vocdoni-node when Mode.Process = true
   */
  rollingCensusRoot?: Uint8Array | undefined;
  /**
   * RollingCensusSize is set by the vocdoni-node when Mode.PreRegister =
   * true and the StartBlock has been reached.
   */
  rollingCensusSize?: number | undefined;
  /**
   * NullifiersRoot is the root of the pre-census nullifiers merkle tree.
   * Used when Mode.PreRegister = true.
   */
  nullifiersRoot?: Uint8Array | undefined;
  /**
   * sourceNetworkContractAddr is used for EVM token based voting and it is
   * the contract address of the token that is going to define the census
   */
  sourceNetworkContractAddr?: Uint8Array | undefined;
  /**
   * tokenDecimals represents the number of decimals of the token (i.e ERC20) used for voting.
   * It is normally used for processes with on-chain census
   */
  tokenDecimals?: number | undefined;
}

export declare enum CensusOrigin {
  CENSUS_UNKNOWN = 0,
  OFF_CHAIN_TREE = 1,
  OFF_CHAIN_TREE_WEIGHTED = 2,
  OFF_CHAIN_CA = 3,
  ERC20 = 11,
  ERC721 = 12,
  ERC1155 = 13,
  ERC777 = 14,
  MINI_ME = 15,
  UNRECOGNIZED = -1,
}

/** Scrutinizer */
interface ProcessResult {
  votes: QuestionResult[];
  processId?: Uint8Array | undefined;
  entityId?: Uint8Array | undefined;
  oracleAddress?: Uint8Array | undefined;
  signature?: Uint8Array | undefined;
}

interface QuestionResult {
  question: Uint8Array[];
}

interface ProcessVoteOptions {
  maxCount: number;
  maxValue: number;
  maxVoteOverwrites: number;
  maxTotalCost: number;
  costExponent: number;
}

declare enum SourceNetworkId {
  UNKNOWN = 0,
  ETH_MAINNET = 1,
  ETH_RINKEBY = 2,
  ETH_GOERLI = 3,
  POA_XDAI = 4,
  POA_SOKOL = 5,
  POLYGON = 6,
  BSC = 7,
  ETH_MAINNET_SIGNALING = 8,
  ETH_RINKEBY_SIGNALING = 9,
  AVAX_FUJI = 10,
  AVAX = 11,
  POLYGON_MUMBAI = 12,
  OPTIMISM = 13,
  ARBITRUM = 14,
  UNRECOGNIZED = -1,
}

interface ProcessMode {
  interruptible: boolean;
  dynamicCensus: boolean;
  encryptedMetaData: boolean;
  preRegister: boolean;
}

interface EnvelopeType {
  serial: boolean;
  anonymous: boolean;
  encryptedVotes: boolean;
  uniqueValues: boolean;
  costFromWeight: boolean;
}

declare enum ProcessStatus {
  PROCESS_UNKNOWN = 0,
  READY = 1,
  ENDED = 2,
  CANCELED = 3,
  PAUSED = 4,
  RESULTS = 5,
  UNRECOGNIZED = -1,
}

export declare enum TxType {
  TX_UNKNOWN = 0,
  NEW_PROCESS = 1,
  SET_PROCESS_STATUS = 2,
  SET_PROCESS_CENSUS = 3,
  SET_PROCESS_QUESTION_INDEX = 4,
  ADD_PROCESS_KEYS = 5,
  REVEAL_PROCESS_KEYS = 6,
  ADD_ORACLE = 7,
  REMOVE_ORACLE = 8,
  ADD_VALIDATOR = 9,
  REMOVE_VALIDATOR = 10,
  VOTE = 11,
  SET_PROCESS_RESULTS = 12,
  REGISTER_VOTER_KEY = 13,
  MINT_TOKENS = 14,
  SEND_TOKENS = 15,
  SET_TRANSACTION_COSTS = 16,
  SET_ACCOUNT_INFO_URI = 17,
  ADD_DELEGATE_FOR_ACCOUNT = 18,
  DEL_DELEGATE_FOR_ACCOUNT = 19,
  COLLECT_FAUCET = 20,
  ADD_KEYKEEPER = 21,
  DELETE_KEYKEEPER = 22,
  CREATE_ACCOUNT = 23,
  UNRECOGNIZED = -1,
}

export interface Proof {
  payload?:
    | {
        $case: 'graviton';
        graviton: {
          siblings: Uint8Array;
        };
      }
    | {
        $case: 'iden3';
        iden3: {
          siblings: Uint8Array;
        };
      }
    | {
        $case: 'ethereumStorage';
        ethereumStorage: {
          key: Uint8Array;
          value: Uint8Array;
          siblings: Uint8Array[];
        };
      }
    | {
        $case: 'ethereumAccount';
        ethereumAccount: {
          nonce: Uint8Array;
          /** Big Int encoded as bytes */
          balance: Uint8Array;
          storageHash: Uint8Array;
          codeHash: Uint8Array;
          siblings: Uint8Array[];
        };
      }
    | {
        $case: 'ca';
        ca: {
          type: ProofCA_Type;
          bundle:
            | {
                processId: Uint8Array;
                address: Uint8Array;
              }
            | undefined;
          signature: Uint8Array;
        };
      }
    | {
        $case: 'arbo';
        arbo: {
          type: ProofArbo_Type;
          siblings: Uint8Array;
          value: Uint8Array;
          keyType: ProofArbo_KeyType;
        };
      }
    | {
        $case: 'zkSnark';
        zkSnark: {
          circuitParametersIndex: number;
          a: string[];
          b: string[];
          c: string[];
          publicInputs: string[];
        };
      }
    | {
        $case: 'minimeStorage';
        minimeStorage: {
          proofPrevBlock:
            | {
                key: Uint8Array;
                value: Uint8Array;
                siblings: Uint8Array[];
              }
            | undefined;
          proofNextBlock?:
            | {
                key: Uint8Array;
                value: Uint8Array;
                siblings: Uint8Array[];
              }
            | undefined;
        };
      };
}

declare enum ProofCA_Type {
  UNKNOWN = 0,
  ECDSA = 1,
  ECDSA_PIDSALTED = 2,
  ECDSA_BLIND = 3,
  ECDSA_BLIND_PIDSALTED = 4,
  UNRECOGNIZED = -1,
}

declare enum ProofArbo_Type {
  BLAKE2B = 0,
  POSEIDON = 1,
  UNRECOGNIZED = -1,
}

declare enum ProofArbo_KeyType {
  PUBKEY = 0,
  ADDRESS = 1,
  UNRECOGNIZED = -1,
}
