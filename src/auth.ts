import {IChallengeStorage, ITypedMessage} from "./@types";
import crypto from "crypto";
import {uuid} from "uuidv4";
import {recoverTypedSignature} from "eth-sig-util";
import {isValidAddress} from "ethereumjs-util";

export class EthAuth {
  private domain: string;
  private challengeStorage: IChallengeStorage;


  /**
   * @param challengeStorage implemented challenge storage object
   * @param domain domain name shown in metamask
   */
  public constructor(challengeStorage: IChallengeStorage, domain: string) {
    this.challengeStorage = challengeStorage;
    this.domain = domain;
  }

  /**
   * Creates challenge and stores challenge hash by user address.
   *
   * @param address ethereum address of user
   */
  public async createChallenge(address: string): Promise<ITypedMessage> {
    if(!isValidAddress(address)) {
      throw new Error("Ethereum address sent is not valid.");
    }

    const challengeHash = crypto.createHmac(
      "sha256", uuid()
    ).update(
      address + uuid()
    ).digest(
      "hex"
    );

    this.challengeStorage.storeChallenge(address.toLowerCase(), challengeHash);


    const typedMessage = this.createTypedMessage(challengeHash);

    return typedMessage;
  }

  /**
   * Checks if challenge is valid and returns ethereum address of authenticated user
   *
   * @param challengeHash Challenge message sent by user
   * @param sig Message signature generated from web3 provider signing challenge message
   */
  public async checkChallenge(challengeHash: string, sig: string): Promise<string | undefined> {
    const typedMessage = this.createTypedMessage(challengeHash);

    const recoveredAddress = recoverTypedSignature({
      data: typedMessage,
      sig: sig,
    });
    const storedChallengeHash = await this.challengeStorage.getChallengeHash(
      recoveredAddress.toLowerCase()
    );

    if (storedChallengeHash === challengeHash) {
      this.challengeStorage.deleteChallenge(recoveredAddress);
      return recoveredAddress;
    }
  }

  private createTypedMessage(challengeHash: string): ITypedMessage {
    return {
      types: {
        EIP712Domain: [
          {
            name: "name",
            type: "string"
          }
        ],
        Challenge: [
          {
            name: "value",
            type: "string"
          }
        ]
      },
      domain: {
        name: this.domain
      },
      primaryType: "Challenge",
      message: {
        value: challengeHash
      }
    };
  }

}
