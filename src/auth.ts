import {IChallengeStorage, IChallenge} from "./@types";
import crypto from "crypto";
import {uuid} from "uuidv4";
import {recoverTypedSignature} from "eth-sig-util";
import {isValidAddress} from "ethereumjs-util";

export class EthAuth {
  private challengeStorage: IChallengeStorage;
  private banner: string;
  private secret: string;

  /**
   * @param challengeStorage implemented challenge storage object
   * @param banner message to show in metamask when signing
   */
  public constructor(challengeStorage: IChallengeStorage, banner: string) {
    this.challengeStorage = challengeStorage;
    this.banner = banner;
    this.secret = uuid();
  }

  /**
   * Creates challenge and stores challenge hash by user address.
   *
   * @param address ethereum address of user
   */
  public async createChallenge(address: string): Promise<IChallenge[]> {
    if(!isValidAddress(address)) {
      throw new Error("Ethereum address sent is not valid.");
    }

    const challengeHash = crypto.createHmac(
      "sha256", this.secret
    ).update(
      address + uuid()
    ).digest(
      "hex"
    );

    this.challengeStorage.storeChallenge(address.toLowerCase(), challengeHash);

    const challenge  = [{
      type: "string",
      name: "banner",
      value: this.banner
    }, {
      type: "string",
      name: "challenge",
      value: challengeHash
    }];

    return challenge;
  }

  /**
   * Checks if challenge is valid and returns ethereum address of authenticated user
   *
   * @param challengeHash Challenge message sent by user
   * @param sig Message signature generated from web3 provider signing challenge message
   */
  public async checkChallange(challengeHash: string, sig: string): Promise<string | undefined> {
    const data = [{
      type: "string",
      name: "banner",
      value: this.banner
    }, {
      type: "string",
      name: "challenge",
      value: challengeHash
    }];

    const recoveredAddress = recoverTypedSignature({
      data,
      sig
    });
    const storedChallenge = await this.challengeStorage.getChallenge(
      recoveredAddress.toLowerCase()
    );

    if (storedChallenge === challengeHash) {
      this.challengeStorage.deleteChallenge(recoveredAddress);
      return recoveredAddress;
    }
  }

}
