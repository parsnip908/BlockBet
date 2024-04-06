// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract BlockBet {
    address public owner;   //owner of blockbet contract address, currently serves no purpose
    
    //bet status
    uint constant STATUS_WIN = 1;
    uint constant STATUS_LOSE = 2;
    uint constant STATUS_PENDING = 3;

    //game status
    uint constant STATUS_NOT_STARTED = 1;
    uint constant STATUS_STARTED = 2;
    uint constant STATUS_COMPLETE = 3;

    //general status
    uint constant STATUS_ERROR = 4;

    //bet outcome status
    uint constant STATUS_NOT_SET = 0;
    uint constant STATUS_TRUE = 1;
    uint constant STATUS_FALSE = 2;

    //structures
    struct BetterBet {
        uint guess; //1 for true, 2 for false
        address payable addr;
        uint status;
    }

    struct Game {
        uint256 betAmount;
        uint outcome;
        uint status;
        BetterBet originator;
        BetterBet taker;
        address oracle;
        string betDescription;
    }

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

    function createBet(uint _guess, address _oracle, string memory _betDescription, address _takerAddr) public payable {
        game = Game(msg.value, STATUS_NOT_SET, STATUS_STARTED, BetterBet(_guess, payable(msg.sender), STATUS_PENDING), BetterBet(0, payable(_takerAddr), STATUS_NOT_STARTED), _oracle, _betDescription);
        game.originator = BetterBet(_guess, payable(msg.sender), STATUS_PENDING);
    }

    function takeBet() public payable {
        require(msg.value == game.betAmount && msg.sender == game.taker.addr);
        uint takerGuess;
        if(game.originator.guess == STATUS_TRUE){
            takerGuess = STATUS_FALSE;
        }else{
            takerGuess = STATUS_TRUE;
        }
        game.taker = BetterBet(takerGuess, payable(msg.sender), STATUS_PENDING);
    }

    function setBetOutcome(uint _outcome) public {
        require(msg.sender == game.oracle);
        game.outcome = _outcome;    //set to 1(true) or 2(false)
        game.status = STATUS_COMPLETE;

        if(game.originator.guess == game.outcome && game.taker.guess != game.outcome){
            game.originator.status = STATUS_WIN;
            game.taker.status = STATUS_LOSE;
        }else if(game.originator.guess != game.outcome && game.taker.guess == game.outcome){
            game.originator.status = STATUS_LOSE;
            game.taker.status = STATUS_WIN;
        }else{
            game.originator.status = STATUS_ERROR;
            game.taker.status = STATUS_ERROR;
            game.status = STATUS_ERROR;
        }
    }

    function payout() public payable {
        // checkPermissions(msg.sender);
        require(msg.sender == game.oracle);
        if(game.originator.status == STATUS_WIN) {
            game.originator.addr.transfer(game.betAmount*2);
        }else if(game.taker.status == STATUS_WIN) {
            game.taker.addr.transfer(game.betAmount*2);
        }else{
            game.originator.addr.transfer(game.betAmount);
            game.taker.addr.transfer(game.betAmount);
        }
    }

    function checkPermissions(address sender) view private {
        //only the originator, taker, or oracle can call this function
        require(sender == game.originator.addr || sender == game.taker.addr || sender == game.oracle);
    }

    function getBetAmount() public view returns (uint) {
        checkPermissions(msg.sender);
        return game.betAmount;
    }
    function getBetDescription() public view returns (string memory) {
        checkPermissions(msg.sender);
        return game.betDescription;
    }

    function getOriginatorAddress() public view returns (address) {
        checkPermissions(msg.sender);
        return game.originator.addr;
    }
    function getTakerAddress() public view returns (address) {
        checkPermissions(msg.sender);
        return game.taker.addr;
    }
    function getOracleAddress() public view returns (address) {
        checkPermissions(msg.sender);
        return game.oracle;
    }

    function getOriginatorGuess() public view returns (uint) {
        checkPermissions(msg.sender);
        return game.originator.guess;
    }
    function getTakerGuess() public view returns (uint) {
        checkPermissions(msg.sender);
        return game.taker.guess;
    }

    // function convertBoolToString(bool input) internal pure returns (string memory) {
    //     if (input) {
    //         return "true";
    //     } else {
    //         return "false";
    //     }
    // }

    //returns - [<description>, <outcome>, 'originator', <originator status>, 'taker', <taker status>]
    function getBetOutcome() public view returns (string memory description, string memory outcome, string memory originatorKey, uint originatorStatus, string memory takerKey, uint takerStatus) {
        if(game.originator.status == STATUS_WIN && game.taker.status == STATUS_LOSE) {
            description = "Bet originator has won the bet";
        }else if(game.originator.status == STATUS_LOSE && game.taker.status == STATUS_WIN) {
            description = "Bet taker has won the bet";
        }else{
            description = "Unknown Bet Outcome";
        }

        if(game.outcome == STATUS_TRUE){
            outcome = "True";
        }else if (game.outcome == STATUS_FALSE){
            outcome = "False";
        }else{
            outcome = "Unknown Game Outcome";
        }
        originatorKey = "originator";
        originatorStatus = game.originator.status;
        takerKey = "taker";
        takerStatus = game.taker.status;
    }
}
