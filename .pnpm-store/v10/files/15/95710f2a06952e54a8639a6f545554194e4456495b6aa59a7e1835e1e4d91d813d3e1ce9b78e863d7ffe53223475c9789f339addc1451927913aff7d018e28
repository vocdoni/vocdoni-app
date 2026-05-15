import { Census, CensusType } from './census';
import invariant from 'tiny-invariant';
import { isAddress } from '@ethersproject/address';

export interface ICensusParticipant {
  key: string;
  weight: bigint;
}

/**
 * Represents an offchain census
 */
export abstract class OffchainCensus extends Census {
  private _participants: ICensusParticipant[];

  /**
   * Constructs an offchain census
   */
  protected constructor() {
    super();
    this.type = CensusType.WEIGHTED;
    this.participants = [];
  }

  protected addParticipants(participants: ICensusParticipant | ICensusParticipant[]) {
    this.participants = this.participants
      .concat(
        Array.isArray(participants)
          ? participants.map((participant) => this.checkParticipant(participant))
          : [this.checkParticipant(participants)]
      )
      .filter((elem, index, self) => index === self.findIndex((p) => p.key === elem.key));
  }

  protected checkParticipant(participant: ICensusParticipant) {
    invariant(typeof participant.weight === 'bigint', 'Added incorrect weight to census');
    invariant(isAddress(participant.key), 'Added incorrect key to census');
    return participant;
  }

  protected removeParticipant(key: string) {
    this.participants = this.participants.filter((elem) => elem.key !== key);
  }

  get participants(): ICensusParticipant[] {
    return this._participants;
  }

  set participants(value: ICensusParticipant[]) {
    this._participants = value;
  }
}
