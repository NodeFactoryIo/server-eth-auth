export interface IChallengeStorage {

  /**
   * Store challenge hash for given address to storage.
   * Overwrites last challenge if existing address sent.
   *
   * @param address ethereum address of user
   * @param challengeHash generated challenge hash
   */
  storeChallenge(address: string, challengeHash: string): Promise<void>;
  /**
   * Retrieve stored challenge hash by address recovered from user reply.
   *
   * @param recoveredAddress ethereum address retrieved from user reply
   */
  getChallengeHash(recoveredAddress: string): Promise<string | undefined>;
  /**
   * Delete stored challenge from storage.
   *
   * @param address ethereum address of stored challenge
   */
  deleteChallenge(address: string): Promise<void>;
}

export interface ITypedMessage {
  types: {
    EIP712Domain: {name: string; type: string}[];
    Challenge: {name: string; type: string}[];
  };
  domain: {
    name: string;
  };
  primaryType: "Challenge" | "EIP712Domain";
  message: {
    value: string;
  };
};
