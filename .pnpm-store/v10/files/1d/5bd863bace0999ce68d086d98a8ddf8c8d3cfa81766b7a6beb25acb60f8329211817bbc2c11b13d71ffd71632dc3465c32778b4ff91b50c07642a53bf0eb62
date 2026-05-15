import { ICensusParticipant, OffchainCensus } from './offchain';

/**
 * Represents a weighted census
 */
export class WeightedCensus extends OffchainCensus {
  /**
   * Constructs a weighted census
   */
  public constructor() {
    super();
  }

  public add(participants: ICensusParticipant | ICensusParticipant[]) {
    super.addParticipants(participants);
  }

  public remove(key: string) {
    super.removeParticipant(key);
  }
}
