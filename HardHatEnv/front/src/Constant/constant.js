import abijson from './../contracts/BlockBet.json'

const contractAddress = "0x6A24CC0c27DA313fB3ba6e5259bb36a5d5E6341e"
					//  "0x74AF5A9E311ca2c6790a36c1BD4BDb09d0f8fba3"
					//  "0x9eB432e962fe21881248F900b2C40A46188462d6"

const contractAbi = require('./../contracts/BlockBet.json').abi;

const BetterStatus = Object.freeze({ 
    WIN: 1,
    LOSE: 2,
    PENDING: 3,
    NOT_PENDING: 4
}); 

const GameStatus = Object.freeze({ 
    VOIDED: 0,
    NOT_STARTED: 1,
    STARTED: 2,
    COMPLETE: 3
}); 

const BetOutcome = Object.freeze({ 
    NOT_SET: 0,
    TRUE: 1,
    FALSE: 2
}); 

export { contractAbi, contractAddress, BetterStatus, GameStatus, BetOutcome}
