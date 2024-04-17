// scripts/index.js
require("dotenv").config();
const API_KEY = process.env.API_KEY;
const PK = process.env.PK;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const contract = require("../artifacts/contracts/BlockBet.sol/BlockBet.json");  //contract abi

const misProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);

//to run this script to interact with deployed contract: npx hardhat –network mis385n run scripts/index.js
async function main () {
    // Our code will go here
    console.log(JSON.stringify(contract.abi));
    // Retrieve accounts from the local node
    
    // const provider = new ethers.JsonRpcProvider();
    // const accounts = await provider.listAccounts();
    // // const accounts = await ethers.provider.getSigners();
    // console.log(accounts);
}
  
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });