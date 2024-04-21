// scripts/index.js
require("dotenv").config();
const PK = process.env.PK;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
// const CONTRACT_ADDRESS = 0x9eB432e962fe21881248F900b2C40A46188462d6;

const contract = require("../artifacts/contracts/BlockBet.sol/BlockBet.json");  // grab contract abi

// To connect to a custom URL:
const ethers = require('ethers');
let url = "http://54.146.235.138:8546/";
// let customHttpProvider = new ethers.providers.JsonRpcProvider(url);

//to run this script to interact with deployed contract: npx hardhat –network mis385n run scripts/index.js
async function main () {
    // Our code will go here
    console.log(JSON.stringify(contract.abi));  //show abi

    const provider = new ethers.JsonRpcProvider(url);
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    const blockNum = await provider.getBlockNumber();
    console.log(blockNum)

    // Retrieve accounts from the local node
    // await window.ethereum.enable
    // const provider = new ethers.providers.Web3Provider(window.ethereum);

    // const accounts = await provider.listAccounts();
    // console.log(accounts);

    const signer = new ethers.Wallet(PK, provider);
    const BlockBetContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

    const betInd = await BlockBetContract.getBetInd();
    console.log("Current betInd is " + betInd);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });