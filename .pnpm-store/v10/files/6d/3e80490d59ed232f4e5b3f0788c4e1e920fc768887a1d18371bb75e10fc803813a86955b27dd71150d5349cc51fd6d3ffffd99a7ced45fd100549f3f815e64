import { OffchainCensus } from './offchain';

/**
 * Represents a plain census
 */
export class PlainCensus extends OffchainCensus {
  /**
   * Constructs a plain census
   */
  public constructor() {
    super();
  }

  public add(participants: string | string[]) {
    super.addParticipants(
      Array.isArray(participants)
        ? participants.map((participant) => {
            return {
              key: participant,
              weight: BigInt(1),
            };
          })
        : {
            key: participants,
            weight: BigInt(1),
          }
    );
  }

  public remove(key: string) {
    super.removeParticipant(key);
  }
}
