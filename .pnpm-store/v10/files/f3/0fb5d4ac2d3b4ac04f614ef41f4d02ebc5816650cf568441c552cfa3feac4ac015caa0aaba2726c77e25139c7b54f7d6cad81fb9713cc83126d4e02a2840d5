import {
  CensusOrigin,
  NewProcessTx,
  ProcessStatus,
  processStatusFromJSON,
  SetProcessTx,
  Tx,
  TxType,
} from '@vocdoni/proto/vochain';
import { AllElectionStatus, CensusType, ElectionStatus, UnpublishedElection } from '../types';
import { TransactionCore } from './transaction';
import { Buffer } from 'buffer';
import { strip0x } from '../util/common';
import { ChainCosts } from '../services';
import { TxMessage } from '../util/constants';

export abstract class ElectionCore extends TransactionCore {
  private static readonly VOCHAIN_BLOCK_TIME_IN_SECONDS = 10;

  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  public static generateSetElectionStatusTransaction(
    electionId: string,
    accountNonce: number,
    newStatus: AllElectionStatus
  ): { tx: Uint8Array; message: string } {
    const status = this.processStatusFromElectionStatus(newStatus);
    const message = TxMessage.SET_PROCESS_STATUS.replace(
      '{status}',
      Object.keys(ProcessStatus)[Object.values(ProcessStatus).indexOf(status)].toLowerCase()
    ).replace('{processId}', electionId);
    const setProcess = SetProcessTx.fromPartial({
      txtype: TxType.SET_PROCESS_STATUS,
      nonce: accountNonce,
      processId: new Uint8Array(Buffer.from(strip0x(electionId), 'hex')),
      status,
    });
    const tx = Tx.encode({
      payload: { $case: 'setProcess', setProcess },
    }).finish();

    return { tx, message };
  }

  public static generateSetElectionCensusTransaction(
    electionId: string,
    accountNonce: number,
    censusId: string,
    censusURI: string,
    maxCensusSize?: number
  ): { tx: Uint8Array; message: string } {
    const message = TxMessage.SET_PROCESS_CENSUS.replace('{censusId}', censusId).replace('{processId}', electionId);
    const setProcess = SetProcessTx.fromPartial({
      txtype: TxType.SET_PROCESS_CENSUS,
      nonce: accountNonce,
      processId: Uint8Array.from(Buffer.from(strip0x(electionId), 'hex')),
      censusRoot: Uint8Array.from(Buffer.from(strip0x(censusId), 'hex')),
      censusURI: censusURI,
      censusSize: maxCensusSize,
    });
    const tx = Tx.encode({
      payload: { $case: 'setProcess', setProcess },
    }).finish();

    return { tx, message };
  }

  public static generateSetElectionDurationTransaction(
    electionId: string,
    accountNonce: number,
    duration: number
  ): { tx: Uint8Array; message: string } {
    const message = TxMessage.SET_PROCESS.replace('{type}', 'SET_PROCESS_DURATION').replace('{processId}', electionId);
    const setProcess = SetProcessTx.fromPartial({
      txtype: TxType.SET_PROCESS_DURATION,
      nonce: accountNonce,
      processId: Uint8Array.from(Buffer.from(strip0x(electionId), 'hex')),
      duration: duration,
    });
    const tx = Tx.encode({
      payload: { $case: 'setProcess', setProcess },
    }).finish();

    return { tx, message };
  }

  public static generateNewElectionTransaction(
    election: UnpublishedElection,
    cid: string,
    address: string,
    nonce: number
  ): { tx: Uint8Array; metadata: string; message: string } {
    const txData = this.prepareElectionData(election, cid, address, nonce);

    const newProcess = NewProcessTx.fromPartial({
      txtype: TxType.NEW_PROCESS,
      ...txData.electionData,
    });
    return {
      tx: Tx.encode({
        payload: { $case: 'newProcess', newProcess },
      }).finish(),
      metadata: txData.metadata,
      message: TxMessage.NEW_PROCESS,
    };
  }

  private static prepareElectionData(
    election: UnpublishedElection,
    cid: string,
    address: string,
    nonce: number
  ): { metadata: string; electionData: object } {
    let startTime = election.startDate ? Math.floor(election.startDate.getTime() / 1000) : 0;
    // If the start date is less than the current time plus the block time, set it to begin immediately
    // This is to prevent the transaction to be rejected by the node
    if (startTime !== 0 && startTime < Math.floor(Date.now() / 1000) + this.VOCHAIN_BLOCK_TIME_IN_SECONDS * 5) {
      startTime = 0;
    }
    return {
      metadata: Buffer.from(election.summarizeMetadata(), 'utf8').toString('base64'),
      electionData: {
        nonce: nonce,
        process: {
          entityId: Uint8Array.from(Buffer.from(address, 'hex')),
          startTime,
          duration: election.duration,
          censusRoot: Uint8Array.from(Buffer.from(election.census.censusId, 'hex')),
          censusURI: election.census.censusURI,
          status: ProcessStatus.READY,
          envelopeType: election.generateEnvelopeType(),
          mode: election.generateMode(),
          voteOptions: election.generateVoteOptions(),
          censusOrigin: this.censusOriginFromCensusType(election.census.type),
          metadata: cid,
          maxCensusSize: election.maxCensusSize ?? election.census.size ?? undefined,
          tempSIKs: election.temporarySecretIdentity ?? false,
        },
      },
    };
  }

  private static processStatusFromElectionStatus(status: AllElectionStatus): ProcessStatus {
    if (status == ElectionStatus.UPCOMING || status == ElectionStatus.ONGOING) {
      return ProcessStatus.READY;
    }
    return processStatusFromJSON(status);
  }

  public static censusOriginFromCensusType(censusType: CensusType): CensusOrigin {
    switch (censusType) {
      case CensusType.CSP:
        return CensusOrigin.OFF_CHAIN_CA;
      case CensusType.WEIGHTED:
      case CensusType.ANONYMOUS:
        return CensusOrigin.OFF_CHAIN_TREE_WEIGHTED;
      default:
        throw new Error('Census origin not defined by the census type');
    }
  }

  public static estimateElectionCost(election: UnpublishedElection, costs: ChainCosts): number {
    if (!election.maxCensusSize) {
      throw new Error('Could not estimate cost because maxCensusSize is not set');
    }

    const electionBlocks = Math.floor(election.duration / this.VOCHAIN_BLOCK_TIME_IN_SECONDS);

    if (electionBlocks <= 0) {
      throw new Error('Could not estimate cost because of negative election blocks size');
    }

    const params = {
      maxCensusSize: election.maxCensusSize,
      electionBlocks: electionBlocks,
      encryptedVotes: election.electionType.secretUntilTheEnd,
      anonymousVotes: election.electionType.anonymous,
      maxVoteOverwrite: election.voteType.maxVoteOverwrites,
    };

    let sizePriceFactor = costs.factors.k1 * params.maxCensusSize * (1 - 1 / costs.capacity);
    if (params.maxCensusSize >= costs.factors.k7) {
      sizePriceFactor *= 1 + costs.factors.k6 * (params.maxCensusSize - costs.factors.k7);
    }
    let sizePrice = sizePriceFactor;

    let durationPrice = costs.factors.k2 * params.electionBlocks * (1 + params.maxCensusSize / costs.capacity);

    let encryptedPrice = 0;
    if (params.encryptedVotes) {
      encryptedPrice = costs.factors.k3 * params.maxCensusSize;
    }

    let anonymousPrice = 0;
    if (params.anonymousVotes) {
      anonymousPrice = costs.factors.k4;
    }

    let overwritePriceFactor = (costs.factors.k5 * params.maxVoteOverwrite) / costs.capacity;
    let overwritePrice = overwritePriceFactor * params.maxCensusSize;

    return costs.basePrice + sizePrice + durationPrice + encryptedPrice + anonymousPrice + overwritePrice;
  }
}
