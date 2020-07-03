export interface IChallengeStorage {

  /**
   * Store challenge hash for given address to storage.
   *
   * @param address ethereum address of user
   * @param challengeHash generated challenge hash
   */
  storeChallenge(address: string, challengeHash: string): Promise<void>;
  /**
   * Retrieve stored challenge by address recovered from user reply.
   *
   * @param recoveredAddress ethereum address retrieved from user reply
   */
  getChallenge(recoveredAddress: string): Promise<string | undefined>;
  /**
   * Delete stored challenge from storage.
   *
   * @param address ethereum address of stored challenge
   */
  deleteChallenge(address: string): Promise<void>;
}

export type IChallenge = {
  type: string;
  name: string;
  value: string;
}
