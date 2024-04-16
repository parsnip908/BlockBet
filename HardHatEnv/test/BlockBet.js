const { expect } = require("chai");
//const { ethers } = require("hardhat");

const hre = require("hardhat");
//const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

//BetterBet status
const STATUS_WIN = 1;
const STATUS_LOSE = 2;
const STATUS_PENDING = 3;
const STATUS_NOT_PENDING = 4;

//game status
const STATUS_VOIDED = 0;
const STATUS_NOT_STARTED = 1;
const STATUS_STARTED = 2;
const STATUS_COMPLETE = 3;

//general status
const STATUS_ERROR = 5;

//bet outcome status
const STATUS_NOT_SET = 0;
const STATUS_TRUE = 1;
const STATUS_FALSE = 2;

describe("BlockBet",  () => {


    let betIndex

    async function deployBlockBet() {
        const [owner,better1,better2,better3,better4,better5] = await ethers.getSigners();
        const bb = await ethers.getContractFactory("BlockBet");
        const BlockBet = await bb.deploy();
        return { BlockBet, owner,better1,better2,better3,better4,better5 };
    }

    it("Should deploy BlockBet contract correctly", async function () {
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

        // betIndex = await BlockBet.betInd();
        // await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        // betIndex = await BlockBet.betInd();
        // game0 = await BlockBet.connect(better1).getBetDescription(0);
        // game0status = await BlockBet.connect(better1).getGameStatus(0);
        // await BlockBet.connect(better3).takeBet(0,{ value: 10 })
        // game0status = await BlockBet.connect(better1).getGameStatus(0);
    });

    it("Should create new bet and correct taker can accept with right message value", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,9,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)

        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await BlockBet.connect(better3).takeBet(0,{ value: 9 })
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
    });

    it("Should fail to createBet with impossible guess", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        await expect(
            BlockBet.connect(better1).createBet(0,better2.address,"E",better3.address,9,{ value: 10 })
        ).to.be.revertedWith("guess is not set to 1 or 2");
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
    });

    it("Should allow taker to take bet", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(() =>
            BlockBet.connect(better3).takeBet(0, { value: 10 })
        ).to.changeEtherBalance(better3, "-10");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
    });

    it("Should fail takeBet with bad taker address", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        await expect(
            BlockBet.connect(better2).takeBet(0,{ value: 10 })
        ).to.be.revertedWith("taker address is incorrect");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
    });

    it("Should fail takeBet with bad taker amount", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        await BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        await expect(
            BlockBet.connect(better3).takeBet(0,{ value: 11 })
        ).to.be.revertedWith("bet amount is incorrect");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
    });

    it("Should allow taker to deny bet", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await BlockBet.connect(better3).denyBet(0)
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_VOIDED)
    });

    it("Should fail to deny bet with bad taker address", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(
            BlockBet.connect(better1).denyBet(0)
        ).to.be.revertedWith("taker address is incorrect");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
    });

    it("Should allow oracle to set bet outcome", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(() =>
            BlockBet.connect(better3).takeBet(0, { value: 10 })
        ).to.changeEtherBalance(better3, "-10");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
        await BlockBet.connect(better2).setBetOutcome(0,1);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_COMPLETE)
    });

    it("Should fail to set bet outcome with bad oracle address", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(() =>
            BlockBet.connect(better3).takeBet(0, { value: 10 })
        ).to.changeEtherBalance(better3, "-10");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
        await expect(
            BlockBet.connect(better4).setBetOutcome(0,1)
        ).to.be.revertedWith("oracle address is incorrect");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
    });

    it("Should fail to set bet outcome if taker hasn't accepted bet yet", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(
            BlockBet.connect(better2).setBetOutcome(0,1)
        ).to.be.revertedWith("BetterBet status of either originator or taker is not pending");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
    });

    it("Should fail to set bet outcome with bad outcome set", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(() =>
            BlockBet.connect(better3).takeBet(0, { value: 10 })
        ).to.changeEtherBalance(better3, "-10");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
        await expect(
            BlockBet.connect(better2).setBetOutcome(0,0)
        ).to.be.revertedWith("outcome must be 1 or 2");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
    });

    it("Should allow oracle to payout", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(() =>
            BlockBet.connect(better3).takeBet(0, { value: 10 })
        ).to.changeEtherBalance(better3, "-10");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
        await BlockBet.connect(better2).setBetOutcome(0,1);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_COMPLETE)
        const contractBalanceBefore1 = await BlockBet.getBalance();
        await BlockBet.connect(better2).payout(0)
        const contractBalanceAfter1 = await BlockBet.getBalance();
        expect(contractBalanceAfter1 == contractBalanceBefore1 - 19n)
    });
    
    it("Should fail to payout with bad oracle address", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(() =>
            BlockBet.connect(better3).takeBet(0, { value: 10 })
        ).to.changeEtherBalance(better3, "-10");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
        await BlockBet.connect(better2).setBetOutcome(0,1);
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_COMPLETE)
        const contractBalanceBefore1 = await BlockBet.getBalance();
        await expect(
            BlockBet.connect(better3).payout(0)
        ).to.be.revertedWith("oracle address is incorrect");
        const contractBalanceAfter1 = await BlockBet.getBalance();
        expect(contractBalanceAfter1 == contractBalanceBefore1)
    });

    it("Should fail to payout with game outcome not set yet", async function () {
        const { BlockBet, owner,better1,better2,better3,better4,better5 } = await deployBlockBet();
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(0)
        const contractBalanceBefore = await BlockBet.getBalance();
        await expect(() =>
            BlockBet.connect(better1).createBet(1,better2.address,"E",better3.address,10,{ value: 10 })
        ).to.changeEtherBalance(better1, "-10");
        const contractBalanceAfter = await BlockBet.getBalance();
        expect(contractBalanceAfter == contractBalanceBefore + 10n)
        betIndex = await BlockBet.betInd();
        expect(betIndex).to.equal(1)
        game0 = await BlockBet.connect(better1).getBetDescription(0);
        expect(game0).to.equal("E")
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_NOT_STARTED)
        await expect(() =>
            BlockBet.connect(better3).takeBet(0, { value: 10 })
        ).to.changeEtherBalance(better3, "-10");
        game0status = await BlockBet.connect(better1).getGameStatus(0);
        expect(game0status).to.equal(STATUS_STARTED)
        const contractBalanceBefore1 = await BlockBet.getBalance();
        await expect(
            BlockBet.connect(better2).payout(0)
        ).to.be.revertedWith("game status is not complete");
        const contractBalanceAfter1 = await BlockBet.getBalance();
        expect(contractBalanceAfter1 == contractBalanceBefore1)
    });
});