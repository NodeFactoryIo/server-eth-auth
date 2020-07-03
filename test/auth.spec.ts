import {expect} from "chai";
import {EthAuth} from "../src";
import {IChallengeStorage} from "../src/@types";
import sinon from "sinon";
import {Hmac} from "crypto";
import * as ethSigUtil from "eth-sig-util";

describe("Create challenge", function () {

  let ethAuth: EthAuth;
  let challengeStorage: IChallengeStorage;

  beforeEach(function () {
    challengeStorage = sinon.stub() as unknown as IChallengeStorage;
    ethAuth = new EthAuth(challengeStorage, "test banner");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("Throws error when invalid ethereum address given", async function () {
    try {
      const challenge = await ethAuth.createChallenge("0x1690A20A0afF150C0501919604bf");
      expect(challenge).to.be.deep.equal(undefined);
    } catch (error) {
      expect(error.message).to.be.deep.equal("Ethereum address sent is not valid.");
    }
  });

  it("Stores challenge and returns challenge if valid address sent", async function () {
    sinon.stub(Hmac.prototype, "digest").returns("hash");
    const storeChallengeSpy = sinon.spy(
      async () => {}
    );
    challengeStorage.storeChallenge = storeChallengeSpy;

    const challenge = await ethAuth.createChallenge("0x1690A20A0afF150C0501919604bf46A9C76A1CBc");

    expect(storeChallengeSpy.callCount).to.be.deep.equal(1);
    expect(storeChallengeSpy.args[0]).to.be.deep.equal([
      "0x1690a20a0aff150c0501919604bf46a9c76a1cbc", "hash"
    ]);
    expect(challenge).to.be.deep.equal([
      {
        type: "string",
        name: "banner",
        value: "test banner"
      }, {
        type: "string",
        name: "challenge",
        value: "hash"
      }]
    );
  });

});

describe("Check challenge", function () {

  let ethAuth: EthAuth;
  let challengeStorage: IChallengeStorage;

  beforeEach(function () {
    challengeStorage = sinon.stub() as unknown as IChallengeStorage;
    ethAuth = new EthAuth(challengeStorage, "test banner");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("Returns undefined if recovered challenge is not equal to stored challenge", async function () {
    sinon.stub(ethSigUtil, "recoverTypedSignature").returns("invalid address");
    const getChallengeSpy = sinon.spy(
      async () => {return "invalid hash";}
    );
    challengeStorage.getChallenge = getChallengeSpy;

    const address = await ethAuth.checkChallange(
      "574b110d87aba03af40df2109c9146c58f253e31e32255488bbcaf030775dbf6",
      "signature"
    );

    expect(address).to.be.deep.equal(undefined);
  });

  it("Returns address and deletes challenge if recovered challenge valid", async function () {
    sinon.stub(ethSigUtil, "recoverTypedSignature").returns("valid address");
    const deleteChallengeSpy = sinon.spy(
      async () => {return;}
    );
    challengeStorage.deleteChallenge = deleteChallengeSpy;
    challengeStorage.getChallenge = async () => {
      return "574b110d87aba03af40df2109c9146c58f253e31e32255488bbcaf030775dbf6";
    };

    const address = await ethAuth.checkChallange(
      "574b110d87aba03af40df2109c9146c58f253e31e32255488bbcaf030775dbf6",
      "signature"
    );

    expect(address).to.be.deep.equal("valid address");
  });

});
