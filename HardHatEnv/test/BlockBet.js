const { expect } = require("chai");
//const { ethers } = require("hardhat");

const hre = require("hardhat");
//const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const STATUS_WIN = 1;
const STATUS_LOSE = 2;
const STATUS_PENDING = 3;
const STATUS_NOT_PENDING = 4;
const STATUS_VOIDED = 0;
const STATUS_NOT_STARTED = 1;
const STATUS_STARTED = 2;
const STATUS_COMPLETE = 3;
const STATUS_ERROR = 5;
const STATUS_NOT_SET = 0;
const STATUS_TRUE = 1;
const STATUS_FALSE = 2;

describe("BlockBet",  () => {


    let betArray

    async function deployBlockBet() {
        const [owner,better1,better2,better3,better4,better5] = await ethers.getSigners();
        const bb = await ethers.getContractFactory("BlockBet");
        const BlockBet = await bb.deploy();
        return { BlockBet, owner,better1,better2,better3,better4,better5 };
    }

    it("deploys BlockBet contract correctly", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        // Assert that BlockBet contract was deployed successfully
        expect(owner.address).to.not.be.undefined;
        expect(await BlockBet.getAddress()).to.not.be.undefined;
        expect(await better1.address).to.not.be.undefined;
        expect(await better2.address).to.not.be.undefined;
        expect(await better3.address).to.not.be.undefined;
        expect(await better4.address).to.not.be.undefined;
        expect(await better5.address).to.not.be.undefined;

        console.log("owner address: ", owner.address)
        console.log("better1 address: ", better1.address)
        console.log("better2 address: ", better2.address)
        console.log("better3 address: ", better3.address)
        console.log("better4 address: ", better4.address)
        console.log("better5 address: ", better5.address)
        console.log("contract address: ", await BlockBet.getAddress())

        betArray = await BlockBet.betInd();
        await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        betArray = await BlockBet.betInd();
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        await BlockBet.connect(better3).takeBet(0,{ value: 10 })
        game0status = await BlockBet.connect(better1).getGameStatus(0);

    });

    it("can create new bet and correct taker can accepts", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betArray = await BlockBet.betInd();
        expect(betArray).to.equal(0)
        await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        betArray = await BlockBet.betInd();
        expect(betArray).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await BlockBet.connect(better3).takeBet(0,{ value: 10 })
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
    });

    it("fails with bad taker address", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betArray = await BlockBet.betInd();
        await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        betArray = await BlockBet.betInd();
        expect(betArray).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        await expect(
            BlockBet.connect(better2).takeBet(0,{ value: 10 })
        ).to.be.revertedWith("taker address is incorrect");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
    });

    it("fails with bad taker amount", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betArray = await BlockBet.betInd();
        await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        betArray = await BlockBet.betInd();
        expect(betArray).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        await expect(
            BlockBet.connect(better3).takeBet(0,{ value: 11 })
        ).to.be.revertedWith("bet amount is incorrect");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
    });

    it("taker can deny bet", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betArray = await BlockBet.betInd();
        expect(betArray).to.equal(0)
        await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        betArray = await BlockBet.betInd();
        expect(betArray).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await BlockBet.connect(better3).denyBet(0)
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_VOIDED)
    });

    it("oracle can set bet outcome", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betArray = await BlockBet.betInd();
        expect(betArray).to.equal(0)
        await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        betArray = await BlockBet.betInd();
        expect(betArray).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await BlockBet.connect(better3).takeBet(0,{ value: 10 })
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
        await BlockBet.connect(better2).setBetOutcome(0,1);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_COMPLETE)
    });

    
});