// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./console.sol";

contract BlockBet {
    address public owner;   //owner of blockbet contract address, currently serves no purpose
    
    //BetterBet status
    uint constant STATUS_WIN = 1;
    uint constant STATUS_LOSE = 2;
    uint constant STATUS_PENDING = 3;
    uint constant STATUS_NOT_PENDING = 4;

    //game status
    uint constant STATUS_VOIDED = 0;
    uint constant STATUS_NOT_STARTED = 1;
    uint constant STATUS_STARTED = 2;
    uint constant STATUS_COMPLETE = 3;

    //general status
    uint constant STATUS_ERROR = 5;

    //bet outcome status
    uint constant STATUS_NOT_SET = 0;
    uint constant STATUS_TRUE = 1;
    uint constant STATUS_FALSE = 2;

    //1 ether value, change to MIS later
    // uint256 constant amount = 1000000000000000000;
    uint256 constant amount = 1;

    //structures
    struct BetterBet {
        uint guess; //1 for true, 2 for false
        address payable addr;
        uint status;
        uint256 betAmount;
    }

    struct Game {
        uint outcome;
        uint status;
        BetterBet originator;
        BetterBet taker;
        address oracle;
        string betDescription;
    }

    uint256 public betInd = 0;
    uint256 public constant arraySize = 65536;
    Game[arraySize] public games;

    //the game
    Game game;

    //fallback function
    // function() public payable {}

    //events
    event BetCreated();

    //constructor to assign owner of contract as the creator
    constructor() {
        owner = msg.sender;
    }

    function createBet(uint _guess, address _oracle, string memory _betDescription, address _takerAddr, uint256 takerBetAmount) public payable {    //guess 1(true) 2(false)
        require(_guess == STATUS_TRUE || _guess == STATUS_FALSE, "guess is not set to 1 or 2");

        console.log(
            "Creating Bet[%s] from %s with amount %s",
            betInd,
            msg.sender,
            msg.value
        );

        uint256 tempAmount = takerBetAmount*amount;
        game = Game(STATUS_NOT_SET, STATUS_NOT_STARTED, BetterBet(_guess, payable(msg.sender), STATUS_PENDING, msg.value), BetterBet(0, payable(_takerAddr), STATUS_NOT_PENDING, tempAmount), _oracle, _betDescription);
        game.originator = BetterBet(_guess, payable(msg.sender), STATUS_PENDING, msg.value);
        games[betInd] = game;
        betInd = betInd + 1;
    }

    function takeBet(uint256 betID) public payable {
        require(msg.value == games[betID].taker.betAmount, "bet amount is incorrect");
        require(msg.sender == games[betID].taker.addr, "taker address is incorrect");

        console.log(
            "Taking Bet[%s] from %s with amount %s",
            betID,
            msg.sender,
            msg.value
        );

        games[betID].status = STATUS_STARTED;
        uint takerGuess;
        if(games[betID].originator.guess == STATUS_TRUE){
            takerGuess = STATUS_FALSE;
        }else{
            takerGuess = STATUS_TRUE;
        }
        games[betID].taker = BetterBet(takerGuess, payable(msg.sender), STATUS_PENDING, msg.value);
    }

    function denyBet(uint256 betID) public payable {
        require(msg.sender == games[betID].taker.addr, "taker address is incorrect");

        console.log(
            "Denying Bet[%s] from %s",
            betID,
            msg.sender
        );

        games[betID].status = STATUS_VOIDED;
        games[betID].originator.addr.transfer(games[betID].originator.betAmount);
    }

    function setBetOutcome(uint256 betID, uint _outcome) public {
        require(msg.sender == games[betID].oracle, "oracle address is incorrect");
        require(games[betID].originator.status == STATUS_PENDING && games[betID].taker.status == STATUS_PENDING, "BetterBet status of either originator or taker is not pending");
        require(_outcome == STATUS_TRUE || _outcome == STATUS_FALSE, "outcome must be 1 or 2");

        console.log(
            "Setting Bet[%s] outcome to %s from %s",
            betID,
            _outcome,
            msg.sender
        );

        games[betID].outcome = _outcome;    //set to 1(true) or 2(false)
        games[betID].status = STATUS_COMPLETE;

        if(games[betID].originator.guess == games[betID].outcome && games[betID].taker.guess != games[betID].outcome){
            games[betID].originator.status = STATUS_WIN;
            games[betID].taker.status = STATUS_LOSE;
        }else if(games[betID].originator.guess != games[betID].outcome && games[betID].taker.guess == games[betID].outcome){
            games[betID].originator.status = STATUS_LOSE;
            games[betID].taker.status = STATUS_WIN;
        }else{
            games[betID].originator.status = STATUS_ERROR;
            games[betID].taker.status = STATUS_ERROR;
            games[betID].status = STATUS_ERROR;
        }
    }

    function payout(uint256 betID) public payable {
        require(msg.sender == games[betID].oracle, "oracle address is incorrect");
        require(games[betID].status == STATUS_COMPLETE, "game status is not complete");

        if(games[betID].originator.status == STATUS_WIN) {
            uint256 winnings = games[betID].originator.betAmount + games[betID].taker.betAmount;
            games[betID].originator.addr.transfer(winnings);

            console.log(
                "Originator Won: Paying out Bet[%s] amount %s to %s",
                betID,
                winnings,
                games[betID].originator.addr
            );
        }else if(games[betID].taker.status == STATUS_WIN) {
            uint256 winnings = games[betID].originator.betAmount + games[betID].taker.betAmount;
            games[betID].taker.addr.transfer(winnings);
            
            console.log(
                "Taker Won: Paying out Bet[%s] amount %s to %s",
                betID,
                winnings,
                games[betID].taker.addr
            );
        }else{
            uint256 originatorWinnings = games[betID].originator.betAmount;
            uint256 takerWinnings = games[betID].taker.betAmount;
            games[betID].originator.addr.transfer(originatorWinnings);
            games[betID].taker.addr.transfer(takerWinnings);

            console.log(
                "Noone Won: Paying out Bet[%s] amount %s to %s",
                betID,
                originatorWinnings,
                games[betID].taker.addr
            );
            console.log(
                "Noone Won: Paying out Bet[%s] amount %s to %s",
                betID,
                takerWinnings,
                games[betID].taker.addr
            );
        }
    }

    function nullBet(uint256 betID) public payable {   //currently only oracle can nullify bet, need to figure out frontend logistics on voting to nulltify bet
        require(msg.sender == games[betID].oracle, "oracle address is incorrect");

        uint256 originatorWinnings = games[betID].originator.betAmount;
        uint256 takerWinnings = games[betID].taker.betAmount;
        games[betID].originator.addr.transfer(originatorWinnings);
        games[betID].taker.addr.transfer(takerWinnings);

        console.log(
            "Noone Won: Paying out Bet[%s] amount %s to %s",
            betID,
            originatorWinnings,
            games[betID].taker.addr
        );
        console.log(
            "Noone Won: Paying out Bet[%s] amount %s to %s",
            betID,
            takerWinnings,
            games[betID].taker.addr
        );
    }

    function checkPermissions(uint256 betID, address sender) view private {
        //only the originator, taker, or oracle can call this function
        require(sender == games[betID].originator.addr || sender == games[betID].taker.addr || sender == games[betID].oracle, "must be originator, taker, or oracle address");
    }

    function getBetAmounts(uint256 betID) public view returns (uint256, uint256) {
        checkPermissions(betID, msg.sender);
        return (games[betID].originator.betAmount, games[betID].originator.betAmount);
    }
    function getBetDescription(uint256 betID) public view returns (string memory) {
        checkPermissions(betID, msg.sender);
        return games[betID].betDescription;
    }

    function getGameStatus(uint256 betID) public view returns (uint256) {
        checkPermissions(betID, msg.sender);
        return games[betID].status;
    }
    function getOriginatorStatus(uint256 betID) public view returns (uint256) {
        checkPermissions(betID, msg.sender);
        return games[betID].originator.status;
    }
    function getTakerStatus(uint256 betID) public view returns (uint256) {
        checkPermissions(betID, msg.sender);
        return games[betID].taker.status;
    }

    function getOriginatorAddress(uint256 betID) public view returns (address) {
        checkPermissions(betID, msg.sender);
        return games[betID].originator.addr;
    }
    function getTakerAddress(uint256 betID) public view returns (address) {
        checkPermissions(betID, msg.sender);
        return games[betID].taker.addr;
    }
    function getOracleAddress(uint256 betID) public view returns (address) {
        checkPermissions(betID, msg.sender);
        return games[betID].oracle;
    }

    function getOriginatorGuess(uint256 betID) public view returns (uint) {
        checkPermissions(betID, msg.sender);
        return games[betID].originator.guess;
    }
    function getTakerGuess(uint256 betID) public view returns (uint) {
        checkPermissions(betID, msg.sender);
        return games[betID].taker.guess;
    }
    function getOutcome(uint256 betID) public view returns (uint) {
        checkPermissions(betID, msg.sender);
        return games[betID].outcome;
    }

    //returns - [<description>, <outcome>, 'originator', <originator status>, 'taker', <taker status>]
    function getBetOutcome(uint256 betID) public view returns (string memory description, string memory outcome, string memory originatorKey, uint originatorStatus, string memory takerKey, uint takerStatus) {
        if(games[betID].originator.status == STATUS_WIN && games[betID].taker.status == STATUS_LOSE) {
            description = "Bet originator has won the bet";
        }else if(games[betID].originator.status == STATUS_LOSE && games[betID].taker.status == STATUS_WIN) {
            description = "Bet taker has won the bet";
        }else{
            description = "Unknown Bet Outcome";
        }

        if(games[betID].outcome == STATUS_TRUE){
            outcome = "True";
        }else if (games[betID].outcome == STATUS_FALSE){
            outcome = "False";
        }else{
            outcome = "Unknown Game Outcome";
        }
        originatorKey = "originator";
        originatorStatus = games[betID].originator.status;
        takerKey = "taker";
        takerStatus = games[betID].taker.status;
    }

    function getBalance() public view returns (uint) {
        uint balance = address(this).balance;

        // console.log("Called getBalance -- ");
        // console.log("contractAddress", address(this));
        // console.log("contractBalance", balance);

        return balance;
    }
}
